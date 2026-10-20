import { useState, useCallback, useRef } from "react";
import { getErrorMessage } from "../../../core/api/errors";
import type { PaginatedResponse } from "../../../core/api/types";
import { userService } from "../../user/services/userService";
import type { ChildUser } from "../../user/types/User";
import { biositeService, type BiositeListParams } from "../services/biositeService";
import type { BiositeFull, BiositeUpdateDto, CreateBiositeDto } from "../types/Biosite";

export const useFetchBiosite = (userId?: string) => {
  const [biositeData, setBiositeData] = useState<BiositeFull | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const currentUserIdRef = useRef<string | undefined>(undefined);

  /** Ejecuta una petición gestionando loading/error; si falla devuelve `fallback`. */
  const run = useCallback(
    async <T>(action: () => Promise<T>, fallback: T, errorMessage: string): Promise<T> => {
      try {
        setLoading(true);
        setError(null);
        return await action();
      } catch (err) {
        setError(getErrorMessage(err, errorMessage));
        return fallback;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAllBiosites = useCallback(
    (params?: BiositeListParams): Promise<BiositeFull[] | PaginatedResponse<BiositeFull>> => {
      const fallback =
        params?.page && params?.size
          ? { data: [], total: 0, page: params.page, size: params.size, totalPages: 0 }
          : [];
      return run(() => biositeService.list(params), fallback, "Error al cargar todos los biosites");
    },
    [run]
  );

  const fetchUserBiosites = useCallback(async (): Promise<BiositeFull[]> => {
    if (!userId) {
      setError("User ID is required");
      return [];
    }
    return run(() => biositeService.getByUser(userId), [], "Error al cargar los biosites");
  }, [userId, run]);

  const fetchAdminBiosites = useCallback(
    async (adminId: string): Promise<BiositeFull[]> => {
      if (!adminId) {
        setError("Admin ID is required");
        return [];
      }
      return run(() => biositeService.getByAdmin(adminId), [], "Error al cargar biosites del admin");
    },
    [run]
  );

  /** Biosites de cada usuario hijo de `parentId`; los que fallan se omiten. */
  const loadChildUsersBiosites = useCallback(async (parentId: string): Promise<BiositeFull[]> => {
    let childUsers: ChildUser[] = [];
    try {
      childUsers = await userService.getChildren(parentId);
    } catch (err) {
      setError(getErrorMessage(err, "Error al cargar usuarios hijos"));
    }

    const results = await Promise.allSettled(
      childUsers.map((childUser) => biositeService.getByUser(childUser.id))
    );
    return results.flatMap((result, index) => {
      if (result.status === "fulfilled") return result.value;
      console.warn(`Error fetching biosites for user ${childUsers[index].id}:`, result.reason);
      return [];
    });
  }, []);

  /**
   * Biosites que gestiona un admin. Si el backend no los devuelve directamente,
   * se reconstruyen a partir de los biosites de cada usuario hijo.
   */
  const fetchChildBiosites = useCallback(
    async (parentId: string): Promise<BiositeFull[]> => {
      if (!parentId) {
        setError("Parent ID is required");
        return [];
      }

      return run(
        async () => {
          const adminBiosites = await fetchAdminBiosites(parentId);
          return adminBiosites.length > 0 ? adminBiosites : loadChildUsersBiosites(parentId);
        },
        [],
        "Error al cargar biosites hijos"
      );
    },
    [fetchAdminBiosites, loadChildUsersBiosites, run]
  );

  const fetchCompleteBiositeStructure = useCallback(
    async (
      parentId: string
    ): Promise<{
      ownBiosites: BiositeFull[];
      childBiosites: BiositeFull[];
      allBiosites: BiositeFull[];
    }> => {
      const empty = { ownBiosites: [], childBiosites: [], allBiosites: [] };
      if (!parentId) {
        setError("Parent ID is required");
        return empty;
      }

      return run(
        async () => {
          // Una sola petición a /biosites/admin: sirve para "own" y, si trae datos, también para los hijos
          const ownBiosites = await biositeService.getByAdmin(parentId);
          const childBiosites =
            ownBiosites.length > 0 ? ownBiosites : await loadChildUsersBiosites(parentId);
          const allBiosites = [...ownBiosites, ...childBiosites].filter(
            (biosite, index, list) => list.findIndex((b) => b.id === biosite.id) === index
          );
          return { ownBiosites, childBiosites, allBiosites };
        },
        empty,
        "Error al cargar estructura completa de biosites"
      );
    },
    [loadChildUsersBiosites, run]
  );

  const fetchBiosite = useCallback(async (): Promise<BiositeFull | null> => {
    if (!userId) {
      setError("User ID is required");
      return null;
    }

    if (
      loading ||
      (isInitializedRef.current && currentUserIdRef.current === userId)
    ) {
      return biositeData;
    }

    const result = await run(
      async () => {
        const biosites = await biositeService.getByUser(userId);
        if (biosites.length === 0) {
          throw new Error("No biosite found for this user");
        }
        return biosites[0];
      },
      null,
      "Error al cargar el biosite"
    );

    setBiositeData(result);
    if (result) {
      isInitializedRef.current = true;
      currentUserIdRef.current = userId;
    }
    return result;
  }, [userId, loading, biositeData, run]);

  const createBiosite = useCallback(
    async (createData: CreateBiositeDto): Promise<BiositeFull | null> => {
      if (!createData.title?.trim() || !createData.slug?.trim()) {
        setError("Title and slug are required");
        return null;
      }

      if (!userId) {
        setError("Parent user ID is required");
        return null;
      }

      const newBiosite = await run(
        async () => {
          const result = await biositeService.createWithUser({
            email: `${createData.slug}@biosite.com`,
            password: createData.password || `biosite_${createData.slug}_${Date.now()}`,
            name: createData.title,
            parentId: userId,
          });
          return result.biosite;
        },
        null,
        "Error al crear el biosite y usuario"
      );

      if (newBiosite && !biositeData) {
        setBiositeData(newBiosite);
        isInitializedRef.current = true;
        currentUserIdRef.current = userId;
      }

      return newBiosite;
    },
    [biositeData, userId, run]
  );

  const updateBiosite = async (
    updateData: BiositeUpdateDto
  ): Promise<BiositeFull | null> => {
    if (!biositeData?.id) {
      setError("No biosite ID available for update");
      return null;
    }

    const missingCriticalFields = (["title", "slug"] as const).filter((field) => {
      const value = updateData[field];
      return !value || value.trim() === "";
    });

    if (missingCriticalFields.length > 0) {
      setError(`Missing critical fields: ${missingCriticalFields.join(", ")}`);
      return null;
    }

    const updated = await run(
      async () => {
        const biositeResult = await biositeService.update(biositeData.id, updateData);
        if (!biositeResult) {
          throw new Error("API returned an empty response");
        }
        return biositeResult;
      },
      null,
      "Error al actualizar el biosite"
    );

    if (!updated) return null;

    const newBiositeData: BiositeFull = {
      ...biositeData,
      ...updated,
      id: updated.id || biositeData.id,
      title: updated.title || updateData.title || biositeData.title,
      slug: updated.slug || updateData.slug || biositeData.slug,
      links: biositeData.links || [],
      ownerId: biositeData.ownerId,
      colors: updated.colors || updateData.colors || biositeData.colors,
    };

    setBiositeData(newBiositeData);
    return newBiositeData;
  };

  const switchBiosite = useCallback(
    async (biositeId: string): Promise<BiositeFull | null> => {
      const biosite = await run(
        () => biositeService.getById(biositeId),
        null,
        "Error al cambiar de biosite"
      );
      if (biosite) {
        setBiositeData(biosite);
      }
      return biosite;
    },
    [run]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setBiositeData(null);
    setError(null);
    setLoading(false);
    isInitializedRef.current = false;
    currentUserIdRef.current = undefined;
  }, []);

  return {
    biositeData,
    loading,
    error,

    fetchBiosite,
    createBiosite,
    updateBiosite,
    switchBiosite,

    fetchUserBiosites,
    fetchAdminBiosites,
    fetchChildBiosites,
    fetchCompleteBiositeStructure,
    fetchAllBiosites,

    clearError,
    resetState,
  };
};

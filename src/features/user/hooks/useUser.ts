import { useState, useCallback } from "react";
import type { UpdateUserDto, User } from "../types/User";
import { userService } from "../services/userService";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(
    async (userId: string): Promise<User | null> => {
      if (!userId) return null;

      setLoading(true);
      setError(null);

      try {
        const userData = await userService.getById(userId);
        setUser(userData);
        return userData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error fetching user";
        setError(errorMessage);
        console.error("Error fetching user:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUser = useCallback(
    async (userId: string, updateData: UpdateUserDto): Promise<User | null> => {
      if (!userId) return null;

      setLoading(true);
      setError(null);

      try {
        const updatedUser = await userService.update(userId, updateData);
        setUser(updatedUser);
        return updatedUser;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error updating user";
        setError(errorMessage);
        console.error("Error updating user:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser,
    clearError,
  };
};

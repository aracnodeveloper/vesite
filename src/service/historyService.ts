import { getHistoryByBiositeApi, historyApi } from "../constants/EndpointsRoutes";
import type {
  CreateHistoryDto,
  HistoryItem,
  UpdateHistoryDto,
} from "../interfaces/History";
import api from "./api";

interface HistoryMediaUploadResponse {
  success: boolean;
  data: {
    url: string;
  };
}

export const HISTORIES_CHANGED_EVENT = "vesite:histories-changed";

interface HistoriesChangedDetail {
  biositeId?: string;
  action?: 'create' | 'update' | 'delete';
  historyId?: string;
}

const notifyHistoriesChanged = (
  biositeId?: string,
  action?: 'create' | 'update' | 'delete',
  historyId?: string
) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<HistoriesChangedDetail>(HISTORIES_CHANGED_EVENT, { 
      detail: { biositeId, action, historyId } 
    })
  );
};

const normalizeHistory = (item: HistoryItem): HistoryItem => ({
  ...item,
  description: item.description ?? undefined,
  image: item.image ?? undefined,
  mediaType: item.mediaType ?? "image",
  interactions: item.interactions ?? 0,
  visuals: item.visuals ?? 0,
  isHighlight: item.isHighlight ?? false,
  expiresAt: item.expiresAt ?? undefined,
});

const getStoredSet = (key: string): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const data = localStorage.getItem(key);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
};

const addToStoredSet = (key: string, id: string) => {
  if (typeof window === "undefined") return;
  try {
    const set = getStoredSet(key);
    set.add(id);
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {}
};

export const historyService = {
  async uploadMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("media", file, file.name);
    const response = await api.post<HistoryMediaUploadResponse>(
      "/upload/history-media",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data.url;
  },

  async listByBiosite(biositeId: string): Promise<HistoryItem[]> {
    const response = await api.get<HistoryItem[]>(
      `${getHistoryByBiositeApi}/${biositeId}`
    );
    return response.data.map(normalizeHistory);
  },

  async listActiveByBiosite(biositeId: string): Promise<HistoryItem[]> {
    const response = await api.get<HistoryItem[]>(
      `${historyApi}/public/biosite/${biositeId}`
    );
    return response.data.map(normalizeHistory);
  },

  async getById(id: string): Promise<HistoryItem> {
    const response = await api.get<HistoryItem>(`${historyApi}/${id}`);
    return normalizeHistory(response.data);
  },

  async recordView(id: string): Promise<HistoryItem | null> {
    const viewed = getStoredSet("vesite:viewed_histories");
    if (viewed.has(id)) return null;

    const response = await api.post<HistoryItem>(`${historyApi}/${id}/view`);
    addToStoredSet("vesite:viewed_histories", id);
    return normalizeHistory(response.data);
  },

  async recordInteraction(id: string, type: "like"): Promise<HistoryItem | null> {
    const interacted = getStoredSet(`vesite:interacted_histories_${type}`);
    if (interacted.has(id)) return null;

    const response = await api.post<HistoryItem>(`${historyApi}/${id}/interaction`, { type });
    addToStoredSet(`vesite:interacted_histories_${type}`, id);
    return normalizeHistory(response.data);
  },

  getInteractedSet(type: "like"): Set<string> {
    return getStoredSet(`vesite:interacted_histories_${type}`);
  },

  async create(data: CreateHistoryDto): Promise<HistoryItem> {
    const response = await api.post<HistoryItem>(historyApi, data);
    const history = normalizeHistory(response.data);
    notifyHistoriesChanged(history.biosite_id, 'create', history.id);
    return history;
  },

  async update(id: string, data: UpdateHistoryDto): Promise<HistoryItem> {
    const response = await api.patch<HistoryItem>(`${historyApi}/${id}`, data);
    const history = normalizeHistory(response.data);
    notifyHistoriesChanged(history.biosite_id, 'update', history.id);
    return history;
  },

  async delete(id: string): Promise<void> {
    const response = await api.delete<HistoryItem>(`${historyApi}/${id}`);
    notifyHistoriesChanged(response.data.biosite_id, 'delete', id);
  },
};

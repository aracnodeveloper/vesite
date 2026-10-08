import apiService from "../../../core/api/apiService";
import { usersApi } from "../../../core/api/endpoints";
import type { ChildUser, UpdateUserDto, User } from "../types/User";

const userCache = new Map<string, User>();

export const userService = {
    /** Usuario por id; se cachea en memoria durante la sesión. */
    getById: async (userId: string): Promise<User> => {
        const cached = userCache.get(userId);
        if (cached) return cached;
        const user = await apiService.getById<User>(usersApi, userId);
        userCache.set(userId, user);
        return user;
    },

    update: async (userId: string, data: UpdateUserDto): Promise<User> => {
        const user = (await apiService.update<UpdateUserDto>(usersApi, userId, data)) as User;
        userCache.set(userId, user);
        return user;
    },

    remove: (userId: string) => apiService.delete(usersApi, userId),

    getChildren: async (parentId: string): Promise<ChildUser[]> => {
        const children = await apiService.getById<ChildUser | ChildUser[]>(usersApi, `${parentId}/childrens`);
        return Array.isArray(children) ? children : [children];
    },
};

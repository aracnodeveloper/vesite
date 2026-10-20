import apiService from "../../../core/api/apiService";
import { loginApi } from "../../../core/api/endpoints";
import type { AuthResponse } from "../types/Auth";
import type { LoginParams } from "../types/authTypes";

export const authService = {
    login: (usuario: string, password: string) =>
        apiService.create<LoginParams, AuthResponse>(loginApi, { usuario, password }),
};

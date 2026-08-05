import axios from "axios";
import Cookies from "js-cookie";
import { getRequestName } from "./requestNames";

const api = axios.create({
    baseURL: "http://localhost:8005",//http://201.218.28.181:8087/ http://190.110.56.75:14500/
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("accessToken"); // localStorage.getItem('accessToken');
        const requestName = getRequestName(config.method, config.url);
        const requestId = crypto.randomUUID();
        config.headers.set("X-Request-Name", requestName);
        config.headers.set("X-Request-ID", requestId);
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        if (import.meta.env.DEV) {
            console.debug(`[API] [${requestId}] ${requestName}`, config.method?.toUpperCase(), config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            const requestId = response.headers["x-request-id"];
            const requestName = response.headers["x-request-name"];
            console.debug(
                `[API RESPONSE] [${requestId}] ${requestName}`,
                response.status,
                response.config.url
            );
        }
        return response;
    },
    (error) => {
        if (import.meta.env.DEV) {
            const requestId = error.response?.headers?.["x-request-id"]
                ?? error.config?.headers?.["X-Request-ID"];
            const requestName = error.response?.headers?.["x-request-name"]
                ?? error.config?.headers?.["X-Request-Name"];
            console.error(
                `[API ERROR] [${requestId}] ${requestName}`,
                error.response?.status,
                error.config?.url
            );
        }
        return Promise.reject(error);
    }
);

export default api;

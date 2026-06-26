import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data;
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", newRefreshToken);
                    // Also update cookie so middleware can read the token
                    document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                document.cookie = "accessToken=; path=/; max-age=0";
                if (typeof window !== "undefined") {
                    // Use soft navigation to preserve in-memory state where possible
                    const currentPath = window.location.pathname + window.location.search;
                    const redirectTo = currentPath !== "/login" ? `/login?redirect=${encodeURIComponent(currentPath)}` : "/login";
                    window.location.replace(redirectTo);
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export type ApiError = {
    message: string;
    statusCode: number;
    error?: string;
};

export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiError & { message?: string | string[] };
        const msg = data?.message;
        if (Array.isArray(msg) && msg.length > 0) {
            return msg.join(". ");
        }
        if (typeof msg === "string") return msg;
        return error.message || "Une erreur est survenue";
    }
    if (error instanceof Error) {
        console.log(error);
        return error.message;
    }
    return "Une erreur est survenue";
}

export default apiClient;


import apiClient, { getErrorMessage } from "@/lib/api-client";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  RefreshTokenDto,
  User,
} from "@/types/api";

// Helper to set cookie (client-side)
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Helper to delete cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * User login - Authenticates a user and returns access/refresh tokens
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);

    // Store in localStorage for API client
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);

    // Store in cookie for middleware
    setCookie("accessToken", response.data.accessToken, 7);

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Register a new user - Only accessible by administrators
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Refresh access token - Obtains a new access token using a valid refresh token
 */
export async function refreshToken(data: RefreshTokenDto): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>("/auth/refresh", data);

    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get current user profile - Returns the profile of the currently authenticated user
 */
export async function getProfile(): Promise<User> {
  try {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update current user profile (backend accepts name, phone)
 */
export async function updateProfile(data: Partial<Pick<User, "name" | "phone" | "specialtyId">>): Promise<User> {
  try {
    const response = await apiClient.patch<User>("/auth/me", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * User logout - Invalidates the refresh token and logs out the user
 */
export async function logout(): Promise<void> {
  try {
    const refreshTokenValue = localStorage.getItem("refreshToken");
    if (refreshTokenValue) {
      await apiClient.post("/auth/logout", { refreshToken: refreshTokenValue });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    deleteCookie("accessToken");
  }
}

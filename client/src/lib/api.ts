import { User } from "@/types";

const BASE_URL = "http://localhost:5000/api";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("token");
};

export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
};

export const isAdmin = (): boolean => getUser()?.role === "admin";

export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Bir hata oluştu/An error has occured");
  }

  return data as T;
};

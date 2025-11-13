import axios from "axios";
import { useSessionStore } from "@/stores/use-session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const session = useSessionStore.getState().session;
  if (session?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  if (config.params && typeof config.params === "object") {
    config.params = Object.fromEntries(
      Object.entries(config.params)
        .filter(
          ([_, value]) => value != null && value !== "" && value !== "null"
        )
        .map(([key, value]) => convertParams(key, value))
    );
  }
  return config;
});

const convertParams = (key: string, value: any) => {
  if (!Number.isNaN(Number(value)) && value !== "true" && value !== "false") {
    return [key, Number(value)];
  }
  if (value === "true") {
    return [key, true];
  }
  if (value === "false") {
    return [key, false];
  }
  return [key, value];
};

export default api;

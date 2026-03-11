import api from "./api";
import { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";

let isRefreshing = false;

interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

let failedQueue: FailedRequest[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(true);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  response => response,

  async (error: AxiosError) => {

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {

        await api.post("api/auth/refresh-token");

        processQueue(null);

        return api(originalRequest);

      } catch (err) {

        processQueue(err as AxiosError);

        // auto logout
        window.location.href = "/login";

        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
import axios from "axios";
import Cookies from "js-cookie";
import { API } from "./getEnv";

const instance = axios.create({ baseURL: API });

// Har bir so'rovga access token qo'shish
instance.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let waiters: Array<(t: string) => void> = [];

// 401 bo'lsa refresh-token bilan yangi access token olib, so'rovni qayta yuboradi
instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error || {};
    if (!response || !config) return Promise.reject(error);

    // 401 emas yoki allaqachon qayta uringan bo'lsa — odatdagidek xatoni uzatamiz
    if (response.status !== 401 || (config as any)._retry) {
      return Promise.reject(error);
    }

    (config as any)._retry = true;

    if (isRefreshing) {
      // Refresh tugaguncha kutamiz
      return new Promise((resolve) => {
        waiters.push((newToken: string) => {
          config.headers = config.headers || {};
          (config.headers as any).Authorization = `Bearer ${newToken}`;
          resolve(instance(config));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) throw error;

      const { data } = await axios.post(`${API}/auth/refresh-token`, { refreshToken });
      const newAccess =
        data?.accessToken ?? data?.data?.accessToken;
      const newRefresh =
        data?.refreshToken ?? data?.data?.refreshToken;

      if (!newAccess) throw error;

      Cookies.set("accessToken", newAccess);
      if (newRefresh) Cookies.set("refreshToken", newRefresh);

      // navbatda kutayotgan so'rovlarni davom ettirish
      waiters.forEach((fn) => fn(newAccess));
      waiters = [];

      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${newAccess}`;
      return instance(config);
    } catch (e) {
      waiters = [];
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default instance;

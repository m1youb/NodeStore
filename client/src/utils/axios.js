import axios from "axios"
import { useAuthStore } from "../store/AuthStore";

const AxiosInstance = axios.create({
    baseURL: "http://localhost:5000/mcollections",
    withCredentials: true
});

let refreshPromise = null;

AxiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const request = error.config;
        if (error.response?.status === 401 && !request._retry) {
            request._retry = true;

            try {
                if (refreshPromise) {
                    await refreshPromise;
                    return AxiosInstance(request);
                }

                refreshPromise = useAuthStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;
                return AxiosInstance(request);
            } catch (error) {
                useAuthStore.getState().logoutFunc();
                return Promise.reject(error)
            }
        }
        return Promise.reject(error);
    }
)
export default AxiosInstance;

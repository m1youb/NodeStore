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
        const user = useAuthStore.getState().user;

        // Only attempt token refresh if user is authenticated and we haven't retried yet
        if (error.response?.status === 401 && !request._retry && user) {
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

        // For guest users or non-401 errors, just reject
        return Promise.reject(error);
    }
)
export default AxiosInstance;

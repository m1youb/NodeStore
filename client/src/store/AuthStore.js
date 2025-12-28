import { create } from "zustand";
import toast from "react-hot-toast";
import AxiosInstance from "../utils/axios";
import axios from "axios";

export const useAuthStore = create((set, get) => ({
    user: null,
    isLoading: false,
    isSigningUp: false,
    isLoggingIn: false,
    isLoggingOut: false,
    isChecking: true,

    signUpFunc: async function (data) {
        set({ isSigningUp: true });
        try {
            const signUp = await AxiosInstance.post("/auth/signup", data);
            toast.success("Welcome to MCollections " + data.fullname + " 🫡🫡");
            set({ user: signUp.data.user });
        } catch (error) {
            toast.error(error.message);
        } finally {
            set({ isSigningUp: false })
        }
    },
    loginFunc: async function (data) {
        set({ isLoggingIn: true });
        try {
            const login = await AxiosInstance.post("/auth/login", data);
            toast.success(`Welcome back 🫡🫡`);
            set({ user: login.data.user });
        } catch (error) {
            toast.error(error.message);
        } finally {
            set({ isLoggingIn: false })
        }
    },
    logoutFunc: async function () {
        set({ isLoggingOut: true });
        try {
            await AxiosInstance.post("/auth/logout");
            toast.success("Don't forget to come back 😊😊");
            set({ user: null });
        } catch (error) {
            toast.error(error.message);
        } finally {
            set({ isLoggingOut: false });
        }
    },
    checkAuth: async function () {
        set({ isChecking: true });
        try {
            const checkReq = await AxiosInstance.get("/auth/profile");
            set({ user: checkReq.data.user })
            console.info("MCollections just checked user succesfully for a bit....");
        } catch (error) {
            console.error(error.message)
        } finally {
            set({ isChecking: false });
        }
    },
    refreshToken: async function () {
        if (get().checkAuth) return;
        set({ isChecking: true });
        try {
            const fetch = await AxiosInstance.post("/auth/refreshtoken");
            set({ user: fetch.data })
            console.log(fetch.data);
            return fetch.data;
        } catch (error) {
            console.log(error.message)
            set({ user: null })
        } finally {
            set({ isChecking: false });
        }
    }
}))

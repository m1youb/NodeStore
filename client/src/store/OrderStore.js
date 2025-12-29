import { create } from "zustand";
import AxiosInstance from "../utils/axios";
import toast from "react-hot-toast";

export const useOrderStore = create((set, get) => ({
    orders: [],
    isLoading: false,
    error: null,

    fetchUserOrders: async function () {
        set({ isLoading: true, error: null });
        try {
            const response = await AxiosInstance.get("/payment/my-orders");
            set({ orders: response.data.orders, isLoading: false });
        } catch (error) {
            console.error("Error fetching orders:", error);
            set({ error: error.message, isLoading: false });
            toast.error("Failed to load orders");
        }
    },

    getOrderById: function (orderId) {
        const orders = get().orders;
        return orders.find(order => order.id === orderId || order._id === orderId);
    }
}));

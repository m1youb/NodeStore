import toast from "react-hot-toast";
import { create } from "zustand";
import AxiosInstance from "../utils/axios";

export const useCartStore = create((set, get) => ({
    cartItems: [],
    suggestions: [],
    totalAmount: 0,
    subTotal: 0,
    coupon: null,
    isLoading: false,
    isCouponApplied: false,
    session: null,

    getCartItems: async function () {
        set({ isLoading: true });
        try {
            const get = await AxiosInstance.get("/cart/all");
            set({ cartItems: get.data.cart });
            get().calculateTotalAmount();
        } catch (error) {
            toast.error(error.response.message.data)
        } finally {
            set({ isLoading: false });
        }
    },
    addToCart: async function (product) {
        set({ isLoading: true });
        const { cartItems } = get();
        try {
            const add = await AxiosInstance.put("/cart/put", { productId: product.id })
            set((prev) => {
                const existInCart = prev?.cartItems?.find(item => item?.id === product.id);
                const newCart = existInCart
                    ? prev.cartItems?.map(item => item?.id === product.id ? { ...item, quantity: item?.quantity + 1 } : item)
                    : [...prev.cartItems, { ...product, quantity: 1 }]
                return { cartItems: newCart };
            });
            console.log(cartItems);
            get().calculateTotalAmount();
            toast.success(add.data.message);
        } catch (error) {
            toast.error(error.message)
        } finally {
            set({ isLoading: false });
        }
    },
    calculateTotalAmount: function () {
        const { cartItems, coupon } = get();
        const subTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
        let total = subTotal;

        if (coupon) {
            const discount = subTotal * (coupon.discountPercentage / 100);
            total = subTotal - discount;
        }

        set({ totalAmount: total, subTotal })
    },
    updateQuantity: async function (id, quantity) {
        set({ isLoading: true });
        try {
            const update = await AxiosInstance.put(`/cart/update/${id}`, { quantity });
            set((prev) => {
                const findItem = prev.cartItems.find(item => item?.id === id);
                const newCart = findItem && prev.cartItems.map(item => item?.id === id ? { ...item, quantity } : item)

                return { cartItems: newCart }
            })
            toast.success(update.data.message);
            get().calculateTotalAmount();
        } catch (error) {
            toast.error(error.message)
        } finally {
            set({ isLoading: false })
        }
    },
    removeFromCart: async function (productId) {
        set({ isLoading: true });
        try {
            const remove = await AxiosInstance.delete(`/cart/remove/${productId}`);
            set((prev) => {
                const findItem = prev.cartItems.find(item => item?.id === productId);
                const newCart = findItem && prev.cartItems.filter(item => item.id !== productId);

                return { cartItems: newCart };
            });

            get().calculateTotalAmount();
            toast.success(remove.data.message);
        } catch (error) {
            toast.error(error.message)
        } finally {
            set({ isLoading: false })
        }
    },
    getSuggestion: async function () {
        set({ isLoading: true })
        try {
            const getProd = await AxiosInstance.get("/products/suggestions");
            console.log(getProd.data)
            set({ suggestions: getProd.data.products });
            console.log(get().suggestions)
        } catch (error) {
            toast.error(error.message)
        } finally {
            set({ isLoading: false })
        }
    },
    createSession: async function (products, coupon) {
        try {
            const session = await AxiosInstance.post("/payment/session", {
                products,
                code: coupon ? coupon.code : null
            })
            set({ session: session.data.id })
        } catch (error) {
            toast.error(error.message)
        }
    },
    clearCart: async function () {
        try {
            await AxiosInstance.delete("/cart/remove");
            set({ cartItems: [], coupon: null, totalAmount: 0 });
        } catch (error) {
            toast.error(error.message)
        }
    },
    handleCheckoutSuccess: async function (sessionId) {
        try {
            await AxiosInstance.post(`/payment/session_status/${sessionId}`);
            get().clearCart();
        } catch (error) {
            toast.error(error.message)
        }
    },
    getCoupon: async function () {
        try {
            const get = await AxiosInstance.get("/coupons/coupon");
            set({ coupon: get.data.coupon })
        } catch (error) {
            toast.error(error.message)
        }
    },
    applyCoupon: async function (code) {
        try {
            const apply = await AxiosInstance.post(`/coupons/validate/${code}`);
            set({ isCouponApplied: true });
            get().calculateTotalAmount();
        } catch (error) {
            toast.error(error.message)
        }
    },
    removeCoupon: function () {
        set({ coupon: null, isCouponApplied: false });
        get().calculateTotalAmount();
    }
}))
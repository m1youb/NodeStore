import toast from "react-hot-toast";
import { create } from "zustand";
import AxiosInstance from "../utils/axios";

// localStorage helper functions
const GUEST_CART_KEY = 'guestCart';

const saveToLocalStorage = (cart) => {
    try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
    }
};

const loadFromLocalStorage = () => {
    try {
        const cart = localStorage.getItem(GUEST_CART_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        return [];
    }
};

const clearLocalStorage = () => {
    try {
        localStorage.removeItem(GUEST_CART_KEY);
    } catch (error) {
        console.error('Failed to clear localStorage cart:', error);
    }
};

export const useCartStore = create((set, get) => ({
    cartItems: loadFromLocalStorage(), // Initialize with localStorage
    suggestions: [],
    totalAmount: 0,
    subTotal: 0,
    coupon: null,
    isLoading: false,
    isCouponApplied: false,
    session: null,

    // Sync guest cart to database after login
    syncCartToDatabase: async function (user) {
        const guestCart = loadFromLocalStorage();
        if (!guestCart || guestCart.length === 0) return;

        console.log('Syncing guest cart to database:', guestCart);

        try {
            // Add each item to database
            for (const item of guestCart) {
                await AxiosInstance.put("/cart/put", { productId: item.id });
            }

            // Clear localStorage
            clearLocalStorage();

            // Load cart from database
            await get().getCartItems();

            toast.success('Cart synced successfully!');
        } catch (error) {
            console.error('Failed to sync cart:', error);
            toast.error('Failed to sync cart');
        }
    },

    getCartItems: async function (user) {
        if (!user) {
            // Load from localStorage for guests
            const guestCart = loadFromLocalStorage();
            set({ cartItems: guestCart });
            get().calculateTotalAmount();
            return;
        }

        // Load from database for authenticated users
        set({ isLoading: true });
        try {
            const get_cart = await AxiosInstance.get("/cart/all");
            set({ cartItems: get_cart.data.cart });
            get().calculateTotalAmount();
        } catch (error) {
            console.error('Get cart error:', error);
            toast.error(error.response?.data?.message || error.message)
        } finally {
            set({ isLoading: false });
        }
    },

    addToCart: async function (product, user) {
        if (!user) {
            // Add to localStorage for guests
            set((prev) => {
                const existInCart = prev.cartItems.find(item => item.id === product.id);
                const newCart = existInCart
                    ? prev.cartItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
                    : [...prev.cartItems, { ...product, quantity: 1 }];

                saveToLocalStorage(newCart);
                return { cartItems: newCart };
            });
            get().calculateTotalAmount();
            toast.success('Added to cart!');
            return;
        }

        // Add to database for authenticated users
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
            get().calculateTotalAmount();
            toast.success(add.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
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

    updateQuantity: async function (id, quantity, user) {
        if (!user) {
            // Update localStorage for guests
            set((prev) => {
                const newCart = prev.cartItems.map(item => item.id === id ? { ...item, quantity } : item);
                saveToLocalStorage(newCart);
                return { cartItems: newCart };
            });
            get().calculateTotalAmount();
            toast.success('Quantity updated!');
            return;
        }

        // Update database for authenticated users
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
            toast.error(error.response?.data?.message || error.message)
        } finally {
            set({ isLoading: false })
        }
    },

    removeFromCart: async function (productId, user) {
        if (!user) {
            // Remove from localStorage for guests
            set((prev) => {
                const newCart = prev.cartItems.filter(item => item.id !== productId);
                saveToLocalStorage(newCart);
                return { cartItems: newCart };
            });
            get().calculateTotalAmount();
            toast.success('Removed from cart!');
            return;
        }

        // Remove from database for authenticated users
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
            toast.error(error.response?.data?.message || error.message)
        } finally {
            set({ isLoading: false })
        }
    },

    getSuggestion: async function () {
        set({ isLoading: true })
        try {
            const getProd = await AxiosInstance.get("/products/suggestions");
            console.log('Suggestions response:', getProd.data)
            set({ suggestions: getProd.data.products });
            console.log('Suggestions set:', get().suggestions)
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            toast.error(error.response?.data?.message || error.message)
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
            toast.error(error.response?.data?.message || error.message)
        }
    },

    clearCart: async function (user) {
        if (!user) {
            // Clear localStorage for guests
            clearLocalStorage();
            set({ cartItems: [], coupon: null, totalAmount: 0, subTotal: 0 });
            return;
        }

        // Clear database for authenticated users
        try {
            await AxiosInstance.delete("/cart/remove");
            set({ cartItems: [], coupon: null, totalAmount: 0, subTotal: 0 });
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    },

    handleCheckoutSuccess: async function (sessionId) {
        try {
            await AxiosInstance.post(`/payment/session_status/${sessionId}`);
            get().clearCart();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    },

    getCoupon: async function (user) {
        // Skip coupon check for guest users (requires authentication)
        if (!user) {
            set({ coupon: null });
            return;
        }

        try {
            const get = await AxiosInstance.get("/coupons/coupon");
            // Only set coupon if it exists, otherwise set to null (no error)
            set({ coupon: get.data.coupon || null })
        } catch (error) {
            // Only show error for actual failures (not 401 or 404)
            if (error.response?.status !== 404 && error.response?.status !== 401) {
                console.error('Get coupon error:', error);
                toast.error(error.response?.data?.message || error.message)
            }
            set({ coupon: null })
        }
    },

    applyCoupon: async function (code) {
        try {
            const apply = await AxiosInstance.post(`/coupons/validate/${code}`);
            set({ isCouponApplied: true });
            get().calculateTotalAmount();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    },

    removeCoupon: function () {
        set({ coupon: null, isCouponApplied: false });
        get().calculateTotalAmount();
    }
}))
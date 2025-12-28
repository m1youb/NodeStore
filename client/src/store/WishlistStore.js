import { create } from 'zustand';
import AxiosInstance from '../utils/axios';
import toast from 'react-hot-toast';

export const useWishlistStore = create((set, get) => ({
    wishlistItems: [],
    isLoading: false,

    // Fetch wishlist from server
    getWishlist: async () => {
        set({ isLoading: true });
        try {
            const res = await AxiosInstance.get('/wishlist');
            set({ wishlistItems: res.data.wishlist || [] });
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            // If not authenticated, just set empty array
            set({ wishlistItems: [] });
        } finally {
            set({ isLoading: false });
        }
    },

    // Add product to wishlist
    addToWishlist: async (product) => {
        try {
            await AxiosInstance.post('/wishlist', { productId: product.id });

            // Add to local state
            set((state) => ({
                wishlistItems: [...state.wishlistItems, { product, productId: product.id }]
            }));

            toast.success('Added to wishlist');
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            if (error.response?.status === 409) {
                toast.error('Product already in wishlist');
            } else if (error.response?.status === 401) {
                toast.error('Please login to use wishlist');
            } else {
                toast.error('Failed to add to wishlist');
            }
        }
    },

    // Remove product from wishlist
    removeFromWishlist: async (productId) => {
        try {
            await AxiosInstance.delete(`/wishlist/${productId}`);

            // Remove from local state
            set((state) => ({
                wishlistItems: state.wishlistItems.filter(item => item.productId !== productId)
            }));

            toast.success('Removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove from wishlist');
        }
    },

    // Check if product is in wishlist
    isInWishlist: (productId) => {
        const { wishlistItems } = get();
        return wishlistItems.some(item => item.productId === productId);
    },

    // Clear entire wishlist
    clearWishlist: async () => {
        try {
            await AxiosInstance.delete('/wishlist');
            set({ wishlistItems: [] });
            toast.success('Wishlist cleared');
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            toast.error('Failed to clear wishlist');
        }
    }
}));

import { create } from 'zustand';

export const useComparisonStore = create((set, get) => ({
    comparisonItems: [],

    addToComparison: (product) => {
        const { comparisonItems } = get();

        // Limit to 4 products for comparison
        if (comparisonItems.length >= 4) {
            return { success: false, message: 'Maximum 4 products can be compared' };
        }

        // Check if already in comparison
        if (comparisonItems.find(item => item.id === product.id)) {
            return { success: false, message: 'Product already in comparison' };
        }

        set({ comparisonItems: [...comparisonItems, product] });
        return { success: true, message: 'Added to comparison' };
    },

    removeFromComparison: (productId) => {
        set(state => ({
            comparisonItems: state.comparisonItems.filter(item => item.id !== productId)
        }));
    },

    clearComparison: () => {
        set({ comparisonItems: [] });
    },

    isInComparison: (productId) => {
        const { comparisonItems } = get();
        return comparisonItems.some(item => item.id === productId);
    }
}));

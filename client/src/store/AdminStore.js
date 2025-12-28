import { create } from "zustand";
import toast from "react-hot-toast";
import AxiosInstance from "../utils/axios";

export const useAdminStore = create((set, get) => ({
    isLoading: false,
    products: [],
    featuredProducts: [],
    suggestions: [],

    createProduct: async function (data) {
        set({ isLoading: true })
        const products = get().products;
        try {
            const create = await AxiosInstance.post("/products/save", data);
            set({ products: [...products, create.data.product] });
            toast.success("Product saved succesfully");
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoading: false })
        }
    },
    getProducts: async function () {
        set({ isLoading: true });
        try {
            const fetchProducts = await AxiosInstance.get("/products/all");
            set({ products: fetchProducts.data.products });
            toast.success(fetchProducts.data.message);
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoading: false })
        }
    },
    deleteProduct: async function (id) {
        set({ isLoading: true });
        const { products } = get();
        try {
            const deletePr = await AxiosInstance.delete(`products/delete/${id}`);
            const updatedProducts = products.filter(pr => pr._id !== id);
            set({ products: updatedProducts });
            toast.success(deletePr.data.message);
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoading: false })
        }
    },
    featureProduct: async function (id) {
        set({ isLoading: true });
        try {
            const feature = await AxiosInstance.put(`/products/feature/${id}`);
            set((prevProducts) => ({
                products: prevProducts.products.map(product => {
                    return product._id === id ? { ...product, isFeatured: feature.data.product.isFeatured } : product
                })
            }))
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoading: false })
        }
    },
    updateProductFunc: async function (id, data) {
        set({ isLoading: true });
        const { products } = get();
        try {
            const updateProd = await AxiosInstance.put(`/products/modify/${id}`, data);
            const updatedProducts = products.map(prod => prod._id === id ? updateProd.data.product : prod);
            set({ products: updatedProducts });
            toast.success(updateProd.data.message);
        } catch (error) {
            // Handle different types of errors
            if (error.code === 'ECONNRESET' || error.message?.includes('ECONNRESET')) {
                toast.error('Connection lost. The image might be too large or the server timed out. Try compressing the image.');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(`Error: ${error.message}`);
            } else {
                toast.error('Failed to update product. Please try again.');
            }
            console.error('Update product error:', error);
        } finally {
            set({ isLoading: false });
        }
    },
    getFeaturedProducts: async function () {
        set({ isLoading: true });
        try {
            const getFeat = await AxiosInstance.get("/products/featured");
            set({ featuredProducts: getFeat.data.products });
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoading: false })
        }
    },
    getProductsByCategory: async function (category) {
        set({ isLoading: true });
        try {
            const fetch = await AxiosInstance.get(`/products/category/${category}`);
            set({ products: fetch.data.products })

        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoading: false })
        }
    }
}))
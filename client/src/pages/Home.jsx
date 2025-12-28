import { Link } from 'react-router-dom';
import categories from '../constants/categories';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import FeaturedProducts from '../components/FeaturedProducts';
import AxiosInstance from '../utils/axios';
import { LoaderCircle, ChevronRight, Plus } from 'lucide-react';
import FeaturedProduct from '../components/FeaturedProduct';
import toast from 'react-hot-toast';
import FilterPanel from '../components/FilterPanel';
import SortDropdown from '../components/SortDropdown';
import { useAuthStore } from '../store/AuthStore';
import { useAdminStore } from '../store/AdminStore';
import CreateProductView from '../components/CreateProductView';
import UpdateProductModal from '../components/UpdateProductModal';

export default function Home() {
    const { user } = useAuthStore();
    const { deleteProductFunc } = useAdminStore();
    const isAdmin = user?.role === 'admin';

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [isLoadingCategory, setIsLoadingCategory] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: 0,
        maxPrice: 5000,
        inStockOnly: false,
        featuredOnly: false
    });
    const [sortBy, setSortBy] = useState('newest');

    // Admin state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleCategoryClick = async (categoryTitle) => {
        if (selectedCategory === categoryTitle) {
            setSelectedCategory(null);
            return;
        }

        setSelectedCategory(categoryTitle);
        fetchCategoryProducts(categoryTitle, filters, sortBy);
    };

    const fetchCategoryProducts = async (category, currentFilters, currentSort) => {
        setIsLoadingCategory(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            if (currentFilters.minPrice > 0) params.append('minPrice', currentFilters.minPrice);
            if (currentFilters.maxPrice < 5000) params.append('maxPrice', currentFilters.maxPrice);
            if (currentFilters.inStockOnly) params.append('inStockOnly', 'true');
            if (currentFilters.featuredOnly) params.append('featuredOnly', 'true');
            params.append('sortBy', currentSort);

            const queryString = params.toString();
            const url = `/products/category/${category}${queryString ? `?${queryString}` : ''}`;

            const res = await AxiosInstance.get(url);
            setCategoryProducts(res.data.products || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load products");
            setCategoryProducts([]);
        } finally {
            setIsLoadingCategory(false);
        }
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        if (selectedCategory) {
            fetchCategoryProducts(selectedCategory, newFilters, sortBy);
        }
    };

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        if (selectedCategory) {
            fetchCategoryProducts(selectedCategory, filters, newSort);
        }
    };

    const handleResetFilters = () => {
        const defaultFilters = {
            minPrice: 0,
            maxPrice: 5000,
            inStockOnly: false,
            featuredOnly: false
        };
        setFilters(defaultFilters);
        setSortBy('newest');
        if (selectedCategory) {
            fetchCategoryProducts(selectedCategory, defaultFilters, 'newest');
        }
    };

    // Admin handlers
    const handleAddProduct = () => {
        setShowCreateModal(true);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setShowUpdateModal(true);
    };

    const handleDeleteProduct = async (product) => {
        if (window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
            try {
                await deleteProductFunc(product.id);
                toast.success('Product deleted successfully');
                // Refresh category products
                if (selectedCategory) {
                    fetchCategoryProducts(selectedCategory, filters, sortBy);
                }
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const handleProductSuccess = () => {
        setShowCreateModal(false);
        setShowUpdateModal(false);
        setSelectedProduct(null);
        // Refresh category products
        if (selectedCategory) {
            fetchCategoryProducts(selectedCategory, filters, sortBy);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className='max-w-[1400px] mx-auto px-6'>
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar - Sticky on Desktop */}
                    <div className="lg:w-64 shrink-0">
                        <div className="lg:sticky lg:top-24 space-y-8">
                            <div>
                                <h3 className="text-xs font-mono text-gray-500 mb-4 tracking-wider uppercase">Categories</h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-mono transition-all duration-300 ${!selectedCategory
                                            ? 'text-white bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10'
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        ALL SYSTEMS
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.title}
                                            onClick={() => handleCategoryClick(cat.title)}
                                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-mono transition-all duration-300 ${selectedCategory === cat.title
                                                ? 'text-white bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10'
                                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            {cat.title.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-h-[80vh]">
                        <AnimatePresence mode="wait">
                            {!selectedCategory ? (
                                <motion.div
                                    key="home"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    {/* Header Section */}
                                    <div className='mb-12'>
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2, duration: 0.6 }}
                                        >
                                            <h1 className='text-5xl md:text-6xl font-bold tracking-tight mb-3 text-white'>
                                                ENGINEERED PERFORMANCE
                                            </h1>
                                            <p className='mono text-sm tracking-wider text-gray-400'>
                                                Precision tools for developers, creators, and architects.
                                            </p>
                                        </motion.div>
                                    </div>

                                    {/* Bento Grid - Only show first 5 categories */}
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16'>
                                        {categories.slice(0, 5).map((ct, index) => (
                                            <motion.div
                                                key={ct.title}
                                                className={`hardware-card ${ct.wide ? 'md:col-span-2' : ''} group cursor-pointer`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 * index, duration: 0.5 }}
                                                onClick={() => handleCategoryClick(ct.title)}
                                            >
                                                <div className='status-badge'>{ct.status}</div>
                                                <div className={`relative overflow-hidden ${ct.wide ? 'h-80' : 'h-64'}`}>
                                                    <img
                                                        src={ct.image}
                                                        alt={ct.title}
                                                        className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
                                                    />
                                                    <div className='absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80'></div>
                                                </div>
                                                <div className='p-6'>
                                                    <h2 className='text-2xl font-bold tracking-tight mb-1 uppercase text-white'>
                                                        {ct.title}
                                                    </h2>
                                                    <p className='spec-summary mb-4'>{ct.specs}</p>
                                                    <div className='action-link'>
                                                        <span>EXPLORE SYSTEMS</span>
                                                        <span className='arrow'>→</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Featured Products */}
                                    <FeaturedProducts />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="category"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="mb-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <button
                                                onClick={() => setSelectedCategory(null)}
                                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5 rotate-180 text-gray-400" />
                                            </button>
                                            <h2 className="text-3xl font-bold text-white uppercase tracking-tight flex-1">
                                                {selectedCategory}
                                            </h2>
                                        </div>

                                        {/* Filter and Sort Toolbar */}
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="text-sm text-gray-500 font-mono">
                                                {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'} found
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {isAdmin && (
                                                    <button
                                                        onClick={handleAddProduct}
                                                        className="flex items-center gap-2 px-4 py-2 bg-accent text-black font-bold rounded-lg hover:bg-accent/90 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        <span className="text-sm">ADD PRODUCT</span>
                                                    </button>
                                                )}
                                                <SortDropdown value={sortBy} onChange={handleSortChange} />
                                                <FilterPanel
                                                    filters={filters}
                                                    onFiltersChange={handleFiltersChange}
                                                    onReset={handleResetFilters}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {isLoadingCategory ? (
                                        <div className="flex h-64 items-center justify-center">
                                            <LoaderCircle className="w-8 h-8 animate-spin text-accent" />
                                        </div>
                                    ) : categoryProducts.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {categoryProducts.map(product => (
                                                <FeaturedProduct
                                                    key={product.id}
                                                    product={product}
                                                    isAdmin={isAdmin}
                                                    onEdit={handleEditProduct}
                                                    onDelete={handleDeleteProduct}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex h-64 items-center justify-center text-gray-500 font-mono">
                                            No products found in this category.
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Admin Modals */}
            {isAdmin && showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className="bg-[#0A0A0A] border border-[#222] rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white mono tracking-tight">ADD NEW PRODUCT</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <CreateProductView onSuccess={handleProductSuccess} />
                    </div>
                </div>
            )}

            {isAdmin && showUpdateModal && selectedProduct && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setShowUpdateModal(false);
                        setSelectedProduct(null);
                    }}
                >
                    <div
                        className="bg-[#0A0A0A] border border-[#222] rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white mono tracking-tight">EDIT PRODUCT</h2>
                            <button
                                onClick={() => {
                                    setShowUpdateModal(false);
                                    setSelectedProduct(null);
                                }}
                                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <UpdateProductModal product={selectedProduct} onSuccess={handleProductSuccess} />
                    </div>
                </div>
            )}
        </div>
    );
}

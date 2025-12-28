import { Link } from 'react-router-dom';
import categories from '../constants/categories';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import FeaturedProducts from '../components/FeaturedProducts';
import AxiosInstance from '../utils/axios';
import { LoaderCircle, ChevronRight } from 'lucide-react';
import FeaturedProduct from '../components/FeaturedProduct';
import toast from 'react-hot-toast';

export default function Home() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [isLoadingCategory, setIsLoadingCategory] = useState(false);

    const handleCategoryClick = async (categoryTitle) => {
        if (selectedCategory === categoryTitle) {
            setSelectedCategory(null);
            return;
        }

        setSelectedCategory(categoryTitle);
        setIsLoadingCategory(true);
        try {
            const res = await AxiosInstance.get(`/products/category/${categoryTitle}`);
            setCategoryProducts(res.data.products || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load products");
            setCategoryProducts([]);
        } finally {
            setIsLoadingCategory(false);
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

                                    {/* Bento Grid */}
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16'>
                                        {categories.map((ct, index) => (
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
                                    <div className="mb-8 flex items-center gap-4">
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className="p-2 hover:bg-white/5 rounded-full transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5 rotate-180 text-gray-400" />
                                        </button>
                                        <h2 className="text-3xl font-bold text-white uppercase tracking-tight">
                                            {selectedCategory}
                                        </h2>
                                    </div>

                                    {isLoadingCategory ? (
                                        <div className="flex h-64 items-center justify-center">
                                            <LoaderCircle className="w-8 h-8 animate-spin text-accent" />
                                        </div>
                                    ) : categoryProducts.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {categoryProducts.map(product => (
                                                <FeaturedProduct key={product.id} product={product} />
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
        </div>
    );
}

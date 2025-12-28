import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FilterPanel({ filters, onFiltersChange, onReset }) {
    const [isOpen, setIsOpen] = useState(false);
    const [priceRange, setPriceRange] = useState({
        min: filters.minPrice || 0,
        max: filters.maxPrice || 5000
    });

    const handlePriceChange = (type, value) => {
        const newRange = { ...priceRange, [type]: parseFloat(value) || 0 };
        setPriceRange(newRange);
        onFiltersChange({
            ...filters,
            minPrice: newRange.min,
            maxPrice: newRange.max
        });
    };

    const toggleInStock = () => {
        onFiltersChange({ ...filters, inStockOnly: !filters.inStockOnly });
    };

    const toggleFeatured = () => {
        onFiltersChange({ ...filters, featuredOnly: !filters.featuredOnly });
    };

    const handleReset = () => {
        setPriceRange({ min: 0, max: 5000 });
        onReset();
        setIsOpen(false);
    };

    const activeFiltersCount =
        (filters.minPrice > 0 ? 1 : 0) +
        (filters.maxPrice < 5000 ? 1 : 0) +
        (filters.inStockOnly ? 1 : 0) +
        (filters.featuredOnly ? 1 : 0);

    return (
        <div className="relative">
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-white hover:bg-white/10 transition-colors"
            >
                <SlidersHorizontal className="w-4 h-4" />
                <span>FILTERS</span>
                {activeFiltersCount > 0 && (
                    <span className="bg-accent text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 right-0 w-72 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 shadow-2xl z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold text-sm uppercase font-mono">Filters</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Price Range */}
                        <div className="mb-4 pb-4 border-b border-white/10">
                            <label className="block text-xs font-mono text-gray-400 mb-3">PRICE RANGE</label>
                            <div className="flex items-center gap-3 mb-3">
                                <input
                                    type="number"
                                    value={priceRange.min}
                                    onChange={(e) => handlePriceChange('min', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#121212] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                                    placeholder="Min"
                                />
                                <span className="text-gray-500">-</span>
                                <input
                                    type="number"
                                    value={priceRange.max}
                                    onChange={(e) => handlePriceChange('max', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#121212] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                                    placeholder="Max"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 font-mono">
                                <span>${priceRange.min}</span>
                                <span>${priceRange.max}</span>
                            </div>
                        </div>

                        {/* Stock Availability */}
                        <div className="mb-4 pb-4 border-b border-white/10">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm text-white font-mono">IN STOCK ONLY</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={filters.inStockOnly}
                                        onChange={toggleInStock}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${filters.inStockOnly ? 'bg-accent' : 'bg-white/10'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${filters.inStockOnly ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Featured Only */}
                        <div className="mb-4 pb-4 border-b border-white/10">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm text-white font-mono">FEATURED ONLY</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={filters.featuredOnly}
                                        onChange={toggleFeatured}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${filters.featuredOnly ? 'bg-accent' : 'bg-white/10'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${filters.featuredOnly ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={handleReset}
                            className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-white hover:bg-white/10 transition-colors"
                        >
                            RESET ALL FILTERS
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

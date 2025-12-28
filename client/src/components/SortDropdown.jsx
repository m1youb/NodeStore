import { useState } from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First', icon: '🆕' },
    { value: 'price_asc', label: 'Price: Low to High', icon: '💰' },
    { value: 'price_desc', label: 'Price: High to Low', icon: '💎' },
    { value: 'popular', label: 'Most Popular', icon: '🔥' }
];

export default function SortDropdown({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    const currentOption = SORT_OPTIONS.find(opt => opt.value === value) || SORT_OPTIONS[0];

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Dropdown Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-white hover:bg-white/10 transition-colors"
            >
                <ArrowUpDown className="w-4 h-4" />
                <span>{currentOption.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 right-0 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${value === option.value
                                            ? 'bg-accent/10 text-accent'
                                            : 'text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-lg">{option.icon}</span>
                                    <span className="text-sm font-mono">{option.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

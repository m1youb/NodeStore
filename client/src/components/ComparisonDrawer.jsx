import { motion, AnimatePresence } from 'framer-motion';
import { useComparisonStore } from '../store/ComparisonStore';
import { X, Cpu, HardDrive, Monitor } from 'lucide-react';

export default function ComparisonDrawer() {
    const { comparisonItems, removeFromComparison, clearComparison } = useComparisonStore();

    if (comparisonItems.length < 2) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className='fixed bottom-0 left-0 right-0 z-50'
                style={{
                    background: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border-primary)',
                    boxShadow: '0 -4px 20px var(--accent-glow)'
                }}
            >
                <div className='max-w-7xl mx-auto px-6 py-4'>
                    {/* Header */}
                    <div className='flex items-center justify-between mb-4'>
                        <h3 className='mono text-lg font-bold' style={{ color: 'var(--text-primary)' }}>
                            COMPARISON ({comparisonItems.length}/4)
                        </h3>
                        <button
                            onClick={clearComparison}
                            className='mono text-sm px-3 py-1 transition-fast'
                            style={{
                                border: '1px solid var(--border-primary)',
                                borderRadius: '4px',
                                color: 'var(--text-secondary)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-hover)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-primary)';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                        >
                            CLEAR ALL
                        </button>
                    </div>

                    {/* Comparison Grid */}
                    <div className='grid gap-4' style={{
                        gridTemplateColumns: `repeat(${comparisonItems.length}, 1fr)`
                    }}>
                        {comparisonItems.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className='hardware-card p-4 relative'
                            >
                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromComparison(product.id)}
                                    className='absolute top-2 right-2 w-6 h-6 flex items-center justify-center transition-fast'
                                    style={{
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: '50%',
                                        color: 'var(--text-secondary)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                    }}
                                >
                                    <X className='w-4 h-4' />
                                </button>

                                {/* Product Image */}
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className='w-full h-24 object-cover mb-3'
                                    style={{ borderRadius: '4px' }}
                                />

                                {/* Product Title */}
                                <h4 className='font-bold text-sm mb-3' style={{ color: 'var(--text-primary)' }}>
                                    {product.title}
                                </h4>

                                {/* Specs */}
                                <div className='space-y-2'>
                                    <div className='flex items-center gap-2'>
                                        <Cpu className='w-4 h-4' style={{ color: 'var(--text-tertiary)' }} />
                                        <span className='mono text-xs' style={{ color: 'var(--text-secondary)' }}>
                                            {product.cpu || 'Intel i7-12700H'}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Monitor className='w-4 h-4' style={{ color: 'var(--text-tertiary)' }} />
                                        <span className='mono text-xs' style={{ color: 'var(--text-secondary)' }}>
                                            {product.gpu || 'RTX 3070 Ti'}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <HardDrive className='w-4 h-4' style={{ color: 'var(--text-tertiary)' }} />
                                        <span className='mono text-xs' style={{ color: 'var(--text-secondary)' }}>
                                            {product.ram || '32GB DDR5'}
                                        </span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className='mt-3 pt-3' style={{ borderTop: '1px solid var(--border-primary)' }}>
                                    <span className='mono text-lg font-bold' style={{ color: 'var(--accent-primary)' }}>
                                        ${product.price}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

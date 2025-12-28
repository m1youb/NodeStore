import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore'
import { useCartStore } from '../store/CartStore'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function FeaturedProduct({ product, isAdmin = false, onEdit, onDelete }) {
    const { user } = useAuthStore();
    const { addToCart } = useCartStore()
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation(); // Prevent card click when clicking button
        addToCart(product, user);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit?.(product);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete?.(product);
    };

    return (
        <div
            onClick={handleCardClick}
            className='hardware-card group cursor-pointer hover:border-accent transition-all relative'
        >
            {/* Admin Controls Overlay */}
            {isAdmin && (
                <div className='absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <button
                        onClick={handleEdit}
                        className='p-2 bg-blue-500/90 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg'
                        title="Edit Product"
                    >
                        <Edit2 className='w-4 h-4' />
                    </button>
                    <button
                        onClick={handleDelete}
                        className='p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-colors shadow-lg'
                        title="Delete Product"
                    >
                        <Trash2 className='w-4 h-4' />
                    </button>
                </div>
            )}

            {/* Status Badge */}
            <div className='status-badge'>
                FEATURED
            </div>

            {/* Image Container */}
            <div className='relative overflow-hidden h-56 bg-[#1A1A1A] flex items-center justify-center'>
                <img
                    src={product.image}
                    alt={product.title}
                    className='w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105 z-10'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60 z-0'></div>
            </div>

            {/* Content */}
            <div className='p-5'>
                <h3 className='text-lg font-bold tracking-tight mb-2 uppercase line-clamp-1'>
                    {product.title}
                </h3>
                <p className='text-sm text-[#B0B0B0] mb-3 line-clamp-2'>
                    {product.description}
                </p>

                {/* Price */}
                <div className='flex items-center justify-between mb-4'>
                    <span className='mono text-[#00FF88] font-bold text-xl'>
                        ${product.price}
                    </span>
                    <span className='spec-summary'>
                        {product.category?.toUpperCase()}
                    </span>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    className='w-full flex items-center justify-center gap-2 py-3 border border-[#222222] hover:border-[#00D9FF] hover:bg-[#00D9FF]/10 transition-fast group/btn'
                >
                    <Plus className="w-4 h-4 text-[#B0B0B0] group-hover/btn:text-[#00D9FF] transition-fast" />
                    <span className='mono text-sm font-medium text-[#B0B0B0] group-hover/btn:text-[#00D9FF] transition-fast'>
                        ADD TO CART
                    </span>
                </button>
            </div>
        </div>
    )
}

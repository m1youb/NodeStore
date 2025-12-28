import { Minus, Plus, Trash2 } from 'lucide-react'
import React from 'react'
import { useAuthStore } from '../store/AuthStore'
import { useCartStore } from '../store/CartStore'

export default function CartProduct({ item }) {
    const { user } = useAuthStore();
    const { updateQuantity, removeFromCart } = useCartStore();

    const itemId = item.id || item._id;

    return (
        <div className='hardware-card p-4 flex items-center justify-between gap-4 w-full group'>
            <div className='flex items-center gap-6'>
                <div className='w-24 h-24 bg-black/50 rounded-md border border-white/10 p-2'>
                    <img
                        src={item.image}
                        alt={item.title}
                        className='w-full h-full object-contain'
                    />
                </div>

                <div className='flex flex-col gap-1'>
                    <h3 className='font-bold text-white text-lg tracking-tight'>{item.title}</h3>
                    <span className='text-xs font-mono text-gray-500 uppercase'>{item.category}</span>
                    <span className='text-accent font-mono font-bold mt-1'>${item.price}</span>
                </div>
            </div>

            <div className='flex items-center gap-8'>
                {/* Quantity Controls */}
                <div className='flex items-center bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden'>
                    <button
                        onClick={() => updateQuantity(itemId, item.quantity - 1, user)}
                        className='p-3 hover:bg-white/5 transition-colors text-gray-400 hover:text-white'
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className='w-12 text-center font-mono text-sm'>{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(itemId, item.quantity + 1, user)}
                        className='p-3 hover:bg-white/5 transition-colors text-gray-400 hover:text-white'
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <h2 className='font-mono font-bold text-lg min-w-[100px] text-right'>
                    ${((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)}
                </h2>

                <button
                    onClick={() => removeFromCart(itemId, user)}
                    className='p-2 text-gray-500 hover:text-red-500 transition-colors'
                    title="Remove Item"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}

import React, { useEffect } from 'react'
import { useCartStore } from '../store/CartStore'
import { Plus } from 'lucide-react';

export default function SuugestedProduct() {
    const { suggestions, getSuggestion, addToCart } = useCartStore();

    useEffect(() => {
        getSuggestion();
    }, [getSuggestion])


    return (
        <div className='mt-12'>
            <h3 className='text-xl font-bold text-white mb-6 mono'>PEOPLE ALSO BOUGHT</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {
                    suggestions.map(pr => (
                        <div key={pr._id} className='hardware-card p-4 flex flex-col gap-4 group'>
                            <div className='w-full h-40 bg-black/50 rounded flex items-center justify-center p-2'>
                                <img
                                    src={pr.image}
                                    alt={pr.title}
                                    className='w-full h-full object-contain group-hover:scale-105 transition-transform'
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className='font-bold text-white text-sm line-clamp-1 mb-1'>{pr.title}</h3>
                                <h3 className='text-accent font-mono font-bold'>${(Number(pr.price) || 0).toFixed(2)}</h3>
                            </div>
                            <button
                                onClick={() => addToCart(pr)}
                                className='w-full py-2 bg-[#222] border border-[#333] hover:border-white text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors'
                            >
                                <Plus className="w-3 h-3" />
                                ADD TO CART
                            </button>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

import { ShoppingCartIcon } from 'lucide-react'
import React from 'react'
import { useAuthStore } from '../store/AuthStore'
import toast from 'react-hot-toast';
import { useCartStore } from '../store/CartStore';

export default function ProductCard({ product }) {
  const { user } = useAuthStore();
  const { isLoading, addToCart } = useCartStore()

  const handleAddCart = function () {
    if (user) {
      addToCart(product);
    } else {
      toast.error("Login or create an account first", { id: "login" });
      return
    }
  }

  const handleImageError = (e) => {
    console.error('Failed to load image for product:', product?.title, 'URL:', product?.image);
    e.target.style.display = 'none';
    e.target.parentElement.innerHTML = `
      <div class="w-full h-full flex items-center justify-center bg-slate-800">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        </svg>
      </div>
    `;
  }

  return (
    <div className='card card-bordered w-[300px] h-[360px] bg-slate-900 rounded-lg mx-10'>
      <figure className='h-48 overflow-hidden'>
        <img
          src={product?.image}
          alt={product?.title || 'Product'}
          className='w-full h-full object-cover'
          onError={handleImageError}
        />
      </figure>
      <div className='card-body'>
        <h1 className='text-xl font-bold'>{product?.title}</h1>
        <p className='text-md font-bold'>{product?.description}</p>
        <h1 className='text-xl font-bold'>{product?.price} DH</h1>
      </div>
      <div className='card-actions'>
        <button
          onClick={handleAddCart}
          className='btn btn-square btn-primary w-full'>Add to cart <ShoppingCartIcon /></button>
      </div>
    </div>
  )
}

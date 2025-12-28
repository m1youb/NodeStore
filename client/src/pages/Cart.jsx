import React, { useEffect } from 'react'
import { useCartStore } from '../store/CartStore'
import CartProduct from '../components/CartProduct';
import { useAuthStore } from '../store/AuthStore';
import OrderSummary from '../components/OrderSummary';
import SuugestedProduct from '../components/SuugestedProduct';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Cart() {
  const { cartItems, totalAmount, subTotal, suggestions, getSuggestion } = useCartStore();

  useEffect(() => {
    getSuggestion();
  }, [getSuggestion])

  if (cartItems.length === 0) {
    return (
      <div className='min-h-[80vh] flex flex-col items-center justify-center p-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col items-center text-center space-y-6 max-w-md'
        >
          <div className='w-24 h-24 rounded-full bg-[#121212] flex items-center justify-center border border-[#262626]'>
            <ShoppingBag className='w-12 h-12 text-[#444]' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-white mb-2'>YOUR CART IS EMPTY</h2>
            <p className='text-gray-500'>Looks like you haven't added anything to your cart yet.</p>
          </div>
          <Link
            to="/"
            className='px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2'
          >
            <span>START SHOPPING</span>
            <ArrowRight className='w-4 h-4' />
          </Link>
        </motion.div>

        {/* Suggestions even when empty */}
        <div className='mt-24 w-full max-w-7xl'>
          <SuugestedProduct />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
      <h1 className='text-3xl md:text-4xl font-bold mono text-white mb-8 tracking-tight'>
        YOUR CART <span className='text-gray-500 text-lg ml-2'>({cartItems.length} items)</span>
      </h1>

      <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
        {/* Left Column: Cart Items */}
        <div className='flex-1 space-y-6'>
          <div className='space-y-4'>
            {cartItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CartProduct item={item} />
              </motion.div>
            ))}
          </div>

          <div className='pt-12'>
            <SuugestedProduct />
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className='lg:w-[400px] flex-shrink-0'>
          <div className='lg:sticky lg:top-24'>
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}

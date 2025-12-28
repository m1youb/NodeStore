import React, { useEffect, useState } from 'react'
import { useCartStore } from '../store/CartStore'
import { useAuthStore } from '../store/AuthStore'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from "@stripe/stripe-js"
import toast from 'react-hot-toast';
import { X, CreditCard, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const stripePromise = loadStripe("pk_test_51R80KDR6STGHtwUjjE1Z4cvCj1y2yFPQiuLtiihJXV1VrUdMzNmnXuDaSn6LG6MGIGjMXjrlzTJUv3sEy8BfsYrr00OHYV0jbs")

export default function OrderSummary() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { calculateTotalAmount, totalAmount, subTotal, session, createSession, cartItems, coupon, isCouponApplied, getCoupon, applyCoupon, removeCoupon } = useCartStore();
    const [couponCode, setCouponCode] = useState('');

    const handlePayment = async function () {
        if (!user) {
            // Redirect to signup if not logged in
            navigate('/signup');
            return;
        }
        // Navigate to checkout page
        navigate('/checkout');
    }
    useEffect(() => {
        calculateTotalAmount()
    }, [calculateTotalAmount])

    useEffect(() => {
        getCoupon(user);
    }, [getCoupon, user])

    return (
        <div className='flex flex-col gap-6 w-full'>
            {/* Order Summary Card */}
            <div className='hardware-card p-6 space-y-6' >
                <h2 className='text-lg font-bold text-white mono tracking-tight flex items-center gap-2'>
                    <CreditCard className="w-5 h-5 text-accent" />
                    ORDER SUMMARY
                </h2>

                <div className='space-y-3 font-mono text-sm'>
                    <div className='flex justify-between items-center text-gray-400'>
                        <span>Subtotal</span>
                        <span className='text-white'>${Number(subTotal).toFixed(2)}</span>
                    </div>
                    {coupon && isCouponApplied && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className='flex justify-between items-center text-green-500'
                        >
                            <span>Discount ({coupon.code})</span>
                            <span>-10%</span>
                        </motion.div>
                    )}

                    <div className='h-px bg-white/10 my-4' />

                    <div className='flex justify-between items-center text-lg font-bold'>
                        <span className='text-white'>Total</span>
                        <span className='text-accent'>${Number(totalAmount).toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handlePayment}
                    className='w-full py-4 bg-white text-black font-bold text-sm rounded-md hover:bg-gray-200 transition-colors tracking-wider flex items-center justify-center gap-2'
                >
                    {user ? 'PROCEED TO CHECKOUT' : 'LOGIN TO CHECKOUT'}
                </button>
            </div>

            {/* Coupon Card */}
            <div className='hardware-card p-6 space-y-4' >
                <h2 className='text-sm font-bold text-gray-400 mono flex items-center gap-2'>
                    <Tag className="w-4 h-4" />
                    HAVE A COUPON?
                </h2>

                {isCouponApplied && coupon ? (
                    <div className='flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded text-green-500 font-mono text-sm'>
                        <span className='font-bold'>{coupon.code}</span>
                        <button onClick={() => removeCoupon()} className='hover:text-green-400'>
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className='flex gap-2'>
                        <input
                            type='text'
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className='flex-1 bg-[#0a0a0a] border border-white/10 rounded p-3 text-white text-sm font-mono focus:border-white/30 outline-none transition-colors'
                            placeholder='Enter code'
                        />
                        <button
                            onClick={() => applyCoupon(couponCode)}
                            className='px-4 bg-[#262626] text-white text-xs font-bold rounded hover:bg-[#333] transition-colors'
                        >
                            APPLY
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

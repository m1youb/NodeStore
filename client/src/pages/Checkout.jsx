import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/AuthStore';
import { useCartStore } from '../store/CartStore';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Package, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import AxiosInstance from '../utils/axios';

export default function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { cartItems, totalAmount, clearCart } = useCartStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        shipping_address: '',
        city: '',
        country: '',
        postal_code: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.shipping_address.trim()) {
            toast.error('Please enter your shipping address');
            return false;
        }
        if (!formData.city.trim()) {
            toast.error('Please enter your city');
            return false;
        }
        if (!formData.country.trim()) {
            toast.error('Please enter your country');
            return false;
        }
        if (!formData.postal_code.trim()) {
            toast.error('Please enter your postal code');
            return false;
        }
        return true;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setIsLoading(true);
        try {
            const response = await AxiosInstance.post('/payment/create-cod-order', {
                products: cartItems,
                shipping_address: formData.shipping_address,
                city: formData.city,
                country: formData.country,
                postal_code: formData.postal_code,
                total_amount: totalAmount
            });

            if (response.data.success) {
                toast.success(response.data.message);
                clearCart(user);
                navigate('/');
            }
        } catch (error) {
            console.error('Place order error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setIsLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className='min-h-screen flex items-center justify-center p-6'>
                <div className='text-center'>
                    <Package className='w-16 h-16 mx-auto mb-4 text-gray-500' />
                    <h2 className='text-2xl font-bold text-white mb-2'>Your cart is empty</h2>
                    <p className='text-gray-400 mb-6'>Add some items to checkout</p>
                    <button
                        onClick={() => navigate('/')}
                        className='px-6 py-3 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-colors'
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
            <button
                onClick={() => navigate('/cart')}
                className='flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8'
            >
                <ArrowLeft className='w-4 h-4' />
                <span>Back to Cart</span>
            </button>

            <h1 className='text-3xl md:text-4xl font-bold mono text-white mb-8 tracking-tight'>
                CHECKOUT
            </h1>

            <div className='grid lg:grid-cols-3 gap-8'>
                {/* Left Column: Shipping Form */}
                <div className='lg:col-span-2 space-y-6'>
                    {/* Shipping Information */}
                    <div className='hardware-card p-6'>
                        <h2 className='text-xl font-bold text-white mb-6 flex items-center gap-2'>
                            <MapPin className='w-5 h-5 text-accent' />
                            SHIPPING INFORMATION
                        </h2>

                        <form onSubmit={handlePlaceOrder} className='space-y-4'>
                            <div>
                                <label className='block text-sm font-mono text-gray-400 mb-2'>
                                    Address <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='text'
                                    name='shipping_address'
                                    value={formData.shipping_address}
                                    onChange={handleChange}
                                    className='w-full bg-[#0a0a0a] border border-white/10 rounded p-3 text-white text-sm font-mono focus:border-white/30 outline-none transition-colors'
                                    placeholder='123 Main Street, Apartment 4B'
                                    disabled={isLoading}
                                />
                            </div>

                            <div className='grid md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-mono text-gray-400 mb-2'>
                                        City <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='text'
                                        name='city'
                                        value={formData.city}
                                        onChange={handleChange}
                                        className='w-full bg-[#0a0a0a] border border-white/10 rounded p-3 text-white text-sm font-mono focus:border-white/30 outline-none transition-colors'
                                        placeholder='New York'
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-mono text-gray-400 mb-2'>
                                        Country <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='text'
                                        name='country'
                                        value={formData.country}
                                        onChange={handleChange}
                                        className='w-full bg-[#0a0a0a] border border-white/10 rounded p-3 text-white text-sm font-mono focus:border-white/30 outline-none transition-colors'
                                        placeholder='United States'
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-mono text-gray-400 mb-2'>
                                    Postal Code <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='text'
                                    name='postal_code'
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    className='w-full bg-[#0a0a0a] border border-white/10 rounded p-3 text-white text-sm font-mono focus:border-white/30 outline-none transition-colors'
                                    placeholder='10001'
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Payment Method */}
                            <div className='hardware-card p-6 mt-6 bg-[#0a0a0a]'>
                                <h3 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
                                    <CreditCard className='w-5 h-5 text-accent' />
                                    PAYMENT METHOD
                                </h3>

                                <div className='border border-white/10 rounded p-4 flex items-center justify-between bg-[#141414]'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center'>
                                            <Check className='w-5 h-5 text-green-500' />
                                        </div>
                                        <div>
                                            <p className='font-bold text-white'>Cash on Delivery</p>
                                            <p className='text-sm text-gray-400'>Pay when you receive your order</p>
                                        </div>
                                    </div>
                                    <div className='px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded'>
                                        SELECTED
                                    </div>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                type='submit'
                                disabled={isLoading}
                                className='w-full py-4 bg-white text-black font-bold text-sm rounded-md hover:bg-gray-200 transition-colors tracking-wider disabled:opacity-50 disabled:cursor-not-allowed mt-6'
                            >
                                {isLoading ? 'PLACING ORDER...' : 'PLACE ORDER'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className='lg:sticky lg:top-24 h-fit'>
                    <div className='hardware-card p-6'>
                        <h2 className='text-lg font-bold text-white mono mb-6'>
                            ORDER SUMMARY
                        </h2>

                        {/* Cart Items */}
                        <div className='space-y-4 mb-6 max-h-[400px] overflow-y-auto'>
                            {cartItems.map((item) => (
                                <div key={item.id} className='flex gap-3'>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className='w-16 h-16 object-cover rounded border border-white/10'
                                    />
                                    <div className='flex-1'>
                                        <p className='text-sm font-bold text-white'>{item.title}</p>
                                        <p className='text-xs text-gray-400'>Qty: {item.quantity}</p>
                                        <p className='text-sm text-accent font-mono'>${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='h-px bg-white/10 my-4' />

                        {/* Total */}
                        <div className='space-y-3 font-mono text-sm'>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-400'>Subtotal</span>
                                <span className='text-white'>${totalAmount.toFixed(2)}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-400'>Shipping</span>
                                <span className='text-green-500'>FREE</span>
                            </div>

                            <div className='h-px bg-white/10 my-4' />

                            <div className='flex justify-between items-center text-lg font-bold'>
                                <span className='text-white'>Total</span>
                                <span className='text-accent'>${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

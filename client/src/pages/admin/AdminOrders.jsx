import React, { useEffect, useState } from 'react';
import AxiosInstance from '../../utils/axios';
import toast from 'react-hot-toast';
import { Package, MapPin, CreditCard, Calendar, Loader, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await AxiosInstance.get('/payment/all-orders');
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Fetch orders error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await AxiosInstance.put(`/payment/update-status/${orderId}`, {
                status: newStatus
            });

            if (response.data.success) {
                toast.success('Order status updated');
                fetchOrders(); // Refresh orders
            }
        } catch (error) {
            console.error('Update status error:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const deleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await AxiosInstance.delete(`/payment/delete-order/${orderId}`);
            if (response.data.success) {
                toast.success('Order deleted successfully');
                fetchOrders(); // Refresh orders
            }
        } catch (error) {
            console.error('Delete order error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete order');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
            cancelled: 'bg-red-500/10 text-red-500 border-red-500/20'
        };
        return colors[status] || colors.pending;
    };

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-64'>
                <Loader className='w-8 h-8 animate-spin text-accent' />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className='text-center py-12'>
                <Package className='w-16 h-16 mx-auto mb-4 text-gray-500' />
                <h3 className='text-xl font-bold text-white mb-2'>No Orders Yet</h3>
                <p className='text-gray-400'>Orders will appear here when customers place them</p>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold text-white'>Orders Management</h2>
                <div className='text-sm text-gray-400'>
                    Total Orders: <span className='text-white font-bold'>{orders.length}</span>
                </div>
            </div>

            <div className='grid gap-4'>
                {orders.map((order) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='hardware-card p-6'
                    >
                        <div className='flex flex-col lg:flex-row gap-6'>
                            {/* Left: Order Info */}
                            <div className='flex-1 space-y-4'>
                                <div className='flex items-start justify-between'>
                                    <div>
                                        <h3 className='text-lg font-bold text-white mb-1'>
                                            Order #{order.id}
                                        </h3>
                                        <p className='text-sm text-gray-400 flex items-center gap-2'>
                                            <Calendar className='w-4 h-4' />
                                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Customer & Shipping Info */}
                                <div className='grid md:grid-cols-2 gap-4 text-sm'>
                                    <div>
                                        <p className='text-gray-400 mb-1'>Customer:</p>
                                        <p className='text-white font-mono'>{order.username || 'N/A'}</p>
                                        <p className='text-gray-500 text-xs'>{order.email || ''}</p>
                                    </div>
                                    <div>
                                        <p className='text-gray-400 mb-1 flex items-center gap-1'>
                                            <MapPin className='w-3 h-3' />
                                            Shipping Address:
                                        </p>
                                        <p className='text-white'>{order.shipping_address}</p>
                                        <p className='text-gray-400'>{order.city}, {order.country} - {order.postal_code}</p>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className='flex items-center gap-2 text-sm'>
                                    <CreditCard className='w-4 h-4 text-gray-400' />
                                    <span className='text-gray-400'>Payment:</span>
                                    <span className='text-white capitalize'>{order.payment_method?.replace('_', ' ')}</span>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <p className='text-gray-400 text-sm mb-2'>Items:</p>
                                    <div className='space-y-2'>
                                        {order.products?.map((item, index) => (
                                            <div key={index} className='flex items-center gap-3 text-sm'>
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.title}
                                                    className='w-12 h-12 object-cover rounded border border-white/10'
                                                />
                                                <div className='flex-1'>
                                                    <p className='text-white font-medium'>{item.product.title}</p>
                                                    <p className='text-gray-400 text-xs'>Qty: {item.quantity} × ${item.price}</p>
                                                </div>
                                                <p className='text-accent font-mono'>${(item.quantity * item.price).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className='flex justify-between items-center pt-4 border-t border-white/10'>
                                    <span className='text-gray-400 font-bold'>Total Amount:</span>
                                    <span className='text-2xl font-bold text-accent'>${order.total_amount}</span>
                                </div>
                            </div>

                            {/* Right: Status Update */}
                            <div className='lg:w-64 space-y-3'>
                                <p className='text-sm text-gray-400 font-bold'>Update Status:</p>
                                <div className='space-y-2'>
                                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateOrderStatus(order.id, status)}
                                            disabled={order.status === status}
                                            className={`w-full px-4 py-2 text-xs font-bold rounded border transition-colors ${order.status === status
                                                ? getStatusColor(status) + ' cursor-not-allowed'
                                                : 'border-white/10 text-gray-400 hover:bg-white/5'
                                                }`}
                                        >
                                            {status.toUpperCase()}
                                        </button>
                                    ))}
                                </div>

                                {/* Delete Order Button */}
                                <button
                                    onClick={() => deleteOrder(order.id)}
                                    className='w-full px-4 py-2 text-xs font-bold rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 mt-4'
                                >
                                    <Trash2 className='w-4 h-4' />
                                    DELETE ORDER
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

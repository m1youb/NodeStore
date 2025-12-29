import { useEffect } from 'react';
import { useOrderStore } from '../store/OrderStore';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyOrders() {
    const { orders, isLoading, fetchUserOrders } = useOrderStore();
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchUserOrders();
    }, [fetchUserOrders]);

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                color: '#FFB800',
                bg: '#FFB80020',
                icon: Clock,
                label: 'Pending'
            },
            processing: {
                color: '#0EA5E9',
                bg: '#0EA5E920',
                icon: Package,
                label: 'Processing'
            },
            shipped: {
                color: '#8B5CF6',
                bg: '#8B5CF620',
                icon: Truck,
                label: 'Shipped'
            },
            delivered: {
                color: '#10B981',
                bg: '#10B98120',
                icon: CheckCircle,
                label: 'Delivered'
            },
            cancelled: {
                color: '#EF4444',
                bg: '#EF444420',
                icon: XCircle,
                label: 'Cancelled'
            }
        };
        return configs[status] || configs.pending;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-tertiary)' }} />
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>No Orders Yet</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Start shopping to see your orders here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mono mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    My Orders
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Track and manage your order history
                </p>
            </div>

            <div className="space-y-4">
                {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    const isExpanded = expandedOrder === order.id;

                    return (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 transition-smooth"
                        >
                            {/* Order Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold mono" style={{ color: 'var(--color-text-primary)' }}>
                                            Order #{order.id}
                                        </h3>
                                        <div
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mono"
                                            style={{
                                                background: statusConfig.bg,
                                                color: statusConfig.color
                                            }}
                                        >
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {statusConfig.label.toUpperCase()}
                                        </div>
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        Placed on {formatDate(order.created_at)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold mono" style={{ color: 'var(--color-accent)' }}>
                                        ${order.total_amount?.toFixed(2)}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                        {order.products?.length || 0} items
                                    </p>
                                </div>
                            </div>

                            {/* Products Preview */}
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                {order.products?.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="flex-shrink-0">
                                        <img
                                            src={item.product?.image || '/placeholder.png'}
                                            alt={item.product?.title}
                                            className="w-16 h-16 object-cover rounded"
                                            style={{ border: '1px solid var(--color-border)' }}
                                        />
                                    </div>
                                ))}
                                {order.products?.length > 4 && (
                                    <div
                                        className="w-16 h-16 flex items-center justify-center rounded"
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--color-border)'
                                        }}
                                    >
                                        <span className="text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                                            +{order.products.length - 4}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Expand/Collapse Button */}
                            <button
                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded transition-fast"
                                style={{
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text-secondary)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                            >
                                <span className="text-sm font-medium">{isExpanded ? 'Hide' : 'Show'} Details</span>
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                                            {/* Shipping Information */}
                                            {order.shipping_address && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-bold mono mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                                        Shipping Address
                                                    </h4>
                                                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                                        {order.shipping_address}<br />
                                                        {order.city}, {order.country}<br />
                                                        {order.postal_code}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Products List */}
                                            <div>
                                                <h4 className="text-sm font-bold mono mb-3" style={{ color: 'var(--color-text-primary)' }}>
                                                    Order Items
                                                </h4>
                                                <div className="space-y-2">
                                                    {order.products?.map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-3 p-3 rounded"
                                                            style={{ background: 'var(--bg-secondary)' }}
                                                        >
                                                            <img
                                                                src={item.product?.image || '/placeholder.png'}
                                                                alt={item.product?.title}
                                                                className="w-12 h-12 object-cover rounded"
                                                            />
                                                            <div className="flex-1">
                                                                <h5 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                                                    {item.product?.title}
                                                                </h5>
                                                                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                                                    Qty: {item.quantity}
                                                                </p>
                                                            </div>
                                                            <p className="font-bold mono" style={{ color: 'var(--color-text-primary)' }}>
                                                                ${(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

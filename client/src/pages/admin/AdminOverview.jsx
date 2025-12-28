import { useEffect, useState } from 'react';
import { Users, Package, ShoppingCart } from 'lucide-react';
import AxiosInstance from '../../utils/axios';
import toast from 'react-hot-toast';

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await AxiosInstance.get('/admin/stats');
            setStats(response.data.stats);
        } catch (error) {
            toast.error('Failed to load stats');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: '#FFFFFF'
        },
        {
            label: 'Total Products',
            value: stats.totalProducts,
            icon: Package,
            color: '#FFFFFF'
        },
        {
            label: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: '#FFFFFF'
        }
    ];

    if (loading) {
        return (
            <div className='flex items-center justify-center h-64'>
                <p className='mono' style={{ color: 'var(--text-secondary)' }}>Loading stats...</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className='text-3xl font-bold mb-8 mono' style={{ color: 'var(--text-primary)' }}>
                DASHBOARD OVERVIEW
            </h1>

            {/* Stats Grid */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className='hardware-card p-6'
                        >
                            <div className='flex items-center justify-between mb-4'>
                                <Icon className='w-8 h-8' style={{ color: stat.color }} />
                            </div>
                            <p className='text-sm mono mb-2' style={{ color: 'var(--text-secondary)' }}>
                                {stat.label}
                            </p>
                            <p className='text-4xl font-bold mono' style={{ color: 'var(--text-primary)' }}>
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

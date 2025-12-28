import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/AuthStore';
import { LayoutDashboard, Users, Package, Settings, LogOut, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminLayout() {
    const { user, logoutFunc } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not admin
        if (user && user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' }
    ];

    const handleLogout = async () => {
        await logoutFunc();
        navigate('/login');
    };

    return (
        <div className='flex min-h-screen' style={{ background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <aside className='w-64 fixed left-0 top-0 h-full' style={{
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-primary)'
            }}>
                {/* Logo */}
                <div className='p-6 border-b' style={{ borderColor: 'var(--border-primary)' }}>
                    <Link to="/" className='flex items-center gap-3 group mb-8'>
                        <div className='w-10 h-10 flex items-center justify-center rounded-lg transition-colors' style={{
                            background: 'var(--color-accent)',
                            color: 'var(--color-bg)'
                        }}>
                            <ShoppingBag className='w-6 h-6' />
                        </div>
                        <div>
                            <h2 className='font-bold text-xl tracking-tight mono transition-fast' style={{ color: 'var(--color-text-primary)' }}>
                                GEAR STORE
                            </h2>
                            <p className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>Admin Panel</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className='p-4'>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className='flex items-center gap-3 px-4 py-3 mb-2 transition-fast'
                                style={{
                                    background: isActive ? 'var(--bg-primary)' : 'transparent',
                                    border: `1px solid ${isActive ? 'var(--border-hover)' : 'transparent'}`,
                                    borderRadius: '4px',
                                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'var(--bg-primary)';
                                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }
                                }}
                            >
                                <Icon className='w-5 h-5' />
                                <span className='font-medium'>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Logout */}
                <div className='absolute bottom-0 left-0 right-0 p-4' style={{
                    borderTop: '1px solid var(--border-primary)'
                }}>
                    <div className='mb-3 px-2'>
                        <p className='text-xs mono' style={{ color: 'var(--text-tertiary)' }}>
                            Logged in as
                        </p>
                        <p className='font-bold text-sm' style={{ color: 'var(--text-primary)' }}>
                            {user?.username}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className='w-full flex items-center justify-center gap-2 px-4 py-2 transition-fast'
                        style={{
                            border: '1px solid var(--border-primary)',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-hover)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-primary)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        <LogOut className='w-4 h-4' />
                        <span className='font-medium'>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className='ml-64 flex-1 p-8'>
                <Outlet />
            </main>
        </div>
    );
}

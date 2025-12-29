import { HomeIcon, LoaderCircleIcon, LayoutDashboardIcon, LogInIcon, LogOutIcon, ShoppingCartIcon, UserPlusIcon, Sun, Moon, Package } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuthStore } from "../store/AuthStore";
import { useCartStore } from "../store/CartStore";
import { useTheme } from "../context/ThemeContext";
import SearchBar from "./SearchBar";

export default function Navbar() {
    const { isLoggingOut, logoutFunc, user } = useAuthStore();
    const isAdmin = user?.role === "admin";
    const { cartItems } = useCartStore();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6">
            <nav className='glass-strong max-w-6xl w-full flex justify-between items-center px-8 py-3 transition-smooth' style={{ borderRadius: '50px' }}>
                {/* Logo */}
                <Link to="/">
                    <div className='flex items-center gap-3 group'>
                        <div className='w-8 h-8 flex items-center justify-center rounded-lg transition-colors' style={{
                            background: 'var(--color-accent)',
                            color: 'var(--color-bg)'
                        }}>
                            <ShoppingCartIcon className='w-5 h-5' />
                        </div>
                        <h2 className='font-bold text-lg tracking-tight mono transition-fast' style={{ color: 'var(--color-text-primary)' }}>
                            GEAR STORE
                        </h2>
                    </div>
                </Link>

                {/* Search Bar */}
                <SearchBar />

                {/* Spacer removed - search bar is now flex-1 */}

                {/* Navigation Icons */}
                <div className='flex items-center gap-2'>
                    {/* Admin Dashboard */}
                    {
                        isAdmin && (
                            <Link to="/admin/dashboard">
                                <button
                                    className="w-9 h-9 flex items-center justify-center transition-fast group relative"
                                    style={{
                                        border: `1px solid var(--color-border)`,
                                        borderRadius: '50%'
                                    }}
                                    title="Dashboard"
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                                >
                                    <LayoutDashboardIcon className="w-4 h-4 transition-fast" style={{ color: 'var(--color-text-secondary)' }} />
                                </button>
                            </Link>
                        )
                    }

                    {/* Home */}
                    <Link to='/'>
                        <button
                            className="w-9 h-9 flex items-center justify-center transition-fast group"
                            style={{
                                border: `1px solid var(--color-border)`,
                                borderRadius: '50%'
                            }}
                            title="Home"
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                        >
                            <HomeIcon className="w-4 h-4 transition-fast" style={{ color: 'var(--color-text-secondary)' }} />
                        </button>
                    </Link>

                    {/* My Orders - Show only for logged-in users */}
                    {user && (
                        <Link to='/my-orders'>
                            <button
                                className="w-9 h-9 flex items-center justify-center transition-fast group"
                                style={{
                                    border: `1px solid var(--color-border)`,
                                    borderRadius: '50%'
                                }}
                                title="My Orders"
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                            >
                                <Package className="w-4 h-4 transition-fast" style={{ color: 'var(--color-text-secondary)' }} />
                            </button>
                        </Link>
                    )}

                    {/* Cart - Show only when there are items */}
                    {cartItems.length > 0 && (
                        <Link to='/cart'>
                            <button
                                className="w-9 h-9 flex items-center justify-center transition-fast group relative"
                                style={{
                                    border: `1px solid var(--color-border)`,
                                    borderRadius: '50%'
                                }}
                                title="Cart"
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                            >
                                <ShoppingCartIcon className="w-4 h-4 transition-fast" style={{ color: 'var(--color-text-secondary)' }} />
                                <span className='absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold mono' style={{
                                    background: 'var(--color-accent)',
                                    color: 'var(--color-bg)',
                                    borderRadius: '50%'
                                }}>
                                    {cartItems.length}
                                </span>
                            </button>
                        </Link>
                    )}

                    {/* Divider */}
                    <div className='w-px h-6 mx-1' style={{ background: 'var(--color-border)' }}></div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 flex items-center justify-center transition-fast group"
                        style={{
                            border: `1px solid var(--color-border)`,
                            borderRadius: '50%'
                        }}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 transition-fast" style={{ color: 'var(--color-text-secondary)' }} />
                        ) : (
                            <Moon className="w-4 h-4 transition-fast" style={{ color: 'var(--color-text-secondary)' }} />
                        )}
                    </button>

                    {/* Auth Buttons */}
                    {
                        user ? (
                            <>
                                {/* User Greeting */}
                                <div className='flex items-center gap-2 px-3 py-1 mono text-sm' style={{
                                    color: 'var(--color-text-primary)',
                                    borderLeft: '1px solid var(--color-border)'
                                }}>
                                    <span>Hello, <strong>{user.fullname?.split(' ')[0] || user.username}</strong></span>
                                </div>

                                {/* Logout Button */}
                                <button
                                    className="w-9 h-9 flex items-center justify-center transition-fast group"
                                    style={{
                                        border: `1px solid var(--color-border)`,
                                        borderRadius: '50%'
                                    }}
                                    onClick={logoutFunc}
                                    title="Logout"
                                    disabled={isLoggingOut}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                                >
                                    {
                                        !isLoggingOut ? (
                                            <LogOutIcon className="w-4 h-4 transition-fast" style={{ color: 'var(--color-text-secondary)' }} />
                                        ) : (
                                            <LoaderCircleIcon className="w-4 h-4 animate-spin" style={{ color: 'var(--color-text-secondary)' }} />
                                        )
                                    }
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <button
                                        className="w-9 h-9 flex items-center justify-center transition-fast group"
                                        style={{
                                            border: `1px solid var(--color-border)`,
                                            borderRadius: '50%'
                                        }}
                                        title="Login"
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                                    >
                                        <LogInIcon className="w-4 h-4 transition-fast" style={{ color: 'var(--color-text-secondary)' }} />
                                    </button>
                                </Link>
                                <Link to="signup">
                                    <button
                                        className="w-9 h-9 flex items-center justify-center transition-fast group"
                                        style={{
                                            border: `1px solid var(--color-border)`,
                                            borderRadius: '50%'
                                        }}
                                        title="Sign Up"
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                                    >
                                        <UserPlusIcon className="w-4 h-4 transition-fast" style={{ color: 'var(--color-text-secondary)' }} />
                                    </button>
                                </Link>
                            </>
                        )
                    }
                </div>
            </nav>
        </div>
    )
}

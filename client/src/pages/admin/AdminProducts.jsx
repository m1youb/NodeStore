import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, AlertCircle } from 'lucide-react';
import AxiosInstance from '../../utils/axios';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import AdminProductForm from '../../components/admin/AdminProductForm';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await AxiosInstance.get('/products/all');
            console.log('Fetched products:', response.data.products);

            // Debug: Test each image URL
            response.data.products.forEach(p => {
                console.log(`Product: ${p.title}, Image URL: ${p.image}`);
                if (p.image) {
                    fetch(p.image, { method: 'HEAD' })
                        .then(res => console.log(`✅ Image accessible: ${p.title} (${res.status})`, p.image))
                        .catch(err => console.error(`❌ Image failed: ${p.title}`, p.image, err.message));
                }
            });

            setProducts(response.data.products);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            await AxiosInstance.delete(`/products/delete/${productId}`);
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleFormSubmit = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
        fetchProducts();
    };

    if (loading) {
        return <div className='flex items-center justify-center h-64'>
            <p className='mono' style={{ color: 'var(--text-secondary)' }}>Loading products...</p>
        </div>;
    }

    return (
        <div>
            <div className='flex items-center justify-between mb-8'>
                <h1 className='text-3xl font-bold mono' style={{ color: 'var(--text-primary)' }}>
                    PRODUCT MANAGEMENT
                </h1>
                <button
                    onClick={handleCreate}
                    className='flex items-center gap-2 px-4 py-2 font-bold mono transition-fast'
                    style={{
                        background: 'var(--text-primary)',
                        color: 'var(--bg-primary)',
                        borderRadius: '4px'
                    }}
                >
                    <Plus className='w-4 h-4' />
                    <span>ADD PRODUCT</span>
                </button>
            </div>

            {/* Products Table */}
            <div className='hardware-card overflow-hidden'>
                <table className='w-full'>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>Image</th>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>Title</th>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>Category</th>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>Price</th>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>Stock</th>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-sm mono">
                                    No products found. Add one to get started.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                    <td className='p-4'>
                                        <div className='w-16 h-12 bg-[#121212] rounded-md overflow-hidden border border-white/10'>
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className='w-full h-full object-cover'
                                                onError={(e) => {
                                                    console.error('Failed to load image:', product.image, 'for product:', product.title);
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className='p-4 font-medium' style={{ color: 'var(--text-primary)' }}>
                                        <Link
                                            to={`/product/${product.id}`}
                                            target="_blank"
                                            className="hover:text-accent transition-colors hover:underline"
                                            title="View Live Page"
                                        >
                                            {product.title}
                                        </Link>
                                    </td>
                                    <td className='p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>{product.category}</td>
                                    <td className='p-4 mono font-bold' style={{ color: 'var(--text-primary)' }}>${product.price}</td>
                                    <td className='p-4 mono text-sm'>
                                        <span className={`px-2 py-1 rounded text-xs border ${product.stock_count > 0
                                            ? 'border-green-900 text-green-500 bg-green-900/10'
                                            : 'border-red-900 text-red-500 bg-red-900/10'
                                            }`}>
                                            {product.stock_count}
                                        </span>
                                    </td>
                                    <td className='p-4'>
                                        <div className='flex gap-2'>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className='p-2 transition-fast'
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
                                                <Edit className='w-4 h-4' />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id, product.title)}
                                                className='p-2 transition-fast'
                                                style={{
                                                    border: '1px solid var(--border-primary)',
                                                    borderRadius: '4px',
                                                    color: 'var(--text-secondary)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#ff4444';
                                                    e.currentTarget.style.color = '#ff4444';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                                }}
                                            >
                                                <Trash2 className='w-4 h-4' />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Product Form Drawer/Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <AdminProductForm
                        product={editingProduct}
                        onClose={() => setIsFormOpen(false)}
                        onSuccess={handleFormSubmit}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

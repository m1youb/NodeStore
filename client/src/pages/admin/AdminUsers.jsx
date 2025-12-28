import { useEffect, useState } from 'react';
import { Edit, Trash2, X } from 'lucide-react';
import AxiosInstance from '../../utils/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        role: 'user'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await AxiosInstance.get('/admin/users');
            setUsers(response.data.users);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            fullname: user.fullname,
            email: user.email,
            password: '',
            role: user.role
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                fullname: formData.fullname,
                email: formData.email,
                role: formData.role
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            await AxiosInstance.patch(`/admin/users/${editingUser.id}`, updateData);
            toast.success('User updated successfully');
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDelete = async (userId, username) => {
        if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            try {
                await AxiosInstance.delete(`/admin/users/${userId}`);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    if (loading) {
        return <div className='flex items-center justify-center h-64'>
            <p className='mono' style={{ color: 'var(--text-secondary)' }}>Loading users...</p>
        </div>;
    }

    return (
        <div>
            <h1 className='text-3xl font-bold mb-8 mono' style={{ color: 'var(--text-primary)' }}>
                USER MANAGEMENT
            </h1>

            {/* Users Table */}
            <div className='hardware-card overflow-hidden'>
                <table className='w-full'>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>ID</th>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>Full Name</th>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>Username</th>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>Email</th>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>Role</th>
                            <th className='text-left p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                <td className='p-4 mono text-sm' style={{ color: 'var(--text-primary)' }}>{user.id}</td>
                                <td className='p-4' style={{ color: 'var(--text-primary)' }}>{user.fullname}</td>
                                <td className='p-4 mono text-sm' style={{ color: 'var(--text-secondary)' }}>{user.username}</td>
                                <td className='p-4 text-sm' style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                                <td className='p-4'>
                                    <span className='mono text-xs px-2 py-1' style={{
                                        background: user.role === 'admin' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                        border: `1px solid ${user.role === 'admin' ? 'rgba(255, 255, 255, 0.2)' : 'var(--border-primary)'}`,
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className='p-4'>
                                    <div className='flex gap-2'>
                                        <button
                                            onClick={() => handleEdit(user)}
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
                                            onClick={() => handleDelete(user.id, user.username)}
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 z-50 flex items-center justify-center p-4'
                        style={{ background: 'rgba(0,0,0,0.8)' }}
                        onClick={() => setEditingUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className='hardware-card p-6 w-full max-w-md'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-xl font-bold mono' style={{ color: 'var(--text-primary)' }}>
                                    EDIT USER
                                </h2>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className='p-1'
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <X className='w-5 h-5' />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className='space-y-4'>
                                <div>
                                    <label className='block text-sm mb-2 mono' style={{ color: 'var(--text-secondary)' }}>
                                        Full Name
                                    </label>
                                    <input
                                        type='text'
                                        value={formData.fullname}
                                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                        className='w-full p-3 bg-transparent outline-none'
                                        style={{
                                            border: '1px solid var(--border-primary)',
                                            borderRadius: '4px',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm mb-2 mono' style={{ color: 'var(--text-secondary)' }}>
                                        Email
                                    </label>
                                    <input
                                        type='email'
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className='w-full p-3 bg-transparent outline-none'
                                        style={{
                                            border: '1px solid var(--border-primary)',
                                            borderRadius: '4px',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm mb-2 mono' style={{ color: 'var(--text-secondary)' }}>
                                        New Password (leave blank to keep current)
                                    </label>
                                    <input
                                        type='password'
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className='w-full p-3 bg-transparent outline-none'
                                        style={{
                                            border: '1px solid var(--border-primary)',
                                            borderRadius: '4px',
                                            color: 'var(--text-primary)'
                                        }}
                                        placeholder='New password'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm mb-2 mono' style={{ color: 'var(--text-secondary)' }}>
                                        Role
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className='w-full p-3 bg-transparent outline-none'
                                        style={{
                                            border: '1px solid var(--border-primary)',
                                            borderRadius: '4px',
                                            color: 'var(--text-primary)',
                                            background: 'var(--bg-secondary)'
                                        }}
                                    >
                                        <option value='user'>User</option>
                                        <option value='admin'>Admin</option>
                                    </select>
                                </div>

                                <button
                                    type='submit'
                                    className='w-full py-3 font-bold mono transition-fast'
                                    style={{
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: '4px',
                                        background: 'var(--text-primary)',
                                        color: 'var(--bg-primary)'
                                    }}
                                >
                                    UPDATE USER
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

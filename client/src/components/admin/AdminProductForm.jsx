import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Upload } from 'lucide-react';
import AxiosInstance from '../../utils/axios';
import toast from 'react-hot-toast';
import categories from '../../constants/categories';

export default function AdminProductForm({ product, onClose, onSuccess }) {
    const isEditing = !!product;
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        stock_count: 0,
        image: '',
        specs: []
    });

    const [newSpec, setNewSpec] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title || '',
                description: product.description || '',
                price: product.price || '',
                category: product.category || '',
                stock_count: product.stock_count || 0,
                image: product.image || '',
                specs: Array.isArray(product.specs) ? product.specs : []
            });
        }
    }, [product]);

    const handleAddSpec = () => {
        if (!newSpec.trim()) return;
        setFormData(prev => ({
            ...prev,
            specs: [...prev.specs, newSpec.trim()]
        }));
        setNewSpec('');
    };

    const handleRemoveSpec = (index) => {
        setFormData(prev => ({
            ...prev,
            specs: prev.specs.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                await AxiosInstance.put(`/products/modify/${product.id}`, formData);
                toast.success('Product updated successfully');
            } else {
                await AxiosInstance.post('/products/save', formData);
                toast.success('Product created successfully');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0a0a0a] border border-[#262626] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#262626]">
                    <h2 className="text-xl font-bold mono text-white">
                        {isEditing ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
                    </h2>
                    <button onClick={onClose} className="text-[#888] hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-[#888]">TITLE</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-[#121212] border border-[#262626] rounded p-3 text-white focus:border-white outline-none transition-colors"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-[#888]">CATEGORY</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-[#121212] border border-[#262626] rounded p-3 text-white focus:border-white outline-none transition-colors"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.title} value={cat.title}>
                                        {cat.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-[#888]">PRICE ($)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-[#121212] border border-[#262626] rounded p-3 text-white focus:border-white outline-none transition-colors"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-[#888]">STOCK QUANTITY</label>
                            <input
                                type="number"
                                value={formData.stock_count}
                                onChange={e => setFormData({ ...formData, stock_count: parseInt(e.target.value) || 0 })}
                                className="w-full bg-[#121212] border border-[#262626] rounded p-3 text-white focus:border-white outline-none transition-colors"
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-[#888]">DESCRIPTION</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-[#121212] border border-[#262626] rounded p-3 text-white focus:border-white outline-none transition-colors min-h-[100px]"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-[#888]">PRODUCT IMAGE</label>

                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, image: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            <div className={`
                                w-full h-48 rounded border border-dashed border-gray-600 flex flex-col items-center justify-center transition-colors
                                ${formData.image ? 'bg-black/50' : 'bg-black/20 hover:bg-black/40'}
                            `}>
                                {formData.image ? (
                                    <div className="relative w-full h-full p-2">
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-full h-48 object-contain bg-black/50 rounded border border-dashed border-gray-600"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/400x300?text=Invalid+Image";
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault(); // Prevent file input trigger
                                                setFormData({ ...formData, image: '' });
                                            }}
                                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors z-20"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-[#666] group-hover:text-[#888] transition-colors">
                                        <Upload className="w-8 h-8 mb-2" />
                                        <p className="text-sm font-mono">Click or drag image here</p>
                                        <p className="text-xs text-[#444] mt-1">Supports JPG, PNG, WEBP</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Specs Builder */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-[#888]">SPECIFICATIONS</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newSpec}
                                onChange={e => setNewSpec(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSpec())}
                                className="flex-1 bg-[#121212] border border-[#262626] rounded p-3 text-white focus:border-white outline-none transition-colors"
                                placeholder="Type a spec (e.g. RTX 4090) and press Enter"
                            />
                            <button
                                type="button"
                                onClick={handleAddSpec}
                                className="px-4 bg-[#262626] text-white rounded hover:bg-[#333] transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {formData.specs.map((spec, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 px-3 py-1 bg-[#121212] border border-[#262626] rounded-full text-sm text-[#ddd]"
                                >
                                    <span>{spec}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSpec(index)}
                                        className="text-[#666] hover:text-[#ff4444]"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {formData.specs.length === 0 && (
                                <p className="text-xs text-[#666] italic">No specs added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-[#262626]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-[#262626] text-[#888] rounded hover:text-white transition-colors"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-[#ddd] transition-colors disabled:opacity-50"
                        >
                            {loading ? 'SAVING...' : 'SAVE PRODUCT'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

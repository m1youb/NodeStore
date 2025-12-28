import React from 'react'
import { useRef, useState } from 'react';
import { useAdminStore } from '../store/AdminStore';
import toast from 'react-hot-toast';
import categories from '../constants/categories';
import { LoaderCircleIcon, SaveIcon, UploadIcon, Plus, X } from 'lucide-react';

export default function UpdateProductModal({ product, onSuccess }) {
    const inputRef = useRef(null);
    const { isLoading, updateProductFunc } = useAdminStore();
    const [updateProduct, setUpdateProduct] = useState({
        title: product?.title || "",
        description: product?.description || "",
        quantity: product?.stock_count || product?.quantity || 1,
        price: product?.price || 0,
        category: product?.category || categories[0]?.title,
        image: product?.image || "",
        specs: Array.isArray(product?.specs) ? product.specs : []
    });
    const [newSpec, setNewSpec] = useState('');

    const handleChange = function (e) {
        const { name, value } = e.target;
        setUpdateProduct((data) => ({
            ...data,
            [name]: value
        }))
    }

    const handleImageInput = function (e) {
        const file = e.target.files[0];
        if (file) {
            const imageHandler = new FileReader;
            imageHandler.onload = () => {
                setUpdateProduct({ ...updateProduct, image: imageHandler.result });
            }
            imageHandler.readAsDataURL(file);
        }
    }

    const handleInputClick = function () {
        inputRef.current.click();
    }

    const handleAddSpec = () => {
        if (!newSpec.trim()) return;
        setUpdateProduct(prev => ({
            ...prev,
            specs: [...prev.specs, newSpec.trim()]
        }));
        setNewSpec('');
    };

    const handleRemoveSpec = (index) => {
        setUpdateProduct(prev => ({
            ...prev,
            specs: prev.specs.filter((_, i) => i !== index)
        }));
    };

    const UPDATE_PRODUCT = async function (e) {
        e.preventDefault();
        // Map quantity to stock_count for backend
        const productData = {
            ...updateProduct,
            stock_count: updateProduct.quantity
        };
        await updateProductFunc(product.id || product._id, productData);
        toast.success("Product updated successfully!");
        onSuccess?.();
    }

    return (
        <form onSubmit={UPDATE_PRODUCT} className="space-y-4">
            {/* Title */}
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Title</label>
                <input
                    type="text"
                    name="title"
                    value={updateProduct.title}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 bg-[#121212] border border-[#262626] rounded text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
                />
            </div>

            {/* Category and Stock */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Category</label>
                    <select
                        name="category"
                        value={updateProduct.category}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-[#121212] border border-[#262626] rounded text-white focus:outline-none focus:border-white transition-colors cursor-pointer"
                    >
                        {categories.map(ct => (
                            <option key={ct.title} value={ct.title} className="bg-[#121212]">
                                {ct.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Stock Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        value={updateProduct.quantity}
                        onChange={handleChange}
                        disabled={isLoading}
                        min="0"
                        className="w-full px-4 py-3 bg-[#121212] border border-[#262626] rounded text-white focus:outline-none focus:border-white transition-colors"
                    />
                </div>
            </div>

            {/* Price */}
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Price ($)</label>
                <input
                    type="number"
                    name="price"
                    value={updateProduct.price}
                    onChange={handleChange}
                    disabled={isLoading}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-[#121212] border border-[#262626] rounded text-white focus:outline-none focus:border-white transition-colors"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Description</label>
                <textarea
                    name="description"
                    value={updateProduct.description}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Product description"
                    rows={4}
                    className="w-full px-4 py-3 bg-[#121212] border border-[#262626] rounded text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors resize-none"
                />
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Product Image</label>
                <div className="relative group">
                    <input
                        type="file"
                        ref={inputRef}
                        accept="image/*"
                        onChange={handleImageInput}
                        disabled={isLoading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full h-48 rounded border border-dashed ${updateProduct.image ? 'border-[#262626] bg-black/50' : 'border-gray-600 bg-black/20 hover:bg-black/40'} flex flex-col items-center justify-center transition-colors`}>
                        {updateProduct.image ? (
                            <div className="relative w-full h-full p-2">
                                <img
                                    src={updateProduct.image}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setUpdateProduct({ ...updateProduct, image: '' });
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors z-20"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-[#666] group-hover:text-[#888] transition-colors">
                                <UploadIcon className="w-8 h-8 mb-2" />
                                <p className="text-sm font-mono">Click or drag image here</p>
                                <p className="text-xs text-[#444] mt-1">Supports JPG, PNG, WEBP</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Specifications */}
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Specifications</label>
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
                    {updateProduct.specs.map((spec, index) => (
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
                    {updateProduct.specs.length === 0 && (
                        <p className="text-xs text-[#666] italic">No specs added yet</p>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-white text-black font-bold rounded hover:bg-[#ddd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6"
            >
                {isLoading ? (
                    <>
                        <LoaderCircleIcon className="w-5 h-5 animate-spin" />
                        <span>Updating Product...</span>
                    </>
                ) : (
                    <>
                        <SaveIcon className="w-5 h-5" />
                        <span>Save Product</span>
                    </>
                )}
            </button>
        </form>
    )
}

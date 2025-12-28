import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCartStore } from '../store/CartStore';
import { useAuthStore } from '../store/AuthStore';
import AxiosInstance from '../utils/axios';
import { LoaderCircle, ShoppingCart, Star, Send, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import AdminProductForm from '../components/admin/AdminProductForm';

export default function ProductDetails() {
    const { id } = useParams();
    const { user } = useAuthStore();
    const { addToCart, isAddingCart } = useCartStore();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Review Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Admin Edit State
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const isAdmin = user?.role === 'admin';

    const fetchData = async () => {
        try {
            const [prodRes, revRes] = await Promise.all([
                AxiosInstance.get(`/products/${id}`),
                AxiosInstance.get(`/reviews/${id}`)
            ]);

            setProduct(prodRes.data.product);
            setReviews(revRes.data.reviews || []);
            setStats({
                averageRating: parseFloat(revRes.data.averageRating) || 0,
                totalReviews: revRes.data.totalReviews || 0
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load product data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) return toast.error("Please login to write a review");

        setIsSubmitting(true);
        try {
            await AxiosInstance.post('/reviews', {
                productId: id,
                rating,
                comment
            });
            toast.success("Review submitted!");
            setComment("");

            // Refresh reviews
            const revRes = await AxiosInstance.get(`/reviews/${id}`);
            setReviews(revRes.data.reviews || []);
            setStats({
                averageRating: parseFloat(revRes.data.averageRating) || 0,
                totalReviews: revRes.data.totalReviews || 0
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProductUpdate = () => {
        setIsEditFormOpen(false);
        fetchData(); // Refresh product data
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <LoaderCircle className="w-12 h-12 animate-spin text-accent" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 text-white">
                Product not found
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto relative">
            {/* Admin Edit Button */}
            {isAdmin && (
                <button
                    onClick={() => setIsEditFormOpen(true)}
                    className="absolute top-24 right-6 z-10 p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-lg"
                    title="Edit Product"
                >
                    <Pencil className="w-5 h-5" />
                </button>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                {/* Left Column - Sticky Image */}
                <div className="relative h-fit lg:sticky lg:top-24">
                    <div className="w-full aspect-[4/3] bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center group">
                        <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>

                {/* Right Column - Info */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-gray-400 uppercase tracking-wider">
                                {product.category}
                            </span>
                            <div className="flex items-center text-yellow-500 gap-1 ml-2">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-bold">{stats.averageRating.toFixed(1)}</span>
                                <span className="text-gray-500 text-xs ml-1">({stats.totalReviews} reviews)</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            {product.title}
                        </h1>

                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-mono text-accent">
                                ${product.price}
                            </span>
                            {product.stock_count > 0 ? (
                                <span className="text-green-500 text-sm font-medium bg-green-500/10 px-2 py-1 rounded">
                                    In Stock
                                </span>
                            ) : (
                                <span className="text-red-500 text-sm font-medium bg-red-500/10 px-2 py-1 rounded">
                                    Out of Stock
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed">
                        <p>{product.description}</p>
                    </div>

                    <button
                        onClick={() => addToCart(product)}
                        disabled={isAddingCart || product.stock_count === 0}
                        className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAddingCart ? (
                            <LoaderCircle className="w-6 h-6 animate-spin" />
                        ) : (
                            <ShoppingCart className="w-6 h-6" />
                        )}
                        ADD TO CART
                    </button>

                    {/* Specs Section */}
                    {product.specs && product.specs.length > 0 && (
                        <div className="pt-8 border-t border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4 font-mono">SPECIFICATIONS</h3>
                            <ul className="space-y-3 font-mono text-sm text-gray-400">
                                {product.specs.map((spec, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                                        <span>{spec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div id="reviews" className="max-w-4xl pt-12 border-t border-white/10">
                <h3 className="text-2xl font-bold text-white mb-8">Customer Reviews</h3>

                {/* Write Review Form */}
                {user ? (
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 mb-12">
                        <h4 className="text-lg font-bold text-white mb-4">Write a Review</h4>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-2">RATING</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`transition-colors ${star <= rating ? 'text-yellow-500' : 'text-gray-700 hover:text-gray-500'}`}
                                        >
                                            <Star className="w-6 h-6 fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-2">COMMENT</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none min-h-[100px]"
                                    placeholder="Share your experience..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-accent text-black font-bold text-sm rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
                            >
                                {isSubmitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                SUBMIT REVIEW
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-12 text-center">
                        <p className="text-gray-400">Please login to write a review.</p>
                    </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-black font-bold text-sm">
                                            {review.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">{review.fullname || review.username}</p>
                                            <div className="flex text-yellow-500 text-xs">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-800'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-600 font-mono">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-400 leading-relaxed text-sm">{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
                    )}
                </div>
            </div>

            {/* Admin Edit Modal */}
            <AnimatePresence>
                {isEditFormOpen && (
                    <AdminProductForm
                        product={product}
                        onClose={() => setIsEditFormOpen(false)}
                        onSuccess={handleProductUpdate}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

import { Plus, Heart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductPhoto } from '../utils/productPhotos';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { items, addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stockQuantity <= 0;
  const wishlisted = isWishlisted(product._id);

  // Build a prioritised fallback chain:
  // 1. Stored DB image
  // 2. productPhotos.js lookup (Unsplash by name)
  // 3. category-level Unsplash photo
  const primarySrc   = product.images?.[0] || '';
  const fallbackSrc  = getProductPhoto(product.name, product.category?.type || 'other');

  const [src, setSrc] = useState(primarySrc || fallbackSrc);
  const [triedFallback, setTriedFallback] = useState(false);

  const handleImgError = () => {
    if (!triedFallback && fallbackSrc && src !== fallbackSrc) {
      setSrc(fallbackSrc);
      setTriedFallback(true);
    } else {
      setSrc('');
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    
    const existingItem = items?.find(i => i.product === product._id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    
    if (currentQtyInCart + 1 > product.stockQuantity) {
      toast.error(`You have ${currentQtyInCart} in cart. Only ${product.stockQuantity} available.`);
      return;
    }

    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggle(product);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="block group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className={`absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-soft ${
          wishlisted ? 'text-red-500 scale-110' : 'text-gray-300 hover:text-red-400 hover:scale-110'
        }`}
      >
        <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Product Photo */}
      <div className="w-full aspect-[4/3] overflow-hidden rounded-t-3xl relative bg-gray-100">
        {src ? (
          <img
            src={src}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={handleImgError}
            loading="lazy"
          />
        ) : (
          /* Last-resort: solid colour with initials — no 3D emoji */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-600 to-brand-800">
            <span className="text-white text-2xl font-bold opacity-80">
              {product.name?.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-gray-600 px-2.5 py-1 rounded-full border border-gray-100">
            {product.category?.name || 'Product'}
          </span>
        </div>

        {/* Out of Stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-t-3xl">
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-gray-900 mb-1 leading-tight line-clamp-2 group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-1.5 mb-2 mt-1">
          <span className="text-lg font-bold text-gray-900">Rs {product.retailPrice?.toLocaleString() || '0'}</span>
          <span className="text-xs text-gray-400">/ {product.unit || 'kg'}</span>
        </div>

        {!outOfStock && (
          <p className="text-xs font-semibold text-emerald-600 mb-3 bg-emerald-50 inline-block px-2 py-1 rounded-md">
            {product.stockQuantity} {product.unit} available
          </p>
        )}

        <div className="mt-auto">
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`w-full py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              added
                ? 'bg-green-500 text-white shadow-sm'
                : outOfStock
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-brand-700 hover:bg-brand-800 text-white shadow-sm hover:shadow-glow'
            }`}
          >
            {added ? (
              <>✓ Added to Cart</>
            ) : outOfStock ? (
              'Out of Stock'
            ) : (
              <>
                <Plus size={14} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

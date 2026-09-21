import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { productApi } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/ProductCard';
import { ShoppingCart, Heart, ArrowLeft, Leaf, Clock, Package, Shield, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const { items, addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  useEffect(() => {
    setLoading(true);
    productApi.getById(id).then((res) => {
      setProduct(res.data.product);
      // Load related products
      productApi.getAll({ category: res.data.product.category._id || res.data.product.category }).then((r) => {
        setRelated(r.data.products.filter((p) => p._id !== id).slice(0, 4));
      }).catch(() => {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const existingItem = items.find(i => i.product === product._id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    
    if (currentQtyInCart + qty > product.stockQuantity) {
      toast.error(`Cannot add ${qty}. You already have ${currentQtyInCart} in your cart. Only ${product.stockQuantity} available.`);
      return;
    }

    addItem(product, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const stockBadge = () => {
    if (!product) return null;
    if (product.stockQuantity === 0) return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Out of Stock</span>;
    if (product.stockQuantity <= product.lowStockThreshold) return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Low Stock — {product.stockQuantity} {product.unit} left</span>;
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">In Stock — {product.stockQuantity} {product.unit} available</span>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-24">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Product not found</h2>
          <Link to="/" className="text-brand-600 hover:underline">← Back to shop</Link>
        </div>
      </Layout>
    );
  }

  const wishlisted = isWishlisted(product._id);
  const imageUrl = product.images?.[0] || `https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&fit=crop`;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-brand-600 transition">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-700 font-medium">{product.name}</span>
        </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Image */}
        <div className="relative rounded-3xl overflow-hidden bg-gray-50 aspect-square max-h-[500px] shadow-soft">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&fit=crop'; }}
          />
          <button
            onClick={() => toggle(product)}
            className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
              wishlisted ? 'bg-red-500 text-white scale-110' : 'bg-white text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart size={20} fill={wishlisted ? 'white' : 'none'} />
          </button>
          {product.isLowStock && !product.stockQuantity === 0 && (
            <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">LOW STOCK</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-2">{stockBadge()}</div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2 mt-3">{product.name}</h1>

          {product.category?.name && (
            <span className="text-brand-600 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-1">
              <Leaf size={14} /> {product.category.name}
            </span>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-brand-700">Rs {product.retailPrice}</span>
            <span className="text-gray-400 text-sm">/ {product.unit}</span>
          </div>

          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          )}

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-semibold text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition text-xl font-bold"
              >−</button>
              <input
                type="number"
                min="1"
                max={product.stockQuantity}
                value={qty}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val === '') {
                    setQty('');
                    return;
                  }
                  let num = parseInt(val);
                  if (isNaN(num)) return;
                  if (num > product.stockQuantity) {
                    toast.error(`Only ${product.stockQuantity} ${product.unit} available in stock.`);
                    num = product.stockQuantity;
                  }
                  setQty(num);
                }}
                onBlur={() => {
                  if (qty === '' || qty < 1) {
                    setQty(1);
                  }
                }}
                className="w-16 text-center font-semibold text-gray-800 border-none focus:ring-0 p-0 m-0 bg-transparent hide-arrows"
                style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
              />
              <button
                onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition text-xl font-bold"
              >+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all ${
                addedToCart
                  ? 'bg-green-500 text-white scale-105'
                  : product.stockQuantity === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-800 hover:bg-brand-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <ShoppingCart size={18} />
              {addedToCart ? 'Added to Cart!' : product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={() => toggle(product)}
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
                wishlisted ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Product meta */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Package size={18} />, label: 'Unit', value: product.unit },
              { icon: <Clock size={18} />, label: 'Supplier', value: product.supplierName || 'Local Farm' },
              { icon: <Shield size={18} />, label: 'Quality', value: 'Farm Fresh' },
            ].map((m) => (
              <div key={m.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="text-brand-600 flex justify-center mb-1">{m.icon}</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{m.label}</div>
                <div className="text-sm font-bold text-gray-700 mt-0.5 truncate">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-gray-100 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900">You might also like</h2>
            <Link to="/" className="text-brand-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowLeft size={14} className="rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
      </div>
    </Layout>
  );
}

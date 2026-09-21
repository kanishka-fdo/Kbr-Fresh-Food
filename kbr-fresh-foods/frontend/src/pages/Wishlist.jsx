import Layout from '../components/Layout';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { items, remove } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product) => {
    addItem(product);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-1 flex items-center gap-3">
          <Heart size={28} className="text-red-500" fill="currentColor" /> My Wishlist
        </h1>
        <p className="text-gray-400">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl p-16 text-center">
          <Heart size={48} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-6">Save items you love by clicking the heart icon on any product.</p>
          <Link to="/" className="bg-brand-700 text-white font-semibold px-8 py-3 rounded-2xl hover:bg-brand-800 transition inline-block">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => {
            const imageUrl = product.images?.[0] || `https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&fit=crop`;
            return (
              <div key={product._id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="relative overflow-hidden aspect-square">
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&fit=crop'; }}
                    />
                  </Link>
                  <button
                    onClick={() => remove(product._id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-red-400 hover:text-red-600 hover:scale-110 transition-all"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="p-5">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-bold text-gray-900 mb-1 hover:text-brand-700 transition">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-700 font-bold text-lg">Rs {product.retailPrice}</span>
                    <span className="text-gray-400 text-xs">/{product.unit}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stockQuantity === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-brand-700 hover:bg-brand-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold py-2.5 rounded-xl transition"
                    >
                      <ShoppingCart size={15} />
                      {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

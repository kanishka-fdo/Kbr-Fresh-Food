import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { getProductPhoto } from '../utils/productPhotos';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Reusable cart image component with fallback chain
function CartItemImage({ item }) {
  const primarySrc  = item.images?.[0] || '';
  const fallbackSrc = getProductPhoto(item.name, item.category?.type || item.category || 'other');
  const [src, setSrc] = useState(primarySrc || fallbackSrc);
  const [triedFallback, setTriedFallback] = useState(false);

  const handleError = () => {
    if (!triedFallback && fallbackSrc && src !== fallbackSrc) {
      setSrc(fallbackSrc);
      setTriedFallback(true);
    } else {
      setSrc('');
    }
  };

  if (!src) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shrink-0">
        <span className="text-white text-lg font-bold opacity-80">
          {item.name?.slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={item.name}
      onError={handleError}
      className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm border border-gray-100"
      loading="lazy"
    />
  );
}

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();
  const [unselectedIds, setUnselectedIds] = useState(new Set());

  const toggleSelect = (productId) => {
    const newUnselected = new Set(unselectedIds);
    if (newUnselected.has(productId)) {
      newUnselected.delete(productId);
    } else {
      newUnselected.add(productId);
    }
    setUnselectedIds(newUnselected);
  };

  const toggleSelectAll = () => {
    if (unselectedIds.size === 0) {
      setUnselectedIds(new Set(items.map(i => i.product)));
    } else {
      setUnselectedIds(new Set());
    }
  };

  const selectedItems = items.filter(i => !unselectedIds.has(i.product));
  const selectedTotal = selectedItems.reduce((sum, item) => sum + (item.retailPrice * item.quantity), 0);

  if (items.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in-up">
          <div className="w-24 h-24 bg-brand-50 text-brand-300 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            Looks like you haven't added any fresh organic produce to your cart yet.
          </p>
          <Link to="/" className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-8 rounded-full transition shadow-glow">
            Start Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up">
              <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-50 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider items-center">
                <div className="col-span-1 flex justify-center">
                  <input 
                    type="checkbox" 
                    checked={unselectedIds.size === 0 && items.length > 0} 
                    onChange={toggleSelectAll} 
                    className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                  />
                </div>
                <div className="col-span-5">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.product} className={`grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 items-center group transition-colors ${unselectedIds.has(item.product) ? 'opacity-60 bg-gray-50' : 'hover:bg-gray-50/30'}`}>
                    
                    {/* Checkbox for Desktop */}
                    <div className="hidden sm:flex col-span-1 justify-center">
                      <input 
                        type="checkbox" 
                        checked={!unselectedIds.has(item.product)} 
                        onChange={() => toggleSelect(item.product)}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="col-span-1 sm:col-span-5 flex items-center gap-4">
                      <div className="sm:hidden">
                        <input 
                          type="checkbox" 
                          checked={!unselectedIds.has(item.product)} 
                          onChange={() => toggleSelect(item.product)}
                          className="w-5 h-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                        />
                      </div>
                      <CartItemImage item={item} />
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-1">Rs. {item.retailPrice} / {item.unit}</p>
                        <p className="text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded">
                          {item.stockQuantity} {item.unit} available
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-1 sm:col-span-3 flex justify-start sm:justify-center">
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-1 py-1 shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.product, item.quantity - 1)} 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-brand-600 transition"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.stockQuantity}
                          value={item.quantity}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (val === '') {
                              updateQuantity(item.product, '');
                              return;
                            }
                            let num = parseInt(val);
                            if (isNaN(num)) return;
                            if (num > item.stockQuantity) {
                              toast.error(`Only ${item.stockQuantity} ${item.unit} available in stock.`);
                              num = item.stockQuantity;
                            }
                            updateQuantity(item.product, num);
                          }}
                          onBlur={() => {
                            if (item.quantity === '' || item.quantity < 1) {
                              updateQuantity(item.product, 1);
                            }
                          }}
                          className="w-12 text-center text-sm font-semibold border-none focus:ring-0 p-0 m-0 bg-transparent hide-arrows"
                          style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                        />
                        <button 
                          onClick={() => {
                            if (item.stockQuantity && item.quantity >= item.stockQuantity) {
                              toast.error(`Only ${item.stockQuantity} ${item.unit} available in stock.`);
                              return;
                            }
                            updateQuantity(item.product, item.quantity + 1);
                          }} 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-brand-600 transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-end items-center sm:items-end">
                      <span className="sm:hidden text-sm text-gray-500">Total:</span>
                      <p className="font-bold text-gray-900 text-lg">
                        Rs. {(item.retailPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    {/* Remove Action */}
                    <div className="col-span-1 flex justify-end">
                      <button 
                        onClick={() => removeItem(item.product)} 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <Link to="/" className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition">
                <ArrowRight size={18} className="rotate-180" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-lg font-display font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({selectedItems.length} items)</span>
                  <span className="font-semibold text-gray-900">Rs. {selectedTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery fee</span>
                  <span className="text-gray-400 italic">Calculated next</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-gray-900">Estimated Total</span>
                  <span className="text-2xl font-bold text-brand-600">Rs. {selectedTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout', { state: { selectedProductIds: selectedItems.map(i => i.product) } })}
                disabled={selectedItems.length === 0}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-full transition shadow-glow flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-6 flex items-start gap-3 bg-green-50 p-3 rounded-xl border border-green-100 text-xs text-green-800">
                <ShieldCheck size={16} className="shrink-0 mt-0.5 text-green-600" />
                <p>Safe and secure checkout. We never store your card details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useEffect, useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { productApi, wholesaleApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag, Search, Minus, Plus, ChevronRight,
  CheckCircle2, Trash2, Package, Upload, X, ImagePlus,
  BadgeCheck, Building2, ClipboardList, TrendingUp
} from 'lucide-react';

const PRODUCT_PHOTOS = {
  fruit: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=200&q=80',
  vegetable: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=200&q=80',
  dairy: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=200&q=80',
  grain: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=200&q=80',
  spice: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
  beverage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=200&q=80',
  seafood: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=200&q=80',
};

function getPhoto(product) {
  if (product.images && product.images.length > 0) return product.images[0];
  const type = product.category?.type;
  return PRODUCT_PHOTOS[type] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';
}

export default function WholesaleShop() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    productApi.getAll({ limit: 100 }).then((res) => setProducts(res.data.products));
  }, []);

  const setQty = (productId, qty) => {
    const p = products.find((pr) => pr._id === productId);
    if (p && qty > p.stockQuantity) {
      setError(`Cannot add more than available stock (${p.stockQuantity} ${p.unit}) for ${p.name}.`);
      return;
    }
    setError('');

    if (qty <= 0) {
      const updated = { ...cart };
      delete updated[productId];
      setCart(updated);
    } else {
      setCart({ ...cart, [productId]: qty });
    }
  };

  const filteredProducts = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([productId, qty]) => {
      const p = products.find((pr) => pr._id === productId);
      return p ? { product: p, quantity: qty } : null;
    })
    .filter(Boolean);

  const total = cartItems.reduce((sum, i) => sum + i.product.wholesalePrice * i.quantity, 0);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve({ name: file.name, url: ev.target.result });
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((imgs) => setUploadedImages((prev) => [...prev, ...imgs]));
  };

  const removeImage = (idx) => setUploadedImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    if (cartItems.length === 0) return setError('Add at least one item to your bulk order.');

    const lowQtyItem = cartItems.find((i) => i.quantity < (i.product.minWholesaleQty || 20));
    if (lowQtyItem) {
      return setError(
        `Minimum quantity of ${lowQtyItem.product.minWholesaleQty || 20} ${lowQtyItem.product.unit || 'units'} required for ${lowQtyItem.product.name}.`
      );
    }

    setSubmitting(true);
    try {
      await wholesaleApi.requestQuote({
        items: cartItems.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        notes,
      });
      setMessage('Bulk order submitted successfully! Our team will review and confirm shortly.');
      setCart({});
      setNotes('');
      setUploadedImages([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl mb-10 bg-gradient-to-br from-brand-900 to-brand-700 text-white">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/80 to-transparent" />
        <div className="relative z-10 px-8 md:px-14 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <BadgeCheck size={13} className="text-brand-300" /> B2B Wholesale Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              {user?.businessName || 'Bulk Order Catalog'}
            </h1>
            <p className="text-brand-100 text-sm max-w-lg">
              Place bulk orders for your supermarket, hotel, or restaurant at wholesale pricing. Minimum quantities apply per product.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            {[
              { icon: Building2, label: 'Keells & Food City', sub: 'Trusted supplier' },
              { icon: ClipboardList, label: 'Quote System', sub: 'Fast approvals' },
              { icon: TrendingUp, label: 'Bulk Discounts', sub: 'Save up to 30%' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-white/10 border border-white/15 rounded-2xl px-5 py-3 text-center backdrop-blur-sm">
                <Icon size={20} className="text-brand-300 mx-auto mb-1" />
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="text-[10px] text-brand-200">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-600 shrink-0" />
          <p className="text-green-700 font-medium text-sm">{message}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-600 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Products Catalog */}
        <div className="lg:col-span-2">
          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or category..."
              className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
            />
          </div>

          <div className="space-y-3">
            {filteredProducts.map((p) => {
              const photo = getPhoto(p);
              const inCart = cart[p._id] > 0;
              const minQty = p.minWholesaleQty || 20;

              return (
                <div
                  key={p._id}
                  className={`bg-white rounded-2xl border p-4 transition-all ${
                    inCart ? 'border-brand-300 ring-1 ring-brand-100 shadow-md' : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      <img src={photo} alt={p.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs">
                        <span className="text-brand-700 font-bold">
                          Rs. {p.wholesalePrice}/{p.unit}
                        </span>
                        <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md font-semibold">
                          Min: {minQty} {p.unit}
                        </span>
                        <span className="text-gray-400">Stock: {p.stockQuantity} {p.unit}</span>
                        {p.category?.name && (
                          <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md font-medium">
                            {p.category.name}
                          </span>
                        )}
                      </div>
                      {p.stockQuantity < minQty && (
                        <p className="text-red-500 text-[10px] mt-1 font-bold">Insufficient stock for wholesale minimum</p>
                      )}
                    </div>

                    {/* Qty Control */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setQty(p._id, (cart[p._id] || 0) - minQty)}
                        disabled={!cart[p._id]}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-brand-400 hover:text-brand-600 disabled:opacity-30 transition"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={cart[p._id] || ''}
                        onChange={(e) => setQty(p._id, Number(e.target.value))}
                        placeholder="0"
                        className="w-16 text-center border border-gray-200 rounded-xl py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-400"
                      />
                      <button
                        onClick={() => setQty(p._id, (cart[p._id] || 0) + minQty)}
                        disabled={(cart[p._id] || 0) + minQty > p.stockQuantity}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-30 disabled:hover:bg-brand-600 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal row when in cart */}
                  {inCart && (
                    <div className="mt-3 pt-3 border-t border-brand-50 flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {cart[p._id]} {p.unit} × Rs. {p.wholesalePrice}
                      </span>
                      <span className="font-bold text-brand-700">
                        Rs. {(cart[p._id] * p.wholesalePrice).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="bg-gray-50 rounded-2xl p-12 text-center">
                <Package size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No products match your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 sticky top-28 space-y-5">
            <h2 className="font-display font-bold text-gray-900 text-lg flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-600" /> Order Summary
            </h2>

            {cartItems.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                <ShoppingBag size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No items added yet.</p>
                <p className="text-gray-300 text-xs mt-1">Use the + buttons to add quantities.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {cartItems.map((i) => (
                    <div key={i.product._id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img
                          src={getPhoto(i.product)}
                          alt={i.product.name}
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{i.product.name}</p>
                          <p className="text-[10px] text-gray-400">{i.quantity} {i.product.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-gray-800">
                          Rs. {(i.product.wholesalePrice * i.quantity).toLocaleString()}
                        </span>
                        <button onClick={() => setQty(i.product._id, 0)} className="text-gray-300 hover:text-red-400 transition">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-gray-700">Estimate Total</span>
                    <span className="text-2xl font-bold text-brand-700">Rs. {total.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Final pricing confirmed by our team</p>
                </div>
              </>
            )}

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5">Order Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Delivery schedule, special requirements..."
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none transition"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 flex items-center gap-1">
                <ImagePlus size={13} /> Attach Reference Photos (optional)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-brand-400 hover:text-brand-600 transition flex items-center justify-center gap-2"
              >
                <Upload size={14} /> Upload Images
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || cartItems.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-2xl transition shadow-md hover:shadow-xl hover:-translate-y-0.5"
              >
                {submitting ? 'Submitting...' : <><span>Submit Bulk Order</span> <ChevronRight size={18} /></>}
              </button>
            ) : (
              <a
                href="/login"
                className="w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-bold py-3.5 rounded-2xl transition shadow-md"
              >
                Login to Submit Order <ChevronRight size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

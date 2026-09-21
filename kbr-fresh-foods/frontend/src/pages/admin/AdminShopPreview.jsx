import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { productApi, categoryApi } from '../../api/services';
import ProductCard from '../../components/ProductCard';
import { Eye, Search, X, Package, ShoppingCart, ExternalLink } from 'lucide-react';
import { getCategoryTheme } from '../../utils/categoryTheme';

export default function AdminShopPreview() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          productApi.getAll({ limit: 200, isActive: true }),
          categoryApi.getAll(),
        ]);
        setProducts(pRes.data.products || []);
        setCategories(cRes.data.categories || []);
      } catch (err) {
        console.error('AdminShopPreview load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || p.category?._id === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <AdminLayout>
      {/* Preview Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-2xl px-6 py-4 mb-8 flex items-center gap-4 shadow-lg">
        <div className="bg-white/20 p-2.5 rounded-xl">
          <Eye size={20} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-lg leading-tight">Customer Shop Preview</p>
          <p className="text-brand-100 text-sm">You are viewing the shop as customers see it. Changes to products in Inventory will reflect here.</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
        >
          <ExternalLink size={15} />
          Open in New Tab
        </a>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
          { label: 'Categories', value: categories.length, icon: ShoppingCart, color: 'bg-brand-50 text-brand-600' },
          { label: 'In Stock', value: products.filter(p => p.stockQuantity > 0).length, icon: Package, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Low Stock', value: products.filter(p => p.stockQuantity <= p.lowStockThreshold).length, icon: Package, color: 'bg-amber-50 text-amber-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              !selectedCategory ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((c) => {
            const theme = getCategoryTheme(c.type);
            return (
              <button
                key={c._id}
                onClick={() => setSelectedCategory(c._id === selectedCategory ? '' : c._id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedCategory === c._id ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {theme.emoji} {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48 bg-white rounded-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Package size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">No products found</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4 font-medium">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

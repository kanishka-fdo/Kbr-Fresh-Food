import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

export default function TrendyProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mb-24 max-w-6xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Authentic Curry Essentials</h2>
        <p className="text-gray-500 text-sm">Handpicked traditional Sri Lankan vegetables from Negombo's finest growers</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Promo Block */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <div className="relative rounded-3xl overflow-hidden h-full min-h-[400px] group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80"
              alt="Sri Lankan Spices and Vegetables"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/40 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8">
              <span className="inline-block bg-brand-400 text-brand-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 w-fit">
                🍛 Local Favorites
              </span>
              <h3 className="font-bold text-white text-2xl leading-tight mb-4">
                Fresh Ingredients For Your Next Curry
              </h3>
              <Link
                to="/products"
                className="self-start flex items-center gap-2 text-xs font-bold text-brand-900 bg-brand-400 hover:bg-brand-300 px-4 py-2 rounded-full group-hover:gap-3 transition-all"
              >
                Explore All <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Products Grid */}
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {products.slice(6, 12).map((product, idx) => (
              <div key={product._id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const PROMO_CARDS = [
  {
    title: 'Fresh Tropical Fruits',
    sub: 'Farm-picked daily from Negombo',
    cta: 'Shop Fruits',
    to: '/shop?category=fruit',
    img: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=500&q=80',
    overlay: 'from-brand-900/80 to-brand-700/40',
  },
  {
    title: 'Organic Vegetables',
    sub: 'No pesticides. Pure nutrition.',
    cta: 'Shop Vegetables',
    to: '/shop?category=vegetable',
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80',
    overlay: 'from-emerald-900/80 to-emerald-700/30',
  },
];

export default function FeaturedProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mb-24 max-w-7xl mx-auto px-4">
      {/* Section header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">🌟 Handpicked for you</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-tight">
            Featured Products
          </h2>
          <p className="text-gray-500 mt-2">Top-rated organic produce from local farms</p>
        </div>
        <Link
          to="/shop"
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-5 py-2.5 rounded-full transition"
        >
          View all <ArrowRight size={15} />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left promo cards */}
        <div className="w-full lg:w-[280px] flex flex-col gap-5 shrink-0">
          {PROMO_CARDS.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="relative h-[230px] rounded-3xl overflow-hidden group block"
            >
              <img
                src={card.img}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className={`absolute inset-0 bg-gradient-to-b ${card.overlay}`} />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="font-display font-bold text-white text-xl leading-tight mb-1">
                  {card.title}
                </h3>
                <p className="text-white/75 text-xs mb-3">{card.sub}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit group-hover:bg-white/30 transition">
                  {card.cta} <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Right products grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {products.slice(0, 6).map((product, idx) => (
              <div
                key={product._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Mobile view all */}
          <div className="mt-6 sm:hidden text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-6 py-3 rounded-full transition"
            >
              View all products <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

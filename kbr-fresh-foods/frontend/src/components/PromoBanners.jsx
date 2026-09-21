import { Link } from 'react-router-dom';

export default function PromoBanners() {
  return (
    <div className="max-w-6xl mx-auto px-4 mb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Banner 1 */}
        <div className="relative rounded-[2rem] overflow-hidden bg-[#fff6f0] h-64 md:h-72 flex items-center p-8 group">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-[#fcece0] rounded-l-[100%] transition-transform duration-500 group-hover:scale-110"></div>
          
          <div className="relative z-10 w-1/2">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
              Everyday Fresh & <br /> Cleanliness
            </h3>
            <p className="text-gray-500 text-xs mb-6 max-w-[150px]">
              Experience daily freshness & impeccable cleanliness.
            </p>
            <Link to="/shop" className="inline-block bg-brand-900 hover:bg-brand-800 transition text-white text-xs font-semibold px-6 py-2.5 rounded">
              Shop Now
            </Link>
          </div>
          
          <div className="absolute right-2 bottom-0 w-1/2 h-[120%] flex items-end justify-center pointer-events-none">
            {/* Placeholder for oranges in basket */}
            <div className="w-40 h-40 bg-accent-400/20 rounded-full blur-xl absolute bottom-10 right-4"></div>
            <img src="https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80" alt="Fresh Oranges" className="relative z-10 w-full object-contain mb-[-10px] transform group-hover:scale-105 transition duration-500 drop-shadow-2xl" />
          </div>
        </div>

        {/* Banner 2 */}
        <div className="relative rounded-[2rem] overflow-hidden bg-[#fbf0f4] h-64 md:h-72 flex items-center p-8 group">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-[#f5dfe7] rounded-l-[100%] transition-transform duration-500 group-hover:scale-110"></div>
          
          <div className="relative z-10 w-1/2">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
              Everyday Healthy & <br /> Cleanliness
            </h3>
            <p className="text-gray-500 text-xs mb-6 max-w-[150px]">
              Experience daily freshness & impeccable cleanliness.
            </p>
            <Link to="/shop" className="inline-block bg-brand-900 hover:bg-brand-800 transition text-white text-xs font-semibold px-6 py-2.5 rounded">
              Shop Now
            </Link>
          </div>
          
          <div className="absolute right-2 bottom-0 w-1/2 h-[120%] flex items-end justify-center pointer-events-none">
            {/* Placeholder for lychee/cherry */}
            <div className="w-40 h-40 bg-pink-400/20 rounded-full blur-xl absolute bottom-10 right-4"></div>
            <img src="https://images.unsplash.com/photo-1596368708356-6e1e1025ee72?auto=format&fit=crop&w=400&q=80" alt="Healthy Fruits" className="relative z-10 w-full object-contain mb-[-10px] transform group-hover:scale-105 transition duration-500 drop-shadow-2xl" />
          </div>
        </div>

      </div>
    </div>
  );
}

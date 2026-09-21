import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function FruitSaladPromo() {
  const features = [
    "100% Local Produce",
    "Negombo Farm Fresh",
    "Ayurvedic Benefits",
    "Pesticide Free"
  ];

  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 to-lime-50 mb-24 overflow-hidden relative rounded-3xl border border-emerald-100">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-100/60 to-transparent rounded-l-[100%] opacity-60"></div>
      
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center relative z-10">
        
        {/* Left Side: Images */}
        <div className="w-full md:w-1/2 p-8 md:p-12 relative flex justify-center">
          <div className="absolute inset-0 bg-[url('/images/harvest.png')] bg-cover bg-center opacity-20 mix-blend-multiply rounded-r-[4rem] hidden md:block"></div>
          <img 
            src="/images/fruits.png" 
            alt="Fresh Organic Fruit Salad Bowl" 
            className="w-full max-w-sm rounded-full shadow-2xl relative z-10 border-8 border-white animate-float object-cover aspect-square"
          />
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:pl-20">
          <p className="text-brand-500 font-bold text-xs uppercase tracking-widest mb-2">Authentic Island Flavors</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Tropical Sri Lankan Fruits
          </h2>
          <p className="text-gray-600 text-sm mb-8 max-w-md leading-relaxed">
            Experience the true taste of Sri Lanka with our fresh selection of Ambul bananas, sweet TJC mangoes, and local papaws straight from our partner farms.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-500 shrink-0" fill="currentColor" stroke="white" />
                <span className="text-gray-800 text-sm font-semibold">{feature}</span>
              </div>
            ))}
          </div>

          <Link to="/products" className="inline-block bg-brand-700 hover:bg-brand-800 transition text-white font-bold px-8 py-3.5 rounded-2xl text-sm tracking-wide shadow-lg shadow-brand-900/20">
            Shop Now →
          </Link>
        </div>

      </div>
    </div>
  );
}

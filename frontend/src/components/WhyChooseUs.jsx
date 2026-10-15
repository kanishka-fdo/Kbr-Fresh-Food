import { useState } from 'react';
import { Truck, ShieldCheck, Leaf, Clock, Heart } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    { icon: <Truck size={32} />, title: 'Free Delivery', desc: 'On orders over Rs. 5000' },
    { icon: <Leaf size={32} />, title: '100% Organic', desc: 'Direct from local farms' },
    { icon: <Clock size={32} />, title: 'Fresh Daily', desc: 'Harvested every morning' },
    { icon: <ShieldCheck size={32} />, title: 'Secure Payment', desc: '100% safe checkout' },
  ];

  return (
    <>
      {/* Features Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-brand-300 hover:shadow-soft transition-all">
            <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              {f.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-brand-900 rounded-[2rem] p-8 md:p-16 relative overflow-hidden mb-24 text-white">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-800 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-800 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-brand-800 text-brand-200 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              Our Promise
            </span>
            <h2 className="text-4xl font-display font-bold mb-6 leading-tight">
              Bringing the best of nature to your table
            </h2>
            <p className="text-brand-100 text-lg mb-8 leading-relaxed">
              We believe that eating healthy shouldn't be complicated. By connecting directly with local farmers in Negombo, we ensure that you get the freshest produce while supporting our community.
            </p>
            
            <div className="flex gap-4">
              <div className="bg-brand-800/50 backdrop-blur-sm p-4 rounded-xl flex-1 border border-brand-700/50">
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-sm text-brand-200">Satisfaction Guarantee</div>
              </div>
              <div className="bg-brand-800/50 backdrop-blur-sm p-4 rounded-xl flex-1 border border-brand-700/50">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-brand-200">Customer Support</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Heart size={32} className="text-accent-400 mb-4" />
              <h4 className="font-semibold text-lg mb-2">Quality First</h4>
              <p className="text-sm text-brand-100">Every item is hand-picked and inspected for perfection.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mt-8">
              <Leaf size={32} className="text-brand-300 mb-4" />
              <h4 className="font-semibold text-lg mb-2">Eco-Friendly</h4>
              <p className="text-sm text-brand-100">Sustainable packaging and responsible farming practices.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

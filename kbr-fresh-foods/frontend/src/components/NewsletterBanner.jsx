import { Send } from 'lucide-react';

export default function NewsletterBanner() {
  return (
    <div className="bg-brand-900 rounded-[2.5rem] p-8 md:p-12 mb-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

      <div className="relative z-10 md:w-1/2 text-white text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 leading-tight">
          Get fresh organic <br className="hidden md:block" /> updates weekly!
        </h2>
        <p className="text-brand-200 text-lg mb-0 max-w-md mx-auto md:mx-0">
          Subscribe to our newsletter for exclusive discounts, new product alerts, and healthy recipes.
        </p>
      </div>

      <div className="relative z-10 md:w-1/2 w-full max-w-md">
        <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="w-full bg-white/10 backdrop-blur-md border border-brand-700 text-white placeholder-brand-300 rounded-full py-4 pl-6 pr-32 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
          />
          <button 
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-full px-6 flex items-center gap-2 transition shadow-sm"
          >
            Subscribe <Send size={16} />
          </button>
        </form>
        <p className="text-xs text-brand-400 mt-3 text-center md:text-left">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}

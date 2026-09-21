import { useState } from 'react';
import { Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Priya Jayawardena',
    role: 'Executive Chef · The Lagoon Kitchen, Negombo',
    rating: 5,
    text: 'The quality of KBR\'s highland vegetables is unlike anything I\'ve sourced in 18 years of professional cooking. The leeks arrive crisp, the strawberries fragrant — it is the only supplier I trust for our tasting menu.',
    img: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&auto=format&fit=crop&q=80',
    product: 'Highland Vegetables',
  },
  {
    name: 'Ranjith de Silva',
    role: 'Head Chef · Heritance Negombo, 5-Star Resort',
    rating: 5,
    text: 'We serve discerning international guests who can tell the difference between fresh and merely adequate. KBR consistently delivers extraordinary. Their Tiger Prawns and yellowfin tuna are the finest in Sri Lanka.',
    img: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
    product: 'Premium Seafood',
  },
  {
    name: 'Amali Fernando',
    role: 'Nutritionist & Wellness Author · Colombo',
    rating: 5,
    text: 'I recommend KBR Fresh Foods to every client. The pesticide-testing certification gives me full confidence, and the produce is nutritionally exceptional. My family has ordered weekly for three years without a single disappointment.',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    product: 'Organic Collection',
  },
];

export default function TestimonialsSection() {
  const [idx, setIdx] = useState(0);
  const r = REVIEWS[idx];

  return (
    <section className="mb-28">
      {/* Full-bleed dark testimonial block */}
      <div
        className="relative overflow-hidden"
        style={{
          background: '#0d1f0d',
          borderRadius: 4,
        }}
      >
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-[460px]">
          {/* Left: decorative image panel */}
          <div className="relative hidden lg:block">
            <img
              key={idx}
              src={r.img}
              alt={r.name}
              className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500"
              style={{ opacity: 0.35 }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, rgba(13,31,13,0.4), rgba(13,31,13,0.95))' }}
            />
            {/* Rating display */}
            <div className="absolute bottom-10 left-10">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#b8956a" color="#b8956a" />
                ))}
              </div>
              <div
                className="font-editorial text-white"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '3rem', fontWeight: 300, lineHeight: 1, opacity: 0.3 }}
              >
                4.9
              </div>
              <div className="font-inter text-xs text-white/30 tracking-widest uppercase mt-1">
                Average Rating · 5,000+ Reviews
              </div>
            </div>
          </div>

          {/* Right: review content */}
          <div className="flex flex-col justify-center px-10 lg:px-16 py-16">
            <span
              className="font-inter text-[10px] uppercase tracking-[0.22em] font-semibold block mb-8"
              style={{ color: '#b8956a' }}
            >
              Customer Stories
            </span>

            {/* Quote */}
            <div
              className="font-editorial text-white mb-8 leading-[1.45]"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(1.3rem, 2vw, 1.65rem)',
                fontWeight: 300,
                fontStyle: 'italic',
              }}
            >
              "{r.text}"
            </div>

            {/* Author */}
            <div className="flex items-center gap-4 mb-10">
              <img
                src={r.img}
                alt={r.name}
                className="w-11 h-11 rounded-full object-cover"
                style={{ filter: 'grayscale(20%)' }}
              />
              <div>
                <div className="font-inter font-semibold text-white text-sm">{r.name}</div>
                <div className="font-inter text-white/40 text-xs mt-0.5">{r.role}</div>
              </div>
              <div
                className="ml-auto font-inter text-[10px] uppercase tracking-widest px-3 py-1.5"
                style={{ color: '#b8956a', border: '1px solid rgba(184,149,106,0.3)', borderRadius: 2 }}
              >
                {r.product}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIdx((idx - 1 + REVIEWS.length) % REVIEWS.length)}
                className="w-10 h-10 flex items-center justify-center border border-white/15 text-white/40 hover:border-white/40 hover:text-white transition-all"
                style={{ borderRadius: 2 }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setIdx((idx + 1) % REVIEWS.length)}
                className="w-10 h-10 flex items-center justify-center border text-white transition-all"
                style={{ borderRadius: 2, borderColor: '#b8956a', color: '#b8956a' }}
              >
                <ChevronRight size={18} />
              </button>
              <span className="font-inter text-white/25 text-xs ml-2">
                {String(idx + 1).padStart(2, '0')} / {String(REVIEWS.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

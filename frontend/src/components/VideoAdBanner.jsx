import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import VideoModal from './VideoModal';

/* ────────────────────────────────────────────────────
   World-class editorial video advertisement section.
   Each panel features a play button that opens a
   fullscreen YouTube modal.
──────────────────────────────────────────────────── */

/* YouTube video IDs for each panel */
const PANEL_VIDEO_IDS = [
  'nUNbUf1neL0', /* Sri Lanka vegetable and fruit harvest */
  '7YkOOsAe4Mk', /* Sri Lanka organic fruit farm tour */
];

const PANELS = [
  {
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=95',
    tag: 'Sourced Daily',
    headline: 'The Art of\nFarm-Fresh.',
    body: 'Every morning, our sourcing team selects only the finest produce from partner farms across Sri Lanka\'s most celebrated growing regions.',
    cta: 'Shop Vegetables',
    to: '/shop?category=vegetable',
    side: 'left',
    videoTitle: 'KBR Farm Vegetables — Daily Harvest',
  },
  {
    img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=95',
    tag: 'Premium Variety',
    headline: 'Tropical Fruits\nAt Their Peak.',
    body: 'Mangoes, pineapples, rambutans and rare tropical varieties — handpicked at peak ripeness and delivered to your door within hours.',
    cta: 'Shop Fruits',
    to: '/shop?category=fruit',
    side: 'right',
    videoTitle: 'KBR Tropical Fruits — Premium Selection',
  },
];

function AdPanel({ panel, index, onPlay }) {
  const isLeft = panel.side === 'left';
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden group cursor-pointer"
      style={{ borderRadius: 2, height: 520 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image with zoom */}
      <img
        src={panel.img}
        alt={panel.tag}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
      />

      {/* Layered overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: isLeft
            ? 'linear-gradient(to right, rgba(4,8,4,0.9) 0%, rgba(4,8,4,0.6) 55%, rgba(4,8,4,0.15) 100%)'
            : 'linear-gradient(to left, rgba(4,8,4,0.9) 0%, rgba(4,8,4,0.6) 55%, rgba(4,8,4,0.15) 100%)',
        }}
      />

      {/* Center play button — appears on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onPlay(index); }}
        className="absolute top-1/2 left-1/2 z-20 flex items-center justify-center transition-all duration-400"
        style={{
          transform: `translate(-50%, -50%) scale(${hovered ? 1 : 0.7})`,
          opacity: hovered ? 1 : 0,
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(184,149,106,0.15)',
          border: '2px solid rgba(184,149,106,0.8)',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer',
          transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        aria-label={`Play ${panel.videoTitle}`}
      >
        <Play size={28} fill="#b8956a" color="#b8956a" style={{ marginLeft: 4 }} />
      </button>

      {/* Content */}
      <div
        className="absolute inset-0 flex flex-col justify-center"
        style={{ padding: '3rem 3.5rem' }}
      >
        <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end text-right'} max-w-sm ${!isLeft ? 'ml-auto' : ''}`}>
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            {!isLeft && <div style={{ width: 24, height: 1, background: '#b8956a' }} />}
            <span
              className="font-inter uppercase text-[10px] tracking-[0.22em] font-semibold"
              style={{ color: '#b8956a' }}
            >
              {panel.tag}
            </span>
            {isLeft && <div style={{ width: 24, height: 1, background: '#b8956a' }} />}
          </div>

          {/* Headline */}
          <h3
            className="font-editorial mb-5 leading-[1.05] text-white"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.2rem, 3.5vw, 3.4rem)',
              fontWeight: 300,
              letterSpacing: '-0.01em',
            }}
          >
            {panel.headline.split('\n').map((l, i) => (
              <span key={i} className="block">{l}</span>
            ))}
          </h3>

          {/* Divider */}
          <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.2)', marginBottom: '1.25rem' }} />

          {/* Body */}
          <p
            className="font-inter text-white/55 mb-7 leading-relaxed"
            style={{ fontSize: '0.875rem', fontWeight: 300 }}
          >
            {panel.body}
          </p>

          {/* Row: CTA + play inline button */}
          <div className={`flex items-center gap-5 ${!isLeft ? 'flex-row-reverse' : ''}`}>
            <Link
              to={panel.to}
              className="group/btn font-inter font-medium text-[11px] tracking-[0.18em] uppercase flex items-center gap-3 transition-all duration-300"
              style={{ color: '#b8956a' }}
              onMouseEnter={e => { e.currentTarget.style.gap = '16px'; e.currentTarget.style.color = '#d4af82'; }}
              onMouseLeave={e => { e.currentTarget.style.gap = '12px'; e.currentTarget.style.color = '#b8956a'; }}
              onClick={e => e.stopPropagation()}
            >
              {panel.cta}
              <ArrowRight size={13} />
            </Link>

            {/* Small inline play link */}
            <button
              onClick={(e) => { e.stopPropagation(); onPlay(index); }}
              className="flex items-center gap-2 transition-all"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#b8956a'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              <Play size={10} fill="currentColor" style={{ marginLeft: 1 }} />
              Watch Video
            </button>
          </div>
        </div>
      </div>

      {/* Corner accent */}
      <div
        className="absolute"
        style={{
          [isLeft ? 'top' : 'bottom']: 24,
          [isLeft ? 'right' : 'left']: 24,
          width: 48,
          height: 48,
          borderTop: isLeft ? '1px solid rgba(184,149,106,0.3)' : 'none',
          borderBottom: !isLeft ? '1px solid rgba(184,149,106,0.3)' : 'none',
          borderRight: isLeft ? '1px solid rgba(184,149,106,0.3)' : 'none',
          borderLeft: !isLeft ? '1px solid rgba(184,149,106,0.3)' : 'none',
          transition: 'opacity 0.3s',
          opacity: hovered ? 0.9 : 0.4,
        }}
      />
    </div>
  );
}

export default function VideoAdBanner() {
  const [activeVideo, setActiveVideo] = useState(null); /* null | 0 | 1 */

  return (
    <>
      <section className="mb-28">
        {/* Section heading */}
        <div className="flex items-center gap-6 mb-10">
          <div style={{ height: 1, flex: 1, background: '#e5e7eb' }} />
          <div className="text-center">
            <span
              className="font-inter text-[10px] uppercase tracking-[0.22em] font-semibold"
              style={{ color: '#b8956a' }}
            >
              Featured Collections
            </span>
          </div>
          <div style={{ height: 1, flex: 1, background: '#e5e7eb' }} />
        </div>

        {/* Two editorial panels side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {PANELS.map((panel, i) => (
            <AdPanel key={i} panel={panel} index={i} onPlay={setActiveVideo} />
          ))}
        </div>

        {/* Bottom label */}
        <div className="mt-4 flex justify-end">
          <Link
            to="/shop"
            className="font-inter text-[11px] uppercase tracking-[0.18em] text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-2"
          >
            View all collections <ArrowRight size={11} />
          </Link>
        </div>
      </section>

      {/* Video modals */}
      {PANELS.map((panel, i) => (
        <VideoModal
          key={i}
          videoId={PANEL_VIDEO_IDS[i]}
          isOpen={activeVideo === i}
          onClose={() => setActiveVideo(null)}
          title={panel.videoTitle}
        />
      ))}
    </>
  );
}

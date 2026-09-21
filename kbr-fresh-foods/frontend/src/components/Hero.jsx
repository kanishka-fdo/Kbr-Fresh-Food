import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Play } from 'lucide-react';
import VideoModal from './VideoModal';

/* ── YouTube video IDs ── */
/* Real Sri Lankan food & farming culture videos */
const HERO_VIDEO_ID = 'nUNbUf1neL0'; /* Village Kitchen SRI LANKA – backyard harvest & cooking ~896K views */

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1800&q=95',
    eyebrow: 'Highland Harvest',
    headline: 'Extraordinary\nProduce,',
    accent: 'Simply Fresh.',
    sub: 'Handpicked at dawn from Sri Lanka\'s most celebrated highland farms — arriving at your door before noon.',
    tag: 'ආයුබෝවන් · Ayubowan',
  },
  {
    img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1800&q=95',
    eyebrow: 'Orchard Fresh',
    headline: 'Tropical Fruits\nAt Their Peak,',
    accent: 'Every Morning.',
    sub: 'Daily harvest from local orchards — mangoes, papayas, and seasonal fruits picked at peak ripeness.',
    tag: 'ආයුබෝවන් · Ayubowan',
  },
  {
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=95',
    eyebrow: 'Rooted in Nature',
    headline: 'The Purest\nGreens on Earth,',
    accent: 'From Our Island.',
    sub: 'Authentic Sri Lankan vegetables, from leafy greens to vibrant root crops — sourced directly from sustainable farms.',
    tag: 'ආයුබෝවන් · Ayubowan',
  },
];

const TRUST = [
  { num: '15+', label: 'Years of Trust' },
  { num: '100+', label: 'Partner Farms' },
  { num: '5,000+', label: 'Families Served' },
  { num: '24hr', label: 'Farm to Door' },
];

export default function Hero({ onShopNow }) {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [playBadgeHover, setPlayBadgeHover] = useState(false);
  const timer = useRef(null);

  const goToSlide = useCallback((idx) => {
    setFade(false);
    setTimeout(() => {
      setCurrent(idx);
      setFade(true);
    }, 500);
  }, []);

  useEffect(() => {
    setHasLoaded(true);
    timer.current = setInterval(() => {
      goToSlide((prev) => {
        const next = (prev + 1) % SLIDES.length;
        return next;
      });
    }, 6000);
    return () => clearInterval(timer.current);
  }, []);

  const handleDot = (idx) => {
    clearInterval(timer.current);
    goToSlide(idx);
    timer.current = setInterval(() => {
      setCurrent((p) => {
        const next = (p + 1) % SLIDES.length;
        goToSlide(next);
        return p;
      });
    }, 6000);
  };

  const slide = SLIDES[current];

  return (
    <>
      <div className="relative w-full overflow-hidden bg-[#0d1f0d]" style={{ height: '100svh', minHeight: 640, maxHeight: 960 }}>

        {/* ── CSS for Ken Burns animation ── */}
        <style>{`
          @keyframes kenBurns {
            0%   { transform: scale(1.04) translate(0px, 0px); }
            50%  { transform: scale(1.10) translate(-12px, -6px); }
            100% { transform: scale(1.04) translate(0px, 0px); }
          }
          .kb-active { animation: kenBurns 18s ease-in-out infinite; }

          @keyframes pulseBadge {
            0%, 100% { box-shadow: 0 0 0 0 rgba(184,149,106,0.5); }
            50%       { box-shadow: 0 0 0 14px rgba(184,149,106,0); }
          }
          .play-pulse { animation: pulseBadge 2.2s ease-in-out infinite; }

          @keyframes floatBadge {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-6px); }
          }
          .float-badge { animation: floatBadge 3.5s ease-in-out infinite; }
        `}</style>

        {/* ── Background images (cross-fade + Ken Burns) ── */}
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[800ms] ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <img
              src={s.img}
              alt={s.eyebrow}
              className={`w-full h-full object-cover ${i === current ? 'kb-active' : ''}`}
            />
            {/* Cinematic vignette */}
            <div className="absolute inset-0"
              style={{
                background: 'linear-gradient(110deg, rgba(6,12,6,0.92) 0%, rgba(6,12,6,0.65) 45%, rgba(6,12,6,0.15) 100%)'
              }}
            />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(6,12,6,0.8) 0%, transparent 50%)' }}
            />
          </div>
        ))}

        {/* ── Sri Lankan Traditional Motif Overlay ── */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M60 0 C70 20, 90 30, 120 60 C90 90, 70 100, 60 120 C50 100, 30 90, 0 60 C30 30, 50 20, 60 0 Z\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'1\'/%3E%3Ccircle cx=\'60\' cy=\'60\' r=\'15\' fill=\'none\' stroke=\'%23b8956a\' stroke-width=\'1\'/%3E%3C/svg%3E")',
            backgroundSize: '120px 120px'
          }}
        />

        {/* ── Main content ── */}
        <div className="relative z-10 h-full flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-12 max-w-screen-2xl mx-auto w-full">

          {/* Top: eyebrow */}
          <div
            className="flex items-center gap-3 pt-4"
            style={{
              opacity: fade ? 1 : 0,
              transform: fade ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease'
            }}
          >
            <div className="w-6 h-px bg-[#b8956a]" />
            <span
              className="font-inter text-[11px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: '#b8956a' }}
            >
              {slide.eyebrow}
            </span>
            <div className="w-6 h-px bg-[#b8956a]" />
            <span className="font-inter text-[11px] text-white/40 tracking-widest uppercase">{slide.tag}</span>
          </div>

          {/* Center: headline */}
          <div className="flex-1 flex flex-col justify-center max-w-4xl">
            <div
              style={{
                opacity: fade ? 1 : 0,
                transform: fade ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s'
              }}
            >
              <h1
                className="font-editorial text-white leading-[1.0] mb-4"
                style={{
                  fontSize: 'clamp(3.5rem, 8vw, 7.5rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  fontFamily: "'Cormorant Garamond', Georgia, serif"
                }}
              >
                {slide.headline.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
                <span
                  className="block italic"
                  style={{
                    fontWeight: 500,
                    color: '#b8956a',
                    fontFamily: "'Cormorant Garamond', Georgia, serif"
                  }}
                >
                  {slide.accent}
                </span>
              </h1>

              <p
                className="font-inter text-white/60 mb-10 leading-relaxed max-w-md"
                style={{ fontSize: 'clamp(0.9rem, 1.4vw, 1.1rem)', fontWeight: 300 }}
              >
                {slide.sub}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-5">
                <button
                  onClick={onShopNow}
                  className="group font-inter font-semibold text-sm tracking-wide flex items-center gap-3 transition-all"
                  style={{
                    background: '#b8956a',
                    color: '#fff',
                    padding: '14px 32px',
                    borderRadius: '4px',
                    letterSpacing: '0.06em',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#c9a97e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#b8956a'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  SHOP NOW
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Watch Our Story button */}
                <button
                  onClick={() => setVideoOpen(true)}
                  className="flex items-center gap-3 transition-all"
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    padding: '14px 0',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#b8956a'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  <span
                    className="flex items-center justify-center play-pulse"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      border: '1.5px solid rgba(184,149,106,0.7)',
                      background: 'rgba(184,149,106,0.12)',
                      flexShrink: 0,
                    }}
                  >
                    <Play size={14} fill="#b8956a" color="#b8956a" style={{ marginLeft: 2 }} />
                  </span>
                  Watch Our Story
                </button>

                <Link
                  to="/about"
                  className="font-inter font-medium text-sm tracking-widest flex items-center gap-3 transition-all"
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    padding: '14px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#b8956a'; e.currentTarget.style.borderBottomColor = '#b8956a'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)'; }}
                >
                  Our Story
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom: stats + slide controls */}
          <div className="flex items-end justify-between pb-2">
            {/* Trust stats */}
            <div className="hidden md:flex items-center gap-8">
              {TRUST.map((t, i) => (
                <div key={i} className="text-left">
                  <div
                    className="font-editorial"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '2rem',
                      fontWeight: 300,
                      color: '#fff',
                      lineHeight: 1.1
                    }}
                  >
                    {t.num}
                  </div>
                  <div className="font-inter text-white/40 text-xs uppercase tracking-widest mt-0.5">
                    {t.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Slide dots + scroll */}
            <div className="flex flex-col items-end gap-6">
              <div className="flex items-center gap-3">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleDot(i)}
                    className="transition-all duration-300"
                    style={{
                      width: i === current ? 32 : 8,
                      height: 2,
                      background: i === current ? '#b8956a' : 'rgba(255,255,255,0.25)',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={onShopNow}
                className="flex flex-col items-center gap-2"
                style={{ color: 'rgba(255,255,255,0.35)', border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <span className="font-inter text-[10px] uppercase tracking-[0.2em]">Discover</span>
                <ChevronDown size={14} className="animate-bounce" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Floating "Watch Our Story" card — desktop only ── */}
        <div
          className="hidden xl:flex absolute bottom-10 right-10 z-20 items-center gap-4 cursor-pointer float-badge"
          style={{
            background: 'rgba(10,18,10,0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(184,149,106,0.25)',
            borderRadius: 4,
            padding: '14px 20px',
            transition: 'all 0.3s ease',
            ...(playBadgeHover ? { borderColor: 'rgba(184,149,106,0.6)', background: 'rgba(10,18,10,0.9)' } : {}),
          }}
          onClick={() => setVideoOpen(true)}
          onMouseEnter={() => setPlayBadgeHover(true)}
          onMouseLeave={() => setPlayBadgeHover(false)}
        >
          {/* Thumbnail */}
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ width: 68, height: 44, borderRadius: 3 }}
          >
            <img
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=200&q=80"
              alt="Watch"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
              <Play size={16} fill="#b8956a" color="#b8956a" style={{ marginLeft: 2 }} />
            </div>
          </div>

          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: '#b8956a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              Watch Our Story
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
              2 min · KBR Farm Visit
            </div>
          </div>
        </div>

        {/* ── Right-side vertical text (editorial touch) ── */}
        <div
          className="hidden xl:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 items-center gap-2"
          style={{ writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)' }}
        >
          <span className="font-inter text-[10px] tracking-[0.25em] uppercase text-white/25">
            KBR Fresh Foods · Negombo, Sri Lanka · Est. 2010
          </span>
        </div>
      </div>

      {/* ── Video Modal ── */}
      <VideoModal
        videoId={HERO_VIDEO_ID}
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        title="KBR Fresh Foods — Farm to Door Story"
      />
    </>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';
import VideoModal from './VideoModal';

/* ────────────────────────────────────────────────────
   CinematicVideoSection
   A premium full-width split section: left editorial
   text + right YouTube embed in an elegant frame.
   Used on the Shop (homepage) between FeaturedProducts
   and PromoBanners.
──────────────────────────────────────────────────── */

const VIDEO_ID = 'nUNbUf1neL0'; /* Sri Lanka vegetable and fruit harvest */

const POINTS = [
  '100+ partner farms across Sri Lanka',
  'Harvested & delivered within 24 hours',
  'SLSI-certified freshness guarantee',
  'Zero pesticide — lab-verified monthly',
];

export default function CinematicVideoSection() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section
        ref={ref}
        className="mb-28"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }}
      >
        {/* Section label */}
        <div className="flex items-center gap-6 mb-12">
          <div style={{ height: 1, flex: 1, background: '#e5e7eb' }} />
          <span
            className="font-inter text-[10px] uppercase tracking-[0.25em] font-semibold"
            style={{ color: '#b8956a' }}
          >
            See It Live
          </span>
          <div style={{ height: 1, flex: 1, background: '#e5e7eb' }} />
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">

          {/* LEFT: Editorial text */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-40px)',
              transition: 'opacity 0.8s ease 0.15s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: 20, height: 1, background: '#b8956a' }} />
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#b8956a',
                }}
              >
                Farm to Your Table
              </span>
            </div>

            <h2
              className="text-gray-900 leading-[1.05] mb-6"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2.4rem, 4vw, 3.8rem)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
              }}
            >
              How We Bring You<br />
              <em style={{ fontStyle: 'italic', color: '#1a3a1a' }}>the World's Freshest Produce.</em>
            </h2>

            <p
              className="text-gray-500 leading-relaxed mb-8"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: '0.95rem',
                fontWeight: 300,
              }}
            >
              Every morning before dawn, our sourcing team is on the ground at partner farms across Sri Lanka. Watch how we maintain an unbroken cold chain from highland harvest to your doorstep — in under 24 hours.
            </p>

            {/* Check points */}
            <div className="space-y-3 mb-8">
              {POINTS.map((pt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `opacity 0.6s ease ${0.4 + i * 0.1}s, transform 0.6s ease ${0.4 + i * 0.1}s`,
                  }}
                >
                  <CheckCircle size={16} style={{ color: '#1a3a1a', flexShrink: 0 }} strokeWidth={2} />
                  <span
                    className="text-gray-700"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 400 }}
                  >
                    {pt}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={() => setVideoOpen(true)}
                className="inline-flex items-center gap-3 transition-all"
                style={{
                  background: '#0d1f0d',
                  color: '#fff',
                  padding: '13px 28px',
                  borderRadius: 3,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1a3a1a'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0d1f0d'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Play size={14} fill="currentColor" style={{ marginLeft: -2 }} />
                Watch Full Video
              </button>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 transition-all"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#1a3a1a',
                  borderBottom: '1px solid #1a3a1a',
                  paddingBottom: 2,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#b8956a'; e.currentTarget.style.borderBottomColor = '#b8956a'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#1a3a1a'; e.currentTarget.style.borderBottomColor = '#1a3a1a'; }}
              >
                Our Story <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* RIGHT: YouTube embed in premium frame */}
          <div
            className="relative"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(40px)',
              transition: 'opacity 0.8s ease 0.25s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.25s',
            }}
          >
            {/* Decorative offset background */}
            <div
              className="absolute"
              style={{
                inset: 0,
                background: '#f0ebe3',
                borderRadius: 6,
                transform: 'translate(12px, 12px)',
                zIndex: 0,
              }}
            />

            {/* Gold border frame */}
            <div
              className="relative"
              style={{
                borderRadius: 6,
                border: '1.5px solid rgba(184,149,106,0.35)',
                overflow: 'hidden',
                zIndex: 1,
                background: '#0d1f0d',
              }}
            >
              {/* Gold top accent */}
              <div style={{ height: 3, background: 'linear-gradient(90deg, #b8956a, #d4af82, #b8956a)' }} />

              {/* YouTube iframe embed — 16:9 */}
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&modestbranding=1&color=white&controls=1`}
                  title="KBR Fresh Foods — Farm to Table"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                  }}
                />
              </div>

              {/* Caption bar */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ background: '#0d1f0d' }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#b8956a',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    KBR Fresh Foods
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.35)',
                      marginTop: 2,
                    }}
                  >
                    Farm-to-door in under 24 hours
                  </div>
                </div>
                <button
                  onClick={() => setVideoOpen(true)}
                  className="flex items-center gap-2 transition-all"
                  style={{
                    background: 'rgba(184,149,106,0.15)',
                    border: '1px solid rgba(184,149,106,0.3)',
                    borderRadius: 3,
                    padding: '6px 14px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#b8956a',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,149,106,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(184,149,106,0.15)'; }}
                >
                  <Play size={10} fill="#b8956a" style={{ marginLeft: 1 }} />
                  Fullscreen
                </button>
              </div>
            </div>

            {/* Stats floating card */}
            <div
              className="absolute -bottom-5 -left-5 z-10 px-5 py-4"
              style={{
                background: '#fff',
                borderRadius: 4,
                border: '1px solid #e5e7eb',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                display: 'flex',
                gap: 20,
              }}
            >
              {[['100+', 'Partner Farms'], ['24hr', 'Delivery']].map(([val, lbl]) => (
                <div key={val}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '1.6rem',
                      fontWeight: 300,
                      color: '#0d1f0d',
                      lineHeight: 1,
                    }}
                  >
                    {val}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: '#9ca3af',
                      marginTop: 3,
                    }}
                  >
                    {lbl}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <VideoModal
        videoId={VIDEO_ID}
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        title="KBR Fresh Foods — Farm to Table in 24 Hours"
      />
    </>
  );
}

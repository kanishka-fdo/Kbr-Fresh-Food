import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import VideoModal from './VideoModal';

const PILLARS = [
  {
    num: '01',
    title: 'Direct Farm Sourcing',
    desc: 'We eliminate every middleman. Our team personally visits 100+ partner farms weekly — from Nuwara Eliya\'s misty highlands to Dambulla\'s agricultural heartland — selecting only peak-quality produce.',
    img: '/images/farm.png',
  },
  {
    num: '02',
    title: 'Cold-Chain Integrity',
    desc: 'Temperature-controlled vehicles maintain 2–8°C from the moment of harvest. Our logistics infrastructure ensures your produce arrives as fresh as the moment it was picked.',
    img: '/images/delivery.png',
  },
  {
    num: '03',
    title: 'Rigorous Quality Lab',
    desc: 'Every single batch undergoes a 12-point freshness and pesticide-residue testing protocol at our SLSI-certified Negombo laboratory. Zero compromise — always.',
    img: '/images/lab.png',
  },
];

/* YouTube video for the process overview */
const PROCESS_VIDEO_ID = 'nUNbUf1neL0'; /* Sri Lanka vegetable and fruit harvest */

export default function PromoVideoSection() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  /* Scroll-triggered reveal */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="mb-28" ref={sectionRef}>
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16">
          <div>
            <span
              className="font-inter text-[10px] uppercase tracking-[0.22em] font-semibold block mb-4"
              style={{ color: 'var(--kandyan-red, #8b1c1c)' }}
            >
              Our Heritage
            </span>
            <h2
              className="font-editorial leading-[1.05] text-gray-900"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
              }}
            >
              The Traditional Art of<br />
              <em style={{ color: '#1a3a1a', fontStyle: 'italic' }}>Fresh Sri Lankan Food.</em>
            </h2>
          </div>
          <div>
            <p className="font-inter text-gray-500 text-base leading-relaxed mb-6" style={{ fontWeight: 300 }}>
              For fifteen years, KBR Fresh Foods has operated on a single belief: that exceptional food begins with exceptional sourcing. Our three-pillar quality system ensures every product you receive is held to the highest standard in Sri Lanka.
            </p>
            <Link
              to="/about"
              className="font-inter inline-flex items-center gap-3 text-sm font-medium transition-all"
              style={{ color: '#1a3a1a', textDecoration: 'underline', textDecorationColor: '#b8956a', textUnderlineOffset: '6px' }}
            >
              Read our full story <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ── CINEMATIC VIDEO EMBED ── */}
        <div
          className="relative mb-14 overflow-hidden"
          style={{
            borderRadius: 4,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {/* Background image as poster */}
          <div
            className="relative overflow-hidden"
            style={{ borderRadius: 4 }}
          >
            <img
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1800&q=90"
              alt="KBR Farm Process"
              className="w-full object-cover"
              style={{ height: 440, objectPosition: 'center 30%' }}
            />
            {/* Dark overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, rgba(4,8,4,0.85) 0%, rgba(4,8,4,0.5) 100%)' }}
            />

            {/* Gold top & bottom border lines */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,#b8956a 30%,#b8956a 70%,transparent)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,#b8956a 30%,#b8956a 70%,transparent)' }} />

            {/* Centered content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <div
                className="font-inter text-[10px] uppercase tracking-[0.25em] font-semibold mb-4"
                style={{ color: '#b8956a' }}
              >
                Behind The Scenes · 4 min Watch
              </div>

              <h3
                className="text-white mb-6 leading-[1.08]"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                }}
              >
                See How We Source<br />
                <em style={{ fontStyle: 'italic', color: '#b8956a' }}>Sri Lanka's Finest Produce.</em>
              </h3>

              {/* Big play button */}
              <button
                onClick={() => setVideoOpen(true)}
                className="group flex items-center justify-center transition-all duration-300"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  background: 'rgba(184,149,106,0.15)',
                  border: '2px solid rgba(184,149,106,0.6)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  marginBottom: 16,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,149,106,0.3)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(184,149,106,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}
                aria-label="Play our farm process video"
              >
                <Play size={32} fill="#b8956a" color="#b8956a" style={{ marginLeft: 5 }} />
              </button>

              <span
                className="font-inter text-white/40 text-xs uppercase tracking-widest"
              >
                Click to play
              </span>
            </div>
          </div>
        </div>

        {/* Three editorial pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100" style={{ borderRadius: 4 }}>
          {PILLARS.map((p, i) => (
            <div
              key={i}
              className="group bg-white relative overflow-hidden"
              style={{
                borderRadius: i === 0 ? '4px 0 0 4px' : i === 2 ? '0 4px 4px 0' : 0,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.7s ease ${0.2 + i * 0.15}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${0.2 + i * 0.15}s`,
              }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ height: 240 }}>
                <img
                  src={p.img}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))' }} />
                {/* Step number */}
                <div
                  className="absolute top-5 left-5 font-editorial"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '4rem',
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.15)',
                    lineHeight: 1,
                  }}
                >
                  {p.num}
                </div>
              </div>

              {/* Text */}
              <div className="p-7">
                <div
                  className="font-inter text-[10px] uppercase tracking-[0.2em] font-semibold mb-3"
                  style={{ color: '#b8956a' }}
                >
                  Step {p.num}
                </div>
                <h3
                  className="font-editorial mb-4 text-gray-900"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.55rem',
                    fontWeight: 400,
                    lineHeight: 1.2,
                  }}
                >
                  {p.title}
                </h3>
                <p className="font-inter text-gray-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                  {p.desc}
                </p>
              </div>

              {/* Bottom accent line on hover */}
              <div
                className="absolute bottom-0 left-0 h-0.5 transition-all duration-500 ease-out group-hover:w-full"
                style={{ width: 0, background: '#b8956a' }}
              />
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-6">
            <span className="font-inter flex items-center gap-1.5 text-xs text-gray-500" style={{ fontWeight: 400 }}>
              Fresh Farm Guarantee
            </span>
            <span className="font-inter flex items-center gap-1.5 text-xs text-gray-500" style={{ fontWeight: 400 }}>
              Direct Sourcing
            </span>
          </div>
          <Link
            to="/shop"
            className="font-inter inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition-all"
            style={{ color: '#1a3a1a', borderBottom: '1px solid #1a3a1a', paddingBottom: 2 }}
          >
            Shop Now <ArrowRight size={11} />
          </Link>
        </div>
      </section>

      <VideoModal
        videoId={PROCESS_VIDEO_ID}
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        title="KBR Fresh Foods — Our Sourcing Process"
      />
    </>
  );
}

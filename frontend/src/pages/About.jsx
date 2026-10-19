import { useRef, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star, CheckCircle, Play } from 'lucide-react';

/* ─── Typography helpers ─── */
const ED = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
const IN = { fontFamily: "'Inter', system-ui, sans-serif" };
const GOLD = '#b8956a';
const FOREST = '#0d1f0d';

/* ─── DATA ─── */

const STATS = [
  { value: '15+', label: 'Years of Heritage', note: 'Est. 2010, Negombo' },
  { value: '100+', label: 'Partner Farms', note: 'Across Sri Lanka' },
  { value: '5,000+', label: 'Families Served', note: 'Weekly deliveries' },
  { value: '7+', label: 'Retail Locations', note: 'Western Province' },
];

const MILESTONES = [
  { year: '2010', event: 'KBR Founded', desc: 'KBR J FERNANDO opens a small fresh-produce operation in Negombo market with three partner farms and an uncompromising vision.' },
  { year: '2013', event: 'First Supermarket Contract', desc: 'KBR wins its inaugural B2B supply agreement with Cargills Food City — a turning point that validated our quality-first approach.' },
  { year: '2016', event: 'Cold-Chain Infrastructure', desc: 'A major investment in refrigerated logistics enables direct sourcing from Nuwara Eliya\'s 1,800m highlands without compromising freshness.' },
  { year: '2018', event: 'Keells Super Partnership', desc: 'KBR becomes the primary organic produce supplier for Keells Super\'s Negombo and Katunayake branches.' },
  { year: '2020', event: 'Digital Platform', desc: 'Launch of KBR\'s online ordering system, extending fresh delivery to thousands of families across the Western Province.' },
  { year: '2025', event: 'Island-Wide Network', desc: '100+ partner farms, 7+ locations, and a growing wholesale network. KBR is Sri Lanka\'s most trusted farm-to-door brand.' },
];

const TEAM = [
  {
    name: 'Kanishka Fernando',
    role: 'Order, Delivery & Payment Management',
    bio: "Born and raised in Negombo, Kanishka ensures seamless order processing and timely deliveries for all KBR customers. With a keen eye on operational efficiency, he manages end-to-end logistics and secure payment systems, guaranteeing that every customer receives their fresh produce exactly when they need it.",
    img: '/team/kanishka.jpg',
    quote: "Efficiency in delivery and security in payments are the pillars of customer trust.",
  },
  {
    name: 'Savinda Herath',
    role: 'Customer & Account Management',
    bio: "Savinda is the voice of KBR, dedicated to providing exceptional support and building lasting relationships with our community. He ensures every customer inquiry is met with care and that user accounts are managed seamlessly, making the KBR experience smooth and welcoming from start to finish.",
    img: '/team/buddhika.jpg',
    quote: "Our customers are at the heart of everything we do. Exceptional service is our standard.",
  },
  {
    name: 'Heshan Rathnayaka',
    role: 'Wholesale Supply Management & Business Analytics',
    bio: "Heshan drives KBR's B2B growth by analyzing market trends and optimizing our wholesale supply chain. Working closely with major commercial partners, his data-driven insights ensure that we maintain consistent, high-quality supply to businesses and resorts across the region.",
    img: '/team/ravindra.jpg',
    quote: "Data-driven decisions and reliable supply chains build the strongest business partnerships.",
  },
  {
    name: 'Anujana Wickramasinghe',
    role: 'Product & Inventory Management',
    bio: "Anujana oversees the heartbeat of KBR's operations—our fresh produce inventory. By meticulously tracking stock levels and product quality, she ensures our warehouse is always fully stocked with the freshest items, minimizing waste and maximizing availability for our customers.",
    img: '/team/sithara.jpg',
    quote: "Precision in inventory means our customers always get the freshest products available.",
  },
];

const REGIONS = [
  {
    name: 'Nuwara Eliya Highlands',
    subtitle: '1,800m · Cool Climate',
    desc: 'Sri Lanka\'s "Little England" produces extraordinary leeks, carrots, strawberries and brassicas in cool highland air. Our team visits twice weekly.',
    img: '/region_nuwara_eliya.png',
  },
  {
    name: 'Dambulla Hub',
    subtitle: 'Central Province · 60+ Farms',
    desc: 'Sri Lanka\'s largest wholesale agricultural market, where we source directly from over sixty smallholder families — cutting out every middleman.',
    img: '/region_dambulla.png',
  },
  {
    name: 'Jaffna Peninsula',
    subtitle: 'Northern Province · Tropical',
    desc: 'Renowned for exceptional mangoes, grapes, and red onions. We work with dedicated farmers in the north to bring their unique harvests southward.',
    img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=90',
  },
  {
    name: 'Anuradhapura Plains',
    subtitle: 'North Central · Heritage Lands',
    desc: 'The ancient agricultural heartland provides us with premium papayas, bananas, and a variety of tropical fruits cultivated with generations of expertise.',
    img: '/region_anuradhapura.png',
  },
];

const CERTIFICATIONS = [
  { label: 'SLSI Certified', desc: 'Sri Lanka Standards Institution Food Safety' },
  { label: 'HACCP Protocol', desc: 'International Hazard Analysis Critical Control' },
  { label: 'ISO 22000', desc: 'Food Safety Management Systems Standard' },
  { label: 'SL Organic', desc: 'Government-Registered Organic Produce' },
  { label: 'Zero Pesticide', desc: 'Monthly Lab Verification on All Batches' },
  { label: 'Export Approved', desc: 'Cleared for Regional Export Markets' },
];

const PARTNERS = [
  { name: 'Keells Super', role: 'Primary organic produce partner — Negombo & Katunayake branches.' },
  { name: 'Cargills Food City', role: 'Retail grocery distribution, Western Province network.' },
  { name: 'Jetwing Hotels', role: 'Preferred produce supplier across all Negombo properties.' },
  { name: 'Gampaha Organic Collective', role: 'Certified cooperative farming partner network.' },
  { name: 'Negombo Fresh Market', role: 'Key supplier for premium export-grade fruits and vegetables.' },
  { name: 'Lagoon Kitchen', role: 'Exclusive supplier of highland vegetables and tropical fruits.' },
];

/* ─── DIVIDER ─── */
function GoldDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
        <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="rgba(184,149,106,0.1)"/>
      </svg>
      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
    </div>
  );
}

/* ─── SECTION LABEL ─── */
function Label({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div style={{ width: 20, height: 1, background: GOLD }} />
      <span style={{ ...IN, fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD }}>
        {children}
      </span>
    </div>
  );
}

/* ─── SCROLL REVEAL HOOK ─── */
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── MAIN COMPONENT ─── */
export default function About() {
  const [activeTeam, setActiveTeam] = useState(0);

  const [statsRef, statsVisible] = useScrollReveal();
  const [timelineRef, timelineVisible] = useScrollReveal();
  const [processRef, processVisible] = useScrollReveal();
  const [teamRef, teamVisible] = useScrollReveal();

  return (
    <Layout>
      <style>{`
        @keyframes pulseBadge {
          0%, 100% { box-shadow: 0 0 0 0 rgba(184,149,106,0.5); }
          50%       { box-shadow: 0 0 0 14px rgba(184,149,106,0); }
        }
        .about-play-pulse { animation: pulseBadge 2.4s ease-in-out infinite; }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .float-badge { animation: floatUp 4s ease-in-out infinite; }
        @keyframes revealFade {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reveal-anim { animation: revealFade 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* ══════════════════════════════════
          01. CINEMATIC HERO
      ══════════════════════════════════ */}
      <div
        className="relative overflow-hidden mb-24"
        style={{ height: '92vh', minHeight: 620, maxHeight: 920 }}
      >
        {/* Background */}
        <img
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1800&q=95"
          alt="KBR Fresh Foods"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(105deg, rgba(4,8,4,0.93) 0%, rgba(4,8,4,0.65) 50%, rgba(4,8,4,0.2) 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(4,8,4,0.85) 0%, transparent 55%)' }}
        />

        {/* Traditional Liyavel motif overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M60 0 C70 20, 90 30, 120 60 C90 90, 70 100, 60 120 C50 100, 30 90, 0 60 C30 30, 50 20, 60 0 Z\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'1\'/%3E%3Ccircle cx=\'60\' cy=\'60\' r=\'15\' fill=\'none\' stroke=\'%23b8956a\' stroke-width=\'1\'/%3E%3C/svg%3E")',
            backgroundSize: '120px 120px'
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 h-full flex flex-col justify-between px-8 sm:px-14 lg:px-20 py-14 max-w-screen-xl mx-auto w-full"
        >
          {/* Top strip */}
          <div className="flex items-center gap-3">
            <div style={{ width: 20, height: 1, background: GOLD }} />
            <span style={{ ...IN, fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD }}>
              ආයුබෝවන් · Ayubowan · Est. 2010 · Negombo
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-3xl">
            <h1
              className="text-white mb-6 leading-[1.02]"
              style={{
                ...ED,
                fontSize: 'clamp(3.2rem, 7vw, 6.8rem)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
              }}
            >
              Fifteen Years of<br />
              <em style={{ fontStyle: 'italic', color: GOLD }}>Farm-Fresh</em><br />
              Excellence.
            </h1>
            <p
              className="text-white/55 mb-10 max-w-lg leading-relaxed"
              style={{ ...IN, fontSize: '1.05rem', fontWeight: 300 }}
            >
              Rooted in the coastal haven of Negombo, KBR Fresh Foods connects Sri Lanka's celebrated highland farms, spice gardens and ocean waters with families and premier establishments across the nation.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link
                to="/"
                className="font-inter font-semibold text-sm tracking-wide flex items-center gap-3 transition-all"
                style={{
                  ...IN,
                  background: GOLD,
                  color: '#fff',
                  padding: '14px 32px',
                  borderRadius: 3,
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: 12,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#c9a97e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Shop Fresh Produce <ArrowRight size={15} />
              </Link>

              <Link
                to="/contact"
                className="flex items-center gap-2 transition-all"
                style={{
                  ...IN,
                  color: 'rgba(255,255,255,0.6)',
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = GOLD; e.currentTarget.style.borderBottomColor = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)'; }}
              >
                <MapPin size={13} /> Visit Our Hub
              </Link>
            </div>
          </div>

          {/* Bottom strip: stats */}
          <div
            ref={statsRef}
            className="flex flex-wrap gap-10 pt-6 border-t border-white/10"
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  opacity: statsVisible ? 1 : 0,
                  transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
                }}
              >
                <div className="text-white" style={{ ...ED, fontSize: '2.4rem', fontWeight: 300, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div className="text-white/40 mt-1" style={{ ...IN, fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          02. BRAND STATEMENT (editorial)
      ══════════════════════════════════ */}
      <section className="mb-24 max-w-5xl mx-auto px-4">
        <GoldDivider className="mb-16" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
          <Label>Our Philosophy</Label>
          <div>
            <p
              className="text-gray-900 mb-6 leading-[1.45]"
              style={{ ...ED, fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', fontWeight: 300 }}
            >
              We believe exceptional food begins with exceptional sourcing. Every product we sell carries a story — of the farmer who grew it, the soil that nurtured it, and the care that brought it to your table.
            </p>
            <p className="text-gray-500 leading-relaxed" style={{ ...IN, fontSize: '0.95rem', fontWeight: 300 }}>
              KBR Fresh Foods operates on a simple but demanding principle: our quality standard is non-negotiable. From the moment a product leaves a partner farm to the moment it arrives at your door, it is handled with the same care a chef gives to the finest ingredient in their kitchen.
            </p>
          </div>
        </div>
        <GoldDivider className="mt-16" />
      </section>

      {/* ══════════════════════════════════
          03. REGIONAL SOURCING — editorial mosaic
      ══════════════════════════════════ */}
      <section className="mb-24 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-12 items-end mb-12">
            <div>
              <Label>Sourcing Regions</Label>
              <h2
                className="text-gray-900 leading-[1.05]"
                style={{ ...ED, fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 300, letterSpacing: '-0.02em' }}
              >
                Sri Lanka's Finest<br />
                <em style={{ fontStyle: 'italic', color: '#1a3a1a' }}>Growing Regions.</em>
              </h2>
            </div>
            <p className="text-gray-500 leading-relaxed self-end" style={{ ...IN, fontSize: '0.95rem', fontWeight: 300 }}>
              We have spent fifteen years building direct relationships with farmers across Sri Lanka's most celebrated agricultural regions. Each source region is chosen for its unique terroir, climate, and the expertise of its growers.
            </p>
          </div>

          {/* Mosaic grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {REGIONS.map((r, i) => (
              <div
                key={i}
                className="group relative overflow-hidden cursor-pointer"
                style={{ borderRadius: 3, height: 420 }}
              >
                <img
                  src={r.img}
                  alt={r.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(4,8,4,0.88) 0%, rgba(4,8,4,0.3) 55%, rgba(4,8,4,0.05) 100%)' }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div style={{ ...IN, fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 6 }}>
                    {r.subtitle}
                  </div>
                  <h3 className="text-white mb-2" style={{ ...ED, fontSize: '1.35rem', fontWeight: 400, lineHeight: 1.2 }}>
                    {r.name}
                  </h3>
                  <p
                    className="text-white/50 leading-relaxed transition-all duration-500 max-h-0 overflow-hidden group-hover:max-h-24"
                    style={{ ...IN, fontSize: '0.8rem', fontWeight: 300 }}
                  >
                    {r.desc}
                  </p>
                </div>
                {/* Top-right accent corner */}
                <div
                  className="absolute top-4 right-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{ width: 28, height: 28, borderTop: `1px solid ${GOLD}`, borderRight: `1px solid ${GOLD}` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          05. COMPANY TIMELINE
      ══════════════════════════════════ */}
      <section className="mb-24 px-4" ref={timelineRef}>
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-12 items-start mb-14">
            <div>
              <Label>Our Journey</Label>
              <h2
                className="text-gray-900 leading-[1.05]"
                style={{ ...ED, fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 300, letterSpacing: '-0.02em' }}
              >
                Fifteen Years<br />
                of <em style={{ fontStyle: 'italic', color: '#1a3a1a' }}>Growing.</em>
              </h2>
            </div>
          </div>

          <div className="border-l border-gray-200 ml-6 pl-8 space-y-10">
            {MILESTONES.map((m, i) => (
              <div
                key={i}
                className="relative group"
                style={{
                  opacity: timelineVisible ? 1 : 0,
                  transform: timelineVisible ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
                }}
              >
                {/* Dot */}
                <div
                  className="absolute -left-11 top-1 w-3 h-3 rounded-full border-2 border-white transition-all duration-300 group-hover:scale-125"
                  style={{ background: i === MILESTONES.length - 1 ? GOLD : '#d1d5db', borderColor: 'white', boxShadow: `0 0 0 2px ${i === MILESTONES.length - 1 ? GOLD : '#d1d5db'}` }}
                />

                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 items-start">
                  <div>
                    <span
                      style={{ ...ED, fontSize: '1.8rem', fontWeight: 300, color: '#d1d5db', lineHeight: 1 }}
                    >
                      {m.year}
                    </span>
                  </div>
                  <div>
                    <h3
                      className="text-gray-900 mb-1"
                      style={{ ...IN, fontSize: '0.95rem', fontWeight: 600, letterSpacing: '-0.01em' }}
                    >
                      {m.event}
                    </h3>
                    <p className="text-gray-500" style={{ ...IN, fontSize: '0.875rem', fontWeight: 300, lineHeight: 1.6 }}>
                      {m.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          06. MISSION — full-bleed split
      ══════════════════════════════════ */}
      <section className="mb-24 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Image */}
            <div className="relative overflow-hidden" style={{ borderRadius: 3, minHeight: 520 }}>
              <img
                src="/farmer_commitment.png"
                alt="Sri Lankan farmers"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div
              className="flex flex-col justify-center px-10 lg:px-14 py-16"
              style={{ background: '#faf7f2', borderRadius: 3 }}
            >
              <Label>Our Commitment</Label>
              <h2
                className="text-gray-900 mb-6 leading-[1.05]"
                style={{ ...ED, fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 300, letterSpacing: '-0.02em' }}
              >
                Empowering<br />
                <em style={{ fontStyle: 'italic', color: '#1a3a1a' }}>Sri Lankan Farmers.</em>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5" style={{ ...IN, fontSize: '0.9rem', fontWeight: 300 }}>
                KBR Fresh Foods pays 30% above market rate to every partner farmer — eliminating exploitative middlemen and creating sustainable livelihoods across Sri Lanka's rural communities.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8" style={{ ...IN, fontSize: '0.9rem', fontWeight: 300 }}>
                We work with over 100 smallholder families who share our belief that sustainable farming is not a philosophy — it is a practice that demands daily commitment.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Direct farm sourcing — zero middlemen',
                  '30% above-market price for all partners',
                  'Monthly sustainability audits',
                  '100% eco-friendly packaging by 2026',
                ].map((pt) => (
                  <div key={pt} className="flex items-center gap-3">
                    <CheckCircle size={15} style={{ color: '#1a3a1a', flexShrink: 0 }} strokeWidth={2} />
                    <span className="text-gray-700" style={{ ...IN, fontSize: '0.875rem', fontWeight: 400 }}>{pt}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-3 text-xs uppercase tracking-widest font-semibold w-fit transition-all"
                style={{ ...IN, color: '#1a3a1a', borderBottom: '1px solid #1a3a1a', paddingBottom: 3 }}
              >
                Shop Our Range <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          07. TEAM — editorial grid
      ══════════════════════════════════ */}
      <section className="mb-24 px-4" ref={teamRef}>
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <div>
              <Label>Leadership</Label>
              <h2
                className="text-gray-900 leading-[1.05]"
                style={{ ...ED, fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 300, letterSpacing: '-0.02em' }}
              >
                The People Behind<br />
                <em style={{ fontStyle: 'italic', color: '#1a3a1a' }}>KBR Fresh Foods.</em>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {TEAM.map((member, i) => (
              <div
                key={i}
                className="group relative overflow-hidden bg-white cursor-pointer"
                style={{
                  borderRadius: 3,
                  border: '1px solid #e5e7eb',
                  opacity: teamVisible ? 1 : 0,
                  transform: teamVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `opacity 0.7s ease ${i * 0.12}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s`,
                }}
                onClick={() => setActiveTeam(i === activeTeam ? null : i)}
              >
                {/* Photo */}
                <div className="relative overflow-hidden" style={{ height: 300 }}>
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                    style={{ filter: 'grayscale(15%)' }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(4,8,4,0.8) 0%, transparent 55%)' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div style={{ ...IN, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 4 }}>
                      {member.role}
                    </div>
                    <h3 className="text-white" style={{ ...ED, fontSize: '1.25rem', fontWeight: 400 }}>
                      {member.name}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-500 mb-4 leading-relaxed" style={{ ...IN, fontSize: '0.8rem', fontWeight: 300 }}>
                    {member.bio}
                  </p>
                  <div
                    className="border-l-2 pl-4 italic text-gray-600"
                    style={{ borderColor: GOLD, ...ED, fontSize: '0.95rem', fontWeight: 400, lineHeight: 1.5 }}
                  >
                    "{member.quote}"
                  </div>
                </div>

                {/* Hover bottom line */}
                <div
                  className="absolute bottom-0 left-0 h-[2px] transition-all duration-500 group-hover:w-full"
                  style={{ width: 0, background: GOLD }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          09. PARTNERS
      ══════════════════════════════════ */}
      <section className="mb-24 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-12 items-end mb-12">
            <div>
              <Label>Trade Partners</Label>
              <h2
                className="text-gray-900 leading-[1.05]"
                style={{ ...ED, fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 300 }}
              >
                Trusted by Sri Lanka's<br />
                <em style={{ fontStyle: 'italic', color: '#1a3a1a' }}>Finest Establishments.</em>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100" style={{ borderRadius: 3 }}>
            {PARTNERS.map((p, i) => (
              <div
                key={i}
                className="group bg-white px-8 py-7 relative transition-colors hover:bg-[#faf7f2]"
                style={{
                  borderRadius:
                    i === 0 ? '3px 0 0 0' : i === 2 ? '0 3px 0 0' :
                    i === 3 ? '0 0 0 3px' : i === 5 ? '0 0 3px 0' : 0
                }}
              >
                <div className="text-gray-900 mb-2" style={{ ...IN, fontSize: '0.9rem', fontWeight: 600 }}>{p.name}</div>
                <div className="text-gray-400 leading-relaxed" style={{ ...IN, fontSize: '0.8rem', fontWeight: 300 }}>{p.role}</div>
                <div
                  className="absolute bottom-0 left-0 h-[2px] transition-all duration-500 group-hover:w-full"
                  style={{ width: 0, background: GOLD }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          10. CTA — dark cinematic banner
      ══════════════════════════════════ */}
      <section className="mb-8 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div
            className="relative overflow-hidden text-white"
            style={{ borderRadius: 3, minHeight: 400 }}
          >
            <img
              src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1800&q=90"
              alt="Fresh produce"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(105deg, rgba(4,8,4,0.92) 0%, rgba(4,8,4,0.6) 55%, rgba(4,8,4,0.15) 100%)' }}
            />

            <div className="relative z-10 flex flex-col justify-center h-full px-12 lg:px-20 py-16 max-w-2xl">
              <Label>Begin Today</Label>
              <h2
                className="text-white mb-5 leading-[1.05]"
                style={{ ...ED, fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 300 }}
              >
                Ready to Taste the<br />
                <em style={{ fontStyle: 'italic', color: GOLD }}>KBR Difference?</em>
              </h2>
              <p className="text-white/50 mb-10 leading-relaxed" style={{ ...IN, fontSize: '0.9rem', fontWeight: 300 }}>
                Join 5,000+ families who start every morning with KBR Fresh Foods. Your first order ships today — directly from the farm.
              </p>
              <div className="flex flex-wrap gap-5">
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 text-xs uppercase tracking-widest font-semibold transition-all"
                  style={{ ...IN, background: GOLD, color: '#fff', padding: '14px 32px', borderRadius: 3 }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#c9a97e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Shop Fresh Now <ArrowRight size={13} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium transition-all"
                  style={{ ...IN, color: 'rgba(255,255,255,0.55)', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 2 }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; e.currentTarget.style.borderBottomColor = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)'; }}
                >
                  <MapPin size={12} /> Visit Our Stores
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
}

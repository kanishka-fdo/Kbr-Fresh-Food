import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    title: 'Farm Selection',
    desc: 'Our team visits and vets every partner farm against our quality charter — ensuring ethical practices, soil health, and sustainable methods.',
    img: '/images/farm.png',
  },
  {
    num: '02',
    title: 'Morning Harvest',
    desc: 'Produce is harvested before 6 AM at peak nutritional density. Timing is everything — which is why our partners only pick for us on our schedule.',
    img: '/images/harvest.png',
  },
  {
    num: '03',
    title: 'Quality & Lab Testing',
    desc: 'Every batch enters our SLSI-certified Negombo laboratory for pesticide residue, freshness grading, and 12-point inspection before dispatch.',
    img: '/images/lab.png',
  },
  {
    num: '04',
    title: 'Cold-Chain Delivery',
    desc: 'Refrigerated vehicles maintain 2–8°C end-to-end. Your order is dispatched and arrives at your door within 24 hours of harvest.',
    img: '/images/delivery.png',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="mb-28">
      {/* Header */}
      <div className="flex items-end justify-between mb-14">
        <div>
          <span
            className="font-inter text-[10px] uppercase tracking-[0.22em] font-semibold block mb-4"
            style={{ color: '#b8956a' }}
          >
            The Process
          </span>
          <h2
            className="font-editorial text-gray-900 leading-[1.05]"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.4rem, 4vw, 3.6rem)',
              fontWeight: 300,
              letterSpacing: '-0.02em',
            }}
          >
            Farm to Door —<br />
            <em className="italic" style={{ color: '#1a3a1a' }}>A Four-Step Promise.</em>
          </h2>
        </div>
        <Link
          to="/about"
          className="hidden md:flex font-inter items-center gap-2 text-xs uppercase tracking-[0.16em] font-medium transition-all"
          style={{ color: '#1a3a1a', borderBottom: '1px solid #1a3a1a', paddingBottom: 2 }}
        >
          Our full story <ArrowRight size={11} />
        </Link>
      </div>

      {/* Steps grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100" style={{ borderRadius: 4 }}>
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="group bg-white relative overflow-hidden"
            style={{
              borderRadius:
                i === 0 ? '4px 0 0 4px' :
                i === 3 ? '0 4px 4px 0' : 0,
            }}
          >
            {/* Image */}
            <div className="relative overflow-hidden" style={{ height: 200 }}>
              <img
                src={step.img}
                alt={step.title}
                className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
              />
              {/* Overlaid step number */}
              <div
                className="absolute bottom-3 right-4 font-editorial"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '5rem',
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.2)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {step.num}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pb-8">
              <div
                className="font-inter text-[10px] uppercase tracking-[0.2em] font-semibold mb-3"
                style={{ color: '#b8956a' }}
              >
                {step.num}
              </div>
              <h3
                className="font-editorial mb-3 text-gray-900"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.4rem',
                  fontWeight: 400,
                  lineHeight: 1.25,
                }}
              >
                {step.title}
              </h3>
              <p className="font-inter text-gray-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                {step.desc}
              </p>
            </div>

            {/* Hover bottom line */}
            <div
              className="absolute bottom-0 left-0 h-[2px] transition-all duration-500 group-hover:w-full"
              style={{ width: 0, background: '#b8956a' }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

import { Leaf, Phone, Mail, MapPin, ChevronRight, MessageCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const WHATSAPP_NUMBER = '94779779316';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20KBR%20Fresh%20Foods!%20I'd%20like%20to%20enquire%20about%20your%20products.`;

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-brand-100/70 pt-16 pb-6 relative overflow-hidden">
      {/* Decorative accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-600 via-brand-400 to-brand-300" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm mb-14">
          {/* Brand column */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-6 group inline-flex">
              <div className="bg-[#f9f9f6] p-1.5 rounded-xl group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/kbr-logo.png" 
                  alt="KBR Fresh Foods Logo" 
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div>
                <div className="font-bold text-white text-xl leading-none">KBR Fresh Foods</div>
                <div className="text-[10px] text-brand-400 font-bold tracking-widest uppercase mt-1">Negombo</div>
              </div>
            </Link>
            <p className="leading-relaxed mb-6 text-sm">
              Negombo's trusted source for farm-fresh organic fruits, vegetables, dairy, and grocery essentials. Supplying Keells, Food City, and homes across Negombo since 2010.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-green-600 flex items-center justify-center transition text-white"
                title="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-blue-600 flex items-center justify-center transition font-bold text-xs text-white" title="Facebook">
                FB
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-pink-600 flex items-center justify-center transition font-bold text-xs text-white" title="Instagram">
                IG
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white text-base mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Shop Fresh Produce', to: '/' },
                { label: 'My Orders', to: '/orders' },
                { label: 'About KBR Fresh Foods', to: '/about' },
                { label: 'Store Locations', to: '/stores' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Wholesale Accounts', to: '/register' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-brand-300 transition flex items-center gap-1.5 group">
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform text-brand-500" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white text-base mb-5">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-400 shrink-0 mt-0.5" />
                <span>No11, Mirigama Road,<br />Koppara Junction,<br />Negombo, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-brand-400 shrink-0" />
                <a href="tel:+94779779316" className="hover:text-white transition">+94 77 977 9316</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-brand-400 shrink-0" />
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">+94 77 977 9316 (WhatsApp)</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-brand-400 shrink-0" />
                <a href="mailto:info@kbrfreshfoods.lk" className="hover:text-white transition">info@kbrfreshfoods.lk</a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-brand-400 shrink-0 mt-0.5" />
                <span>Mon–Sat: 6:00 AM – 8:00 PM<br />Sunday: 7:00 AM – 5:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Wholesale / CTA */}
          <div>
            <h3 className="font-bold text-white text-base mb-5">For Businesses</h3>
            <p className="mb-4 text-sm leading-relaxed">
              We supply <strong className="text-white">Keells Super</strong>, <strong className="text-white">Food City</strong>, hotels, and restaurants with premium wholesale produce at competitive prices.
            </p>
            <Link
              to="/register"
              className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-full transition text-sm mb-4 shadow-lg shadow-brand-500/25"
            >
              Open Wholesale Account
            </Link>
            <div className="mt-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-400 hover:text-brand-300 transition text-sm font-semibold"
              >
                <MessageCircle size={15} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© {new Date().getFullYear()} KBR Fresh Foods (Pvt) Ltd. All rights reserved. Negombo, Sri Lanka.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

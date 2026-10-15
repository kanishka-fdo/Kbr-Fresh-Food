import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Bell, LogOut, Leaf, Phone, User, Menu, X, Heart, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useEffect, useState } from 'react';
import { notificationApi } from '../api/services';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    notificationApi
      .getAll()
      .then((res) => setUnread(res.data.unreadCount))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const roleHome = {
    admin: '/admin',
    staff: '/staff',
    driver: '/driver',
    wholesale: '/wholesale',
    customer: '/',
  };

  const isActive = (path) => location.pathname === path;

  const TopBar = () => (
    <div className="bg-brand-500 text-white py-2 px-4 hidden md:block text-xs font-medium tracking-wide">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          <span>🌿 Farm-fresh produce · Negombo, Sri Lanka · Free delivery on orders over Rs 2,000</span>
        </div>
        <div className="flex gap-6">
          <Link to="/stores" className="flex items-center gap-1.5 hover:text-brand-100 transition cursor-pointer">
            <MapPin size={12} /> Find a Store
          </Link>
          <span className="flex items-center gap-1.5 hover:text-brand-100 transition cursor-pointer">
            <Phone size={12} /> +94 77 977 9316
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <TopBar />
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-white py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">

          {/* Logo */}
          <Link to={user ? roleHome[user.role] : '/'} className="flex items-center gap-3 group">
            <div className="group-hover:scale-105 transition duration-300">
              <img 
                src="/kbr-logo.png" 
                alt="KBR Fresh Foods Logo" 
                className="h-14 w-auto object-contain py-1"
              />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900 tracking-tight leading-none block">KBR Fresh Foods</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-brand-600 block leading-none mt-1">Negombo</span>
            </div>
          </Link>

          {/* Desktop Nav Links (Centered) */}
          <div className="hidden md:flex items-center justify-center gap-8 flex-1">
            {(!user || user.role === 'customer') && (
              <>
                <Link to="/" className={`text-sm font-medium transition ${isActive('/') ? 'text-brand-500' : 'text-gray-700 hover:text-brand-500'}`}>
                  Home
                </Link>
                <Link to="/products" className={`text-sm font-semibold transition px-3 py-1.5 rounded-full border ${isActive('/products') ? 'bg-brand-500 text-white border-brand-500' : 'text-brand-600 border-brand-200 bg-brand-50 hover:bg-brand-500 hover:text-white hover:border-brand-500'}`}>
                  🛒 Products
                </Link>
                <Link to="/about" className={`text-sm font-medium transition ${isActive('/about') ? 'text-brand-500' : 'text-gray-700 hover:text-brand-500'}`}>
                  About
                </Link>
                <Link to="/stores" className={`text-sm font-medium transition flex items-center gap-1 ${isActive('/stores') ? 'text-brand-500' : 'text-gray-700 hover:text-brand-500'}`}>
                  <MapPin size={13} /> Stores
                </Link>
                <Link to="/contact" className={`text-sm font-medium transition ${isActive('/contact') ? 'text-brand-500' : 'text-gray-700 hover:text-brand-500'}`}>
                  Contact
                </Link>

                {user && (
                  <Link to="/orders" className={`text-sm font-medium transition ${isActive('/orders') ? 'text-brand-500' : 'text-gray-700 hover:text-brand-500'}`}>
                    My Orders
                  </Link>
                )}
              </>
            )}

            {user?.role === 'wholesale' && (
              <>
                <Link to="/wholesale" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition">Bulk Order</Link>
                <Link to="/wholesale/orders" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition">My Orders</Link>
              </>
            )}

            {user?.role === 'staff' && (
              <>
                <Link to="/staff" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition">Orders</Link>
                <Link to="/staff/inventory" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition">Inventory</Link>
                <Link to="/staff/wholesale" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition">Wholesale</Link>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition">Dashboard</Link>
                <Link to="/admin/users" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition">Users</Link>
                <Link to="/staff" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition">Orders</Link>
                <Link to="/staff/inventory" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition">Inventory</Link>
              </>
            )}

            {user?.role === 'driver' && (
              <Link to="/driver" className="text-sm font-medium text-gray-700 hover:text-brand-500 transition">My Deliveries</Link>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <Link to="/notifications" className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-brand-500 hover:border-brand-400 transition">
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border-2 border-white shadow-sm">
                    {unread}
                  </span>
                )}
              </Link>
            )}

            <Link to={user ? '/profile' : '/login'} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-brand-500 hover:border-brand-400 transition">
              {user ? (
                <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              ) : (
                <User size={18} />
              )}
            </Link>

            {(!user || user.role === 'customer') && (
              <Link to="/wishlist" className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-500 hover:border-red-300 transition">
                <Heart size={18} />
                {wishCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border-2 border-white shadow-sm">
                    {wishCount}
                  </span>
                )}
              </Link>
            )}

            {(!user || user.role === 'customer') && (
              <Link to="/cart" className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-brand-500 hover:border-brand-400 transition">
                <ShoppingCart size={18} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border-2 border-white shadow-sm">
                    {count}
                  </span>
                )}
              </Link>
            )}

            {user && (
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="ml-1 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-500 transition"
              >
                <LogOut size={16} />
              </button>
            )}

            {!user && (
              <Link to="/login" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2 rounded-full text-sm transition">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            {(!user || user.role === 'customer') && (
              <Link to="/cart" className="relative text-gray-700">
                <ShoppingCart size={22} />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 bg-gray-50 p-2 rounded-xl"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl py-4 px-4 flex flex-col gap-3 animate-fade-in-up z-50">
            {(!user || user.role === 'customer') && (
              <>
                <Link to="/" className="text-gray-800 font-medium py-2 border-b border-gray-50">🏠 Home</Link>
                <Link to="/products" className="text-brand-600 font-bold py-2 border-b border-gray-50 bg-brand-50 px-3 rounded-xl">🛒 All Products</Link>
                <Link to="/about" className="text-gray-800 font-medium py-2 border-b border-gray-50">🌿 About Us</Link>
                <Link to="/stores" className="text-gray-800 font-medium py-2 border-b border-gray-50">📍 Find a Store</Link>
                <Link to="/contact" className="text-gray-800 font-medium py-2 border-b border-gray-50">📩 Contact</Link>

                <Link to="/wishlist" className="flex items-center gap-2 text-gray-800 font-medium py-2 border-b border-gray-50"><Heart size={16} className="text-red-500" /> Wishlist {wishCount > 0 && `(${wishCount})`}</Link>
                {user && <Link to="/orders" className="text-gray-800 font-medium py-2 border-b border-gray-50">📦 My Orders</Link>}
                {user && <Link to="/profile" className="text-gray-800 font-medium py-2 border-b border-gray-50">👤 Profile</Link>}
                {user && <Link to="/notifications" className="text-gray-800 font-medium py-2 border-b border-gray-50">🔔 Notifications {unread > 0 && `(${unread})`}</Link>}
              </>
            )}
            {user?.role === 'staff' && (
              <>
                <Link to="/staff" className="text-gray-800 font-medium py-2 border-b border-gray-50">Orders</Link>
                <Link to="/staff/inventory" className="text-gray-800 font-medium py-2 border-b border-gray-50">Inventory</Link>
                <Link to="/staff/wholesale" className="text-gray-800 font-medium py-2 border-b border-gray-50">Wholesale</Link>
                <Link to="/profile" className="text-gray-800 font-medium py-2 border-b border-gray-50">👤 Profile</Link>
                <Link to="/notifications" className="text-gray-800 font-medium py-2 border-b border-gray-50">🔔 Notifications {unread > 0 && `(${unread})`}</Link>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="text-gray-800 font-medium py-2 border-b border-gray-50">Dashboard</Link>
                <Link to="/admin/users" className="text-gray-800 font-medium py-2 border-b border-gray-50">Users</Link>
                <Link to="/staff" className="text-gray-800 font-medium py-2 border-b border-gray-50">Orders</Link>
                <Link to="/staff/inventory" className="text-gray-800 font-medium py-2 border-b border-gray-50">Inventory</Link>
                <Link to="/profile" className="text-gray-800 font-medium py-2 border-b border-gray-50">👤 Profile</Link>
                <Link to="/notifications" className="text-gray-800 font-medium py-2 border-b border-gray-50">🔔 Notifications {unread > 0 && `(${unread})`}</Link>
              </>
            )}
            {user?.role === 'driver' && (
              <>
                <Link to="/driver" className="text-gray-800 font-medium py-2 border-b border-gray-50">My Deliveries</Link>
                <Link to="/profile" className="text-gray-800 font-medium py-2 border-b border-gray-50">👤 Profile</Link>
                <Link to="/notifications" className="text-gray-800 font-medium py-2 border-b border-gray-50">🔔 Notifications {unread > 0 && `(${unread})`}</Link>
              </>
            )}
            {user?.role === 'wholesale' && (
              <>
                <Link to="/wholesale" className="text-gray-800 font-medium py-2 border-b border-gray-50">Bulk Order</Link>
                <Link to="/wholesale/orders" className="text-gray-800 font-medium py-2 border-b border-gray-50">My Orders</Link>
                <Link to="/profile" className="text-gray-800 font-medium py-2 border-b border-gray-50">👤 Profile</Link>
                <Link to="/notifications" className="text-gray-800 font-medium py-2 border-b border-gray-50">🔔 Notifications {unread > 0 && `(${unread})`}</Link>
              </>
            )}

            <div className="pt-2">
              {user ? (
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="flex items-center gap-2 text-red-500 font-semibold"
                >
                  <LogOut size={18} /> Logout
                </button>
              ) : (
                <Link to="/login" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-full w-full text-center block transition">
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

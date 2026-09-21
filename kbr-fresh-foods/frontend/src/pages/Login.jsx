import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/services';
import { Leaf, ArrowRight, Eye, EyeOff, MessageCircle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roleHome = { admin: '/admin', staff: '/staff', driver: '/driver', wholesale: '/wholesale', customer: '/' };

  // Redirect already-logged-in users to their role-appropriate dashboard
  useEffect(() => {
    if (user) {
      navigate(roleHome[user.role] || '/', { replace: true });
    }
  }, [user]);

  // Client-side validation
  const validate = () => {
    if (!form.email.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
    if (!form.password) return 'Password is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setUnverifiedEmail('');
    setResendMsg('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleHome[user.role] || '/');
    } catch (err) {
      if (err.response?.data?.unverified) {
        setUnverifiedEmail(err.response.data.email || form.email);
      }
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail || resendLoading) return;
    setResendLoading(true);
    setResendMsg('');
    try {
      await authApi.resendVerification(unverifiedEmail);
      setResendMsg('Verification link sent! Check your inbox.');
    } catch (err) {
      setResendMsg('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex w-1/2 bg-brand-50 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_banner.png"
            alt="Organic food"
            className="w-full h-full object-cover opacity-80 mix-blend-multiply"
          />
        </div>
        <div className="relative z-10 max-w-lg p-12 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 text-center m-8 shadow-xl">
          {/* Logo Section */}
          <div className="flex justify-center mb-6 relative">
            <div className="absolute inset-0 bg-brand-500/10 blur-xl rounded-full"></div>
            <div className="bg-[#f9f9f6] p-3 rounded-[2rem] shadow-xl relative z-10 transform hover:scale-105 transition-transform duration-300">
              <img src="/kbr-logo.png" alt="KBR Fresh Foods" className="w-24 h-auto object-contain" />
            </div>
          </div>
          <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">Welcome back to fresh.</h2>
          <p className="text-gray-700 text-lg">
            Sign in to access your farm-fresh deliveries, track your orders, and manage your organic lifestyle.
          </p>
          {/* Trust badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-brand-700 font-semibold">
            <ShieldCheck size={16} className="text-brand-600" />
            Secured with JWT Authentication
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden flex flex-col items-center gap-2 justify-center mb-8">
            <div className="bg-[#f9f9f6] p-2 rounded-xl">
              <img src="/kbr-logo.png" alt="KBR Fresh Foods" className="h-12 w-auto object-contain" />
            </div>
            <h1 className="text-xl font-display font-bold text-gray-900 mt-2">KBR Fresh</h1>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Sign in</h1>
            <p className="text-gray-500">Enter your details to access your account.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 mb-6 border border-red-100 flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5"></span>
                <span>{error}</span>
              </div>
              
              {unverifiedEmail && (
                <div className="pl-3.5 mt-1 border-t border-red-100/50 pt-3">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-50 transition"
                  >
                    <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                    {resendLoading ? 'Sending...' : 'Resend verification email'}
                  </button>
                  {resendMsg && (
                    <p className={`mt-2 text-xs font-medium ${resendMsg.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>
                      {resendMsg}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email address</label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-brand-600 font-medium hover:text-brand-700 transition">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold py-3.5 rounded-xl transition shadow-glow flex items-center justify-center gap-2 mt-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Sign in <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* Support contact */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="bg-green-50 rounded-2xl p-4 flex items-start gap-3">
              <MessageCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Need help signing in?</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Contact KBR Fresh Foods support via WhatsApp:{' '}
                  <a
                    href="https://wa.me/94779779316?text=Hi%20KBR%20Fresh%20Foods%2C%20I%20need%20help%20with%20my%20account."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 font-bold hover:underline"
                  >
                    +94 77 977 9316
                  </a>
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-bold hover:text-brand-700 transition">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

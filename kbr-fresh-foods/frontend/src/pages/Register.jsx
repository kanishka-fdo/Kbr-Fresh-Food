import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/services';
import { Leaf, ArrowRight, CheckCircle2, Eye, EyeOff, Phone, ShieldCheck, Mail, RefreshCw } from 'lucide-react';

// Sri Lanka phone number validator
function isValidSLPhone(phone) {
  if (!phone) return true; // optional field
  const cleaned = phone.replace(/[\s\-().]/g, '');
  // Accept: +94XXXXXXXXX, 0XXXXXXXXX, 94XXXXXXXXX (9 digits after prefix)
  return /^(\+94|94|0)[0-9]{9}$/.test(cleaned);
}

// Password strength
function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-400' };
  if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-yellow-400' };
  if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-400' };
  return { level: 4, label: 'Strong', color: 'bg-green-500' };
}

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const roleHome = { admin: '/admin', staff: '/staff', driver: '/driver', wholesale: '/wholesale', customer: '/' };

  // Redirect already-logged-in users to their role-appropriate dashboard
  useEffect(() => {
    if (user) {
      navigate(roleHome[user.role] || '/', { replace: true });
    }
  }, [user]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
    businessName: '',
    businessRegNo: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required.';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    if (form.phone && !isValidSLPhone(form.phone)) {
      newErrors.phone = 'Enter a valid Sri Lanka number (e.g. +94 77 977 9316 or 077 977 9316).';
    }
    if (form.role === 'wholesale' && !form.businessName.trim()) {
      newErrors.businessName = 'Business name is required for wholesale accounts.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      const res = await register(submitData);
      setRegisteredEmail(res?.data?.email || form.email);
      setSuccess(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendMsg('');
    try {
      await authApi.resendVerification(registeredEmail);
      setResendMsg('A new verification link has been sent! Check your inbox.');
      setResendCooldown(60); // 60s cooldown
    } catch {
      setResendMsg('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const field = (key, value) => setForm({ ...form, [key]: value });
  const fieldError = (key) => errors[key] ? (
    <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
  ) : null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-green-50 px-4">
        <div className="bg-white shadow-2xl shadow-green-100 rounded-[2rem] p-10 w-full max-w-md text-center animate-fade-in-up">

          {/* Email Icon */}
          <div className="relative flex justify-center mb-6">
            <div className="absolute inset-0 bg-brand-200/30 blur-2xl rounded-full"></div>
            <div className="relative bg-brand-600 p-5 rounded-2xl shadow-xl shadow-brand-500/30">
              <Mail size={36} className="text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Check your inbox! 📬</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            We've sent a verification link to:
          </p>

          {/* Email badge */}
          <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 mb-6 inline-flex items-center gap-2">
            <Mail size={16} className="text-brand-600 flex-shrink-0" />
            <span className="font-semibold text-brand-800 text-sm break-all">{registeredEmail}</span>
          </div>

          <p className="text-gray-500 text-sm mb-8">
            Click the link in the email to activate your account. 
            <br />Don't see it? Check your <strong>spam or junk folder</strong>.
          </p>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || resendLoading}
            className="w-full flex items-center justify-center gap-2 border-2 border-brand-200 text-brand-700 font-semibold py-3 px-6 rounded-full mb-4 hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <RefreshCw size={16} className={resendLoading ? 'animate-spin' : ''} />
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : resendLoading
              ? 'Sending...'
              : 'Resend verification email'}
          </button>

          {resendMsg && (
            <p className={`text-sm mb-4 font-medium ${
              resendMsg.includes('sent') ? 'text-green-600' : 'text-red-500'
            }`}>{resendMsg}</p>
          )}

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-600 transition"
          >
            Already verified? Sign in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex w-1/2 bg-brand-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_banner.png"
            alt="Organic food"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
        </div>
        <div className="relative z-10 max-w-lg p-12 text-center text-white">
          <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/20">
            <Leaf size={40} className="text-brand-300" />
          </div>
          <h2 className="text-5xl font-display font-bold mb-6 leading-tight">Join the organic revolution.</h2>
          <p className="text-brand-100 text-lg leading-relaxed">
            Create an account to get farm-fresh produce delivered to your doorstep, or register your business for wholesale pricing.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-brand-200 font-semibold">
            <ShieldCheck size={16} className="text-brand-300" />
            Your data is encrypted & secure
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8 animate-fade-in-up">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="bg-brand-600 p-2 rounded-xl">
              <Leaf className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900">KBR Fresh</h1>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Create account</h1>
            <p className="text-gray-500">Join us to start shopping organic.</p>
          </div>

          {serverError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 mb-6 border border-red-100 flex items-center gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-600"></span>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Account type */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => field('role', 'customer')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                  form.role === 'customer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => field('role', 'wholesale')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                  form.role === 'wholesale' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Business / Wholesale
              </button>
            </div>

            {/* Full name */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full name <span className="text-red-500">*</span></label>
              <input
                id="reg-name"
                required
                value={form.name}
                onChange={(e) => field('name', e.target.value)}
                placeholder="e.g. Kanishka Perera"
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
              />
              {fieldError('name')}
            </div>

            {/* Wholesale fields */}
            {form.role === 'wholesale' && (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Business name <span className="text-red-500">*</span></label>
                  <input
                    required
                    value={form.businessName}
                    onChange={(e) => field('businessName', e.target.value)}
                    placeholder="e.g. Keells Super - Negombo"
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition ${errors.businessName ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {fieldError('businessName')}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Business registration no.</label>
                  <input
                    value={form.businessRegNo}
                    onChange={(e) => field('businessRegNo', e.target.value)}
                    placeholder="e.g. PV 123456"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email address <span className="text-red-500">*</span></label>
              <input
                id="reg-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => field('email', e.target.value)}
                placeholder="you@example.com"
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
              />
              {fieldError('email')}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                <span className="flex items-center gap-1"><Phone size={13} /> Phone number (optional)</span>
              </label>
              <input
                id="reg-phone"
                value={form.phone}
                onChange={(e) => field('phone', e.target.value.replace(/[^0-9+\s-]/g, ''))}
                placeholder="+94 77 977 9316 or 077 977 9316"
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
              />
              {fieldError('phone')}
              {!errors.phone && form.phone && isValidSLPhone(form.phone) && (
                <p className="text-green-500 text-xs mt-1 flex items-center gap-1"><CheckCircle2 size={12} /> Valid Sri Lanka number</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => field('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition ${errors.password ? 'border-red-300' : 'border-gray-200'}`}
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
              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.level ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.level === 1 ? 'text-red-500' :
                    strength.level === 2 ? 'text-yellow-600' :
                    strength.level === 3 ? 'text-blue-600' : 'text-green-600'
                  }`}>{strength.label} password</p>
                </div>
              )}
              {fieldError('password')}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Confirm password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  id="reg-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => field('confirmPassword', e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldError('confirmPassword')}
              {!errors.confirmPassword && form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-green-500 text-xs mt-1 flex items-center gap-1"><CheckCircle2 size={12} /> Passwords match</p>
              )}
            </div>

            <button
              id="reg-submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold py-3.5 rounded-xl transition shadow-glow flex items-center justify-center gap-2 mt-6 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Create account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, userApi } from '../api/services';
import {
  MapPin, CreditCard, Banknote, QrCode, Plus, ArrowRight,
  CheckCircle, Shield, Phone, MessageCircle, Package, Lock,
  ChevronRight, AlertCircle, Mail, Truck, User, Building2,
  Eye, EyeOff, X, CheckCircle2, Clock
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────
const SHOP_LOCATION = { lat: 7.2083, lng: 79.8358 };
function calcDeliveryFee(lat, lng) {
  if (!lat || !lng) return 200;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat - SHOP_LOCATION.lat);
  const dLng = toRad(lng - SHOP_LOCATION.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(SHOP_LOCATION.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  const km = 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.max(150, Math.round(km * 40));
}

function detectCardType(num) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return null;
}

function luhnCheck(num) {
  const digits = num.replace(/\s/g, '').split('').map(Number);
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

const PRESET_LOCATIONS = [
  { label: 'Negombo Town Centre', lat: 7.2090, lng: 79.8397 },
  { label: 'Negombo Beach Road', lat: 7.2240, lng: 79.8396 },
  { label: 'Katunayake', lat: 7.1703, lng: 79.8867 },
  { label: 'Kochchikade', lat: 7.2583, lng: 79.8458 },
  { label: 'Wattala', lat: 6.9914, lng: 79.8834 },
  { label: 'Ja-Ela', lat: 7.0742, lng: 79.8914 },
  { label: 'Seeduwa', lat: 7.1464, lng: 79.8895 },
];

const STEPS = [
  { id: 1, label: 'Delivery', icon: <Truck size={16} /> },
  { id: 2, label: 'Payment', icon: <CreditCard size={16} /> },
  { id: 3, label: 'Review', icon: <CheckCircle2 size={16} /> },
];

// ─── CardBrandLogo ──────────────────────────────────────────────────────────
function CardBrandLogo({ brand }) {
  if (brand === 'visa') return (
    <span className="font-black italic text-blue-700 text-sm tracking-tight">VISA</span>
  );
  if (brand === 'mastercard') return (
    <div className="flex items-center">
      <div className="w-5 h-5 rounded-full bg-red-500 opacity-90" />
      <div className="w-5 h-5 rounded-full bg-yellow-400 opacity-90 -ml-2.5" />
    </div>
  );
  if (brand === 'amex') return (
    <span className="font-black text-blue-500 text-xs tracking-tight">AMEX</span>
  );
  return null;
}

// ─── FieldError ─────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1 font-medium">
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

// ─── StepIndicator ──────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
              ${currentStep > step.id ? 'bg-brand-600 text-white shadow-md' :
                currentStep === step.id ? 'bg-brand-600 text-white shadow-lg ring-4 ring-brand-100' :
                'bg-gray-100 text-gray-400'}`}>
              {currentStep > step.id ? <CheckCircle2 size={16} /> : step.icon}
            </div>
            <span className={`text-[11px] font-semibold mt-1.5 transition-colors ${
              currentStep >= step.id ? 'text-brand-700' : 'text-gray-400'
            }`}>{step.label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-4 transition-colors duration-500 ${
              currentStep > step.id ? 'bg-brand-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, removeItem } = useCart();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedProductIds = location.state?.selectedProductIds || items.map(i => i.product);
  const checkoutItems = items.filter(i => selectedProductIds.includes(i.product));
  const checkoutTotal = checkoutItems.reduce((sum, item) => sum + ((item.retailPrice || 0) * item.quantity), 0);

  // Steps
  const [step, setStep] = useState(1);

  // Address
  const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?._id || '');
  const [showNewAddress, setShowNewAddress] = useState(!user?.addresses?.length);
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', line2: '', city: 'Negombo', lat: '', lng: '' });
  const [selectedPreset, setSelectedPreset] = useState('');
  const [addrErrors, setAddrErrors] = useState({});

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [cardErrors, setCardErrors] = useState({});
  const [showCvc, setShowCvc] = useState(false);
  const [cardBrand, setCardBrand] = useState(null);
  const [show3DSecure, setShow3DSecure] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  // UI
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentAddress = showNewAddress
    ? { ...newAddress, lat: Number(newAddress.lat), lng: Number(newAddress.lng) }
    : user?.addresses?.find(a => a._id === selectedAddressId);
  const deliveryFee = calcDeliveryFee(currentAddress?.lat, currentAddress?.lng);
  const grandTotal = checkoutTotal + deliveryFee;

  // Resend OTP countdown
  useEffect(() => {
    if (otpResendTimer > 0) {
      const t = setTimeout(() => setOtpResendTimer(v => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpResendTimer]);

  // ── Card formatting ────────────────────────────────────────────────────────
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const fmt = raw.replace(/(.{4})/g, '$1 ').trim();
    setCardDetails(prev => ({ ...prev, number: fmt }));
    setCardBrand(detectCardType(raw));
    if (cardErrors.number) validateCardField('number', raw);
  };
  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    const fmt = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    setCardDetails(prev => ({ ...prev, expiry: fmt }));
    if (cardErrors.expiry) validateCardField('expiry', fmt);
  };

  // ── Per-field card validation ─────────────────────────────────────────────
  const validateCardField = (field, value) => {
    const v = value !== undefined ? value : cardDetails[field];
    let err = '';
    if (field === 'name') {
      if (!v.trim()) err = 'Cardholder name is required.';
      else if (v.trim().length < 3) err = 'Enter the full name as it appears on the card.';
      else if (!/^[a-zA-Z\s'-]+$/.test(v.trim())) err = 'Name should only contain letters.';
    }
    if (field === 'number') {
      const raw = v.replace(/\s/g, '');
      if (!raw) err = 'Card number is required.';
      else if (raw.length < 16) err = 'Please enter a 16-digit card number.';
    }
    if (field === 'expiry') {
      if (!v) err = 'Expiry date is required.';
      else if (!/^\d{2}\/\d{2}$/.test(v)) err = 'Use MM/YY format.';
      else {
        const [mm, yy] = v.split('/').map(Number);
        const now = new Date();
        const expYear = 2000 + yy;
        const expMonth = mm;
        if (mm < 1 || mm > 12) err = 'Invalid month.';
        else if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1))
          err = 'This card has expired.';
      }
    }
    if (field === 'cvc') {
      if (!v) err = 'CVV is required.';
      else if (v.length < 3) err = 'CVV must be 3–4 digits.';
    }
    setCardErrors(prev => ({ ...prev, [field]: err }));
    return !err;
  };

  const validateAllCard = () => {
    const fields = ['name', 'number', 'expiry', 'cvc'];
    let valid = true;
    fields.forEach(f => { if (!validateCardField(f)) valid = false; });
    return valid;
  };

  // ── Address validation ────────────────────────────────────────────────────
  const validateAddress = () => {
    const errs = {};
    if (!newAddress.line1.trim()) errs.line1 = 'Street address is required.';
    if (!newAddress.city.trim()) errs.city = 'City is required.';
    if (!newAddress.lat || !newAddress.lng) errs.area = 'Please select your area from the quick pick list.';
    setAddrErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePresetPick = (preset) => {
    setSelectedPreset(preset.label);
    setNewAddress(prev => ({ ...prev, city: preset.label, lat: String(preset.lat), lng: String(preset.lng) }));
    setAddrErrors(prev => ({ ...prev, area: '' }));
  };

  const handleAddAddress = async () => {
    if (!validateAddress()) return;
    try {
      const res = await userApi.addAddress({ ...newAddress, lat: Number(newAddress.lat), lng: Number(newAddress.lng) });
      setUser({ ...user, addresses: res.data.addresses });
      setShowNewAddress(false);
      setSelectedAddressId(res.data.addresses[res.data.addresses.length - 1]._id);
      setAddrErrors({});
    } catch (err) {
      setAddrErrors({ general: 'Failed to save address. Please try again.' });
    }
  };

  const handleContinueToPayment = () => {
    if (!currentAddress) { setError('Please select or add a delivery address.'); return; }
    if (!currentAddress.lat || !currentAddress.lng) { setError('Please select a valid delivery location.'); return; }
    setError('');
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleContinueToReview = () => {
    if (paymentMethod === 'card') {
      if (!validateAllCard()) return;
    }
    setError('');
    setStep(3);
    window.scrollTo(0, 0);
  };

  const sendOtp = async () => {
    setLoading(true);
    try {
      await orderApi.requestPaymentOtp(grandTotal);
      setShow3DSecure(true);
      setOtpResendTimer(60);
      setOtpInput('');
      setOtpError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    if (!checkoutItems.length) { setError('Your cart is empty.'); return; }
    if (paymentMethod === 'card') {
      await sendOtp();
      return;
    }
    await processOrderSubmission();
  };

  const processOrderSubmission = async () => {
    setLoading(true);
    setOtpError('');
    try {
      const res = await orderApi.create({
        items: checkoutItems.map(i => ({ product: i.product, quantity: i.quantity })),
        deliveryAddress: currentAddress,
        paymentMethod,
        paymentOtp: paymentMethod === 'card' ? otpInput : undefined,
        cardInfo: paymentMethod === 'card' ? { last4: cardDetails.number.slice(-4), holder: cardDetails.name } : undefined,
      });
      checkoutItems.forEach(i => removeItem(i.product));
      setShow3DSecure(false);
      navigate(`/orders/${res.data.order._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment verification failed.';
      if (paymentMethod === 'card') {
        setOtpError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (!checkoutItems.length) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto py-24 text-center px-4">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some fresh products before checking out.</p>
          <button onClick={() => navigate('/')} className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3 rounded-full transition shadow-lg">
            Continue Shopping
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* ── Page Header ── */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1 text-sm">Secure, fast, and easy — complete your order below</p>
        </div>

        {/* ── Step Indicator ── */}
        <StepIndicator currentStep={step} />

        <div className="grid lg:grid-cols-12 gap-8">
          {/* ───── LEFT: Main Content ───── */}
          <div className="lg:col-span-7 space-y-6">

            {/* ══════ STEP 1: DELIVERY ADDRESS ══════ */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Section header */}
                <div className="bg-gradient-to-r from-brand-50 to-white px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Delivery Address</h2>
                    <p className="text-xs text-gray-500 mt-0.5">We deliver across Negombo &amp; nearby areas</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Saved addresses */}
                  {user?.addresses?.length > 0 && !showNewAddress && (
                    <div className="space-y-3 mb-5">
                      {user.addresses.map(a => (
                        <label
                          key={a._id}
                          className={`flex items-start gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedAddressId === a._id
                              ? 'border-brand-500 bg-brand-50 shadow-sm'
                              : 'border-gray-100 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            checked={selectedAddressId === a._id}
                            onChange={() => setSelectedAddressId(a._id)}
                            className="mt-1 shrink-0 accent-brand-600 w-4 h-4"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold uppercase tracking-wide text-brand-700 bg-brand-100 px-2 py-0.5 rounded">{a.label}</span>
                              {a.isDefault && <span className="text-[10px] text-gray-400 font-medium">Default</span>}
                            </div>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                            <p className="text-xs text-gray-500">{a.city}</p>
                            {a.lat && a.lng && (
                              <p className="text-xs text-brand-600 mt-1.5 font-semibold flex items-center gap-1">
                                <Truck size={11} /> Delivery fee: Rs. {calcDeliveryFee(a.lat, a.lng).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                      <button
                        onClick={() => setShowNewAddress(true)}
                        className="flex items-center gap-2 text-sm text-brand-600 font-semibold hover:text-brand-700 transition mt-1 px-1"
                      >
                        <Plus size={15} /> Add a new address
                      </button>
                    </div>
                  )}

                  {/* New address form */}
                  {showNewAddress && (
                    <div className="space-y-4">
                      {/* Area quick-pick */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                          📍 Select Your Area <span className="text-red-400">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_LOCATIONS.map(p => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => handlePresetPick(p)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                selectedPreset === p.label
                                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600'
                              }`}
                            >
                              {selectedPreset === p.label && <span className="mr-1">✓</span>}
                              {p.label}
                            </button>
                          ))}
                        </div>
                        <FieldError msg={addrErrors.area} />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Address Label */}
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1.5">
                            Address Label
                          </label>
                          <div className="relative">
                            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              placeholder="Home, Office, Other…"
                              value={newAddress.label}
                              onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                            />
                          </div>
                        </div>
                        {/* City */}
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1.5">
                            City / Area <span className="text-red-400">*</span>
                          </label>
                          <input
                            placeholder="e.g. Negombo"
                            value={newAddress.city}
                            onChange={e => { setNewAddress({ ...newAddress, city: e.target.value }); setAddrErrors(p => ({ ...p, city: '' })); }}
                            className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${addrErrors.city ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-brand-400'}`}
                          />
                          <FieldError msg={addrErrors.city} />
                        </div>
                      </div>

                      {/* Street */}
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1.5">
                          Street Address <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            placeholder="e.g. 45 Colombo Road"
                            value={newAddress.line1}
                            onChange={e => { setNewAddress({ ...newAddress, line1: e.target.value }); setAddrErrors(p => ({ ...p, line1: '' })); }}
                            className={`w-full bg-white border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${addrErrors.line1 ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-brand-400'}`}
                          />
                        </div>
                        <FieldError msg={addrErrors.line1} />
                      </div>

                      {/* Apt */}
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1.5">Apartment / Floor <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input
                          placeholder="e.g. Apt 3B, Floor 2"
                          value={newAddress.line2}
                          onChange={e => setNewAddress({ ...newAddress, line2: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
                        />
                      </div>

                      {/* Delivery fee preview */}
                      {newAddress.lat && newAddress.lng && (
                        <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-sm text-brand-800 font-semibold flex items-center gap-2">
                          <CheckCircle size={15} className="text-brand-600" />
                          Estimated delivery fee to <strong>{selectedPreset}</strong>: Rs. {calcDeliveryFee(Number(newAddress.lat), Number(newAddress.lng)).toLocaleString()}
                        </div>
                      )}

                      {addrErrors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                          {addrErrors.general}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={handleAddAddress} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm shadow-sm">
                          Save Address
                        </button>
                        {user?.addresses?.length > 0 && (
                          <button type="button" onClick={() => { setShowNewAddress(false); setAddrErrors({}); }} className="text-gray-600 font-semibold px-6 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Continue button */}
                  {error && <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mt-4"><AlertCircle size={14} /> {error}</div>}
                  {!showNewAddress && (
                    <button
                      onClick={handleContinueToPayment}
                      className="w-full mt-5 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 group shadow-sm"
                    >
                      Continue to Payment <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ══════ STEP 2: PAYMENT METHOD ══════ */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-brand-50 to-white px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Payment Method</h2>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Lock size={10} /> All transactions are secured &amp; encrypted</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Payment method selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                      { id: 'card', name: 'Card', icon: <CreditCard size={20} />, sub: 'Visa / MC / Amex' },
                      { id: 'qr', name: 'QR Pay', icon: <QrCode size={20} />, sub: 'LankaQR / Genie' },
                      { id: 'cod', name: 'Cash', icon: <Banknote size={20} />, sub: 'Pay on delivery' },
                      { id: 'bank_transfer', name: 'Bank', icon: <Building2 size={20} />, sub: 'Bank Transfer' },
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-xl border-2 transition-all text-center font-medium ${
                          paymentMethod === m.id
                            ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                            : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <div className={paymentMethod === m.id ? 'text-brand-600' : 'text-gray-400'}>{m.icon}</div>
                        <span className="text-xs font-bold">{m.name}</span>
                        <span className="text-[10px] text-gray-400 leading-tight">{m.sub}</span>
                      </button>
                    ))}
                  </div>

                  {/* ── Card Payment Form ── */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-5">
                      {/* Card visual mockup */}
                      <div className="relative h-44 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white overflow-hidden shadow-xl">
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
                        <div className="absolute -right-4 top-8 w-28 h-28 bg-white/5 rounded-full" />
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-8 h-6 bg-yellow-400 rounded-sm opacity-90" style={{background:'linear-gradient(135deg,#f6d365,#fda085)'}} />
                          <CardBrandLogo brand={cardBrand} />
                        </div>
                        <p className="font-mono text-lg tracking-[0.2em] text-white/90 mb-4">
                          {cardDetails.number || '•••• •••• •••• ••••'}
                        </p>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[9px] text-white/50 uppercase tracking-widest mb-0.5">Card Holder</p>
                            <p className="text-sm font-semibold uppercase tracking-wide">{cardDetails.name || 'YOUR NAME'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-white/50 uppercase tracking-widest mb-0.5">Expires</p>
                            <p className="text-sm font-semibold font-mono">{cardDetails.expiry || 'MM/YY'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Security badge */}
                      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 font-semibold">
                        <Lock size={12} /> Your card information is encrypted with 256-bit SSL
                      </div>

                      {/* Cardholder name */}
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Cardholder Name <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Name as it appears on card"
                            value={cardDetails.name}
                            onChange={e => { setCardDetails(p => ({ ...p, name: e.target.value })); if(cardErrors.name) validateCardField('name', e.target.value); }}
                            onBlur={e => validateCardField('name', e.target.value)}
                            className={`w-full bg-white border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${cardErrors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-brand-400'}`}
                          />
                        </div>
                        <FieldError msg={cardErrors.name} />
                      </div>

                      {/* Card number */}
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Card Number <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0000 0000 0000 0000"
                            value={cardDetails.number}
                            onChange={handleCardNumberChange}
                            onBlur={() => validateCardField('number')}
                            className={`w-full bg-white border rounded-xl pl-9 pr-16 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 transition ${cardErrors.number ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-brand-400'}`}
                          />
                          {cardBrand && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <CardBrandLogo brand={cardBrand} />
                            </div>
                          )}
                        </div>
                        <FieldError msg={cardErrors.number} />
                      </div>

                      {/* Expiry + CVC */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1.5">Expiry Date <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="MM / YY"
                            value={cardDetails.expiry}
                            onChange={handleExpiryChange}
                            onBlur={() => validateCardField('expiry')}
                            className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-center font-mono focus:outline-none focus:ring-2 transition ${cardErrors.expiry ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-brand-400'}`}
                          />
                          <FieldError msg={cardErrors.expiry} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1.5">CVV / CVC <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <input
                              type={showCvc ? 'text' : 'password'}
                              inputMode="numeric"
                              placeholder="•••"
                              maxLength={4}
                              value={cardDetails.cvc}
                              onChange={e => { const v = e.target.value.replace(/\D/g,''); setCardDetails(p => ({...p, cvc:v})); if(cardErrors.cvc) validateCardField('cvc', v); }}
                              onBlur={() => validateCardField('cvc')}
                              className={`w-full bg-white border rounded-xl px-4 pr-10 py-2.5 text-sm text-center font-mono focus:outline-none focus:ring-2 transition ${cardErrors.cvc ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-brand-400'}`}
                            />
                            <button type="button" onClick={() => setShowCvc(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showCvc ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <FieldError msg={cardErrors.cvc} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── QR Payment ── */}
                  {paymentMethod === 'qr' && (
                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">LankaQR / Mobile Banking</span>
                        <span className="text-xs text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded border border-brand-100">🇱🇰 LankaQR</span>
                      </div>
                      <p className="text-sm text-gray-600">Scan with any Sri Lankan banking app</p>
                      <div className="w-48 h-48 bg-white p-3 rounded-2xl border-2 border-brand-500 shadow-md mx-auto flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                            `LANKAQR:KBR_FRESH_FOODS_NEGOMBO|AMOUNT:${grandTotal}|LKR|REF:KBR-${Date.now().toString().slice(-6)}`
                          )}`}
                          alt="LankaQR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs font-mono text-gray-700">
                        Merchant: <strong>KBR FRESH FOODS (PVT) LTD</strong><br />
                        Amount: <strong className="text-brand-700">Rs. {grandTotal.toLocaleString()}</strong>
                      </div>
                    </div>
                  )}

                  {/* ── Cash on Delivery ── */}
                  {paymentMethod === 'cod' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <Banknote size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Cash on Delivery</h4>
                        <p className="text-sm text-gray-600">Pay <strong>Rs. {grandTotal.toLocaleString()}</strong> in cash when your order arrives. Please have the exact amount ready.</p>
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <Phone size={12} className="text-brand-600" /> Driver will call you before delivery
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Bank Transfer ── */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 space-y-3">
                      <h4 className="font-bold text-gray-900 text-sm">Bank Transfer Details</h4>
                      <p className="text-sm text-gray-600">Please transfer <strong>Rs. {grandTotal.toLocaleString()}</strong> to:</p>
                      <div className="bg-white rounded-xl border border-brand-100 p-4 text-sm space-y-2">
                        {[
                          ['Bank', 'Commercial Bank of Ceylon'],
                          ['Branch', 'Negombo'],
                          ['Account No', '1234 5678 9012'],
                          ['Account Name', 'KBR Fresh Foods (Pvt) Ltd'],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-gray-500">{label}</span>
                            <strong className="text-gray-900 font-semibold">{val}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
                        <MessageCircle size={14} />
                        Send receipt via WhatsApp to{' '}
                        <a href="https://wa.me/94779779316" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">+94 77 977 9316</a>
                      </div>
                    </div>
                  )}

                  {error && <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mt-4"><AlertCircle size={14} /> {error}</div>}

                  {/* Navigation buttons */}
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
                      ← Back
                    </button>
                    <button onClick={handleContinueToReview} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 group shadow-sm">
                      Review Order <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══════ STEP 3: REVIEW ══════ */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Delivery summary card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                      <MapPin size={15} className="text-brand-600" /> Delivering to
                    </div>
                    <button onClick={() => setStep(1)} className="text-xs text-brand-600 font-semibold hover:text-brand-700">Change</button>
                  </div>
                  {currentAddress && (
                    <div className="px-5 py-4 text-sm">
                      <p className="font-semibold text-gray-900">{currentAddress.line1}{currentAddress.line2 ? `, ${currentAddress.line2}` : ''}</p>
                      <p className="text-gray-500">{currentAddress.city}</p>
                    </div>
                  )}
                </div>

                {/* Payment summary card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                      <CreditCard size={15} className="text-brand-600" /> Payment
                    </div>
                    <button onClick={() => setStep(2)} className="text-xs text-brand-600 font-semibold hover:text-brand-700">Change</button>
                  </div>
                  <div className="px-5 py-4 text-sm">
                    {paymentMethod === 'card' && <p className="font-semibold text-gray-900">Card ending in {cardDetails.number.slice(-4)} · {cardDetails.name}</p>}
                    {paymentMethod === 'cod' && <p className="font-semibold text-gray-900">Cash on Delivery</p>}
                    {paymentMethod === 'qr' && <p className="font-semibold text-gray-900">QR / LankaQR</p>}
                    {paymentMethod === 'bank_transfer' && <p className="font-semibold text-gray-900">Bank Transfer</p>}
                    <p className="text-gray-400 text-xs mt-0.5">
                      {paymentMethod === 'card' ? '🔒 Secure card payment with OTP verification' : 'Your order will be confirmed immediately'}
                    </p>
                  </div>
                </div>

                {error && <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3"><AlertCircle size={14} /> {error}</div>}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 group shadow-md"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock size={15} />
                        {paymentMethod === 'card' ? 'Verify & Place Order' : 'Place Order'}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ───── RIGHT: Order Summary ───── */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-24 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-base">Order Summary</h2>
                <p className="text-xs text-gray-400 mt-0.5">{checkoutItems.length} item{checkoutItems.length !== 1 ? 's' : ''} in your cart</p>
              </div>

              {/* Items */}
              <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
                {checkoutItems.map(i => (
                  <div key={i.product} className="flex items-center gap-3">
                    {i.image ? (
                      <img src={i.image} alt={i.name} className="w-11 h-11 rounded-lg object-cover shrink-0 border border-gray-100" />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                        <Package size={16} className="text-brand-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{i.name}</p>
                      <p className="text-xs text-gray-400">Qty: {i.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0">Rs. {((i.retailPrice || 0) * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">Rs. {checkoutTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  {currentAddress?.lat ? (
                    <span className="font-semibold text-gray-900">Rs. {deliveryFee.toLocaleString()}</span>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Select address…</span>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-brand-600">Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                {[
                  { icon: <Lock size={13} />, text: 'Secure Checkout' },
                  { icon: <Shield size={13} />, text: 'Buyer Protection' },
                  { icon: <Truck size={13} />, text: 'Fast Delivery' },
                  { icon: <CheckCircle size={13} />, text: 'Quality Assured' },
                ].map(b => (
                  <div key={b.text} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <span className="text-brand-500">{b.icon}</span> {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ OTP Verification Modal ══════ */}
      {show3DSecure && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            {/* Close */}
            <button onClick={() => setShow3DSecure(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Mail size={28} className="text-brand-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-1">Email Verification</h3>
            <p className="text-gray-500 text-sm text-center mb-1">
              A 6-digit OTP was sent to
            </p>
            <p className="text-brand-700 font-semibold text-sm text-center mb-6">{user?.email}</p>

            {/* Card being charged */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5 border border-gray-200">
              <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
                <CreditCard size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Charging card</p>
                <p className="text-sm font-bold text-gray-900">•••• •••• •••• {cardDetails.number.slice(-4)}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-sm font-bold text-brand-700">Rs. {grandTotal.toLocaleString()}</p>
              </div>
            </div>

            {/* OTP input — individual boxes */}
            <div className="mb-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 text-center">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpInput}
                onChange={e => { setOtpInput(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                placeholder="_ _ _ _ _ _"
                className={`w-full text-center tracking-[0.5em] text-2xl font-bold py-3.5 bg-gray-50 border-2 rounded-2xl focus:outline-none transition ${otpError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-brand-500 focus:bg-white'}`}
                autoFocus
              />
              {otpError && <p className="text-red-500 text-xs text-center mt-2 font-medium flex items-center justify-center gap-1"><AlertCircle size={11} /> {otpError}</p>}
            </div>

            <div className="flex items-center justify-center mb-5">
              <Clock size={12} className="text-gray-400 mr-1" />
              <span className="text-xs text-gray-400">OTP valid for 10 minutes</span>
            </div>

            {/* Buttons */}
            <button
              onClick={processOrderSubmission}
              disabled={loading || otpInput.length < 6}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2 mb-3"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Lock size={14} /> Confirm & Pay Rs. {grandTotal.toLocaleString()}</>}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-gray-400">Didn't receive it?</span>
              {otpResendTimer > 0 ? (
                <span className="text-gray-400 font-medium">Resend in {otpResendTimer}s</span>
              ) : (
                <button onClick={sendOtp} disabled={loading} className="text-brand-600 font-semibold hover:text-brand-700 transition disabled:opacity-50">
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

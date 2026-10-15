import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { userApi, authApi } from '../api/services';
import {
  User, Phone, Mail, MapPin, Plus, Trash2, Save, Shield,
  Loader, CheckCircle, KeyRound, Lock, Eye, EyeOff, AlertCircle,
  Building2, Smartphone, Camera
} from 'lucide-react';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'addresses', label: 'Addresses', icon: MapPin },
  { key: 'security', label: 'Security', icon: Shield },
];

const ROLE_CONFIG = {
  customer: { label: 'Customer', color: 'bg-blue-100 text-blue-700', emoji: '👤' },
  staff: { label: 'Staff Member', color: 'bg-purple-100 text-purple-700', emoji: '🧑‍💼' },
  admin: { label: 'Administrator', color: 'bg-red-100 text-red-700', emoji: '🛡️' },
  driver: { label: 'Delivery Driver', color: 'bg-orange-100 text-orange-700', emoji: '🚗' },
  wholesale: { label: 'Wholesale Buyer', color: 'bg-green-100 text-green-700', emoji: '🏢' },
};

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');

  // Profile form
  const [form, setForm] = useState({ name: '', phone: '', businessName: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [newAddr, setNewAddr] = useState({ label: 'Home', line1: '', line2: '', city: 'Negombo', isDefault: false });
  const [addingAddr, setAddingAddr] = useState(false);

  // Email change
  const [emailStep, setEmailStep] = useState('idle'); // idle | input | otp | done
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Avatar
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setForm({ name: user.name || '', phone: user.phone || '', businessName: user.businessName || '' });
    setAddresses(user.addresses || []);
  }, [user, navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateProfile(form);
      if (refreshUser) await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddingAddr(true);
    try {
      const res = await userApi.addAddress(newAddr);
      setAddresses(res.data.addresses);
      setNewAddr({ label: 'Home', line1: '', line2: '', city: 'Negombo', isDefault: false });
    } catch (err) {
      console.error(err);
    } finally {
      setAddingAddr(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await userApi.deleteAddress(id);
      setAddresses(res.data.addresses);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert('Image is too large. Please select an image under 1MB.');
      return;
    }

    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await userApi.uploadAvatar(reader.result);
        if (refreshUser) await refreshUser();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to upload profile picture.');
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Email change
  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    setEmailErr(''); setEmailMsg('');
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return setEmailErr('Please enter a valid email address.');
    }
    setEmailLoading(true);
    try {
      const res = await userApi.requestEmailChange(newEmail);
      setEmailMsg(res.data.message);
      setEmailStep('otp');
    } catch (err) {
      setEmailErr(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleConfirmEmailChange = async (e) => {
    e.preventDefault();
    setEmailErr(''); setEmailMsg('');
    if (!otp || otp.length !== 6) return setEmailErr('Please enter the 6-digit OTP.');
    setEmailLoading(true);
    try {
      const res = await userApi.confirmEmailChange(otp);
      setEmailMsg('✅ Email changed successfully!');
      setEmailStep('done');
      if (refreshUser) await refreshUser();
    } catch (err) {
      setEmailErr(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwErr(''); setPwMsg('');
    if (!pwForm.current) return setPwErr('Current password is required.');
    if (pwForm.newPw.length < 6) return setPwErr('New password must be at least 6 characters.');
    if (pwForm.newPw !== pwForm.confirm) return setPwErr('Passwords do not match.');
    setPwLoading(true);
    try {
      await authApi.changePassword(pwForm.current, pwForm.newPw);
      setPwMsg('✅ Password changed successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      setPwErr(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const roleInfo = ROLE_CONFIG[user?.role] || ROLE_CONFIG.customer;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Profile Header Card */}
        <div className="relative bg-gradient-to-br from-brand-900 to-brand-700 rounded-3xl p-8 text-white mb-8 overflow-hidden">
          <div
            className="absolute inset-0 opacity-15"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=60)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/80 to-transparent" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="relative w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/20 shrink-0 overflow-hidden group">
              {avatarLoading ? (
                <Loader size={24} className="animate-spin text-white" />
              ) : user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || '?'
              )}
              
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera size={20} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarLoading} />
              </label>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">{user?.name}</h1>
              <p className="text-brand-200 text-sm flex items-center gap-1.5 mt-0.5">
                <Mail size={13} /> {user?.email}
              </p>
              {user?.phone && (
                <p className="text-brand-200 text-sm flex items-center gap-1.5 mt-0.5">
                  <Smartphone size={13} /> {user.phone}
                </p>
              )}
              <span className={`inline-flex items-center gap-1 mt-2 text-xs font-bold px-3 py-1 rounded-full ${roleInfo.color}`}>
                {roleInfo.emoji} {roleInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-gray-100 rounded-2xl p-1.5 mb-8">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === key ? 'bg-white text-brand-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === 'profile' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-fade-in">
            <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition bg-gray-50 focus:bg-white"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9+\s-]/g, '') })}
                  placeholder="+94 77 000 0000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition bg-gray-50 focus:bg-white"
                />
              </div>

              {user?.role === 'wholesale' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
                  <input
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    placeholder="e.g. Keells Super - Negombo"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition bg-gray-50 focus:bg-white"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-semibold text-sm transition-all shadow-sm ${
                  saved ? 'bg-green-500 text-white' : 'bg-brand-700 hover:bg-brand-800 text-white'
                }`}
              >
                {saving ? <Loader size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            </form>

            {/* Account info */}
            <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Role</p>
                <p className="font-bold text-gray-800">{roleInfo.emoji} {roleInfo.label}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Status</p>
                <p className="font-bold text-green-700 flex items-center gap-1.5">
                  <CheckCircle size={14} /> Verified
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Addresses Tab ── */}
        {tab === 'addresses' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-fade-in">
            <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Delivery Addresses</h2>

            {/* Saved addresses */}
            <div className="space-y-3 mb-8">
              {addresses.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-10 text-center">
                  <MapPin size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No saved addresses yet</p>
                  <p className="text-gray-400 text-sm mt-1">Add your first delivery address below.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`flex items-start justify-between gap-4 p-5 rounded-2xl border transition-all ${
                      addr.isDefault ? 'border-brand-300 bg-brand-50 ring-1 ring-brand-100' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'}`}>
                        <MapPin size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-600">{addr.label}</span>
                          {addr.isDefault && <span className="text-[10px] font-bold bg-brand-600 text-white px-2 py-0.5 rounded-full">DEFAULT</span>}
                        </div>
                        <p className="text-sm text-gray-800">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                        <p className="text-sm text-gray-500">{addr.city}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAddress(addr._id)} className="text-gray-300 hover:text-red-500 transition shrink-0 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add new address */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Plus size={16} /> Add New Address</h3>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Label</label>
                    <select
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                    >
                      {['Home', 'Work', 'Other'].map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                    <input
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Street Address *</label>
                  <input
                    required
                    value={newAddr.line1}
                    onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                    placeholder="45 Colombo Road, Negombo"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Apartment / Floor (optional)</label>
                  <input
                    value={newAddr.line2}
                    onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })}
                    placeholder="Apt 2B, 3rd Floor..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAddr.isDefault}
                    onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    className="rounded accent-brand-600"
                  />
                  <span className="text-sm text-gray-600">Set as default delivery address</span>
                </label>
                <button
                  type="submit"
                  disabled={addingAddr}
                  className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition disabled:opacity-60"
                >
                  {addingAddr ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
                  Add Address
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Security Tab ── */}
        {tab === 'security' && (
          <div className="space-y-6 animate-fade-in">
            {/* Change Email */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-900">Change Email</h2>
                  <p className="text-gray-500 text-sm">Current: <span className="font-semibold text-gray-700">{user?.email}</span></p>
                </div>
              </div>

              {emailStep === 'done' ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 font-medium text-sm flex items-center gap-2">
                  <CheckCircle size={18} /> {emailMsg}
                </div>
              ) : emailStep === 'otp' ? (
                <form onSubmit={handleConfirmEmailChange} className="space-y-4">
                  <p className="text-sm text-gray-600 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    📧 We sent a 6-digit OTP to <strong>{newEmail}</strong>. Enter it below to confirm the change.
                  </p>
                  {emailMsg && <p className="text-green-700 text-sm">{emailMsg}</p>}
                  {emailErr && <p className="text-red-600 text-sm flex items-center gap-1"><AlertCircle size={14} />{emailErr}</p>}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">6-Digit OTP</label>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={emailLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
                    >
                      {emailLoading ? <Loader size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                      Confirm Change
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmailStep('input'); setEmailErr(''); setEmailMsg(''); }}
                      className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm font-semibold"
                    >
                      Go Back
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRequestEmailChange} className="space-y-4">
                  {emailErr && <p className="text-red-600 text-sm flex items-center gap-1"><AlertCircle size={14} />{emailErr}</p>}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Email Address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="your.newemail@example.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-60 text-sm"
                  >
                    {emailLoading ? <Loader size={15} className="animate-spin" /> : <Mail size={15} />}
                    Send OTP to New Email
                  </button>
                </form>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-900">Change Password</h2>
                  <p className="text-gray-500 text-sm">Keep your account secure with a strong password</p>
                </div>
              </div>

              {pwMsg && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-green-700 text-sm font-medium flex items-center gap-2">
                  <CheckCircle size={16} /> {pwMsg}
                </div>
              )}
              {pwErr && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {pwErr}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { key: 'current', label: 'Current Password', placeholder: 'Your current password' },
                  { key: 'newPw', label: 'New Password', placeholder: 'Min. 6 characters' },
                  { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <input
                        type={showPw[key] ? 'text' : 'password'}
                        value={pwForm[key]}
                        onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-gray-50 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw({ ...showPw, [key]: !showPw[key] })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-7 py-3 rounded-2xl transition disabled:opacity-60 shadow-sm text-sm"
                >
                  {pwLoading ? <Loader size={15} className="animate-spin" /> : <Lock size={15} />}
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Danger zone */}
            <div className="bg-red-50 border border-red-100 rounded-3xl p-8">
              <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2"><AlertCircle size={16} /> Danger Zone</h3>
              <p className="text-red-600 text-sm mb-4">Signing out will clear your session. You will need to log in again.</p>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

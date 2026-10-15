import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '../api/services';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    authApi
      .verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-green-50 px-4 py-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

      <div className="bg-white shadow-2xl shadow-green-100 rounded-[2.5rem] p-10 w-full max-w-md text-center relative z-10">

        {/* KBR Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#f9f9f6] p-2 rounded-xl inline-block">
            <img src="/kbr-logo.png" alt="KBR Fresh Foods" className="h-16 w-auto object-contain" />
          </div>
        </div>

        {status === 'loading' && (
          <div className="py-8">
            <Loader2 size={48} className="text-brand-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Verifying your email…</h2>
            <p className="text-gray-500">Please wait a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Email Verified! ✅</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {message}
              <br /><br />
              Welcome to <strong>KBR Fresh Foods</strong> — Negombo's freshest produce, delivered to your door. 🌿
            </p>
            <Link
              to="/login"
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-8 rounded-full transition shadow-lg shadow-brand-500/30"
            >
              Sign in to your account →
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Verification Failed</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">{message}</p>
            <p className="text-sm text-gray-400 mb-8">
              The link may have expired (24 hours) or already been used.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/register"
                className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-8 rounded-full transition"
              >
                Register again
              </Link>
              <Link to="/login" className="text-sm text-gray-400 hover:text-brand-600 transition">
                Already verified? Sign in →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/services';
import { Leaf, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-200 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

      <div className="bg-white shadow-xl shadow-gray-200/50 rounded-[2.5rem] p-10 w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="bg-brand-600 p-2.5 rounded-xl shadow-sm">
            <Leaf className="text-white" size={24} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Set new password</h1>
          <p className="text-gray-500">Please choose a secure password for your account.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 mb-6 border border-red-100 flex items-center gap-2">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-600"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">New password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold py-3.5 rounded-xl transition shadow-glow flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>Save password <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-8">
          <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700 transition">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react';

const roleHome = { admin: '/admin', staff: '/staff', driver: '/driver', wholesale: '/wholesale', customer: '/' };

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-500 mb-2">
            Your role <span className="font-semibold text-gray-700 capitalize">({user.role})</span> does not have permission to access this page.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            If you believe this is an error, please contact your administrator.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(roleHome[user.role] || '/', { replace: true })}
              className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-xl transition"
            >
              <ArrowLeft size={16} /> Go to Dashboard
            </button>
            <button
              onClick={() => { logout(); navigate('/login', { replace: true }); }}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

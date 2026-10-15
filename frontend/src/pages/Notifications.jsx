import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/services';
import { Bell, CheckCheck, Package, Truck, AlertTriangle, Info, ShoppingBag, Star, X } from 'lucide-react';

const typeConfig = {
  order: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  delivery: { icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  alert: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  promo: { icon: Star, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  wholesale: { icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  info: { icon: Info, color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-100' },
};

function getTypeConfig(type) {
  return typeConfig[type] || typeConfig.info;
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => notificationApi.getAll().then((res) => setNotifications(res.data.notifications));

  useEffect(() => {
    // Re-fetch whenever the logged-in user changes (account switch)
    setLoading(true);
    setNotifications([]);
    load().finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const handleMarkAll = async () => {
    await notificationApi.markAllRead();
    load();
  };

  const handleRead = async (id) => {
    await notificationApi.markRead(id);
    load();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                <Bell size={22} />
              </div>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                You have <span className="font-semibold text-brand-600">{unreadCount} unread</span> notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-full transition"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center flex flex-col items-center animate-fade-in-up">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <Bell size={40} />
            </div>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-2">All caught up!</h2>
            <p className="text-gray-400">No notifications yet. We'll let you know when something important happens.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, idx) => {
              const { icon: Icon, color, bg, border } = getTypeConfig(n.type);
              return (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && handleRead(n._id)}
                  className={`relative flex gap-4 p-5 rounded-2xl border transition-all cursor-pointer group animate-fade-in-up ${
                    n.isRead
                      ? 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      : `${bg} ${border} hover:shadow-card`
                  }`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="absolute top-5 right-5 w-2 h-2 bg-brand-500 rounded-full" />
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.isRead ? 'bg-gray-100' : bg} ${n.isRead ? 'text-gray-400' : color}`}>
                    <Icon size={18} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm leading-snug ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {n.title}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${n.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                      {n.message}
                    </p>
                  </div>

                  {/* Mark read button (on hover, if unread) */}
                  {!n.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRead(n._id); }}
                      className="absolute top-3 right-3 w-6 h-6 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-all flex items-center justify-center"
                      title="Mark as read"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

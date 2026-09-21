import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Package, Truck, AlertTriangle, Info, ShoppingBag, Star } from 'lucide-react';
import { notificationApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

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

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const load = () => {
    notificationApi.getAll().then((res) => {
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    }).catch(err => console.error("Error loading notifications", err));
  };

  useEffect(() => {
    if (!user) return;
    load();
    // Poll every 60 seconds
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAll = async (e) => {
    e.stopPropagation();
    await notificationApi.markAllRead();
    load();
  };

  const handleRead = async (id, e) => {
    e.stopPropagation();
    await notificationApi.markRead(id);
    load();
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      notificationApi.markRead(n._id).then(load);
    }
    setIsOpen(false);
    if (n.relatedOrder) {
      if (user?.role === 'admin' || user?.role === 'staff') {
        navigate('/staff'); 
      } else {
        navigate('/orders');
      }
    } else {
      navigate('/notifications');
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up origin-top-right">
          {/* Header */}
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-display font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAll}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                  <Bell size={24} />
                </div>
                <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.slice(0, 5).map((n) => {
                  const { icon: Icon, color, bg } = getTypeConfig(n.type);
                  return (
                    <div 
                      key={n._id} 
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-brand-50/20' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg} ${color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm truncate pr-4 ${!n.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <button 
                              onClick={(e) => handleRead(n._id, e)}
                              className="text-gray-400 hover:text-brand-600 transition-colors p-1 -mr-1"
                              title="Mark as read"
                            >
                              <CheckCheck size={14} />
                            </button>
                          )}
                        </div>
                        <p className={`text-xs line-clamp-2 ${!n.isRead ? 'text-gray-600' : 'text-gray-500'}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-50 bg-gray-50/50 text-center">
            <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

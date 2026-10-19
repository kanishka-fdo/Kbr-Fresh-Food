import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import { Search, User, Menu, PanelLeftClose } from 'lucide-react';
import NotificationDropdown from '../NotificationDropdown';

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans animate-fade-in">
      <AdminSidebar collapsed={collapsed} onToggle={toggleSidebar} />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-64'}`}>
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle */}
            <button
              onClick={toggleSidebar}
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}
            </button>

            {/* Search */}
            <div className="relative w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search orders, users, products..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            
            <div className="h-7 w-px bg-gray-200"></div>
            
            <Link to="/profile" className="flex items-center gap-2.5 hover:bg-gray-50 p-1.5 rounded-lg transition-colors pr-3 cursor-pointer">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() || <User size={16} />}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">{user?.role || 'Admin'}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ─────────────────────────────────────────
   Inline SVG Icons — real-world Lucide paths
   ───────────────────────────────────────── */

const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Orders: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  Wholesale: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Inventory: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Shop: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  Reports: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  AdvInventory: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  Suppliers: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  Purchases: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
    </svg>
  ),
  Globe: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Profile: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
};

export default function AdminSidebar({ collapsed = false, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard',        path: '/admin',                icon: Icons.Dashboard   },
    { name: 'Orders',           path: '/staff',                icon: Icons.Orders      },
    { name: 'Wholesale Orders', path: '/staff/wholesale',      icon: Icons.Wholesale   },
    { name: 'Inventory',        path: '/staff/inventory',      icon: Icons.Inventory   },
    { name: 'Users & Roles',    path: '/admin/users',          icon: Icons.Users       },
    { name: 'Customer Shop',    path: '/admin/shop',           icon: Icons.Shop        },
    { name: 'Reports',          path: '/admin/reports',        icon: Icons.Reports     },
  ];

  const supplyChainItems = [
    { name: 'Adv. Inventory',   path: '/admin/inventory-intel', icon: Icons.AdvInventory },
    { name: 'Suppliers',        path: '/admin/suppliers',       icon: Icons.Suppliers    },
    { name: 'Purchases',        path: '/admin/purchases',       icon: Icons.Purchases    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active =
      location.pathname === item.path ||
      (item.path !== '/admin' && location.pathname.startsWith(item.path + '/'));

    return (
      <Link
        to={item.path}
        title={collapsed ? item.name : undefined}
        className={`group relative flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-200
          ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
          ${active
            ? 'bg-brand-500 text-white shadow-lg'
            : 'text-brand-100 hover:bg-white/10 hover:text-white'
          }`}
      >
        <span className="shrink-0"><Icon /></span>
        {!collapsed && <span className="truncate">{item.name}</span>}

        {/* Tooltip on hover when collapsed */}
        {collapsed && (
          <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] pointer-events-none shadow-lg">
            {item.name}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className={`bg-brand-900 flex flex-col h-full fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>

      {/* ── Brand Logo ─────────────────────────────── */}
      <div className="h-16 flex items-center border-b border-brand-800 bg-white overflow-hidden">
        <Link
          to="/admin"
          className={`flex items-center w-full h-full group transition-all duration-300 ${collapsed ? 'justify-center px-2' : 'gap-2.5 px-4'}`}
        >
          <img 
            src="/kbr-logo.png" 
            alt="KBR Fresh Logo" 
            className={`object-contain group-hover:scale-105 transition-transform shrink-0 ${collapsed ? 'h-9 w-9' : 'h-11 w-auto max-h-11'}`}
          />
          {!collapsed && (
            <div className="leading-none min-w-0">
              <span className="font-bold text-[15px] tracking-tight block text-brand-900 leading-none truncate">
                KBR Fresh Foods
              </span>
              <span className="text-[7px] uppercase tracking-[2px] text-brand-600 font-bold block mt-0.5 leading-none">
                Admin Workspace
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Nav Menu ───────────────────────────────── */}
      <div className={`flex-1 overflow-y-auto py-5 flex flex-col gap-0.5 ${collapsed ? 'px-2.5' : 'px-4'}`}>

        {!collapsed && (
          <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-3 px-3">
            Main Menu
          </p>
        )}
        {collapsed && <div className="mb-2" />}

        {navItems.map(item => <NavItem key={item.name} item={item} />)}

        {/* ── Supply Chain ───────────────────────── */}
        {!collapsed ? (
          <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-3 mt-6 px-3">
            Supply Chain
          </p>
        ) : (
          <div className="my-3 mx-2 border-t border-brand-700" />
        )}

        {supplyChainItems.map(item => <NavItem key={item.name} item={item} />)}
      </div>

      {/* ── Bottom Actions ─────────────────────────── */}
      <div className={`border-t border-brand-800 space-y-0.5 ${collapsed ? 'p-2.5' : 'p-4'}`}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? 'Customer Site' : undefined}
          className={`group relative flex items-center gap-3 rounded-xl text-sm font-medium text-brand-200 hover:bg-white/10 hover:text-white transition-colors ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}`}
        >
          <Icons.Globe />
          {!collapsed && (
            <>
              <span>Customer Site</span>
              <span className="ml-auto bg-brand-800 p-1 rounded">
                <Icons.ExternalLink />
              </span>
            </>
          )}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none shadow-lg">
              Customer Site
            </span>
          )}
        </a>

        <Link
          to="/profile"
          title={collapsed ? 'My Profile' : undefined}
          className={`group relative flex items-center gap-3 rounded-xl text-sm font-medium text-brand-200 hover:text-white hover:bg-white/10 transition-colors ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}`}
        >
          <Icons.Profile />
          {!collapsed && 'My Profile'}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none shadow-lg">
              My Profile
            </span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`group relative w-full flex items-center gap-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 transition-colors ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}`}
        >
          <Icons.Logout />
          {!collapsed && 'Sign Out'}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none shadow-lg">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

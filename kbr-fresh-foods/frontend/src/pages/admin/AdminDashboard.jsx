import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { dashboardApi } from '../../api/services';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  DollarSign, ShoppingBag, Users, Package, AlertTriangle,
  TrendingUp, ArrowUpRight, BarChart2, Calendar, Download
} from 'lucide-react';
import { exportToCSV } from '../../utils/csvExport';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white shadow-xl rounded-xl px-4 py-3 text-sm border border-gray-800">
        <p className="font-semibold text-gray-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
            {p.name === 'revenue' ? `Rs. ${Number(p.value).toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, tRes, pRes, fRes] = await Promise.all([
        dashboardApi.summary(),
        dashboardApi.salesTrend(timeRange),
        dashboardApi.topProducts(),
        dashboardApi.inventoryForecast(),
      ]);
      setSummary(sRes.data);
      setTrend(tRes.data.trend || []);
      setTopProducts(pRes.data.topProducts || []);
      setForecast(fRes.data.forecast || []);
    } catch (err) {
      console.error('AdminDashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const handleExport = () => {
    if (!trend || trend.length === 0) {
      alert("No data available to export");
      return;
    }
    const csvData = trend.map(t => ({
      'Date': t._id,
      'Retail Revenue (Rs)': t.retailRevenue || 0,
      'B2B Revenue (Rs)': t.wholesaleRevenue || 0,
      'Total Orders': t.orders || 0
    }));
    exportToCSV(csvData, `KBR_Dashboard_Trend_${timeRange}Days`);
  };

  const reorderSoon = forecast.filter((f) => f.recommendation === 'Reorder soon');
  
  const avgOrderValue = summary?.totalOrders ? Math.round((summary.retailRevenue + summary.wholesaleRevenue) / summary.totalOrders) : 0;

  const statCards = summary ? [
    {
      label: 'Retail Revenue',
      value: `Rs. ${summary.retailRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-700',
      trend: '+12.5%',
    },
    {
      label: 'B2B Revenue',
      value: `Rs. ${summary.wholesaleRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-700',
      trend: '+15.2%',
    },
    {
      label: 'Total Orders',
      value: summary.totalOrders,
      icon: ShoppingBag,
      color: 'from-purple-500 to-purple-700',
    },
    {
      label: 'Active Customers',
      value: summary.totalCustomers,
      icon: Users,
      color: 'from-amber-500 to-amber-700',
    },
    {
      label: 'Active Products',
      value: summary.totalProducts,
      icon: Package,
      color: 'from-cyan-500 to-cyan-700',
    },
    {
      label: 'Low Stock Alerts',
      value: summary.lowStockCount,
      icon: AlertTriangle,
      color: summary.lowStockCount > 0 ? 'from-red-500 to-red-700' : 'from-gray-400 to-gray-600',
      urgent: summary.lowStockCount > 0,
    },
  ] : [];

  if (loading && !summary) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={18} className="text-brand-600" />
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest">Overview</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 leading-tight">Business Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Monitor your key metrics and store performance</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none cursor-pointer shadow-sm"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {reorderSoon.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-6 flex items-center gap-3 animate-fade-in-up">
          <div className="bg-red-100 p-2 rounded-lg shrink-0">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-red-800 font-bold text-sm leading-tight">Critical Inventory Alert</h3>
            <p className="text-red-600 text-xs mt-0.5 truncate">
              <span className="font-semibold">{reorderSoon.length} product(s)</span> running low: {reorderSoon.map(f => f.product).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${card.urgent ? 'border-red-200 ring-1 ring-red-50' : 'border-gray-100 shadow-sm'}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${card.color} text-white shadow-sm`}>
                <Icon size={18} />
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5 leading-tight">{card.label}</p>
              <p className={`text-xl font-bold font-display leading-tight ${card.urgent ? 'text-red-600' : 'text-gray-900'}`}>{card.value}</p>
              
              {card.trend && (
                <div className="flex items-center gap-0.5 text-[11px] text-emerald-600 font-bold mt-1.5">
                  <ArrowUpRight size={12} /> {card.trend}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-gray-900 text-base">Revenue Trend</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Daily revenue over selected period</p>
            </div>
            <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          {trend.length > 0 ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRetail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWholesale" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#306c4e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#306c4e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} dx={-5} tickFormatter={(val) => `Rs.${val/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="retailRevenue" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRetail)" activeDot={{ r: 5, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }} stackId="1" />
                  <Area type="monotone" dataKey="wholesaleRevenue" stroke="#306c4e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWholesale)" activeDot={{ r: 5, fill: '#306c4e', stroke: '#fff', strokeWidth: 2 }} stackId="1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg">No data available for this period</div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-gray-900 text-base">Top Performers</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Best selling products by quantity</p>
            </div>
            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          {topProducts.length > 0 ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="totalQuantity" radius={[0, 4, 4, 0]} barSize={20}>
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#306c4e' : index < 3 ? '#69a686' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg">No sales data yet</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-base">Inventory Intelligence</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">AI-driven stock runway predictions based on recent velocity</p>
          </div>
          <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100">Product</th>
                <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100">Category</th>
                <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100 text-right">Stock</th>
                <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100 text-right">Velocity/Day</th>
                <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100 text-right">Runway</th>
                <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {forecast.slice(0, 8).map((f) => (
                <tr key={f.product} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-900 text-sm">{f.product}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-sm">{f.category || '—'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="font-semibold text-gray-900">{f.stockQuantity}</span>
                    <span className="text-gray-400 text-xs ml-1">{f.unit}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 text-right tabular-nums">{f.avgDailySales} units</td>
                  <td className="px-5 py-3.5 text-right">
                    {f.daysRemaining !== null ? (
                      <span className={`font-bold tabular-nums ${f.daysRemaining <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                        {f.daysRemaining}d
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      f.recommendation === 'Reorder soon'
                        ? 'bg-red-50 text-red-700'
                        : f.recommendation === 'Stock healthy'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {f.recommendation === 'Reorder soon' && <AlertTriangle size={10} />}
                      {f.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
              {forecast.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No inventory data available to forecast</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

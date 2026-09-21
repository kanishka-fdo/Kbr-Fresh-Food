import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { dashboardApi } from '../../api/services';
import { 
  BarChart3, Download, Calendar, 
  TrendingUp, Users, Package, Award
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white shadow-xl rounded-xl px-4 py-3 text-sm border border-gray-800">
        <p className="font-semibold text-gray-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
            {p.name.includes('evenue') || p.name.includes('pent') ? `Rs. ${Number(p.value).toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#306c4e', '#f59e0b', '#0ea5e9', '#8b5cf6', '#ec4899'];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [trend, setTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tRes, pRes, cRes, cbRes] = await Promise.all([
          dashboardApi.salesTrend(timeRange),
          dashboardApi.topProducts(),
          dashboardApi.customerReport(),
          dashboardApi.categoryBreakdown(),
        ]);
        setTrend(tRes.data.trend || []);
        setTopProducts(pRes.data.topProducts || []);
        setCustomers(cRes.data.report || []);
        setCategoryData(cbRes.data.breakdown || []);
      } catch (err) {
        console.error('AdminReports load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  // Derived metrics
  const totalRevenue = trend.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = trend.reduce((acc, curr) => acc + curr.orders, 0);

  if (loading && trend.length === 0) {
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={20} className="text-brand-600" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Analytics</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Advanced Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Deep dive into sales performance and customer insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none cursor-pointer shadow-sm"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={365}>Last 12 Months</option>
            </select>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-brand-100">
              <TrendingUp size={20} />
              <span className="font-semibold text-sm uppercase tracking-wider">Period Revenue</span>
            </div>
            <div className="text-4xl font-bold font-display mb-1">Rs. {totalRevenue.toLocaleString()}</div>
            <div className="text-brand-200 text-sm">Generated in the last {timeRange} days</div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <Package size={20} className="text-amber-500" />
            <span className="font-semibold text-sm uppercase tracking-wider">Orders Completed</span>
          </div>
          <div className="text-4xl font-bold font-display text-gray-900 mb-1">{totalOrders.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">Successful transactions</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <Users size={20} className="text-blue-500" />
            <span className="font-semibold text-sm uppercase tracking-wider">Avg Order Value</span>
          </div>
          <div className="text-4xl font-bold font-display text-gray-900 mb-1">
            Rs. {totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}
          </div>
          <div className="text-gray-400 text-sm">Revenue per transaction</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-display font-bold text-gray-900 text-lg mb-6">Revenue vs Orders</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => `Rs.${val/1000}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dx={10} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="retailRevenue"
                  name="Retail Revenue"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="wholesaleRevenue"
                  name="Wholesale Revenue"
                  stroke="#306c4e"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#306c4e', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (Pie) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-display font-bold text-gray-900 text-lg mb-2">Category Sales</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Top Customers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="font-display font-bold text-gray-900 text-lg">Top Customers</h2>
              <p className="text-xs text-gray-500 mt-1">Based on total lifetime value</p>
            </div>
            <Award className="text-amber-500" />
          </div>
          <div className="p-0">
            {customers.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {customers.slice(0, 5).map((customer, idx) => (
                  <div key={customer._id} className="p-4 hover:bg-gray-50/80 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.orderCount} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-700">Rs. {customer.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">No customer data available</div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="font-display font-bold text-gray-900 text-lg">Top Products</h2>
              <p className="text-xs text-gray-500 mt-1">Best selling items by quantity</p>
            </div>
            <Package className="text-blue-500" />
          </div>
          <div className="p-0">
            {topProducts.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {topProducts.slice(0, 5).map((product, idx) => (
                  <div key={product._id} className="p-4 hover:bg-gray-50/80 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400 font-bold w-4">{idx + 1}.</div>
                      <div>
                        <p className="font-bold text-gray-900">{product.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{product.totalQuantity} <span className="text-gray-400 font-normal text-sm">sold</span></p>
                      <p className="text-xs text-brand-600 font-medium">Rs. {product.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">No product data available</div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

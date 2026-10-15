import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/services';
import {
  Package, Clock, CheckCircle2, Truck, XCircle, ChevronDown,
  RefreshCw, User, Phone, DollarSign, ListFilter, ShoppingBag, 
  MapPin, Calendar, FileText, Search
} from 'lucide-react';

const STATUS_FLOW = ['pending', 'processing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

const statusConfig = {
  pending: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Clock, label: 'Pending' },
  processing: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Processing' },
  packed: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Package, label: 'Packed' },
  out_for_delivery: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Truck, label: 'Out for Delivery' },
  delivered: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Delivered' },
  cancelled: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
};

export default function StaffOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [loadError, setLoadError] = useState(null);

  const load = async (isRefresh = false) => {
    if (isRefresh && !refreshing) setRefreshing(true);
    else if (!isRefresh) setLoading(true);
    setLoadError(null);
    try {
      const [oRes, dRes] = await Promise.all([
        orderApi.getAll(), // Always fetch all to keep counts accurate
        orderApi.availableDrivers(),
      ]);
      setOrders(oRes.data.orders || []);
      setDrivers(dRes.data.drivers || []);
    } catch (err) {
      console.error('StaffOrders load error:', err);
      if (!isRefresh) setLoadError(err?.response?.data?.message || 'Failed to load orders. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    load(); 
    const interval = setInterval(() => load(true), 15000); 
    return () => clearInterval(interval);
  }, []); // Remove filter dependency so it doesn't refetch on tab change

  const handleStatusChange = async (id, status) => {
    await orderApi.updateStatus(id, status);
    load(true);
  };

  const handlePaymentStatusChange = async (id, status) => {
    try {
      await orderApi.updatePaymentStatus(id, status);
      load(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const handleAssignDriver = async (id, driverId) => {
    if (!driverId) return;
    await orderApi.assignDriver(id, driverId);
    load(true);
  };

  const counts = {};
  STATUS_FLOW.forEach((s) => { counts[s] = 0; });
  orders.forEach((o) => { 
    let normalized = (o.status || '').trim().toLowerCase();
    if (normalized === 'confirmed') normalized = 'processing'; // Map legacy status
    if (counts[normalized] !== undefined) counts[normalized]++; 
  });

  const filteredOrders = orders.filter(o => {
    let normalized = (o.status || '').trim().toLowerCase();
    if (normalized === 'confirmed') normalized = 'processing';
    
    const matchesFilter = filter === '' || normalized === filter;
    const matchesSearch = !search || 
      (o.orderNumber?.toLowerCase() || '').includes(search.toLowerCase()) || 
      (o.customer?.name?.toLowerCase() || '').includes(search.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  const LayoutWrapper = user?.role === 'admin' ? AdminLayout : Layout;

  return (
    <LayoutWrapper>
      {/* Error Banner */}
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <XCircle size={18} className="shrink-0 text-red-500" />
          <span className="text-sm font-medium">{loadError}</span>
          <button onClick={() => load()} className="ml-auto text-xs font-bold underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Header Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="bg-brand-50 text-brand-600 p-1.5 rounded-lg">
              <ShoppingBag size={18} />
            </div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Fulfillment Center</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Order Management</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID or customer..."
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all bg-gray-50 focus:bg-white shadow-sm"
            />
          </div>
          {/* Refresh Button */}
          <button
            onClick={() => load(true)}
            className={`w-full sm:w-auto flex justify-center items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm ${refreshing ? 'opacity-70 pointer-events-none' : ''}`}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-brand-600' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Modern Filter Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm mb-6 flex items-center overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setFilter('')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
            filter === '' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          <ListFilter size={16} /> All
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${filter === '' ? 'bg-brand-200/50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
            {orders.length}
          </span>
        </button>
        
        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1 shrink-0"></div>

        {STATUS_FLOW.map((s) => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                filter === s ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {cfg.label}
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${filter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {counts[s]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders View */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
            <p className="text-gray-500 font-medium text-sm">Loading orders...</p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-400 text-sm">We couldn't find any orders matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4 pl-6 font-semibold">Order Details</th>
                  <th className="p-4 font-semibold">Customer & Delivery</th>
                  <th className="p-4 font-semibold">Amount & Items</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 pr-6 text-right font-semibold">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((o) => {
                  let normalizedStatus = (o.status || '').trim().toLowerCase();
                  if (normalizedStatus === 'confirmed') normalizedStatus = 'processing';
                  const cfg = statusConfig[normalizedStatus] || statusConfig.pending;
                  const StatusIcon = cfg.icon;

                  return (
                    <tr key={o._id} className="hover:bg-gray-50/40 transition-colors group">
                      <td className="p-4 pl-6 align-top">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-display font-bold text-gray-900">{o.orderNumber}</span>
                          {o.type === 'wholesale' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider border border-amber-200">B2B</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <Calendar size={13} className="text-gray-400" /> 
                          {new Date(o.createdAt).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>
                      
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-2 mb-1.5 text-sm">
                          <User size={14} className="text-gray-400" />
                          <span className="font-bold text-gray-800">{o.customer?.name || 'Unknown'}</span>
                        </div>
                        {o.customer?.phone && (
                          <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-500 font-medium">
                            <Phone size={13} className="text-gray-400" /> {o.customer.phone}
                          </div>
                        )}
                        <div className="flex items-start gap-2 text-xs text-gray-500 font-medium">
                          <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="truncate max-w-[200px]" title={`${o.deliveryAddress?.line1 || ''} ${o.deliveryAddress?.city || ''}`}>
                            {o.deliveryAddress?.line1 ? `${o.deliveryAddress.line1}, ${o.deliveryAddress.city || 'Negombo'}` : 'Pickup'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <div className="font-bold text-gray-900 text-sm mb-1.5">
                          Rs. {o.totalAmount?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-bold mb-2">
                          {o.items?.length || 0} items
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {o.items?.slice(0, 2).map((item, i) => (
                             <span key={i} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-[100px]">
                               {item.quantity}x {item.name}
                             </span>
                          ))}
                          {o.items?.length > 2 && <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">+{o.items.length - 2}</span>}
                        </div>
                      </td>

                      <td className="p-4 align-top">
                         <div className="flex flex-col gap-2 items-start">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.color}`}>
                              <StatusIcon size={12} /> {cfg.label}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${
                              o.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              o.paymentStatus === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                              o.paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              <DollarSign size={11} className="-ml-0.5" /> 
                              {o.paymentStatus || 'Pending'}
                            </span>
                         </div>
                      </td>

                      <td className="p-4 pr-6 align-top">
                         <div className="flex flex-col gap-2 w-full max-w-[160px] ml-auto">
                             <div className="relative">
                               <select 
                                 value={normalizedStatus}
                                 onChange={(e) => handleStatusChange(o._id, e.target.value)}
                                 className="w-full appearance-none bg-white border border-gray-200 hover:border-brand-400 rounded-lg pl-2 pr-6 py-1.5 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
                               >
                                  {STATUS_FLOW.map(s => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
                               </select>
                               <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                             </div>

                             <div className="relative">
                               <select 
                                 value={o.paymentStatus || 'pending'}
                                 onChange={(e) => handlePaymentStatusChange(o._id, e.target.value)}
                                 className="w-full appearance-none bg-white border border-gray-200 hover:border-brand-400 rounded-lg pl-2 pr-6 py-1.5 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
                               >
                                  <option value="pending">Pay: Pending</option>
                                  <option value="paid">Pay: Paid</option>
                                  <option value="failed">Pay: Failed</option>
                                  <option value="refunded">Pay: Refunded</option>
                               </select>
                               <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                             </div>

                             <div className="relative">
                               <select 
                                 value=""
                                 onChange={(e) => handleAssignDriver(o._id, e.target.value)}
                                 className="w-full appearance-none bg-white border border-gray-200 hover:border-brand-400 rounded-lg pl-2 pr-6 py-1.5 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
                               >
                                  <option value="" disabled>
                                    {o.driver ? `🚗 ${o.driver.name.split(' ')[0]}` : 'Assign Driver...'}
                                  </option>
                                  {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                               </select>
                               <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                             </div>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid gap-4 lg:hidden">
            {filteredOrders.map((o) => {
              let normalizedStatus = (o.status || '').trim().toLowerCase();
              if (normalizedStatus === 'confirmed') normalizedStatus = 'processing';
              const cfg = statusConfig[normalizedStatus] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              
              return (
                <div
                  key={o._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
                >
                  <div className="flex flex-col gap-5">
                    
                    {/* Order Core Info */}
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0 text-gray-400">
                        <FileText size={20} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-display font-bold text-lg text-gray-900">{o.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${cfg.color}`}>
                            <StatusIcon size={10} />
                            {cfg.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                          <div className="flex items-center gap-1"><Calendar size={12}/> {new Date(o.createdAt).toLocaleDateString()}</div>
                          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                          <div className="font-bold text-gray-900">Rs. {o.totalAmount?.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Customer Info */}
                    <div className="flex flex-col gap-2 text-xs font-medium bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span className="font-bold text-gray-800">{o.customer?.name || 'Unknown'}</span>
                        </div>
                        {o.customer?.phone && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Phone size={12} className="text-gray-400" />
                            <span>{o.customer.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                        <span className="text-gray-600">
                          {o.deliveryAddress?.line1 ? `${o.deliveryAddress.line1}, ${o.deliveryAddress.city || 'Negombo'}` : 'Pickup / No Address'}
                        </span>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-gray-100 pt-4">
                      {/* Status Dropdown */}
                      <div className="relative">
                        <select
                          value={normalizedStatus}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          className="w-full appearance-none bg-white border border-gray-200 hover:border-brand-400 rounded-lg pl-2 pr-6 py-2 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none shadow-sm"
                        >
                          {STATUS_FLOW.map((s) => (
                            <option key={s} value={s}>{statusConfig[s]?.label || s}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Payment Status Dropdown */}
                      <div className="relative">
                        <select
                          value={o.paymentStatus || 'pending'}
                          onChange={(e) => handlePaymentStatusChange(o._id, e.target.value)}
                          className="w-full appearance-none bg-white border border-gray-200 hover:border-brand-400 rounded-lg pl-2 pr-6 py-2 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none shadow-sm"
                        >
                          <option value="pending">Pay: Pending</option>
                          <option value="paid">Pay: Paid</option>
                          <option value="failed">Pay: Failed</option>
                          <option value="refunded">Pay: Refunded</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Driver Dropdown */}
                      <div className="relative col-span-2 sm:col-span-1">
                        <select
                          defaultValue=""
                          onChange={(e) => handleAssignDriver(o._id, e.target.value)}
                          className="w-full appearance-none bg-white border border-gray-200 hover:border-brand-400 rounded-lg pl-2 pr-6 py-2 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none shadow-sm"
                        >
                          <option value="" disabled>
                            {o.driver ? `🚗 ${o.driver.name.split(' ')[0]}` : 'Assign Driver...'}
                          </option>
                          {drivers.map((d) => (
                            <option key={d._id} value={d._id}>{d.name.split(' ')[0]}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </LayoutWrapper>
  );
}

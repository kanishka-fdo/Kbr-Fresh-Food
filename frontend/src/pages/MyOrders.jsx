import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/services';
import { Package, ArrowRight, Clock, CheckCircle2, Truck, XCircle, ShoppingBag } from 'lucide-react';

const statusColors = {
  pending: 'bg-gray-100 text-gray-600 border-gray-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  packed: 'bg-purple-100 text-purple-700 border-purple-200',
  out_for_delivery: 'bg-amber-100 text-amber-700 border-amber-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const StatusIcon = ({ status }) => {
  switch(status) {
    case 'pending': return <Clock size={16} />;
    case 'processing': return <CheckCircle2 size={16} />;
    case 'packed': return <Package size={16} />;
    case 'out_for_delivery': return <Truck size={16} />;
    case 'delivered': return <CheckCircle2 size={16} />;
    case 'cancelled': return <XCircle size={16} />;
    default: return <Clock size={16} />;
  }
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    setOrders([]);
    orderApi
      .myOrders()
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [user?._id]);

  const handleCancel = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(id);
    try {
      await orderApi.cancelOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
      setCancellingId(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">My Orders</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center animate-fade-in-up">
            <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't made your first purchase.</p>
            <Link to="/" className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-8 rounded-full transition shadow-glow">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o, idx) => {
              let normalizedStatus = (o.status || '').trim().toLowerCase();
              if (normalizedStatus === 'confirmed') normalizedStatus = 'processing';
              
              return (
              <Link
                key={o._id}
                to={`/orders/${o._id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card hover:border-brand-200 transition-all p-5 animate-fade-in-up group"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Package size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900">{o.orderNumber}</p>
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[normalizedStatus] || statusColors.pending}`}>
                          <StatusIcon status={normalizedStatus} />
                          {normalizedStatus.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString('en-US', { 
                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:border-l sm:pl-6 border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Total ({o.items.length} items)</p>
                      <p className="font-bold text-lg text-gray-900">Rs. {o.totalAmount.toLocaleString()}</p>
                    </div>
                    {normalizedStatus === 'pending' ? (
                      <button
                        onClick={(e) => handleCancel(e, o._id)}
                        disabled={cancellingId === o._id}
                        className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
                      >
                        {cancellingId === o._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                        <ArrowRight size={20} />
                      </div>
                    )}
                  </div>
                  
                </div>
              </Link>
            )})}
          </div>
        )}
      </div>
    </Layout>
  );
}

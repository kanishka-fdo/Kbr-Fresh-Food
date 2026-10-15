import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { wholesaleApi } from '../../api/services';
import { Package, Clock, CheckCircle2, XCircle, ShoppingBag, ChevronDown, ChevronUp, Download, AlertCircle } from 'lucide-react';
import { downloadInvoicePDF } from '../../utils/pdfInvoice';

const statusConfig = {
  quote_requested: {
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Clock,
    label: 'Quote Requested',
    desc: 'Your order has been received. Our team is reviewing it.',
  },
  quoted: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Package,
    label: 'Quoted',
    desc: 'A price has been quoted. Awaiting your confirmation.',
  },
  approved: {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle2,
    label: 'Approved',
    desc: 'Your order has been approved and is being prepared.',
  },
  rejected: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
    label: 'Rejected',
    desc: 'This order was rejected. Please contact us for details.',
  },
  fulfilled: {
    color: 'bg-brand-50 text-brand-700 border-brand-200',
    icon: CheckCircle2,
    label: 'Fulfilled',
    desc: 'Order has been fulfilled and delivered.',
  },
  cancelled: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
    label: 'Cancelled',
    desc: 'This order was cancelled.',
  },
};

export default function WholesaleOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = () => {
    wholesaleApi.myOrders().then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this wholesale order?')) return;
    setCancellingId(id);
    try {
      await wholesaleApi.cancelOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">My Bulk Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Track the status of your wholesale order requests</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center flex flex-col items-center animate-fade-in-up">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No bulk orders yet</h2>
          <p className="text-gray-400 text-sm mb-5">Head to the Bulk Order page to place your first wholesale request.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o, idx) => {
            const sc = statusConfig[o.status] || statusConfig.quote_requested;
            const Icon = sc.icon;
            const isOpen = expanded === o._id;

            return (
              <div
                key={o._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up transition-all"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {/* Order header */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer hover:bg-gray-50/50 transition"
                  onClick={() => setExpanded(isOpen ? null : o._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
                      <Package size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900">{o.orderNumber}</span>
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${sc.color}`}>
                          <Icon size={11} /> {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:ml-auto">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Order Total</p>
                      <p className="font-bold text-xl text-brand-700">Rs. {o.itemsTotal?.toLocaleString()}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Status message */}
                <div className={`mx-5 mb-3 px-4 py-2.5 rounded-xl text-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${sc.color}`}>
                  <div>
                    {sc.desc}
                    {o.rejectionReason && (
                      <span className="block mt-1 font-medium">Reason: {o.rejectionReason}</span>
                    )}
                    {(o.status === 'approved' || o.status === 'fulfilled') && (
                      <span className="block mt-1 font-bold">
                        Payment Status: {o.paymentStatus ? o.paymentStatus.toUpperCase() : 'UNPAID'} 
                        {o.amountPaid > 0 && ` (Paid: Rs. ${o.amountPaid.toLocaleString()})`}
                      </span>
                    )}
                  </div>
                  {(o.status === 'quote_requested' || o.status === 'quoted') && (
                    <button
                      onClick={(e) => handleCancel(e, o._id)}
                      disabled={cancellingId === o._id}
                      className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm disabled:opacity-50 shrink-0"
                    >
                      {cancellingId === o._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>

                {/* Expanded items */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Items ({o.items.length})</p>
                    <div className="space-y-2">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-800">Rs. {item.subtotal?.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between font-bold text-gray-900 pt-3 border-t border-gray-100 gap-3">
                      <div className="flex items-center gap-2">
                        <span>Total:</span>
                        <span className="text-brand-700 text-lg">Rs. {o.itemsTotal?.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => downloadInvoicePDF(o)}
                        className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                      >
                        <Download size={14} /> Download PDF Invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

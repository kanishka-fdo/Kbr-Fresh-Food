import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { wholesaleApi } from '../../api/services';
import {
  Package, Clock, CheckCircle2, XCircle, Building2,
  Mail, DollarSign, RefreshCw, ShoppingBag, Check, X, CreditCard
} from 'lucide-react';

const statusConfig = {
  quote_requested: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock, label: 'Quote Requested' },
  quoted: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Package, label: 'Quoted' },
  approved: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, label: 'Approved' },
  rejected: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Rejected' },
  fulfilled: { color: 'bg-brand-50 text-brand-700 border-brand-200', icon: CheckCircle2, label: 'Fulfilled' },
};

export default function StaffWholesale() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Payment State
  const [recordPaymentId, setRecordPaymentId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', reference: '', method: 'bank_transfer' });

  const load = () => {
    setLoading(true);
    wholesaleApi.getAll().then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    await wholesaleApi.approve(id);
    load();
  };

  const handleReject = async () => {
    await wholesaleApi.reject(rejectId, rejectReason);
    setRejectId(null);
    setRejectReason('');
    load();
  };

  const handleFulfil = async (id) => {
    await wholesaleApi.fulfil(id);
    load();
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await wholesaleApi.recordTransaction(recordPaymentId._id, paymentForm);
      setRecordPaymentId(null);
      setPaymentForm({ amount: '', reference: '', method: 'bank_transfer' });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const pending = orders.filter((o) => o.status === 'quote_requested' || o.status === 'quoted');
  const processed = orders.filter((o) => !['quote_requested', 'quoted'].includes(o.status));

  return (
    <Layout>
      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-gray-900 text-lg mb-1">Reject Order</h2>
            <p className="text-gray-500 text-sm mb-4">Optionally provide a reason for the rejection (visible to the buyer).</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason (optional)..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectId(null); setRejectReason(''); }}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {recordPaymentId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2"><CreditCard size={20} className="text-brand-600"/> Record Payment</h2>
              <button onClick={() => setRecordPaymentId(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount (Rs.)</label>
                <input required type="number" step="0.01" min="1" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Method</label>
                <select value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-brand-500 outline-none bg-white">
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reference / Note (Optional)</label>
                <input type="text" value={paymentForm.reference} onChange={e => setPaymentForm({...paymentForm, reference: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-brand-500 outline-none" placeholder="e.g. TRx12345" />
              </div>
              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition">
                Submit Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Wholesale Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pending.length > 0 ? (
              <span className="text-amber-600 font-semibold">{pending.length} order{pending.length !== 1 ? 's' : ''} awaiting action</span>
            ) : 'All orders are up to date'}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-600 bg-white border border-gray-200 px-4 py-2.5 rounded-full transition hover:border-brand-300"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No wholesale orders</h2>
          <p className="text-gray-400 text-sm">Wholesale buyer orders will appear here once submitted.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending orders */}
          {pending.length > 0 && (
            <section>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Needs Action ({pending.length})
              </p>
              <div className="space-y-4">
                {pending.map((o, idx) => {
                  const sc = statusConfig[o.status] || statusConfig.quote_requested;
                  const Icon = sc.icon;
                  return (
                    <div
                      key={o._id}
                      className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-5 animate-fade-in-up"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{o.buyer?.businessName || o.buyer?.name}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Mail size={11} /> {o.buyer?.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.color}`}>
                            <Icon size={11} /> {sc.label}
                          </span>
                          <span className="font-bold text-brand-700">Rs. {o.itemsTotal?.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
                        {o.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.name} × {item.quantity}</span>
                            <span className="text-gray-500">Rs. {item.subtotal?.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                          <span>Total</span>
                          <span className="text-brand-700">Rs. {o.itemsTotal?.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {(o.status === 'quote_requested' || o.status === 'quoted') && (
                          <>
                            <button
                              onClick={() => handleApprove(o._id)}
                              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition"
                            >
                              <Check size={15} /> Approve Order
                            </button>
                            <button
                              onClick={() => setRejectId(o._id)}
                              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold px-5 py-2.5 rounded-full transition border border-red-200"
                            >
                              <X size={15} /> Reject
                            </button>
                          </>
                        )}
                        {o.status === 'approved' && (
                          <>
                            <button
                              onClick={() => handleFulfil(o._id)}
                              className="flex items-center gap-1.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition"
                            >
                              <CheckCircle2 size={15} /> Mark Fulfilled
                            </button>
                            <button
                              onClick={() => setRecordPaymentId(o)}
                              className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-semibold px-5 py-2.5 rounded-full transition border border-green-200"
                            >
                              <CreditCard size={15} /> Record Payment
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Processed orders */}
          {processed.length > 0 && (
            <section>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Processed ({processed.length})
              </p>
              <div className="space-y-3">
                {processed.map((o) => {
                  const sc = statusConfig[o.status] || statusConfig.fulfilled;
                  const Icon = sc.icon;
                  return (
                    <div key={o._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center shrink-0">
                          <Package size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700 text-sm">{o.orderNumber}</span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${sc.color}`}>
                              <Icon size={10} /> {sc.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{o.buyer?.businessName || o.buyer?.name} · {o.items?.length} items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:ml-auto">
                        <p className="font-bold text-gray-700">Rs. {o.itemsTotal?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </Layout>
  );
}

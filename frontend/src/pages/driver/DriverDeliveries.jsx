import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import MapView from '../../components/MapView';
import { orderApi } from '../../api/services';
import { Truck, MapPin, Phone, User, Package, CheckCircle2, ChevronRight, RefreshCw, QrCode as QrCodeIcon, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const nextStatus = {
  pending: 'processing',
  processing: 'packed',
  packed: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

const nextLabel = {
  pending: 'Mark as Processing',
  processing: 'Mark as Packed',
  packed: 'Start Delivery',
  out_for_delivery: 'Scan QR to Deliver',
};

const nextStyle = {
  pending: 'bg-blue-600 hover:bg-blue-700',
  processing: 'bg-purple-600 hover:bg-purple-700',
  packed: 'bg-amber-500 hover:bg-amber-600',
  out_for_delivery: 'bg-green-600 hover:bg-green-700',
};

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
  packed: { label: 'Packed', color: 'bg-purple-100 text-purple-700' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-amber-100 text-amber-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
};

export default function DriverDeliveries() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(null);
  
  // QR Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scanningOrder, setScanningOrder] = useState(null);
  const [scanError, setScanError] = useState('');

  const load = () => {
    orderApi.myDeliveries().then((res) => {
      const fetched = res.data.orders;
      setOrders(fetched);
      // Auto-select first order if nothing selected
      if (!selected && fetched.length > 0) setSelected(fetched[0]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdvance = async (order) => {
    if (order.status === 'out_for_delivery') {
      setScanningOrder(order);
      setShowScanner(true);
      return;
    }

    const next = nextStatus[order.status];
    if (!next) return;
    setAdvancing(order._id);
    await orderApi.updateStatus(order._id, next);
    await load();
    setAdvancing(null);
  };

  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        async (decodedText) => {
          scanner.clear();
          try {
            setAdvancing(scanningOrder._id);
            await orderApi.verifyQrCode(scanningOrder._id, decodedText);
            setShowScanner(false);
            setScanningOrder(null);
            await load();
          } catch (err) {
            setScanError(err.response?.data?.message || 'Invalid QR Code');
            setTimeout(() => setScanError(''), 3000);
            // Re-render scanner so they can try again
            setShowScanner(true);
          } finally {
            setAdvancing(null);
          }
        },
        (error) => {
          // parse errors are normal while searching for code, ignore
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [showScanner, scanningOrder]);

  const active = orders.filter((o) => o.status !== 'delivered');
  const completed = orders.filter((o) => o.status === 'delivered');

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">My Deliveries</h1>
          <p className="text-gray-500 text-sm mt-1">
            {active.length > 0 ? `${active.length} active delivery${active.length !== 1 ? 's' : ''}` : 'No active deliveries'}
            {completed.length > 0 && ` · ${completed.length} completed today`}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); load(); }}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-600 bg-white border border-gray-200 px-4 py-2.5 rounded-full transition hover:border-brand-300"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <Truck size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No deliveries assigned</h2>
          <p className="text-gray-400 text-sm">Check back later — deliveries will appear here once assigned to you.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Delivery List */}
          <div className="space-y-4">
            {/* Active */}
            {active.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active</p>
                {active.map((o, idx) => {
                  const sc = statusConfig[o.status] || {};
                  return (
                    <div
                      key={o._id}
                      onClick={() => setSelected(o)}
                      className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all animate-fade-in-up ${
                        selected?._id === o._id
                          ? 'border-brand-500 shadow-card ring-1 ring-brand-200'
                          : 'border-gray-100 hover:border-brand-200 hover:shadow-sm'
                      }`}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{o.orderNumber}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><User size={13} />{o.customer?.name}</span>
                            {o.customer?.phone && (
                              <a href={`tel:${o.customer.phone}`} className="flex items-center gap-1 hover:text-brand-600 transition" onClick={(e) => e.stopPropagation()}>
                                <Phone size={13} />{o.customer.phone}
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                            <MapPin size={13} />
                            <span>{o.deliveryAddress?.line1}, {o.deliveryAddress?.city}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-brand-700">Rs. {o.totalAmount?.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">{o.items?.length} item(s)</p>
                        </div>
                      </div>

                      {nextStatus[o.status] && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAdvance(o); }}
                          disabled={advancing === o._id}
                          className={`w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-2.5 rounded-xl transition ${nextStyle[o.status]} disabled:opacity-60`}
                        >
                          {advancing === o._id ? (
                            <RefreshCw size={15} className="animate-spin" />
                          ) : (
                            <>
                              {o.status === 'out_for_delivery' ? <QrCodeIcon size={16} /> : <ChevronRight size={16} />}
                              {nextLabel[o.status]}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Completed</p>
                {completed.map((o) => (
                  <div
                    key={o._id}
                    onClick={() => setSelected(o)}
                    className={`bg-gray-50 rounded-2xl border-2 p-4 cursor-pointer transition-all opacity-75 hover:opacity-100 ${
                      selected?._id === o._id ? 'border-green-400' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">{o.orderNumber}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Delivered
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{o.deliveryAddress?.line1}, {o.deliveryAddress?.city}</p>
                      </div>
                      <p className="font-semibold text-gray-600">Rs. {o.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Map Panel */}
          <div className="lg:sticky lg:top-28 self-start">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-display font-bold text-gray-900 flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-brand-600" /> Delivery Route
              </h2>
              {selected ? (
                <>
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                    <p className="font-semibold text-gray-800">{selected.customer?.name}</p>
                    <p className="text-gray-500">{selected.deliveryAddress?.line1}</p>
                    <p className="text-gray-500">{selected.deliveryAddress?.city}</p>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    <MapView destination={selected.deliveryAddress} height={340} />
                  </div>
                  {selected.customer?.phone && (
                    <a
                      href={`tel:${selected.customer.phone}`}
                      className="mt-3 flex items-center justify-center gap-2 w-full bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold py-2.5 rounded-xl transition text-sm"
                    >
                      <Phone size={15} /> Call Customer
                    </a>
                  )}
                </>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
                    <MapPin size={28} />
                  </div>
                  <p className="text-gray-400 text-sm">Select a delivery to view its route</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => { setShowScanner(false); setScanningOrder(null); setScanError(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 bg-white rounded-full p-1 shadow-sm"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <QrCodeIcon className="text-brand-600" /> Scan Delivery QR
            </h2>
            <p className="text-sm text-gray-500 mb-6">Scan the QR code from the customer's tracking page to confirm delivery of order <strong>{scanningOrder?.orderNumber}</strong>.</p>
            
            <div id="reader" className="rounded-xl overflow-hidden shadow-inner border-2 border-dashed border-gray-300"></div>
            
            {scanError && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 text-center animate-shake">
                {scanError}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

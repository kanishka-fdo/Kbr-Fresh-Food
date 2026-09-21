import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import MapView from '../components/MapView';
import { orderApi } from '../api/services';
import { Check, Circle, Truck, MapPin, Receipt, Clock, Package, AlertCircle, Download } from 'lucide-react';
import { downloadInvoicePDF } from '../utils/pdfInvoice';

const steps = ['pending', 'processing', 'packed', 'out_for_delivery', 'delivered'];
const stepLabels = { 
  pending: 'Order Placed', 
  processing: 'Processing', 
  packed: 'Packed', 
  out_for_delivery: 'Out for Delivery', 
  delivered: 'Delivered' 
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = () => 
    orderApi.getById(id)
      .then((res) => setOrder(res.data.order))
      .finally(() => setLoading(false));
  
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await orderApi.cancelOrder(id);
      await fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000); // poll for live status updates
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !order) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      </Layout>
    );
  }

  if (!order) return null;

  let normalizedStatus = (order.status || '').trim().toLowerCase();
  if (normalizedStatus === 'confirmed') normalizedStatus = 'processing';
  const currentStepIndex = steps.indexOf(normalizedStatus);
  const isCancelled = normalizedStatus === 'cancelled';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
              Order {order.orderNumber}
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${statusColors[normalizedStatus] || statusColors.pending}`}>
                {normalizedStatus.replace(/_/g, ' ')}
              </span>
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-1.5">
              <Clock size={16} /> 
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {normalizedStatus === 'pending' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold px-5 py-2.5 rounded-2xl shadow-sm transition shrink-0 disabled:opacity-50"
              >
                <AlertCircle size={18} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <button
              onClick={() => downloadInvoicePDF(order)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-2xl shadow-sm transition shrink-0"
            >
              <Download size={18} /> Download PDF Invoice
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Progress Tracker */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm animate-fade-in-up">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="text-brand-600" /> Delivery Status
              </h2>

              {isCancelled ? (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                  <AlertCircle className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800">Order Cancelled</h3>
                    <p className="text-red-600 text-sm mt-1">This order was cancelled and will not be delivered.</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-100"></div>
                  <div 
                    className="absolute left-[19px] top-4 w-[2px] bg-brand-500 transition-all duration-1000 ease-in-out"
                    style={{ height: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                  ></div>

                  <div className="space-y-6 relative z-10">
                    {steps.map((s, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      
                      return (
                        <div key={s} className={`flex items-start gap-4 transition-opacity duration-300 ${!isCompleted && !isCurrent ? 'opacity-50' : ''}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-500 bg-white ${
                            isCompleted ? 'border-brand-500 text-brand-600' : 'border-gray-200 text-gray-300'
                          }`}>
                            {isCompleted ? <Check size={20} strokeWidth={3} /> : <Circle size={12} fill="currentColor" className="text-gray-200" />}
                          </div>
                          <div className="pt-2">
                            <p className={`font-semibold ${isCurrent ? 'text-brand-700' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                              {stepLabels[s]}
                            </p>
                            {isCurrent && s === 'out_for_delivery' && (
                              <p className="text-sm text-brand-600 font-medium mt-1 animate-pulse">Your fresh produce is arriving soon!</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {!isCancelled && order.estimatedDeliveryTime && normalizedStatus !== 'delivered' && (
                <div className="mt-8 bg-brand-50 p-4 rounded-2xl flex items-center justify-between border border-brand-100">
                  <div className="flex items-center gap-3 text-brand-800">
                    <Clock size={20} />
                    <span className="font-semibold">Estimated Arrival</span>
                  </div>
                  <span className="text-xl font-display font-bold text-brand-600">
                    {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="text-brand-600" /> Order Items
              </h2>
              
              <div className="divide-y divide-gray-50">
                {order.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-400">
                        {i.quantity}x
                      </div>
                      <p className="font-semibold text-gray-800">{i.name}</p>
                    </div>
                    <span className="font-semibold text-gray-900">Rs. {i.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-6 space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">Rs. {order.itemsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery fee</span>
                  <span className="font-semibold text-gray-900">Rs. {order.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end pt-4 mt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total Paid</span>
                  <span className="text-2xl font-bold text-brand-600">Rs. {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 space-y-6">
            
            {/* Delivery Details */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-lg font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-brand-600" size={20} /> Delivery Details
              </h2>
              
              <div className="bg-gray-50 p-4 rounded-2xl mb-4">
                <p className="font-semibold text-gray-900">{order.deliveryAddress.label || 'Delivery Address'}</p>
                <p className="text-gray-500 mt-1">{order.deliveryAddress.line1}</p>
                <p className="text-gray-500">{order.deliveryAddress.city}</p>
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <MapView destination={order.deliveryAddress} height={200} />
              </div>
            </div>

            {/* Driver Info */}
            {!isCancelled && order.driver && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg shrink-0">
                  {order.driver.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">Your Driver</p>
                  <p className="font-semibold text-gray-900">{order.driver.name}</p>
                  <p className="text-sm text-gray-500">{order.driver.vehicleNumber}</p>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-lg font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt className="text-brand-600" size={20} /> Payment Method
              </h2>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium capitalize">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                  {order.paymentMethod === 'cod' && normalizedStatus !== 'delivered' ? 'To be paid' : 'Paid'}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { orderApi } from '../api/services';
import MapView from '../components/MapView';
import { Package, Truck, CheckCircle2, MapPin, Clock, ArrowLeft, Phone, Calendar, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const STATUS_STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Package },
  { id: 'processing', label: 'Processing', icon: Clock },
  { id: 'packed', label: 'Packed', icon: MapPin },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getById(orderId);
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-xl text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <Link to="/profile" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} /> Back to Orders
          </Link>
        </div>
      </Layout>
    );
  }

  let normalizedStatus = (order.status || '').trim().toLowerCase();
  if (normalizedStatus === 'confirmed') normalizedStatus = 'processing';
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === normalizedStatus);

  return (
    <Layout>
      <div className="bg-gray-50 py-12 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/profile" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-600 font-medium mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to My Orders
          </Link>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-100 bg-brand-50/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-display font-bold text-gray-900">Track Order</h1>
                    <span className="bg-brand-100 text-brand-700 font-bold px-3 py-1 rounded-full text-sm">
                      #{order.orderNumber}
                    </span>
                  </div>
                  <p className="text-gray-500 flex items-center gap-2 text-sm">
                    <Calendar size={16} />
                    Placed on {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(order.createdAt))}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">Rs. {order.totalAmount?.toLocaleString()}</p>
                  
                  {order.invoiceUrl && (
                    <a 
                      href={`http://localhost:5000${order.invoiceUrl}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      <Download size={14} /> Download Invoice
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Status Stepper */}
              <div className="mb-12 relative">
                {/* Connecting Line */}
                <div className="absolute top-7 left-[10%] right-[10%] h-1 bg-gray-100 rounded-full -z-0 hidden md:block">
                  <div 
                    className="h-full bg-brand-500 transition-all duration-1000 ease-in-out"
                    style={{ width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6 md:gap-0">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 shrink-0 ${
                          isCompleted 
                            ? 'bg-brand-500 border-brand-100 text-white shadow-lg shadow-brand-500/30' 
                            : 'bg-white border-gray-100 text-gray-300'
                        } ${isCurrent ? 'scale-110 ring-4 ring-brand-50' : ''}`}>
                          <Icon size={24} />
                        </div>
                        <div className="md:text-center flex-1">
                          <p className={`font-bold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {isCurrent && normalizedStatus === 'out_for_delivery' && (
                            <p className="text-xs text-brand-600 font-medium mt-1">Arriving soon!</p>
                          )}
                          {isCurrent && normalizedStatus === 'delivered' && (
                            <p className="text-xs text-green-600 font-medium mt-1">Enjoy your fresh food!</p>
                          )}
                        </div>
                        {/* Mobile line connecting steps */}
                        {idx !== STATUS_STEPS.length - 1 && (
                          <div className="w-0.5 h-10 bg-gray-100 md:hidden ml-7 mt-2 -mb-6 relative -z-10">
                            {currentStepIndex > idx && (
                              <div className="w-full h-full bg-brand-500" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QR Code and Delivery Map */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                
                {/* QR Code Section (Only show if not delivered) */}
                {order.qrCodeToken && normalizedStatus !== 'delivered' && normalizedStatus !== 'cancelled' && (
                  <div className="bg-brand-50/50 rounded-2xl p-6 border border-brand-100 flex flex-col items-center justify-center animate-scale-up">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-2">
                      <QrCode size={20} className="text-brand-600" /> Delivery Verification
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-6">Show this QR code to the driver upon delivery to securely verify and complete your order.</p>
                    
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-brand-200">
                      <QRCodeSVG value={order.qrCodeToken} size={150} level="M" fgColor="#15803d" />
                    </div>
                  </div>
                )}
                
                {/* Map Section */}
                <div className={`space-y-4 ${!(order.qrCodeToken && normalizedStatus !== 'delivered' && normalizedStatus !== 'cancelled') ? 'lg:col-span-2' : ''}`}>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <MapPin size={20} className="text-brand-500" /> Live Delivery Map
                  </h3>
                  
                  {order.deliveryMethod === 'Pickup' ? (
                    <div className="bg-brand-50 rounded-2xl p-8 text-center text-brand-700 border border-brand-100 h-[320px] flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-brand-500">
                        <MapPin size={32} />
                      </div>
                      <h4 className="font-bold text-lg mb-2">Store Pickup</h4>
                      <p className="text-sm">Please collect your order at our Negombo store.</p>
                      <p className="text-xs font-bold mt-4 opacity-70">123 Main Road, Negombo, Sri Lanka</p>
                    </div>
                  ) : order.deliveryAddress?.coordinates?.lat ? (
                    <div className="relative rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow-sm h-[320px]">
                      {/* Leaflet map using OpenStreetMap routing */}
                      <MapView 
                        destination={{ 
                          lat: order.deliveryAddress.coordinates.lat, 
                          lng: order.deliveryAddress.coordinates.lng 
                        }} 
                        driverLocation={order.driverLocation}
                        height={320}
                      />
                      {normalizedStatus === 'out_for_delivery' && (
                        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between z-[1000]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 animate-pulse">
                              <Truck size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900">Driver is on the way</p>
                              <p className="text-xs text-gray-500">Tracking active</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-500 border border-gray-200 h-[320px] flex flex-col items-center justify-center">
                      <MapPin size={32} className="mb-4 text-gray-300" />
                      <p>Location coordinates unavailable.</p>
                    </div>
                  )}

                  {/* Delivery Address Details */}
                  {order.deliveryMethod === 'Delivery' && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</p>
                      <p className="font-medium text-gray-900">{order.customer?.name}</p>
                      <p className="text-gray-600 text-sm mt-1">{order.deliveryAddress?.line1}</p>
                      {order.deliveryAddress?.line2 && <p className="text-gray-600 text-sm">{order.deliveryAddress?.line2}</p>}
                      <p className="text-gray-600 text-sm">{order.deliveryAddress?.city}</p>
                      <p className="text-gray-600 text-sm flex items-center gap-2 mt-2">
                        <Phone size={14} className="text-brand-500" /> {order.customer?.phone}
                      </p>
                    </div>
                  )}

                  {/* Delivery Metrics */}
                  {order.deliveryDistanceKm > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Distance</p>
                        <p className="font-semibold text-gray-900">{order.deliveryDistanceKm.toFixed(1)} km</p>
                      </div>
                      <div className="w-px h-8 bg-gray-100"></div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Est. Time</p>
                        <p className="font-semibold text-gray-900">{order.deliveryEstimatedMins} mins</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <Package size={20} className="text-brand-500" /> Order Summary
                  </h3>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-100 max-h-[250px] overflow-y-auto custom-scrollbar">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                          <img 
                            src={item.image || 'https://via.placeholder.com/60?text=No+Image'} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-xl border border-gray-100 bg-white"
                          />
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Rs {item.price} x {item.quantity}</p>
                          </div>
                          <p className="font-bold text-brand-700">Rs {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 p-5 border-t border-gray-100 space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">Rs {order.subtotal?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Delivery Fee</span>
                        <span className="font-medium">Rs {order.deliveryFee?.toLocaleString()}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span className="font-medium">- Rs {order.discount?.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-brand-700">Rs {order.totalAmount?.toLocaleString()}</span>
                      </div>
                      <div className="mt-2 text-right">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

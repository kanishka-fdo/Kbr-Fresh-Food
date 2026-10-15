import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { inventoryApi } from '../../api/services';
import {
  Package, AlertTriangle, TrendingUp, TrendingDown, BarChart3,
  Droplets, Zap, MapPin, RefreshCw, Download, ShoppingCart,
  ArrowRight, CheckCircle2, XCircle, ChevronRight, Star,
  Thermometer, Activity, DollarSign, Clock, Building2, Truck
} from 'lucide-react';
import { exportToCSV } from '../../utils/csvExport';

const TABS = [
  { id: 'health', label: 'Inventory Health', icon: Activity },
  { id: 'freshness', label: 'Freshness Scores', icon: Droplets },
  { id: 'pricing', label: 'Dynamic Pricing', icon: DollarSign },
  { id: 'forecast', label: 'AI Demand Forecast', icon: TrendingUp },
  { id: 'allocation', label: 'Keells Allocation', icon: Building2 },
  { id: 'warehouse', label: 'Warehouse Map', icon: MapPin },
  { id: 'performance', label: 'Supplier Performance', icon: Star },
  { id: 'reorder', label: 'Reorder Alerts', icon: AlertTriangle },
];

function FreshnessBar({ score }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : score >= 20 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold w-10 text-right ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : score >= 20 ? 'text-orange-600' : 'text-red-600'}`}>
        {score}%
      </span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminInventory() {
  const [tab, setTab] = useState('health');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});

  const load = useCallback(async (tabId) => {
    if (data[tabId] && !loading[tabId]) return;
    setLoading(prev => ({ ...prev, [tabId]: true }));
    try {
      let res;
      if (tabId === 'health') res = await inventoryApi.health();
      else if (tabId === 'freshness') res = await inventoryApi.freshness();
      else if (tabId === 'pricing') res = await inventoryApi.dynamicPricing();
      else if (tabId === 'forecast') res = await inventoryApi.forecast();
      else if (tabId === 'allocation') res = await inventoryApi.allocation();
      else if (tabId === 'warehouse') res = await inventoryApi.warehouseMap();
      else if (tabId === 'performance') res = await inventoryApi.supplierPerformance();
      else if (tabId === 'reorder') res = await inventoryApi.reorder();
      setData(prev => ({ ...prev, [tabId]: res.data }));
    } catch (err) {
      console.error(`Failed to load ${tabId}:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [tabId]: false }));
    }
  }, [data, loading]);

  useEffect(() => { load(tab); }, [tab]);

  const refresh = () => {
    setData(prev => { const n = {...prev}; delete n[tab]; return n; });
  };

  const isLoading = loading[tab];
  const tabData = data[tab];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={20} className="text-brand-600" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Advanced</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Inventory Intelligence</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered inventory insights, demand forecasting & smart allocation</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 mb-8 bg-gray-50 p-1 rounded-2xl border border-gray-100">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-white text-brand-700 shadow-sm border border-brand-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
          <p className="text-gray-400 text-sm">Loading intelligence data...</p>
        </div>
      ) : !tabData ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p>No data available. Click Refresh to load.</p>
        </div>
      ) : (
        <>
          {/* ── HEALTH TAB ── */}
          {tab === 'health' && tabData.summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Package} label="Total Products" value={tabData.summary.totalProducts} color="brand" />
                <StatCard icon={AlertTriangle} label="Low Stock" value={tabData.summary.lowStockCount} sub="Need reorder" color="red" />
                <StatCard icon={Clock} label="Near Expiry" value={tabData.summary.nearExpiryCount} sub="Within 5 days" color="yellow" />
                <StatCard icon={DollarSign} label="Inventory Value" value={`Rs ${(tabData.summary.totalInventoryValue || 0).toLocaleString()}`} sub="At cost price" color="green" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" /> Low Stock Items</h3>
                    <button onClick={() => exportToCSV(tabData.lowStock?.map(p => ({ Name: p.name, Stock: p.stockQuantity, Unit: p.unit, Threshold: p.lowStockThreshold, Recommended: p.recommendedPurchase })), 'Low_Stock')} className="text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1"><Download size={12} /> Export</button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {tabData.lowStock?.slice(0, 8).map(p => (
                      <div key={p._id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category} · Stock: <span className="text-red-600 font-bold">{p.stockQuantity}</span>/{p.lowStockThreshold} {p.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-brand-700">Buy {p.recommendedPurchase} {p.unit}</p>
                          <p className="text-xs text-gray-400">≈ Rs {(p.recommendedPurchase * p.purchasePrice).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {(!tabData.lowStock || tabData.lowStock.length === 0) && (
                      <div className="px-5 py-8 text-center text-gray-400 text-sm">✅ All products are well-stocked!</div>
                    )}
                  </div>
                </div>

                {/* Fast Movers */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><TrendingUp size={16} className="text-green-500" /> Fast Moving Products</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {tabData.fastMovers?.map((p, i) => (
                      <div key={p.productId} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">#{i+1}</span>
                          <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{p.qty} kg sold</p>
                          <p className="text-xs text-green-600">Rs {p.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {(!tabData.fastMovers || tabData.fastMovers.length === 0) && (
                      <div className="px-5 py-8 text-center text-gray-400 text-sm">No sales data yet</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Near Expiry */}
              {tabData.nearExpiry?.length > 0 && (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-red-100 bg-red-50/50">
                    <h3 className="font-bold text-red-700 flex items-center gap-2"><AlertTriangle size={16} /> Near-Expiry Products — Action Required</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="px-5 py-3">Product</th>
                          <th className="px-5 py-3">Stock</th>
                          <th className="px-5 py-3">Days Left</th>
                          <th className="px-5 py-3">Freshness</th>
                          <th className="px-5 py-3">Suggested Price</th>
                          <th className="px-5 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {tabData.nearExpiry.map(p => (
                          <tr key={p._id} className="hover:bg-red-50/30 transition-colors">
                            <td className="px-5 py-3 font-semibold text-gray-900">{p.name}</td>
                            <td className="px-5 py-3 text-gray-600">{p.stockQuantity} {p.unit}</td>
                            <td className="px-5 py-3">
                              <span className={`font-bold ${p.daysLeft <= 1 ? 'text-red-600' : p.daysLeft <= 3 ? 'text-orange-600' : 'text-yellow-600'}`}>
                                {p.daysLeft} day{p.daysLeft !== 1 ? 's' : ''}
                              </span>
                            </td>
                            <td className="px-5 py-3 w-36">
                              <FreshnessBar score={p.freshnessScore ?? 0} />
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-brand-700 font-bold">Rs {p.suggestedPrice?.toLocaleString()}</span>
                              <span className="text-xs text-gray-400 ml-1">(was {p.retailPrice?.toLocaleString()})</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                                {p.daysLeft <= 1 ? '⚠️ Discard/Discount' : 'Apply Discount'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── FRESHNESS TAB ── */}
          {tab === 'freshness' && tabData.products && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><Droplets size={16} className="text-blue-500" /> Product Freshness Scores</h3>
                <button onClick={() => exportToCSV(tabData.products.map(p => ({ Name: p.name, Stock: p.stockQuantity, Unit: p.unit, Freshness: `${p.freshnessScore}%`, DaysLeft: p.daysLeft, Recommendation: p.recommendation })), 'Freshness_Report')} className="text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1"><Download size={12} /> Export</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Stock</th>
                      <th className="px-5 py-3">Zone</th>
                      <th className="px-5 py-3">Days Left</th>
                      <th className="px-5 py-3 w-48">Freshness Score</th>
                      <th className="px-5 py-3">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tabData.products.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-5 py-3 font-semibold text-gray-900">{p.name}</td>
                        <td className="px-5 py-3 text-gray-500">{p.category}</td>
                        <td className="px-5 py-3 text-gray-600">{p.stockQuantity} {p.unit}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{p.warehouseZone}</td>
                        <td className="px-5 py-3">
                          {p.daysLeft != null ? (
                            <span className={`font-bold ${p.daysLeft <= 1 ? 'text-red-600' : p.daysLeft <= 3 ? 'text-orange-500' : p.daysLeft <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>{p.daysLeft}d</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3 w-48">
                          {p.freshnessScore != null ? <FreshnessBar score={p.freshnessScore} /> : <span className="text-gray-300 text-xs">No expiry set</span>}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-600">{p.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── DYNAMIC PRICING TAB ── */}
          {tab === 'pricing' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 flex items-start gap-3">
                <Zap size={18} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <div>
                  <strong>Dynamic Pricing Engine</strong> — Prices are automatically suggested based on remaining shelf life, current stock, and seasonal demand. Apply these prices to reduce waste and maximize revenue.
                </div>
              </div>
              {tabData.suggestions?.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">✅ All products are at full freshness — no price adjustments needed!</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tabData.suggestions?.map(p => (
                  <div key={p._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${p.urgency === 'critical' ? 'border-red-200' : p.urgency === 'high' ? 'border-orange-200' : 'border-yellow-200'}`}>
                    <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider text-white ${p.urgency === 'critical' ? 'bg-red-500' : p.urgency === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                      {p.urgency === 'critical' ? '🚨 Critical' : p.urgency === 'high' ? '⚠️ High Priority' : '📌 Monitor'} · {p.freshnessScore}% Fresh
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-1">{p.name}</h4>
                      <p className="text-xs text-gray-400 mb-3">{p.category} · {p.stockQuantity} {p.unit} in stock</p>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 text-center bg-gray-50 rounded-xl p-2">
                          <div className="text-xs text-gray-400">Normal Price</div>
                          <div className="font-bold text-gray-500 line-through">Rs {p.retailPrice}</div>
                        </div>
                        <ArrowRight size={16} className="text-gray-300" />
                        <div className="flex-1 text-center bg-green-50 rounded-xl p-2">
                          <div className="text-xs text-green-600">Suggested</div>
                          <div className="font-bold text-green-700">Rs {p.suggestedPrice}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 text-center">{p.discount}% discount · Est. revenue: Rs {p.potentialRevenue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FORECAST TAB ── */}
          {tab === 'forecast' && tabData.forecast && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><TrendingUp size={16} className="text-brand-600" /> AI Demand Forecast</h3>
                  <p className="text-xs text-gray-400 mt-1">Based on historical sales velocity over 90 days</p>
                </div>
                <button onClick={() => exportToCSV(tabData.forecast.map(p => ({ Name: p.name, 'Daily Velocity': p.dailyVelocity, 'Weekly Demand': p.weeklyDemand, 'Monthly Demand': p.monthlyDemand, 'Days Until Stockout': p.daysUntilStockout ?? 'N/A', 'Recommended Purchase': p.recommendedPurchase, 'Est. Cost Rs': p.estimatedCost })), 'Demand_Forecast')} className="text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1"><Download size={12} /> Export</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Daily Velocity</th>
                      <th className="px-5 py-3">Weekly Demand</th>
                      <th className="px-5 py-3">Monthly Demand</th>
                      <th className="px-5 py-3">Days to Stockout</th>
                      <th className="px-5 py-3">Recommend Buy</th>
                      <th className="px-5 py-3">Est. Cost</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tabData.forecast.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-5 py-3 font-semibold text-gray-900">{p.name}</td>
                        <td className="px-5 py-3 text-gray-600">{p.dailyVelocity} {p.unit}</td>
                        <td className="px-5 py-3 text-gray-600">{p.weeklyDemand} {p.unit}</td>
                        <td className="px-5 py-3 text-gray-600">{p.monthlyDemand} {p.unit}</td>
                        <td className="px-5 py-3">
                          {p.daysUntilStockout != null ? (
                            <span className={`font-bold ${p.daysUntilStockout <= 3 ? 'text-red-600' : p.daysUntilStockout <= 7 ? 'text-orange-500' : 'text-green-600'}`}>
                              {p.daysUntilStockout}d
                            </span>
                          ) : <span className="text-gray-300">N/A</span>}
                        </td>
                        <td className="px-5 py-3 font-bold text-brand-700">{p.recommendedPurchase} {p.unit}</td>
                        <td className="px-5 py-3 text-gray-600">Rs {p.estimatedCost.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                            p.stockStatus === 'Critical' ? 'bg-red-100 text-red-700' :
                            p.stockStatus === 'Low' ? 'bg-orange-100 text-orange-700' :
                            p.stockStatus === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                            p.stockStatus === 'Good' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {p.stockStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ALLOCATION TAB ── */}
          {tab === 'allocation' && tabData.allocations && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 flex items-start gap-3">
                <Building2 size={18} className="mt-0.5 flex-shrink-0 text-blue-600" />
                <div>
                  <strong>Smart Inventory Allocation</strong> — System automatically recommends how to distribute available stock among Keells Super and Food City branches based on priority and demand.
                </div>
              </div>
              <div className="space-y-4">
                {tabData.allocations?.slice(0, 15).map(p => (
                  <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900">{p.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{p.category} · Available: <span className="font-bold text-brand-700">{p.available} {p.unit}</span></span>
                      </div>
                      <span className="text-xs text-gray-400">Reserve: {p.wholesaleReserve} {p.unit}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase">
                          <tr>
                            <th className="px-5 py-2">Branch</th>
                            <th className="px-5 py-2 text-right">Requested</th>
                            <th className="px-5 py-2 text-right">Available</th>
                            <th className="px-5 py-2 text-right">Allocated</th>
                            <th className="px-5 py-2">Priority</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {p.branches.map(b => (
                            <tr key={b.name} className="hover:bg-gray-50/50">
                              <td className="px-5 py-2 font-medium text-gray-900">{b.name}</td>
                              <td className="px-5 py-2 text-right text-gray-500">{b.requested} {p.unit}</td>
                              <td className="px-5 py-2 text-right text-gray-500">{p.distributable} {p.unit}</td>
                              <td className="px-5 py-2 text-right">
                                <span className="font-bold text-brand-700">{b.allocated} {p.unit}</span>
                              </td>
                              <td className="px-5 py-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${b.priority === 1 ? 'bg-green-100 text-green-700' : b.priority === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                  P{b.priority}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── WAREHOUSE MAP TAB ── */}
          {tab === 'warehouse' && tabData.heatmap && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tabData.heatmap.map(zone => (
                  <div key={zone.zone} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${zone.status === 'critical' ? 'border-red-200' : zone.status === 'warning' ? 'border-yellow-200' : 'border-green-200'}`}>
                    <div className={`px-5 py-3 flex items-center justify-between ${zone.status === 'critical' ? 'bg-red-50' : zone.status === 'warning' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className={zone.status === 'critical' ? 'text-red-600' : zone.status === 'warning' ? 'text-yellow-600' : 'text-green-600'} />
                        <h3 className="font-bold text-gray-900">{zone.zone}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Avg Freshness</div>
                        <div className={`font-bold text-sm ${zone.status === 'critical' ? 'text-red-600' : zone.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {zone.avgFreshness}%
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      {zone.products.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">No products in this zone</p>
                      ) : (
                        <div className="space-y-3">
                          {zone.products.map(p => (
                            <div key={p._id} className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.isExpiringSoon ? 'bg-red-500' : p.isLowStock ? 'bg-yellow-500' : 'bg-green-500'}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{p.stockQuantity} {p.unit}</span>
                                </div>
                                {p.freshnessScore != null && <FreshnessBar score={p.freshnessScore} />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Near Expiry</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Low Stock</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Good</span>
              </div>
            </div>
          )}

          {/* ── SUPPLIER PERFORMANCE TAB ── */}
          {tab === 'performance' && tabData.suppliers && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Supplier Performance Scores</h3>
                <button onClick={() => exportToCSV(tabData.suppliers.map(s => ({ ID: s.supplierId, Name: s.name, Mobile: s.mobile, Orders: s.totalOrders, 'Total Value Rs': s.totalValue, 'Paid Orders': s.paidOrders, 'Score %': s.performanceScore })), 'Supplier_Performance')} className="text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1"><Download size={12} /> Export</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3">Rank</th>
                      <th className="px-5 py-3">Supplier</th>
                      <th className="px-5 py-3">Mobile</th>
                      <th className="px-5 py-3 text-center">Total Orders</th>
                      <th className="px-5 py-3 text-right">Total Value</th>
                      <th className="px-5 py-3 text-center">Payment Rate</th>
                      <th className="px-5 py-3 w-48">Performance Score</th>
                      <th className="px-5 py-3">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tabData.suppliers.map((s, i) => (
                      <tr key={s._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-5 py-3 text-gray-400 text-xs font-bold">#{i + 1}</td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.supplierId}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{s.mobile || '—'}</td>
                        <td className="px-5 py-3 text-center font-bold text-gray-700">{s.totalOrders}</td>
                        <td className="px-5 py-3 text-right text-gray-700">
                          {s.totalValue > 0 ? `Rs ${s.totalValue.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {s.totalOrders > 0 ? `${s.onTimePaymentRate}%` : '—'}
                        </td>
                        <td className="px-5 py-3 w-48">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${s.performanceScore >= 80 ? 'bg-green-500' : s.performanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-400'}`} style={{ width: `${s.performanceScore}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-600 w-8">{s.performanceScore}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {s.purchaseDue !== 0 ? (
                            <span className={`text-xs font-bold ${s.purchaseDue > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              Rs {Math.abs(s.purchaseDue).toLocaleString()}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── REORDER TAB ── */}
          {tab === 'reorder' && (
            <div className="space-y-4">
              {tabData.count === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                  <h3 className="font-bold text-green-700 text-lg">All Stock Levels Healthy!</h3>
                  <p className="text-green-600 text-sm mt-1">No products need reordering at this time.</p>
                </div>
              ) : (
                <>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800 flex items-start gap-3">
                    <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-red-600" />
                    <div><strong>{tabData.count} products</strong> need immediate reorder attention. Total estimated cost: <strong>Rs {tabData.recommendations?.reduce((s, r) => s + r.estimatedCost, 0).toLocaleString()}</strong></div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Automatic Purchase Recommendations</h3>
                      <button onClick={() => exportToCSV(tabData.recommendations?.map(r => ({ Product: r.name, Category: r.category, Unit: r.unit, 'Current Stock': r.currentStock, 'Min Stock': r.minimumStock, 'Recommended Buy': r.recommendedPurchase, 'Supplier': r.supplierName, 'Est. Cost Rs': r.estimatedCost, Urgency: r.urgency })), 'Reorder_Recommendations')} className="text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1"><Download size={12} /> Export</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {tabData.recommendations?.map(r => (
                        <div key={r._id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${r.urgency === 'Out of Stock' ? 'bg-red-500' : 'bg-orange-400'}`} />
                            <div>
                              <p className="font-bold text-gray-900">{r.name}</p>
                              <p className="text-xs text-gray-400">{r.category} · Supplier: {r.supplierName}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-400">Current: <span className="text-red-600 font-bold">{r.currentStock} {r.unit}</span></span>
                                <span className="text-xs text-gray-400">Min: <span className="font-bold">{r.minimumStock} {r.unit}</span></span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-brand-700">Buy {r.recommendedPurchase} {r.unit}</p>
                            <p className="text-xs text-gray-400">≈ Rs {r.estimatedCost.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold mt-1 inline-block ${r.urgency === 'Out of Stock' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                              {r.urgency}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

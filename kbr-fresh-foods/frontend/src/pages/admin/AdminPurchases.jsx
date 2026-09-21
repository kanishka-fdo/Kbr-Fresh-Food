import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { purchaseApi } from '../../api/services';
import { 
  ShoppingCart,
  CheckCircle2, XCircle, Search, 
  Download
} from 'lucide-react';
import { exportToCSV } from '../../utils/csvExport';

export default function AdminPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await purchaseApi.getAll();
      setPurchases(res.data.purchases || []);
    } catch (err) {
      console.error('AdminPurchases load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = purchases.filter((p) =>
    !search || p.supplierName?.toLowerCase().includes(search.toLowerCase()) || p.purchaseCode?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const csvData = filtered.map(p => ({
      'Code': p.purchaseCode || '',
      'Date': p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : '',
      'Supplier': p.supplierName || '',
      'Total (Rs)': p.total || 0,
      'Paid (Rs)': p.paidPayment || 0,
      'Due (Rs)': p.due || 0,
      'Status': p.paymentStatus || ''
    }));
    exportToCSV(csvData, 'KBR_Purchases');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={20} className="text-brand-600" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Inventory</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Track purchases from suppliers</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or supplier..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">Code / Date</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">Supplier</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100 text-right">Total</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100 text-right">Paid</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100 text-right">Due</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <p className="font-medium text-gray-500">No purchases found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{p.purchaseCode}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{new Date(p.purchaseDate).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{p.supplierName}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-900">Rs. {p.total?.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                      Rs. {p.paidPayment?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-red-600 font-medium">
                      Rs. {p.due?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        p.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

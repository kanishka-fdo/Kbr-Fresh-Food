import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supplierApi } from '../../api/services';
import { 
  Building2,
  CheckCircle2, XCircle, Search, 
  Download, Filter
} from 'lucide-react';
import { exportToCSV } from '../../utils/csvExport';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await supplierApi.getAll();
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.error('AdminSuppliers load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = suppliers.filter((s) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.supplierId?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const csvData = filtered.map(s => ({
      'Supplier ID': s.supplierId || '',
      'Name': s.name || '',
      'Mobile': s.mobile || '',
      'Email': s.email || '',
      'Purchase Due (Rs)': s.purchaseDue || 0,
      'Return Due (Rs)': s.purchaseReturnDue || 0,
      'Status': s.status || ''
    }));
    exportToCSV(csvData, 'KBR_Suppliers');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={20} className="text-brand-600" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Partners</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage suppliers, balances, and status</p>
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
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">Supplier</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">Contact</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100 text-right">Purchase Due</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100 text-right">Return Due</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    <p className="font-medium text-gray-500">No suppliers found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{s.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{s.supplierId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{s.mobile || '—'}</p>
                      <p className="text-gray-500 text-xs">{s.email || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">Rs. {s.purchaseDue?.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">Rs. {s.purchaseReturnDue?.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {s.status === 'Active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {s.status}
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

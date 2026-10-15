import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { userApi, wholesaleApi } from '../../api/services';
import {
  Users, Shield, Truck,
  CheckCircle2, XCircle, ChevronDown, Search,
  Building2, Download, AlertCircle, RefreshCw, UserPlus, X
} from 'lucide-react';
import { exportToCSV } from '../../utils/csvExport';

const roles = ['customer', 'staff', 'admin', 'driver', 'wholesale'];

const roleConfig = {
  customer:  { color: 'bg-blue-50 text-blue-700 border border-blue-200',    icon: Users,     label: 'Customers' },
  staff:     { color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: Shield, label: 'Staff' },
  admin:     { color: 'bg-purple-50 text-purple-700 border border-purple-200',    icon: Shield, label: 'Admins' },
  driver:    { color: 'bg-amber-50 text-amber-700 border border-amber-200',  icon: Truck,     label: 'Drivers' },
  wholesale: { color: 'bg-cyan-50 text-cyan-700 border border-cyan-200',     icon: Building2, label: 'B2B Partners' },
};

const getRoleConfig = (role) => roleConfig[role] || roleConfig.customer;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pendingBuyers, setPendingBuyers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Create Staff state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', phone: '', role: 'staff', vehicleNumber: '', businessName: '', businessRegNo: '' });
  const [creating, setCreating] = useState(false);

  // Edit User state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', vehicleNumber: '', businessName: '', businessRegNo: '', isAvailable: true });
  const [editing, setEditing] = useState(false);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await userApi.createStaff(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', phone: '', role: 'staff', vehicleNumber: '', businessName: '', businessRegNo: '' });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      vehicleNumber: user.vehicleNumber || '',
      businessName: user.businessName || '',
      businessRegNo: user.businessRegNo || '',
      isAvailable: user.isAvailable ?? true,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      await userApi.updateDetails(editingUser._id, editForm);
      setEditingUser(null);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update details');
    } finally {
      setEditing(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [uRes, pRes] = await Promise.allSettled([
        userApi.getAll(roleFilter || undefined),
        wholesaleApi.pendingBuyers(),
      ]);
      if (uRes.status === 'fulfilled') {
        setUsers(Array.isArray(uRes.value?.data?.users) ? uRes.value.data.users : []);
      } else {
        console.error('Failed to load users:', uRes.reason);
        setError('Could not load users. Please try again.');
      }
      if (pRes.status === 'fulfilled') {
        setPendingBuyers(Array.isArray(pRes.value?.data?.buyers) ? pRes.value.data.buyers : []);
      }
    } catch (err) {
      console.error('AdminUsers load error:', err);
      setError('Server error while loading users.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (id, role) => {
    setActionLoading(id + '_role');
    try {
      await userApi.updateRole(id, role);
      await load();
    } catch (err) {
      alert('Failed to update role: ' + (err?.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (id, isActive) => {
    if (!confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this user?`)) return;
    setActionLoading(id + '_deactivate');
    try {
      await userApi.deactivate(id);
      await load();
    } catch (err) {
      alert('Failed to update status: ' + (err?.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveBuyer = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await wholesaleApi.approveBuyer(id);
      await load();
    } catch (err) {
      alert('Failed to approve buyer: ' + (err?.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!u) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.customerId?.toLowerCase().includes(q)
    );
  });

  const stats = roles.map((r) => ({
    role: r,
    count: users.filter((u) => u?.role === r).length,
  }));

  const handleExportCSV = () => {
    const csvData = filtered.map(u => ({
      'Name': u.name || '',
      'Email': u.email || '',
      'Phone': u.phone || '',
      'Role': u.role || 'customer',
      'Status': u.isActive ? 'Active' : 'Disabled',
      'Joined': u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-LK') : '',
      'Customer ID': u.customerId || '',
      'Sales Due': u.salesDue || 0
    }));
    exportToCSV(csvData, 'KBR_Users');
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} className="text-brand-600" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Access Control</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage accounts, permissions, and wholesale approvals</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <UserPlus size={16} /> Add User
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Help info for assigning drivers */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3 text-blue-800 shadow-sm">
        <div className="bg-blue-100 p-2 rounded-full shrink-0 mt-0.5">
          <Truck size={18} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-sm">How to add a new Delivery Driver?</h3>
          <p className="text-sm mt-0.5 opacity-90">
            Find the user's account in the table below and change their <strong>Role</strong> to <span className="font-semibold bg-white px-1.5 py-0.5 rounded border border-blue-100 text-blue-700 text-xs shadow-sm">Drivers</span>. They will immediately appear in the order assignment list.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-medium">{error}</p>
          <button onClick={load} className="ml-auto text-sm font-bold underline">Retry</button>
        </div>
      )}

      {/* Role Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s, idx) => {
          const config = getRoleConfig(s.role);
          const Icon = config.icon;
          const isActive = roleFilter === s.role;
          return (
            <div
              key={s.role}
              onClick={() => setRoleFilter(isActive ? '' : s.role)}
              className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all hover:-translate-y-1 ${
                isActive
                  ? 'border-brand-500 shadow-md ring-1 ring-brand-500'
                  : 'border-gray-100 shadow-sm hover:shadow-md'
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                  <Icon size={20} />
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-brand-500"></div>}
              </div>
              <div className="text-2xl font-bold font-display text-gray-900">{s.count}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{config.label}</div>
            </div>
          );
        })}
      </div>

      {/* Pending Wholesale Approvals */}
      {pendingBuyers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 p-2 rounded-full">
              <Building2 size={20} className="text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Pending B2B Applications</h3>
              <p className="text-amber-700 text-sm">{pendingBuyers.length} wholesale accounts require approval</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {pendingBuyers.map((b) => {
              if (!b) return null;
              const displayName = b.businessName || b.name || 'Unknown';
              const firstChar = typeof displayName === 'string' ? displayName[0]?.toUpperCase() : '?';
              return (
                <div
                  key={b._id}
                  className="flex items-center justify-between gap-4 bg-white rounded-xl p-4 border border-amber-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center font-bold">
                      {firstChar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{b.email || '—'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApproveBuyer(b._id)}
                    disabled={actionLoading === b._id + '_approve'}
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-60"
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or customer ID..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
            />
          </div>
          {roleFilter && (
            <button
              onClick={() => setRoleFilter('')}
              className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl"
            >
              <XCircle size={13} /> Clear filter: {getRoleConfig(roleFilter).label}
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">User Details</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">Role</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">Status</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">Joined</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                    <p className="text-gray-400 text-sm mt-2">Loading users...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Users size={40} className="text-gray-200 mb-3 mx-auto" />
                    <p className="font-medium text-gray-500">
                      {search ? `No users found for "${search}"` : 'No users found'}
                    </p>
                    {search && (
                      <button onClick={() => setSearch('')} className="text-brand-600 text-sm mt-2 underline">
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  if (!u || !u._id) return null;
                  const rc = getRoleConfig(u.role);
                  return (
                    <tr key={u._id} className="hover:bg-gray-50/80 transition-colors group">
                      {/* User Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${rc.color}`}>
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              (u.name?.[0] || '?').toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
                              {u.name || 'Unknown User'}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">{u.email || '—'}</p>
                            {u.phone && <p className="text-gray-400 text-xs">{u.phone}</p>}
                            {u.customerId && (
                              <div className="flex gap-2 mt-1 items-center flex-wrap">
                                <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                  {u.customerId}
                                </span>
                                {u.salesDue > 0 && (
                                  <span className="text-[10px] text-red-600 font-bold">
                                    Due: Rs. {Number(u.salesDue).toLocaleString('en-LK')}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <div className="relative inline-block w-40">
                          <select
                            value={u.role || 'customer'}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={actionLoading === u._id + '_role'}
                            className={`w-full appearance-none border text-xs font-bold pr-8 pl-3 py-2 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all disabled:opacity-60 ${rc.color}`}
                          >
                            {roles.map((r) => (
                              <option key={r} value={r}>
                                {getRoleConfig(r).label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {u.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-LK', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm border text-brand-600 hover:text-white hover:bg-brand-500 border-brand-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeactivate(u._id, u.isActive)}
                          disabled={actionLoading === u._id + '_deactivate'}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm disabled:opacity-60 border ${
                            u.isActive 
                              ? 'text-red-600 hover:text-white hover:bg-red-500 border-red-200' 
                              : 'text-emerald-600 hover:text-white hover:bg-emerald-500 border-emerald-200'
                          }`}
                        >
                          {actionLoading === u._id + '_deactivate' ? '...' : (u.isActive ? 'Disable' : 'Enable')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
            <p>
              Showing <span className="font-bold text-gray-900">{filtered.length}</span> of{' '}
              <span className="font-bold text-gray-900">{users.length}</span> users
            </p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-display font-bold text-xl text-gray-900">Add Internal User</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Name</label>
                  <input required type="text" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Role</label>
                  <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="driver">Driver</option>
                    <option value="wholesale">Wholesale</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email</label>
                  <input required type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone</label>
                  <input required type="tel" value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="0771234567" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
                <input required type="password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="••••••••" />
              </div>

              {createForm.role === 'driver' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Vehicle Number</label>
                  <input required type="text" value={createForm.vehicleNumber} onChange={e => setCreateForm({...createForm, vehicleNumber: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="WP ABC-1234" />
                </div>
              )}

              {createForm.role === 'wholesale' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Business Name</label>
                    <input required type="text" value={createForm.businessName} onChange={e => setCreateForm({...createForm, businessName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Company Ltd" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Registration No</label>
                    <input type="text" value={createForm.businessRegNo} onChange={e => setCreateForm({...createForm, businessRegNo: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="PV 12345" />
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-display font-bold text-xl text-gray-900">Edit User Details</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Name</label>
                <input required type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone</label>
                <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="0771234567" />
              </div>

              {editingUser.role === 'driver' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Vehicle Number</label>
                    <input type="text" value={editForm.vehicleNumber} onChange={e => setEditForm({...editForm, vehicleNumber: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="WP ABC-1234" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={editForm.isAvailable} onChange={e => setEditForm({...editForm, isAvailable: e.target.checked})} className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4" />
                      Available for Delivery
                    </label>
                  </div>
                </>
              )}

              {editingUser.role === 'wholesale' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Business Name</label>
                    <input type="text" value={editForm.businessName} onChange={e => setEditForm({...editForm, businessName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Company Ltd" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Registration No</label>
                    <input type="text" value={editForm.businessRegNo} onChange={e => setEditForm({...editForm, businessRegNo: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="PV 12345" />
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition">Cancel</button>
                <button type="submit" disabled={editing} className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition disabled:opacity-50">
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

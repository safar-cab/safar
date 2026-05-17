import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ShieldBan, ShieldCheck, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { User } from '@/types';

export function UsersList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  // Block modal
  const [blockModal, setBlockModal] = useState(false);
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blocking, setBlocking] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res: any = await api.get('/admin/users', { params });
      setUsers(res.users || res.data || res || []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const openBlockModal = (user: User) => {
    setBlockTarget(user);
    setBlockReason('');
    setBlockModal(true);
  };

  const handleBlock = async () => {
    if (!blockTarget) return;
    setBlocking(true);
    try {
      await api.put(`/admin/users/${blockTarget._id}/block`, { reason: blockReason });
      toast.success('User blocked successfully');
      setBlockModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to block user');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/unblock`);
      toast.success('User unblocked successfully');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to unblock user');
    }
  };

  const getRoleBadgeStatus = (role: string) => {
    switch (role) {
      case 'admin': return 'driver_assigned';
      case 'driver': return 'confirmed';
      case 'customer': return 'created';
      default: return 'created';
    }
  };

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage all users" />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="w-64">
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-12 px-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 outline-none focus:border-primary-500"
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
        <Button variant="outline" onClick={handleSearch}>Search</Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="No users match the current filters."
        />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Phone</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Joined</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{user.phone}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{user.email || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge status={getRoleBadgeStatus(user.role)} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={user.isBlocked ? 'cancelled' : 'completed'} />
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                        {user.isBlocked ? (
                          <Button
                            size="sm"
                            onClick={() => handleUnblock(user._id)}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => openBlockModal(user)}
                          >
                            <ShieldBan className="w-3.5 h-3.5" />
                            Block
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-neutral-500">Showing {users.length} of {total}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}

      {/* Block Modal */}
      <Modal open={blockModal} onClose={() => setBlockModal(false)} title="Block User">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to block <span className="font-semibold">{blockTarget?.name}</span>?
          </p>
          <Input
            label="Reason for blocking"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Enter reason..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBlockModal(false)}>Cancel</Button>
            <Button variant="danger" loading={blocking} onClick={handleBlock}>Block User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Tooltip } from '@/components/ui/Tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatPhone } from '@/utils/format';
import type { User } from '@/types';

interface SelectOption {
  value: string;
  label: string;
}

export function UsersList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);

  // Block modal
  const [blockModal, setBlockModal] = useState(false);
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blocking, setBlocking] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await api.get('/lookup/user-roles') as string[];
      setRoleOptions(res.map((r) => ({
        value: r,
        label: r.charAt(0).toUpperCase() + r.slice(1),
      })));
    } catch {
      setRoleOptions([
        { value: 'customer', label: 'Customer' },
        { value: 'driver', label: 'Driver' },
        { value: 'admin', label: 'Admin' },
      ]);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };
      if (roleFilter) params.role = roleFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get('/admin/users', { params }) as {
        users?: User[];
        data?: User[];
        total?: number;
        totalPages?: number;
      };
      setUsers((res.users || res.data || []) as User[]);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  const handleSort = useCallback((field: string) => {
    setSortOrder(sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortBy(field);
  }, [sortBy, sortOrder]);

  const openBlockModal = useCallback((user: User) => {
    setBlockTarget(user);
    setBlockReason('');
    setBlockModal(true);
  }, []);

  const handleBlock = useCallback(async () => {
    if (!blockTarget) return;
    setBlocking(true);
    try {
      await api.put(`/admin/users/${blockTarget._id}/block`, { reason: blockReason });
      toast.success('User blocked successfully');
      setBlockModal(false);
      fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to block user';
      toast.error(message);
    } finally {
      setBlocking(false);
    }
  }, [blockTarget, blockReason, fetchUsers]);

  const handleUnblock = useCallback(async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/unblock`);
      toast.success('User unblocked successfully');
      fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to unblock user';
      toast.error(message);
    }
  }, [fetchUsers]);

  const getRoleBadgeStatus = useCallback((role: string) => {
    switch (role) {
      case 'admin': return 'driver_assigned';
      case 'driver': return 'confirmed';
      case 'customer': return 'created';
      default: return 'created';
    }
  }, []);

  const roleFilterOptions = useMemo(() => [
    { value: '', label: 'All Roles' },
    ...roleOptions,
  ], [roleOptions]);

  const thClass = 'text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none';
  const thStatic = 'text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3';

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
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-48">
          <Select
            placeholder="All Roles"
            options={roleFilterOptions}
            value={roleFilter}
            onChange={setRoleFilter}
            clearable
          />
        </div>
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
                  <th className={thClass} onClick={() => handleSort('name')}>
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thClass} onClick={() => handleSort('phone')}>
                    Phone {sortBy === 'phone' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Email</th>
                  <th className={thClass} onClick={() => handleSort('role')}>
                    Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Status</th>
                  <th className={thClass} onClick={() => handleSort('createdAt')}>
                    Joined {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{formatPhone(user.phone)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{user.email || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge status={getRoleBadgeStatus(user.role)} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={user.isBlocked ? 'cancelled' : 'completed'} />
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tooltip content="View user">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Tooltip>
                        {user.isBlocked ? (
                          <Tooltip content="Unblock user">
                            <Button
                              size="sm"
                              onClick={() => handleUnblock(user._id)}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip content="Block user">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => openBlockModal(user)}
                            >
                              <ShieldBan className="w-3.5 h-3.5" />
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
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

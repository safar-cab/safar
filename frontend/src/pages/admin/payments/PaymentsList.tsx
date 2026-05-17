import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, RotateCcw, Eye, Link as LinkIcon, Search } from 'lucide-react';
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
import { formatCurrency, formatDate } from '@/utils/format';
import type { Payment, Booking, User } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'created', label: 'Created' },
  { value: 'captured', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

export function PaymentsList() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Refund modal
  const [refundModal, setRefundModal] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refunding, setRefunding] = useState(false);

  // Generate link modal
  const [linkModal, setLinkModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/payments', { params }) as {
        payments?: Payment[];
        data?: Payment[];
        total?: number;
        totalPages?: number;
      };
      setPayments((res.payments || res.data || []) as Payment[]);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch payments';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleSort = useCallback((field: string) => {
    setSortOrder(sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortBy(field);
  }, [sortBy, sortOrder]);

  const getBookingId = useCallback((payment: Payment): string => {
    if (typeof payment.booking === 'object' && payment.booking !== null) {
      return (payment.booking as Booking).bookingId || '-';
    }
    return typeof payment.booking === 'string' ? payment.booking : '-';
  }, []);

  const getCustomerName = useCallback((payment: Payment): string => {
    if (typeof payment.user === 'object' && payment.user !== null) {
      return (payment.user as User).name || '-';
    }
    return '-';
  }, []);

  const openRefundModal = useCallback((payment: Payment) => {
    setRefundTarget(payment);
    setRefundAmount('');
    setRefundModal(true);
  }, []);

  const handleRefund = useCallback(async () => {
    if (!refundTarget) return;
    setRefunding(true);
    try {
      const payload: Record<string, number> = {};
      if (refundAmount) payload.amount = Math.round(Number(refundAmount) * 100);
      await api.post(`/admin/payments/${refundTarget._id}/refund`, payload);
      toast.success('Refund initiated successfully');
      setRefundModal(false);
      fetchPayments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process refund';
      toast.error(message);
    } finally {
      setRefunding(false);
    }
  }, [refundTarget, refundAmount, fetchPayments]);

  const handleGenerateLink = useCallback(async (paymentId: string) => {
    setGeneratingLink(true);
    setGeneratedLink('');
    setLinkModal(true);
    try {
      const res = await api.post(`/admin/payments/${paymentId}/generate-link`) as { link?: string; url?: string };
      setGeneratedLink(res.link || res.url || '');
      toast.success('Payment link generated');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate link';
      toast.error(message);
      setLinkModal(false);
    } finally {
      setGeneratingLink(false);
    }
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(generatedLink);
    toast.success('Link copied to clipboard');
  }, [generatedLink]);

  const thClass = 'text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none';
  const thStatic = 'text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3';

  return (
    <div>
      <PageHeader title="Payments" subtitle="Manage all payments" />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="w-48">
          <Select
            placeholder="All Statuses"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
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
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments found"
          description="No payments match the current filters."
        />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className={thClass} onClick={() => handleSort('bookingId')}>
                    Booking ID {sortBy === 'bookingId' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Customer</th>
                  <th className={thClass} onClick={() => handleSort('amount')}>
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Method</th>
                  <th className={thClass} onClick={() => handleSort('status')}>
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thClass} onClick={() => handleSort('paidAt')}>
                    Paid At {sortBy === 'paidAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{getBookingId(payment)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{getCustomerName(payment)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">{formatCurrency(payment.amount, true)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 capitalize">{payment.method || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge status={payment.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {payment.paidAt ? formatDate(payment.paidAt) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tooltip content="View payment">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/payments/${payment._id}`)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Tooltip>
                        {payment.status !== 'captured' && payment.status !== 'refunded' && (
                          <Tooltip content="Generate payment link">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateLink(payment._id)}
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                            </Button>
                          </Tooltip>
                        )}
                        {payment.status === 'captured' && (
                          <Tooltip content="Refund payment">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRefundModal(payment)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
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

      {/* Refund Modal */}
      <Modal open={refundModal} onClose={() => setRefundModal(false)} title="Process Refund">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Payment amount: <span className="font-semibold">{refundTarget ? formatCurrency(refundTarget.amount, true) : ''}</span>
          </p>
          <Input
            label="Refund Amount (in rupees, optional - leave empty for full refund)"
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            placeholder="e.g. 500"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRefundModal(false)}>Cancel</Button>
            <Button loading={refunding} onClick={handleRefund}>Process Refund</Button>
          </div>
        </div>
      </Modal>

      {/* Generate Link Modal */}
      <Modal open={linkModal} onClose={() => setLinkModal(false)} title="Payment Link">
        <div className="space-y-4">
          {generatingLink ? (
            <p className="text-sm text-neutral-500">Generating payment link...</p>
          ) : generatedLink ? (
            <>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="text-sm text-neutral-700 break-all">{generatedLink}</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setLinkModal(false)}>Close</Button>
                <Button onClick={handleCopyLink}>Copy Link</Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-neutral-500">No link generated.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}

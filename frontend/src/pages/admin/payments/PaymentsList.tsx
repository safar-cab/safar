import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Payment, Booking, User } from '@/types';

export function PaymentsList() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Refund modal
  const [refundModal, setRefundModal] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refunding, setRefunding] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res: any = await api.get('/admin/payments', { params });
      setPayments(res.payments || res.data || res || []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const formatAmount = (amount: number) => `\u20B9${(amount / 100).toLocaleString('en-IN')}`;

  const getBookingId = (payment: Payment): string => {
    if (typeof payment.booking === 'object' && payment.booking !== null) {
      return (payment.booking as Booking).bookingId || '-';
    }
    return typeof payment.booking === 'string' ? payment.booking : '-';
  };

  const getCustomerName = (payment: Payment): string => {
    if (typeof payment.user === 'object' && payment.user !== null) {
      return (payment.user as User).name || '-';
    }
    return '-';
  };

  const openRefundModal = (payment: Payment) => {
    setRefundTarget(payment);
    setRefundAmount('');
    setRefundModal(true);
  };

  const handleRefund = async () => {
    if (!refundTarget) return;
    setRefunding(true);
    try {
      const payload: Record<string, any> = {};
      if (refundAmount) payload.amount = Math.round(Number(refundAmount) * 100);
      await api.post(`/admin/payments/${refundTarget._id}/refund`, payload);
      toast.success('Refund initiated successfully');
      setRefundModal(false);
      fetchPayments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to process refund');
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div>
      <PageHeader title="Payments" subtitle="Manage all payments" />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-12 px-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 outline-none focus:border-primary-500"
        >
          <option value="">All Statuses</option>
          <option value="created">Created</option>
          <option value="captured">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
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
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Booking ID</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Method</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Paid At</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{getBookingId(payment)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{getCustomerName(payment)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">{formatAmount(payment.amount)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 capitalize">{payment.method || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge status={payment.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleDateString('en-IN')
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {payment.status === 'captured' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRefundModal(payment)}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-neutral-500">Showing {payments.length} of {total}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}

      {/* Refund Modal */}
      <Modal open={refundModal} onClose={() => setRefundModal(false)} title="Process Refund">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Payment amount: <span className="font-semibold">{refundTarget ? formatAmount(refundTarget.amount) : ''}</span>
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
    </div>
  );
}

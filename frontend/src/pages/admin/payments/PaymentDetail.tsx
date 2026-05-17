import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { IndianRupee, User, Car, Calendar, CreditCard, Hash, Clock, Copy, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Payment, Booking, User as UserType } from '@/types';
import toast from 'react-hot-toast';

interface PaymentWithRelations extends Omit<Payment, 'booking' | 'user'> {
  booking: Booking;
  user: UserType;
}

export function PaymentDetail() {
  const { id } = useParams();
  const [payment, setPayment] = useState<PaymentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkModal, setLinkModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/admin/payments/${id}`)
      .then((data) => setPayment(data as unknown as PaymentWithRelations))
      .catch(() => toast.error('Failed to load payment'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGenerateLink = useCallback(async () => {
    setGenerating(true);
    try {
      const result = await api.post(`/admin/payments/${id}/generate-link`) as unknown as { link: string; expiresAt: string };
      setGeneratedLink(result.link);
      setLinkModal(true);
    } catch {
      toast.error('Failed to generate payment link');
    } finally {
      setGenerating(false);
    }
  }, [id]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  }, [generatedLink]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Payment Detail" showBack />
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const booking = payment.booking;
  const user = payment.user;

  const infoItems = [
    { icon: Hash, label: 'Payment ID', value: payment._id },
    { icon: CreditCard, label: 'Razorpay Order', value: payment.razorpay?.orderId || '—' },
    { icon: CreditCard, label: 'Razorpay Payment', value: payment.razorpay?.paymentId || '—' },
    { icon: IndianRupee, label: 'Amount', value: formatCurrency(payment.amount, true) },
    { icon: CreditCard, label: 'Method', value: payment.method.toUpperCase() },
    { icon: CreditCard, label: 'UPI ID', value: payment.upiId || '—' },
    { icon: Clock, label: 'Paid At', value: payment.paidAt ? formatDate(payment.paidAt, 'datetime') : 'Not paid' },
    { icon: Calendar, label: 'Created', value: formatDate(payment.createdAt, 'datetime') },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Detail"
        showBack
        actions={
          <Button size="sm" variant="outline" onClick={handleGenerateLink} loading={generating}>
            Generate Payment Link
          </Button>
        }
      />

      {/* Status */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">Status</p>
            <div className="mt-1"><Badge status={payment.status} /></div>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Amount</p>
            <p className="text-2xl font-bold text-neutral-900">{formatCurrency(payment.amount, true)}</p>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 mb-4">
        <h3 className="text-sm font-semibold text-neutral-800 px-5 pt-4 pb-2">Payment Information</h3>
        <div className="divide-y divide-neutral-100">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-5 py-3">
              <item.icon className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="text-sm text-neutral-500 w-36 shrink-0">{item.label}</span>
              <span className="text-sm text-neutral-800 font-medium truncate">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Info */}
      {user && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100 mb-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Customer</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{user.name}</p>
              <p className="text-xs text-neutral-500">{user.phone} {user.email && `• ${user.email}`}</p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Info */}
      {booking && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100 mb-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Booking</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Booking ID</span>
              <span className="text-neutral-800 font-mono">{booking.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Status</span>
              <Badge status={booking.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Pickup</span>
              <span className="text-neutral-800">{booking.pickup?.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Drop</span>
              <span className="text-neutral-800">{booking.drop?.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Total Amount</span>
              <span className="text-neutral-800 font-semibold">{formatCurrency(booking.pricing?.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Refund Info */}
      {payment.refund && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100 mb-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Refund</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Refund ID</span>
              <span className="text-neutral-800 font-mono">{payment.refund.refundId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Amount</span>
              <span className="text-neutral-800">{formatCurrency(payment.refund.amount, true)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Status</span>
              <span className="text-neutral-800 capitalize">{payment.refund.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Link Modal */}
      <Modal open={linkModal} onClose={() => setLinkModal(false)} title="Payment Link Generated">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">Share this link with the customer. It expires in 10 minutes.</p>
          <div className="flex items-center gap-2 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
            <input
              readOnly
              value={generatedLink}
              className="flex-1 bg-transparent text-sm text-neutral-800 outline-none font-mono"
            />
            <Button size="sm" variant="outline" onClick={handleCopyLink}>
              {copied ? <CheckCircle className="w-4 h-4 text-success-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <Button variant="primary" className="w-full" onClick={() => setLinkModal(false)}>Done</Button>
        </div>
      </Modal>
    </div>
  );
}

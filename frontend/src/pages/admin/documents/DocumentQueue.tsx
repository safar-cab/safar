import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/lib/cn';

interface Document {
  _id: string;
  entityType: 'driver' | 'car';
  entityId: string;
  docType: string;
  fileUrl: string;
  fileName?: string;
  status: string;
  documentNumber?: string;
  expiryDate?: string;
  createdAt: string;
}

interface Stats {
  pending: number;
  verified: number;
  rejected: number;
  expired: number;
  total: number;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  driving_license: 'Driving License',
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  car_rc: 'Registration Certificate',
  insurance: 'Insurance',
  permit: 'Permit',
  fitness_certificate: 'Fitness Certificate',
  pollution_certificate: 'Pollution Certificate',
  photo: 'Photo',
  other: 'Other',
};

export function DocumentQueue() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entityFilter, setEntityFilter] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (entityFilter) params.set('entityType', entityFilter);

      const [docsRes, statsRes] = await Promise.all([
        api.get(`/admin/documents/pending?${params}`) as Promise<any>,
        api.get('/admin/documents/stats') as Promise<Stats>,
      ]);

      setDocuments(docsRes.documents || []);
      setTotalPages(docsRes.totalPages || 1);
      setStats(statsRes);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, entityFilter]);

  const handleVerify = async (docId: string) => {
    try {
      await api.put(`/admin/documents/${docId}/verify`);
      toast.success('Document verified');
      setSelectedDoc(null);
      fetchData();
    } catch {
      toast.error('Verification failed');
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    try {
      await api.put(`/admin/documents/${rejectModal}/reject`, { reason: rejectReason.trim() });
      toast.success('Document rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchData();
    } catch {
      toast.error('Rejection failed');
    }
  };

  return (
    <div>
      <PageHeader title="Document Verification" />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            color="text-amber-500"
            bg="bg-amber-50"
          />
          <StatCard
            icon={CheckCircle}
            label="Verified"
            value={stats.verified}
            color="text-green-500"
            bg="bg-green-50"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={stats.rejected}
            color="text-red-500"
            bg="bg-red-50"
          />
          <StatCard
            icon={AlertTriangle}
            label="Expired"
            value={stats.expired}
            color="text-orange-500"
            bg="bg-orange-50"
          />
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-neutral-400" />
        <select
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
        >
          <option value="">All types</option>
          <option value="driver">Driver</option>
          <option value="car">Car</option>
        </select>
      </div>

      {/* Document list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">All caught up!</p>
          <p className="text-sm text-neutral-400">No pending documents to review</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => setSelectedDoc(doc)}
              className="bg-white rounded-xl p-4 border border-neutral-100 hover:border-primary-200 cursor-pointer transition-colors flex items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg bg-neutral-50 border border-neutral-100 overflow-hidden flex-shrink-0">
                {doc.fileUrl.endsWith('.pdf') ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-neutral-300" />
                  </div>
                ) : (
                  <img src={doc.fileUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800">
                  {DOC_TYPE_LABELS[doc.docType] || doc.docType}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {doc.entityType === 'driver' ? 'Driver' : 'Car'} ·{' '}
                  {doc.documentNumber || 'No number'}
                </p>
                <p className="text-xs text-neutral-400">
                  Uploaded {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerify(doc._id);
                  }}
                  className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                  title="Verify"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRejectModal(doc._id);
                  }}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="Reject"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={documents.length}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Document preview modal */}
      <Modal
        open={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc ? DOC_TYPE_LABELS[selectedDoc.docType] || selectedDoc.docType : ''}
        size="md"
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-neutral-100">
              {selectedDoc.fileUrl.endsWith('.pdf') ? (
                <a
                  href={selectedDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-4 text-primary-600 hover:underline"
                >
                  <FileText className="w-5 h-5" /> View PDF
                </a>
              ) : (
                <img
                  src={selectedDoc.fileUrl}
                  alt=""
                  className="w-full max-h-96 object-contain bg-neutral-50"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-neutral-400 text-xs">Entity</p>
                <p className="font-medium capitalize">{selectedDoc.entityType}</p>
              </div>
              {selectedDoc.documentNumber && (
                <div>
                  <p className="text-neutral-400 text-xs">Number</p>
                  <p className="font-medium">{selectedDoc.documentNumber}</p>
                </div>
              )}
              {selectedDoc.expiryDate && (
                <div>
                  <p className="text-neutral-400 text-xs">Expiry</p>
                  <p className="font-medium">
                    {new Date(selectedDoc.expiryDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2 border-t border-neutral-100">
              <Button
                className="flex-1"
                onClick={() => {
                  handleVerify(selectedDoc._id);
                }}
              >
                <CheckCircle className="w-4 h-4" /> Verify
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  setRejectModal(selectedDoc._id);
                  setSelectedDoc(null);
                }}
              >
                <XCircle className="w-4 h-4" /> Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal
        open={!!rejectModal}
        onClose={() => {
          setRejectModal(null);
          setRejectReason('');
        }}
        title="Reject Document"
        size="sm"
      >
        <div className="space-y-4">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={3}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setRejectModal(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleReject}>
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-neutral-100">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('p-1.5 rounded-lg', bg)}>
          <Icon className={cn('w-4 h-4', color)} />
        </div>
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, XCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/cn';

interface Document {
  _id: string;
  docType: string;
  fileUrl: string;
  fileName?: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  expiryDate?: string;
  documentNumber?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
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

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending' },
  verified: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Verified' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Rejected' },
  expired: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Expired' },
};

interface Props {
  entityType: 'driver' | 'car';
  entityId: string;
  isAdmin?: boolean;
  availableDocTypes?: string[];
}

export function DocumentsPanel({ entityType, entityId, isAdmin, availableDocTypes }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Upload form state
  const [uploadDocType, setUploadDocType] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocNumber, setUploadDocNumber] = useState('');
  const [uploadExpiry, setUploadExpiry] = useState('');
  const [uploading, setUploading] = useState(false);

  const docTypes =
    availableDocTypes ||
    (entityType === 'driver'
      ? ['driving_license', 'aadhaar', 'pan', 'photo']
      : ['car_rc', 'insurance', 'permit', 'fitness_certificate', 'pollution_certificate']);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin
        ? `/admin/documents/entity/${entityType}/${entityId}`
        : `/${entityType}/documents`;
      const res = await api.get(endpoint);
      setDocuments(Array.isArray(res) ? res : (res as any).data || []);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [entityId]);

  const handleUpload = async () => {
    if (!uploadFile || !uploadDocType) {
      toast.error('Select document type and file');
      return;
    }

    setUploading(true);
    try {
      // Get presigned URL
      const presigned = (await api.post('/upload/presigned-url', {
        folder: `documents/${entityType}`,
        fileName: uploadFile.name,
        contentType: uploadFile.type,
      })) as { uploadUrl: string; fileUrl: string };

      // Upload to S3
      await fetch(presigned.uploadUrl, {
        method: 'PUT',
        body: uploadFile,
        headers: { 'Content-Type': uploadFile.type },
      });

      // Create document record
      const endpoint = isAdmin ? `/admin/documents` : `/${entityType}/documents`;

      const body: Record<string, string> = {
        docType: uploadDocType,
        fileUrl: presigned.fileUrl,
        fileName: uploadFile.name,
      };
      if (isAdmin) {
        body.entityType = entityType;
        body.entityId = entityId;
      }
      if (uploadDocNumber) body.documentNumber = uploadDocNumber;
      if (uploadExpiry) body.expiryDate = uploadExpiry;

      await api.post(endpoint, body);
      toast.success('Document uploaded');
      setUploadModal(false);
      resetUploadForm();
      fetchDocuments();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (docId: string) => {
    try {
      await api.put(`/admin/documents/${docId}/verify`);
      toast.success('Document verified');
      fetchDocuments();
    } catch {
      toast.error('Verification failed');
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      toast.error('Provide rejection reason');
      return;
    }
    try {
      await api.put(`/admin/documents/${rejectModal}/reject`, { reason: rejectReason.trim() });
      toast.success('Document rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchDocuments();
    } catch {
      toast.error('Rejection failed');
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const endpoint = isAdmin ? `/admin/documents/${docId}` : `/${entityType}/documents/${docId}`;
      await api.delete(endpoint);
      toast.success('Document deleted');
      fetchDocuments();
    } catch {
      toast.error('Delete failed');
    }
  };

  const resetUploadForm = () => {
    setUploadDocType('');
    setUploadFile(null);
    setUploadDocNumber('');
    setUploadExpiry('');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-neutral-100 rounded w-40" />
          <div className="h-16 bg-neutral-50 rounded" />
          <div className="h-16 bg-neutral-50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-neutral-900">Documents</h3>
        <Button size="sm" onClick={() => setUploadModal(true)}>
          <Upload className="w-4 h-4" />
          Upload
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
          <p className="text-sm text-neutral-400">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const statusConf = STATUS_CONFIG[doc.status];
            const StatusIcon = statusConf.icon;

            return (
              <div
                key={doc._id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-neutral-50',
                  doc.status === 'rejected' ? 'border-red-100' : 'border-neutral-100',
                )}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className={cn('p-2 rounded-lg', statusConf.bg)}>
                  <StatusIcon className={cn('w-4 h-4', statusConf.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800">
                    {DOC_TYPE_LABELS[doc.docType] || doc.docType}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {doc.documentNumber && `${doc.documentNumber} · `}
                    {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                  </p>
                  {doc.status === 'rejected' && doc.rejectionReason && (
                    <p className="text-xs text-red-500 mt-0.5">{doc.rejectionReason}</p>
                  )}
                  {doc.expiryDate && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Expires: {new Date(doc.expiryDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
                <Badge status={doc.status === 'verified' ? 'completed' : doc.status} />
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={uploadModal}
        onClose={() => {
          setUploadModal(false);
          resetUploadForm();
        }}
        title="Upload Document"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">Document Type</label>
            <select
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">Select type...</option>
              {docTypes.map((t) => (
                <option key={t} value={t}>
                  {DOC_TYPE_LABELS[t] || t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">File</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium file:cursor-pointer hover:file:bg-primary-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">
              Document Number (optional)
            </label>
            <input
              type="text"
              value={uploadDocNumber}
              onChange={(e) => setUploadDocNumber(e.target.value)}
              placeholder="e.g. DL-1234567890"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">
              Expiry Date (optional)
            </label>
            <input
              type="date"
              value={uploadExpiry}
              onChange={(e) => setUploadExpiry(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <Button className="w-full" loading={uploading} onClick={handleUpload}>
            Upload Document
          </Button>
        </div>
      </Modal>

      {/* Document Detail Modal */}
      <Modal
        open={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc ? DOC_TYPE_LABELS[selectedDoc.docType] || selectedDoc.docType : ''}
        size="md"
      >
        {selectedDoc && (
          <div className="space-y-4">
            {/* Preview */}
            {selectedDoc.fileUrl && (
              <div className="rounded-lg overflow-hidden border border-neutral-100">
                {selectedDoc.fileUrl.endsWith('.pdf') ? (
                  <a
                    href={selectedDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 text-primary-600 hover:underline"
                  >
                    <FileText className="w-5 h-5" />
                    View PDF
                  </a>
                ) : (
                  <img
                    src={selectedDoc.fileUrl}
                    alt={selectedDoc.docType}
                    className="w-full max-h-96 object-contain bg-neutral-50"
                  />
                )}
              </div>
            )}

            {/* Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-neutral-400 text-xs">Status</p>
                <Badge
                  status={selectedDoc.status === 'verified' ? 'completed' : selectedDoc.status}
                />
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
              {selectedDoc.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-neutral-400 text-xs">Rejection Reason</p>
                  <p className="text-red-600 font-medium">{selectedDoc.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Admin actions */}
            {isAdmin && selectedDoc.status === 'pending' && (
              <div className="flex gap-3 pt-2 border-t border-neutral-100">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleVerify(selectedDoc._id);
                    setSelectedDoc(null);
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Verify
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    setRejectModal(selectedDoc._id);
                    setSelectedDoc(null);
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            )}

            {/* Delete */}
            <div className="pt-2 border-t border-neutral-100">
              <button
                onClick={() => {
                  handleDelete(selectedDoc._id);
                  setSelectedDoc(null);
                }}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete document
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
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

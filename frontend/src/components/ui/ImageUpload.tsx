import { useState, useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface UploadResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

interface PendingImage {
  id: string;
  file: File;
  preview: string; // local blob URL
  uploaded: boolean;
  s3Url?: string;
}

export interface ImageUploadRef {
  uploadPending: () => Promise<string[]>;
  hasPending: () => boolean;
}

interface ImageUploadProps {
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  folder?: string;
  className?: string;
}

export const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(function ImageUpload(
  { label, value = [], onChange, maxFiles = 5, folder = 'uploads', className },
  ref,
) {
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Upload all pending files to S3 — called by parent on form submit
  const uploadPending = useCallback(async (): Promise<string[]> => {
    if (pending.length === 0) return value;

    setUploading(true);
    const uploadedUrls: string[] = [...value];

    try {
      for (const item of pending) {
        if (item.uploaded && item.s3Url) {
          uploadedUrls.push(item.s3Url);
          continue;
        }

        const result = (await api.post('/upload/presigned-url', {
          folder,
          fileName: item.file.name,
          contentType: item.file.type,
        })) as unknown as UploadResult;

        const uploadRes = await fetch(result.uploadUrl, {
          method: 'PUT',
          body: item.file,
          headers: { 'Content-Type': item.file.type },
        });

        if (!uploadRes.ok) {
          toast.error(`Failed to upload ${item.file.name}`);
          continue;
        }

        uploadedUrls.push(result.fileUrl);

        setPending((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, uploaded: true, s3Url: result.fileUrl } : p)),
        );
      }

      // Clear pending after successful upload
      setPending((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.preview));
        return [];
      });

      onChange(uploadedUrls);
      return uploadedUrls;
    } catch {
      toast.error('Upload failed');
      return value;
    } finally {
      setUploading(false);
    }
  }, [pending, value, onChange, folder]);

  const hasPending = useCallback(() => pending.length > 0, [pending]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({ uploadPending, hasPending }), [uploadPending, hasPending]);

  // Add files — preview only, no upload yet
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const totalCount = value.length + pending.length;
      const remaining = maxFiles - totalCount;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }

      const newPending: PendingImage[] = [];
      const filesToAdd = Array.from(files).slice(0, remaining);

      for (const file of filesToAdd) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit`);
          continue;
        }

        newPending.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          uploaded: false,
        });
      }

      setPending((prev) => [...prev, ...newPending]);
      if (inputRef.current) inputRef.current.value = '';
    },
    [value.length, pending.length, maxFiles],
  );

  // Remove existing (already uploaded) image
  const handleRemoveExisting = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  // Remove pending (not yet uploaded) image
  const handleRemovePending = useCallback((id: string) => {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const totalCount = value.length + pending.length;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Already uploaded images */}
        {value.map((url, i) => (
          <div
            key={url}
            className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200"
          >
            <img src={url} alt={`Uploaded ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute top-1 left-1">
              <CheckCircle className="w-4 h-4 text-success-500 drop-shadow" />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveExisting(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ))}

        {/* Pending images (local preview, not uploaded yet) */}
        {pending.map((item) => (
          <div
            key={item.id}
            className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100 border-2 border-dashed border-primary-300"
          >
            <img src={item.preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary-500/10 flex items-center justify-center">
              <span className="text-[9px] font-semibold text-primary-700 bg-white/80 px-1.5 py-0.5 rounded">
                Pending
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleRemovePending(item.id)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ))}

        {/* Upload button */}
        {totalCount < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors',
              uploading
                ? 'border-primary-300 bg-primary-50 cursor-wait'
                : 'border-neutral-300 hover:border-primary-400 hover:bg-primary-50 cursor-pointer',
            )}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-neutral-400" />
                <span className="text-xs text-neutral-500">Add</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      <p className="text-xs text-neutral-400 mt-2">
        {totalCount}/{maxFiles} images
        {pending.length > 0 && (
          <span className="text-primary-500 font-medium"> ({pending.length} pending upload)</span>
        )}
        . Max 5MB each.
      </p>
    </div>
  );
});

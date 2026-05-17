import { useState, useCallback, useRef, memo } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface UploadResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

interface ImageUploadProps {
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  folder?: string;
  className?: string;
}

export const ImageUpload = memo(function ImageUpload({
  label,
  value = [],
  onChange,
  maxFiles = 5,
  folder = 'uploads',
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = maxFiles - value.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remaining);
      setUploading(true);

      try {
        const newUrls: string[] = [];

        for (const file of filesToUpload) {
          if (!file.type.startsWith('image/')) {
            toast.error(`${file.name} is not an image`);
            continue;
          }
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} exceeds 5MB limit`);
            continue;
          }

          const result = (await api.post('/upload/presigned-url', {
            folder,
            fileName: file.name,
            contentType: file.type,
          })) as unknown as UploadResult;

          const uploadRes = await fetch(result.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });

          if (!uploadRes.ok) {
            toast.error(`Failed to upload ${file.name} to storage`);
            continue;
          }

          newUrls.push(result.fileUrl);
        }

        if (newUrls.length > 0) {
          onChange([...value, ...newUrls]);
          toast.success(`${newUrls.length} image${newUrls.length > 1 ? 's' : ''} uploaded`);
        }
      } catch {
        toast.error('Upload failed');
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [value, onChange, maxFiles, folder],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Existing images */}
        {value.map((url, i) => (
          <div
            key={url}
            className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200"
          >
            <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ))}

        {/* Upload button */}
        {value.length < maxFiles && (
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
                <span className="text-xs text-neutral-500">Upload</span>
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
        onChange={(e) => handleUpload(e.target.files)}
      />

      <p className="text-xs text-neutral-400 mt-2">
        {value.length}/{maxFiles} images. Max 5MB each. JPG, PNG, WebP.
      </p>
    </div>
  );
});

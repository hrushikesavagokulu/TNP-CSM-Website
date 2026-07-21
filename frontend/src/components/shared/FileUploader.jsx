import { useState, useRef } from 'react';
import api from '../../services/api';

/**
 * FileUploader — Universal drag/drop & file uploader component.
 * Supports image, PDF, document, and video uploads to MinIO storage.
 */
export default function FileUploader({
  uploadUrl = '/upload',
  fieldName = 'file',
  accept = 'image/*,application/pdf,.doc,.docx',
  maxSizeMB = 10,
  onUploadSuccess,
  onUploadComplete,
  onRemove,
  currentUrl,
  label,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress]     = useState(0);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]         = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    setError(null);

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds limit of ${maxSizeMB}MB.`);
      return;
    }

    const formData = new FormData();
    formData.append(fieldName, file);

    setUploading(true);
    setProgress(0);

    try {
      // Determine endpoint: if uploadUrl starts with /api/v1 strip it as axios base includes it
      const targetEndpoint = uploadUrl.replace(/^\/api\/v1/, '') || '/upload';

      const res = await api.post(targetEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percent);
        },
      });

      const uploadedUrl =
        res.data?.data?.url ||
        res.data?.data?.fileUrl ||
        res.data?.url ||
        res.data?.fileUrl;

      if (uploadedUrl) {
        onUploadSuccess?.(uploadedUrl, res.data?.data);
        onUploadComplete?.(uploadedUrl, res.data?.data);
      } else {
        setError(res.data?.message || 'Upload completed but no URL returned.');
      }
    } catch (err) {
      console.error('[FileUploader] Upload failed:', err);
      setError(err.response?.data?.message || 'Network error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {currentUrl && (
        <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs">
          <div className="flex items-center gap-2 truncate">
            {currentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img src={currentUrl} alt="Uploaded" className="w-8 h-8 rounded-lg object-cover border" />
            ) : (
              <span className="text-lg">📄</span>
            )}
            <span className="text-[var(--color-text-primary)] font-semibold truncate">{currentUrl}</span>
          </div>
          {onRemove && (
            <button type="button" onClick={onRemove} className="text-xs font-bold text-red-500 hover:underline">
              Remove
            </button>
          )}
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragActive
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 scale-[0.99]'
            : 'border-[var(--color-border)] bg-[var(--color-surface)]/60 hover:border-[var(--color-accent)]/60'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          <span className="text-lg">📁</span>
          <span className="text-xs font-bold text-[var(--color-text-primary)]">
            {uploading ? 'Uploading...' : label || 'Choose file or drag & drop'}
          </span>
        </div>
        <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
          Max size: {maxSizeMB}MB
        </span>

        {uploading && (
          <div className="w-full max-w-[180px] mt-2">
            <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[var(--color-accent)] h-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[9px] font-bold text-center text-[var(--color-text-muted)] mt-1">{progress}% uploaded</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400 font-semibold">⚠ {error}</p>}
    </div>
  );
}

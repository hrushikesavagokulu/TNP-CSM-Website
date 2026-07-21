import { useState, useRef } from 'react';
import api from '../../services/api';

/**
 * FileUploader — generic reusable drag/drop uploader.
 *
 * @param {Object} props
 * @param {string} props.uploadUrl - API endpoint (e.g. '/student/profile/upload-photo')
 * @param {string} props.fieldName - Multer field name (e.g. 'photo' or 'document')
 * @param {string} props.accept - MIME types (e.g. 'image/png, image/jpeg')
 * @param {number} props.maxSizeMB - Max allowed size in MB
 * @param {function} props.onUploadComplete - Callback returning the public URL
 */
export default function FileUploader({ uploadUrl, fieldName, accept, maxSizeMB = 5, onUploadComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState(null);
  const fileInputRef = useRef(null);

  const validateAndUpload = async (file) => {
    setError(null);

    // Validate size limit client side
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File is too large. Max limit is ${maxSizeMB}MB.`);
      return;
    }

    // Validate type limit client side (basic check)
    const allowed = accept.split(',').map((t) => t.trim());
    const isAllowed = allowed.some((mime) => {
      if (mime.endsWith('/*')) {
        return file.type.startsWith(mime.replace('/*', ''));
      }
      return file.type === mime;
    });
    if (!isAllowed && accept !== '*') {
      setError(`Invalid file type. Allowed types: ${accept}`);
      return;
    }

    // Prepare upload payload
    const formData = new FormData();
    formData.append(fieldName, file);

    setUploading(true);
    setProgress(0);

    try {
      const res = await api.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      if (res.data.success) {
        onUploadComplete?.(res.data.data.fileUrl || res.data.data.url, res.data.data);
      } else {
        setError(res.data.message || 'Upload failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        id="uploader-container"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInput}
        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
          bg-[var(--color-bg-secondary)]/10 hover:bg-[var(--color-accent-subtle)]/30
          ${dragActive ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/40 scale-95' : 'border-[var(--color-border)]'}
          ${uploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        <svg className="w-8 h-8 text-[var(--color-text-muted)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>

        <p className="text-xs font-semibold text-[var(--color-text-primary)]">
          {uploading ? 'Uploading your file...' : 'Drag & drop your file or click to browse'}
        </p>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
          Max size: {maxSizeMB}MB
        </p>

        {uploading && (
          <div className="w-full max-w-[200px] mt-4">
            <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--color-accent)] h-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-center text-[var(--color-text-secondary)] mt-1">{progress}% completed</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-[var(--color-error)] mt-2 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

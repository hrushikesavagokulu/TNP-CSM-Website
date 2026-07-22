import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLightbox } from '../../context/LightboxContext';

export default function ImageLightbox() {
  const { isOpen, currentImageUrl, currentAltText, closeLightbox } = useLightbox();

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeLightbox]);

  if (!isOpen || !currentImageUrl) return null;

  return createPortal(
    <div
      id="global-image-lightbox"
      onClick={closeLightbox}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md animate-fade-in select-none"
      style={{ cursor: 'zoom-out' }}
    >
      {/* Top right close button */}
      <button
        type="button"
        id="lightbox-close-btn"
        onClick={(e) => {
          e.stopPropagation();
          closeLightbox();
        }}
        className="fixed top-4 right-4 z-[100000] w-11 h-11 rounded-full bg-slate-900/80 hover:bg-red-500 text-white text-xl font-bold flex items-center justify-center border border-white/20 transition-all duration-200 hover:scale-110 shadow-2xl"
        title="Close (Esc)"
        style={{ cursor: 'pointer' }}
      >
        ✕
      </button>

      {/* Image container — stops propagation so clicking image doesn't close lightbox */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'default' }}
      >
        <img
          src={currentImageUrl}
          alt={currentAltText || 'Enlarged Preview'}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10 select-none animate-scale-in"
        />
        {currentAltText && currentAltText !== 'Enlarged Image' && (
          <p className="mt-3 text-xs font-semibold text-slate-300 text-center max-w-xl bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
            {currentAltText}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}

import { useAppStore } from '@/store/app-store';
import { X, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

export function ImagePreviewModal() {
  const { imagePreviewState, closeImagePreview } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && imagePreviewState.isOpen) {
        closeImagePreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imagePreviewState.isOpen, closeImagePreview]);

  if (!imagePreviewState.isOpen || !imagePreviewState.url) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeImagePreview}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center p-2 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div className="w-full flex items-center justify-between pb-3 px-2 text-white">
          <span className="text-sm font-bold truncate max-w-md">
            {imagePreviewState.title || 'Image Preview'}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={imagePreviewState.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-semibold"
              title="Open full size in new tab"
            >
              <ExternalLink size={14} />
              <span>Full Size</span>
            </a>
            <button
              type="button"
              onClick={closeImagePreview}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative overflow-hidden rounded-2xl bg-black/40 border border-white/15 p-2 shadow-2xl flex items-center justify-center max-h-[80vh] w-auto">
          <img
            src={imagePreviewState.url}
            alt={imagePreviewState.title || 'Preview'}
            className="max-h-[75vh] max-w-full w-auto h-auto object-contain rounded-xl select-none"
          />
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { FileText, Maximize2, Trash2, Upload, UploadCloud, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface FileUploadCardProps {
  title: string;
  accept?: string;
  preview: string;
  onSelect: (f: File | null) => void;
  onClear: () => void;
  loading?: boolean;
}

export function FileUploadCard({ title, accept, preview, onSelect, onClear, loading }: FileUploadCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isPdf = preview.startsWith('data:application/pdf') || preview.toLowerCase().includes('.pdf');

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</label>
      {loading ? (
        <div className="min-h-[110px] border-2 border-dashed border-primary/40 bg-primary/5 rounded-2xl flex flex-col items-center justify-center text-center p-4">
          <Spinner className="size-6 text-primary" />
          <span className="text-xs font-bold text-foreground mt-2">Uploading {title}...</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Please wait, this may take a moment</span>
        </div>
      ) : preview ? (
        <div className="p-4 rounded-2xl border border-foreground/15 bg-card/60 shadow-xs flex flex-row items-center gap-4">
          {/* One Side: Image / File Preview */}
          <div
            onClick={() => {
              if (isPdf) {
                window.open(preview, '_blank');
              } else {
                setLightboxOpen(true);
              }
            }}
            className="relative w-28 h-22 sm:w-32 sm:h-24 shrink-0 rounded-xl overflow-hidden border border-foreground/15 bg-muted/10 flex items-center justify-center cursor-pointer group shadow-xs"
            title="Click to view full preview"
          >
            {isPdf ? (
              <div className="flex flex-col items-center justify-center text-red-500 hover:text-red-600 transition">
                <FileText size={28} />
                <span className="text-[9px] font-bold mt-1">PDF</span>
              </div>
            ) : (
              <>
                <img src={preview} alt={title} className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 size={14} className="text-white" />
                </div>
              </>
            )}
          </div>

          {/* Beside: Details & Action Buttons */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground truncate">
                  {isPdf ? 'PDF Document' : `${title}`}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Uploaded
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {isPdf ? 'Click preview thumbnail to open file' : 'Click thumbnail to preview full size'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs inline-flex items-center gap-1.5">
                <Upload size={12} />
                <span>Replace</span>
                <input
                  type="file"
                  accept={accept || 'image/*'}
                  className="hidden"
                  onChange={(e) => {
                    onSelect(e.target.files?.[0] || null);
                    e.target.value = '';
                  }}
                />
              </label>

              <button
                type="button"
                onClick={onClear}
                className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold cursor-pointer transition inline-flex items-center gap-1.5"
                title="Remove file"
              >
                <Trash2 size={12} />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {lightboxOpen && !isPdf && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
              onClick={() => setLightboxOpen(false)}
            >
              <div
                className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-card border border-foreground/10 p-2 shadow-2xl cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition shadow-md cursor-pointer"
                >
                  <X size={16} />
                </button>
                <img src={preview} alt={title} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <label className="min-h-[110px] border-2 border-dashed border-foreground/20 hover:border-primary/50 hover:bg-primary/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition p-4 text-center group">
          <UploadCloud size={22} className="text-muted-foreground group-hover:text-primary transition mb-1" />
          <span className="text-xs font-bold text-foreground">Upload {title}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Click to choose {accept?.includes('.pdf') ? 'file or document' : 'image'}</span>
          <input
            type="file"
            accept={accept || 'image/*'}
            className="hidden"
            onChange={(e) => {
              onSelect(e.target.files?.[0] || null);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}

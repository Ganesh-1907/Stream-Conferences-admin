import { useState } from 'react';
import { FileText, Maximize2, UploadCloud, X } from 'lucide-react';

interface FileUploadCardProps {
  title: string;
  accept?: string;
  preview: string;
  onSelect: (f: File | null) => void;
  onClear: () => void;
}

export function FileUploadCard({ title, accept, preview, onSelect, onClear }: FileUploadCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isPdf = preview.startsWith('data:application/pdf') || preview.toLowerCase().includes('.pdf');

  return (
    <div className="bg-muted/20 border border-foreground/10 rounded-xl p-4">
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</label>
      {preview ? (
        <div className="flex items-center gap-4">
          <div
            onClick={() => {
              if (isPdf) {
                window.open(preview, '_blank');
              } else {
                setLightboxOpen(true);
              }
            }}
            className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-foreground/10 bg-background flex items-center justify-center cursor-pointer group"
            title="Click to view full screen"
          >
            {isPdf ? (
              <div className="flex flex-col items-center justify-center text-red-500 hover:text-red-600 transition">
                <FileText size={24} />
                <span className="text-[8px] font-bold mt-0.5">PDF</span>
              </div>
            ) : (
              <>
                <img src={preview} alt={title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 size={12} className="text-white" />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="text-xs text-muted-foreground font-semibold truncate max-w-[120px]">
              {isPdf ? 'Brochure PDF' : `${title} Image`}
            </span>
            <div className="flex gap-2">
              <label className="px-2.5 py-1 bg-muted hover:bg-muted/80 border border-foreground/10 rounded-md text-[10px] font-semibold cursor-pointer inline-block transition">
                Replace
                <input type="file" accept={accept || 'image/*'} className="hidden" onChange={(e) => { onSelect(e.target.files?.[0] || null); e.target.value = ''; }} />
              </label>
              <button
                type="button"
                onClick={onClear}
                className="px-2.5 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-md text-[10px] font-semibold cursor-pointer transition"
              >
                Remove
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
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition shadow-md"
                >
                  <X size={16} />
                </button>
                <img src={preview} alt={title} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-foreground/15 rounded-lg p-5 cursor-pointer hover:border-secondary transition">
          <UploadCloud size={20} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-semibold">Upload {title}</span>
          <input type="file" accept={accept || 'image/*'} className="hidden" onChange={(e) => { onSelect(e.target.files?.[0] || null); e.target.value = ''; }} />
        </label>
      )}
    </div>
  );
}

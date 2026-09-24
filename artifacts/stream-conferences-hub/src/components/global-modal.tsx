import { useAppStore } from '@/store/app-store';
import { AlertTriangle, CheckCircle2, Info, Trash2, X } from 'lucide-react';

export function GlobalModal() {
  const { modalState, closeModal } = useAppStore();

  if (!modalState.isOpen) return null;

  const { title, message, type = 'info', confirmText = 'Confirm', cancelText = 'Cancel' } = modalState;

  const isConfirmType = type === 'confirm' || type === 'danger';

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Trash2 size={26} />
          </div>
        );
      case 'success':
        return (
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 size={26} />
          </div>
        );
      case 'info':
        return (
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Info size={26} />
          </div>
        );
      case 'confirm':
      default:
        return (
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <AlertTriangle size={26} />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-card border border-foreground/15 p-6 rounded-2xl shadow-2xl text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => closeModal(false)}
          className="absolute right-4 top-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {getIcon()}

        <h3 className="text-lg font-bold text-foreground mb-2">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center justify-center gap-3">
          {isConfirmType && (
            <button
              type="button"
              onClick={() => closeModal(false)}
              className="flex-1 px-4 py-2.5 bg-muted/40 hover:bg-muted/70 text-foreground border border-foreground/10 font-semibold rounded-xl text-sm transition cursor-pointer"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={() => closeModal(true)}
            className={`flex-1 px-4 py-2.5 font-bold rounded-xl text-sm transition cursor-pointer shadow-sm ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
                : 'cta-button justify-center'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

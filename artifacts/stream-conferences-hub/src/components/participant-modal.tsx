import { useAppStore } from '@/store/app-store';

export function ParticipantModal() {
  const { viewingParticipant, setViewingParticipant } = useAppStore();

  if (!viewingParticipant) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card text-foreground border border-foreground/10 rounded-2xl w-[92vw] md:w-[55vw] max-w-2xl p-8 relative shadow-2xl space-y-6">
        <button
          type="button"
          onClick={() => setViewingParticipant(null)}
          className="absolute top-6 right-6 p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground transition duration-150 cursor-pointer"
        >
          Close
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">Participant</span>
            {viewingParticipant.eventTitle && (
              <span className="text-xs text-muted-foreground">{viewingParticipant.eventTitle}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{viewingParticipant.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{viewingParticipant.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/20 border border-foreground/5 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Registration Details</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Phone</dt><dd className="font-semibold text-right">{viewingParticipant.phone || '—'}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Institution</dt><dd className="font-semibold text-right">{viewingParticipant.institution || '—'}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Country</dt><dd className="font-semibold text-right">{viewingParticipant.country || '—'}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Category</dt><dd className="font-semibold text-right text-accent">{viewingParticipant.category}</dd></div>
            </dl>
          </div>
          <div className="bg-muted/20 border border-foreground/5 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Status</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Payment</dt>
                <dd>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(viewingParticipant.paymentStatus || 'unpaid') === 'paid' ? 'bg-green-500/10 text-green-500' : (viewingParticipant.paymentStatus || 'unpaid') === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-foreground/10 text-muted-foreground'}`}>
                    {viewingParticipant.paymentStatus || 'unpaid'}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Presenting Abstract</dt><dd className="font-semibold text-right">{viewingParticipant.presentingAbstract || 'No'}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Registered On</dt><dd className="font-semibold text-right">{new Date(viewingParticipant.createdAt).toLocaleDateString()}</dd></div>
            </dl>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setViewingParticipant(null)}
            className="px-6 py-2.5 bg-muted text-foreground text-sm font-semibold rounded-xl hover:bg-muted/80 transition duration-150 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

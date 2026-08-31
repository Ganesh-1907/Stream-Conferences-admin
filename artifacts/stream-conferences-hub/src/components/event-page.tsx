import { useAppStore } from '@/store/app-store';
import { registerLinkFor, mediaUrl } from '@/lib/utils';
import { EventPageTab, Webinar } from '@/lib/types';

const SUBTABS: EventPageTab[] = ['dashboard', 'details', 'participants', 'payments', 'abstracts', 'enquiries'];

const SUBTAB_LABELS: Record<EventPageTab, string> = {
  dashboard: 'Overview',
  details: 'Details',
  participants: 'Participants',
  payments: 'Payments',
  abstracts: 'Abstracts',
  enquiries: 'Enquiries',
};

export function EventPage() {
  const store = useAppStore();
  const { eventPage, eventPageType } = store;

  if (!eventPage || !eventPageType) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full capitalize">{eventPageType}</span>
            <span className="text-xs text-muted-foreground">
              Announced by: <strong>{eventPage.announcedBy}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{eventPage.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {eventPage.month} {eventPage.day} · {eventPage.location}
            {eventPage.eventDate && <> · {new Date(eventPage.eventDate).toLocaleDateString()}</>}
            {eventPageType === 'webinar' && (eventPage as Webinar).speaker && <> · Speaker: {(eventPage as Webinar).speaker}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={registerLinkFor(eventPage)}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-muted hover:bg-muted/70 border border-foreground/10 rounded-lg text-xs font-semibold transition duration-150 cursor-pointer inline-flex items-center gap-1.5"
          >
            Registration Link
          </a>
          <button
            type="button"
            onClick={store.closeEventPage}
            className="px-3 py-1.5 bg-muted hover:bg-muted/70 border border-foreground/10 rounded-lg text-xs font-semibold transition duration-150 cursor-pointer"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {SUBTABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => store.openEventPage(eventPage, eventPageType, tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition duration-150 cursor-pointer ${
              store.eventPageTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/40 hover:bg-muted/70 text-muted-foreground border border-foreground/10'
            }`}
          >
            {SUBTAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {store.eventPageTab === 'dashboard' && <OverviewTab />}
      {store.eventPageTab === 'details' && <DetailsTab />}
      {store.eventPageTab === 'participants' && <ParticipantsTab />}
      {store.eventPageTab === 'payments' && <PaymentsTab />}
      {store.eventPageTab === 'abstracts' && <AbstractsTab />}
      {store.eventPageTab === 'enquiries' && <EnquiriesTab />}
    </div>
  );
}

function OverviewTab() {
  const { eventDetail, eventDetailLoading, eventDetailError, eventPage, eventPageType } = useAppStore();
  if (!eventPage || !eventPageType) return null;

  return (
    <div className="space-y-6">
      {eventDetailLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading event dashboard...</div>}
      {eventDetailError && <div className="p-6 text-center text-sm text-red-500">{eventDetailError}</div>}
      {eventDetail && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard value={String(eventDetail.stats.totalParticipants)} label="Participants" />
          <StatCard value={String(eventDetail.stats.totalPayments)} label="Payments" />
          <StatCard value={String(eventDetail.stats.paidCount)} label="Paid" className="text-green-500" />
          <StatCard value={`₹${eventDetail.stats.revenue}`} label="Revenue" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/20 border border-foreground/5 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Date & Schedule</h4>
          <p className="text-sm font-medium">{eventPage.month} {eventPage.day}</p>
          {eventPage.eventDate && <p className="text-xs text-muted-foreground mt-0.5">{new Date(eventPage.eventDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>}
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${eventPage.date === 'upcoming' ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-muted-foreground'}`}>{eventPage.date}</span>
        </div>
        <div className="bg-muted/20 border border-foreground/5 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Location Details</h4>
          <p className="text-sm font-medium">{eventPage.location}</p>
          {eventPageType === 'webinar' && (eventPage as Webinar).speaker && (
            <p className="text-sm text-muted-foreground mt-1">Speaker: <strong>{(eventPage as Webinar).speaker}</strong></p>
          )}
        </div>
      </div>

      {eventPage.description && (
        <div className="bg-muted/10 border border-foreground/5 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description / Summary</h4>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{eventPage.description}</p>
        </div>
      )}
    </div>
  );
}

function DetailsTab() {
  const { eventPage, eventPageType } = useAppStore();
  if (!eventPage || !eventPageType) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/20 border border-foreground/5 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Date & Schedule</h4>
          <p className="text-sm font-medium">{eventPage.month} {eventPage.day}</p>
          {eventPage.eventDate && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(eventPage.eventDate).toLocaleDateString(undefined, { dateStyle: 'full' })}
            </p>
          )}
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${eventPage.date === 'upcoming' ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-muted-foreground'}`}>
            {eventPage.date}
          </span>
        </div>
        <div className="bg-muted/20 border border-foreground/5 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Location Details</h4>
          <p className="text-sm font-medium">{eventPage.location}</p>
          {eventPageType === 'webinar' && (eventPage as Webinar).speaker && (
            <p className="text-sm text-muted-foreground mt-1">Speaker: <strong>{(eventPage as Webinar).speaker}</strong></p>
          )}
        </div>
      </div>

      <div className="bg-muted/10 p-5 rounded-xl border border-foreground/5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Registration Link</h4>
            <p className="text-sm font-mono text-accent break-all">{registerLinkFor(eventPage)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(registerLinkFor(eventPage));
            }}
            className="shrink-0 px-3 py-1.5 bg-muted hover:bg-muted/70 border border-foreground/10 rounded-lg text-xs font-semibold transition duration-150 cursor-pointer"
          >
            Copy Link
          </button>
        </div>
      </div>

      {eventPage.description && (
        <div className="bg-muted/10 border border-foreground/5 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description / Summary</h4>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{eventPage.description}</p>
        </div>
      )}
    </div>
  );
}

function ParticipantsTab() {
  const { eventDetail, eventDetailLoading, setViewingParticipant } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">
          Participants
          {eventDetail && <span className="text-sm text-muted-foreground font-normal ml-2">({eventDetail.participants.length})</span>}
        </h3>
      </div>
      {eventDetailLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading participants...</div>}
      {eventDetail && (
        <div className="border border-foreground/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
                <th className="p-4">Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Country</th>
                <th className="p-4">Category</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {eventDetail.participants.map((p) => (
                <tr key={p._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                  <td className="p-4 font-semibold">{p.name}</td>
                  <td className="p-4 text-xs">
                    <div>{p.email}</div>
                    {p.phone && <div className="text-muted-foreground">{p.phone}</div>}
                  </td>
                  <td className="p-4 text-xs">{p.country}</td>
                  <td className="p-4 text-xs font-bold text-accent">{p.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(p.paymentStatus || 'unpaid') === 'paid' ? 'bg-green-500/10 text-green-500' : (p.paymentStatus || 'unpaid') === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-foreground/10 text-muted-foreground'}`}>
                      {p.paymentStatus || 'unpaid'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => setViewingParticipant(p)}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/70 border border-foreground/10 rounded-lg text-[11px] font-bold transition duration-150 cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {eventDetail.participants.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No participants registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PaymentsTab() {
  const { eventDetail, eventDetailLoading } = useAppStore();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold tracking-tight">
        Payments
        {eventDetail && <span className="text-sm text-muted-foreground font-normal ml-2">({eventDetail.payments.length})</span>}
      </h3>
      {eventDetailLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading payments...</div>}
      {eventDetail && (
        <div className="border border-foreground/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
                <th className="p-4">Order / Payment</th>
                <th className="p-4">Delegate</th>
                <th className="p-4">Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {eventDetail.payments.map((o) => (
                <tr key={o._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                  <td className="p-4 font-mono text-xs text-muted-foreground">{o.orderId}</td>
                  <td className="p-4 font-semibold">{o.name}</td>
                  <td className="p-4 text-xs font-bold text-accent">{o.category}</td>
                  <td className="p-4 font-mono font-semibold">₹{(o.amount / 100).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                      o.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>{o.status}</span>
                  </td>
                </tr>
              ))}
              {eventDetail.payments.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AbstractsTab() {
  const { eventAbstracts, eventAbstractsLoading, eventPageType } = useAppStore();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold tracking-tight">
        Abstracts
        <span className="text-sm text-muted-foreground font-normal ml-2">({eventAbstracts.length})</span>
      </h3>
      {eventAbstractsLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading abstracts...</div>}
      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Author</th>
              <th className="p-4">Institution / Country</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Abstract</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {eventAbstracts.map((abs) => (
              <tr key={abs._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 font-semibold">
                  <div>{abs.name || `${abs.firstName || ''} ${abs.lastName || ''}`.trim()}</div>
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground">{abs.institution || '—'}</div>
                  {abs.country && <div className="mt-0.5">{abs.country}</div>}
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  <div>{abs.email}</div>
                  {abs.phone && <div className="mt-0.5">{abs.phone}</div>}
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  {abs.track && <div className="font-bold text-accent uppercase tracking-wider">{abs.track}</div>}
                  {abs.summary && <div className="mt-1 max-w-md whitespace-pre-wrap">{abs.summary}</div>}
                  {abs.abstractFile && (
                    <a href={mediaUrl(abs.abstractFile)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-secondary hover:underline">
                      View PDF
                    </a>
                  )}
                </td>
                <td className="p-4 text-xs text-muted-foreground">{new Date(abs.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!eventAbstractsLoading && eventAbstracts.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No abstracts submitted for this {eventPageType} yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EnquiriesTab() {
  const { eventEnquiries, eventEnquiriesLoading, eventPageType } = useAppStore();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold tracking-tight">
        Enquiries
        <span className="text-sm text-muted-foreground font-normal ml-2">({eventEnquiries.length})</span>
      </h3>
      {eventEnquiriesLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading enquiries...</div>}
      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Inquiry Type</th>
              <th className="p-4">Message</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {eventEnquiries.map((c) => (
              <tr key={c._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 font-semibold">{c.name}</td>
                <td className="p-4 text-xs">
                  <div>{c.email}</div>
                  {c.phone && <div className="text-muted-foreground">{c.phone}</div>}
                </td>
                <td className="p-4 text-xs font-bold text-accent">{c.subject || 'General'}</td>
                <td className="p-4 text-xs text-muted-foreground max-w-md whitespace-pre-wrap">{c.message}</td>
                <td className="p-4 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!eventEnquiriesLoading && eventEnquiries.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No enquiries for this {eventPageType} yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ value, label, className = '' }: { value: string; label: string; className?: string }) {
  return (
    <div className="bg-background border border-foreground/10 rounded-xl p-5 text-center">
      <div className={`text-3xl font-bold tracking-tight ${className}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

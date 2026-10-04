import { useState } from 'react';
import { Globe, Inbox, Mail, Phone, CheckCircle2, RotateCcw, MessageSquare } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Contact } from '@/lib/types';

type FilterId = 'open' | 'closed' | 'all';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'closed', label: 'Closed' },
  { id: 'all', label: 'All' },
];

function EnquiryRow({ contact }: { contact: Contact }) {
  const { setContactStatus } = useAppStore();
  const [saving, setSaving] = useState(false);
  const isClosed = contact.status === 'closed';

  const toggle = async () => {
    setSaving(true);
    await setContactStatus(contact._id, isClosed ? 'open' : 'closed');
    setSaving(false);
  };

  return (
    <tr className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0 align-top">
      <td className="p-4">
        <div className="font-semibold">{contact.name}</div>
        <div className="text-xs text-muted-foreground">{contact.country}</div>
      </td>
      <td className="p-4 text-xs">
        <div className="flex items-center gap-1.5 break-all"><Mail size={12} className="shrink-0" />{contact.email}</div>
        {contact.phone && <div className="flex items-center gap-1.5 mt-1"><Phone size={12} className="shrink-0" />{contact.phone}</div>}
      </td>
      <td className="p-4 text-xs font-bold text-accent whitespace-nowrap">{contact.subject || 'General'}</td>
      <td className="p-4 text-xs text-muted-foreground max-w-md whitespace-pre-wrap">
        {contact.conference && <div className="font-semibold text-foreground/70 mb-0.5">About: {contact.conference}</div>}
        {contact.message}
      </td>
      <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
        <div>{new Date(contact.createdAt).toLocaleDateString()}</div>
        <div>{new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </td>
      <td className="p-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-1 rounded-full ${
            isClosed ? 'bg-muted text-muted-foreground' : 'bg-emerald-500/15 text-emerald-600'
          }`}
        >
          {isClosed ? <CheckCircle2 size={12} /> : <MessageSquare size={12} />}
          {isClosed ? 'Closed' : 'Open'}
        </span>
      </td>
      <td className="p-4">
        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer disabled:opacity-50 ${
            isClosed
              ? 'border-foreground/20 text-foreground hover:bg-foreground/5'
              : 'border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10'
          }`}
          data-testid={isClosed ? 'button-reopen-enquiry' : 'button-close-enquiry'}
        >
          {isClosed ? <RotateCcw size={13} /> : <CheckCircle2 size={13} />}
          {isClosed ? 'Reopen' : 'Close'}
        </button>
      </td>
    </tr>
  );
}

export function GlobalEnquiriesTab() {
  const { contacts, loadingData, loadTabData, activeTab } = useAppStore();
  const [filter, setFilter] = useState<FilterId>('open');

  const filtered = contacts.filter((c) => filter === 'all' || (c.status === 'closed' ? 'closed' : 'open') === filter);
  const openCount = contacts.filter((c) => c.status !== 'closed').length;
  const closedCount = contacts.length - openCount;
  const counts: Record<FilterId, number> = { open: openCount, closed: closedCount, all: contacts.length };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-foreground/10 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Globe size={22} className="text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Global Enquiries</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Enquiries submitted from the main streamconferences.com contact form (not tied to a specific conference).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadTabData(activeTab)}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-foreground/15 hover:bg-foreground/5 transition"
          >
            Refresh
          </button>
          <div className="flex rounded-lg border border-foreground/15 overflow-hidden">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-3 py-2 text-xs font-bold transition ${
                  filter === f.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-foreground/5'
                }`}
                data-testid={`filter-enquiries-${f.id}`}
              >
                {f.label} ({counts[f.id]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {loadingData && contacts.length === 0 && (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading enquiries...</div>
      )}

      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Inquiry Type</th>
              <th className="p-4">Message</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <EnquiryRow key={c._id} contact={c} />
            ))}
            {!loadingData && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <Inbox size={28} className="mx-auto mb-2 opacity-40" />
                  No {filter !== 'all' ? filter : ''} global enquiries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

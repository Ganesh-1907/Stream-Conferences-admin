import { useAppStore } from '@/store/app-store';
import { registerLinkFor, subdomainUrlFor, mediaUrl } from '@/lib/utils';
import { API_BASE } from '@/lib/constants';
import { EventPageTab, Webinar, Speaker, ItineraryItem, ProgramDay, FAQ, EventPartner, VenueDetails } from '@/lib/types';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { FileUploadCard } from '@/components/file-upload-card';
import { useState, FormEvent } from 'react';
import { Plus, Trash2, GripVertical, Upload, X, ChevronDown, ChevronUp } from 'lucide-react';

const SUBTABS: EventPageTab[] = [
  'dashboard', 'details', 'fees', 'participants', 'payments', 'abstracts', 'enquiries', 'brochures',
  'speakers', 'tracks', 'program', 'itinerary', 'banners', 'faqs', 'partners',
  'guidelines', 'organizer-contact', 'organizing-committee', 'venue-details'
];

const SUBTAB_LABELS: Record<EventPageTab, string> = {
  dashboard: 'Overview',
  details: 'Details',
  fees: 'Fees',
  participants: 'Participants',
  payments: 'Payments',
  abstracts: 'Abstracts',
  enquiries: 'Enquiries',
  brochures: 'Brochure Leads',
  speakers: 'Speakers',
  tracks: 'Tracks',
  program: 'Program',
  itinerary: 'Itinerary',
  banners: 'Banners',
  faqs: 'FAQs',
  partners: 'Sponsors / Exhibitors',
  guidelines: 'Guidelines',
  'organizer-contact': 'Organizer Contact',
  'organizing-committee': 'Organizing Committee',
  'venue-details': 'Venue Details',
};

export function EventPage() {
  const store = useAppStore();
  const { eventPage, eventPageType, currentEventLoading } = store;

  if (currentEventLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">Loading event…</div>;
  }

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
          {subdomainUrlFor(eventPage) && (
            <a
              href={subdomainUrlFor(eventPage)!}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold transition duration-150 cursor-pointer inline-flex items-center gap-1.5"
            >
              View Site
            </a>
          )}
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
      {store.eventPageTab === 'fees' && <FeesTab />}
      {store.eventPageTab === 'participants' && <ParticipantsTab />}
      {store.eventPageTab === 'payments' && <PaymentsTab />}
      {store.eventPageTab === 'abstracts' && <AbstractsTab />}
      {store.eventPageTab === 'enquiries' && <EnquiriesTab />}
      {store.eventPageTab === 'brochures' && <BrochureLeadsTab />}
      {store.eventPageTab === 'speakers' && <SpeakersTab />}
      {store.eventPageTab === 'tracks' && <TracksTab />}
      {store.eventPageTab === 'program' && <ProgramTab />}
      {store.eventPageTab === 'itinerary' && <ItineraryTab />}
      {store.eventPageTab === 'banners' && <BannersTab />}
      {store.eventPageTab === 'faqs' && <FAQsTab />}
      {store.eventPageTab === 'partners' && <PartnersTab />}
      {store.eventPageTab === 'guidelines' && <GuidelinesTab />}
      {store.eventPageTab === 'organizer-contact' && <OrganizerContactTab />}
      {store.eventPageTab === 'organizing-committee' && <OrganizingCommitteeTab />}
      {store.eventPageTab === 'venue-details' && <VenueDetailsTab />}
    </div>
  );
}

function OverviewTab() {
  const { eventDashboard, eventDetailLoading, eventDetailError, eventPage, eventPageType } = useAppStore();
  if (!eventPage || !eventPageType) return null;

  return (
    <div className="space-y-6">
      {eventDetailLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading event dashboard...</div>}
      {eventDetailError && <div className="p-6 text-center text-sm text-red-500">{eventDetailError}</div>}
      {eventDashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard value={String(eventDashboard.stats.totalParticipants)} label="Participants" />
          <StatCard value={String(eventDashboard.stats.totalPayments)} label="Payments" />
          <StatCard value={String(eventDashboard.stats.paidCount)} label="Paid" className="text-green-500" />
          <StatCard value={`₹${eventDashboard.stats.revenue}`} label="Revenue" />
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
  const { eventPage, eventPageType, uploadHeaderBannerForEvent, removeHeaderBannerForEvent } = useAppStore();
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

      {/* Media Assets & Header Banners */}
      <div className="bg-muted/10 border border-foreground/5 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Header Banners (Carousel)</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Carousel banner images displayed on the event microsite home page.</p>
          </div>
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold cursor-pointer hover:bg-primary/90 transition shadow-sm">
            <Plus size={13} /> Add Header Banner
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  uploadHeaderBannerForEvent(eventPage._id, eventPageType, e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>

        {Array.isArray(eventPage.headerBanners) && eventPage.headerBanners.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {eventPage.headerBanners.map((bannerUrl, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-foreground/10 bg-muted/20 aspect-[16/7] flex items-center justify-center">
                <img src={mediaUrl(bannerUrl)} alt={`Header Banner ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeHeaderBannerForEvent(eventPage._id, eventPageType, idx)}
                    className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    title="Delete banner"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 bg-black/60 text-[10px] text-white font-mono rounded">
                  Slide {idx + 1}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-foreground/10 rounded-xl p-4 text-center text-xs text-muted-foreground">
            No carousel header banners uploaded yet. Click &quot;Add Header Banner&quot; above to upload banner slides.
          </div>
        )}

        {(eventPage.logoUrl || eventPage.bannerUrl || eventPage.brochureUrl) && (
          <div className="pt-3 border-t border-foreground/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {eventPage.logoUrl && (
              <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg border border-foreground/5">
                <img src={mediaUrl(eventPage.logoUrl)} alt="Logo" className="w-9 h-9 rounded-full object-cover border" />
                <span className="font-medium text-foreground">Logo configured</span>
              </div>
            )}
            {eventPage.bannerUrl && (
              <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg border border-foreground/5">
                <span className="font-medium text-foreground truncate">Banner: {eventPage.bannerUrl.split('/').pop()}</span>
              </div>
            )}
            {eventPage.brochureUrl && (
              <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg border border-foreground/5">
                <span className="font-medium text-foreground truncate">Brochure: {eventPage.brochureUrl.split('/').pop()}</span>
              </div>
            )}
          </div>
        )}
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
  const { eventParticipants, eventDetailLoading, setViewingParticipant } = useAppStore();
  const { page, totalPages, totalItems, paginatedItems, setPage } = usePagination(eventParticipants ?? []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">
          Participants
          {eventParticipants && <span className="text-sm text-muted-foreground font-normal ml-2">({eventParticipants.length})</span>}
        </h3>
      </div>
      {eventDetailLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading participants...</div>}
      {!eventDetailLoading && (
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
              {paginatedItems.map((p) => (
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
              {totalItems === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No participants registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <PaginationBar page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
    </div>
  );
}

function PaymentsTab() {
  const { eventPayments, eventDetailLoading } = useAppStore();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold tracking-tight">
        Payments
        {eventPayments && <span className="text-sm text-muted-foreground font-normal ml-2">({eventPayments.length})</span>}
      </h3>
      {eventDetailLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading payments...</div>}
      {!eventDetailLoading && (
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
              {eventPayments.map((o) => (
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
              {eventPayments.length === 0 && (
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
  const { eventAbstracts, eventAbstractsLoading, eventPageType, abstractActionLoading, handleAbstractAction } = useAppStore();

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
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Action</th>
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
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    abs.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                    abs.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-foreground/10 text-muted-foreground'
                  }`}>
                    {abs.status || 'pending'}
                  </span>
                  {abs.rejectionReason && <div className="mt-1 text-xs text-muted-foreground">{abs.rejectionReason}</div>}
                </td>
                <td className="p-4 text-xs text-muted-foreground">{new Date(abs.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right whitespace-nowrap">
                  {abs.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleAbstractAction(abs._id, 'approve')}
                      disabled={abstractActionLoading === abs._id}
                      className="px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-xs font-semibold mr-2 transition disabled:opacity-50"
                    >
                      {abstractActionLoading === abs._id ? '...' : 'Approve'}
                    </button>
                  )}
                  {abs.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => handleAbstractAction(abs._id, 'reject')}
                      disabled={abstractActionLoading === abs._id}
                      className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                    >
                      {abstractActionLoading === abs._id ? '...' : 'Reject'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!eventAbstractsLoading && eventAbstracts.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No abstracts submitted for this {eventPageType} yet.</td></tr>
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

function BrochureLeadsTab() {
  const { eventBrochureLeads, eventBrochureLeadsLoading, eventPageType } = useAppStore();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold tracking-tight">
        Brochure Download Leads
        <span className="text-sm text-muted-foreground font-normal ml-2">({eventBrochureLeads.length})</span>
      </h3>
      {eventBrochureLeadsLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading brochure leads...</div>}
      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Institution</th>
              <th className="p-4">Country</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {eventBrochureLeads.map((lead) => (
              <tr key={lead._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 font-semibold">{lead.firstName} {lead.lastName}</td>
                <td className="p-4 text-xs">{lead.email}</td>
                <td className="p-4 text-xs text-muted-foreground">{lead.phone || '—'}</td>
                <td className="p-4 text-xs text-muted-foreground">{lead.institution || '—'}</td>
                <td className="p-4 text-xs text-muted-foreground">{lead.country || '—'}</td>
                <td className="p-4 text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!eventBrochureLeadsLoading && eventBrochureLeads.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No brochure downloads for this {eventPageType} yet.</td></tr>
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

// ============ SPEAKERS TAB ============
function SpeakersTab() {
  const { eventPage, eventPageType, updateEventField } = useAppStore();
  const speakers: Speaker[] = (eventPage as any)?.speakers || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Speaker>({
    name: '', designation: '', organization: '', bio: '', avatar: '',
    linkedin: '', twitter: '', website: '', topic: '', isKeynote: false
  });

  const handleSave = () => {
    const updatedSpeakers = [...speakers];
    if (editingIndex !== null) {
      updatedSpeakers[editingIndex] = formData;
    } else {
      updatedSpeakers.push(formData);
    }
    updateEventField('speakers', updatedSpeakers);
    setEditingIndex(null);
    setFormData({ name: '', designation: '', organization: '', bio: '', avatar: '', linkedin: '', twitter: '', website: '', topic: '', isKeynote: false });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData(speakers[index]);
  };

  const handleDelete = (index: number) => {
    const updatedSpeakers = speakers.filter((_, i) => i !== index);
    updateEventField('speakers', updatedSpeakers);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">Speakers ({speakers.length})</h3>
        <button
          type="button"
          onClick={() => { setEditingIndex(null); setFormData({ name: '', designation: '', organization: '', bio: '', avatar: '', linkedin: '', twitter: '', website: '', topic: '', isKeynote: false }); }}
          className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold flex items-center gap-1"
        >
          <Plus size={14} /> Add Speaker
        </button>
      </div>

      {/* Add/Edit Form */}
      {(editingIndex !== null || formData.name) && (
        <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-sm">{editingIndex !== null ? 'Edit Speaker' : 'Add New Speaker'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name *</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Designation</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.designation || ''} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organization</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.organization || ''} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.topic || ''} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bio</label>
              <textarea className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" rows={3} value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">LinkedIn URL</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.linkedin || ''} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Twitter URL</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.twitter || ''} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Website URL</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.website || ''} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isKeynote" checked={formData.isKeynote || false} onChange={(e) => setFormData({ ...formData, isKeynote: e.target.checked })} className="rounded" />
              <label htmlFor="isKeynote" className="text-sm font-semibold">Keynote Speaker</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} disabled={!formData.name} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold disabled:opacity-50">
              {editingIndex !== null ? 'Update' : 'Add'} Speaker
            </button>
            <button type="button" onClick={() => { setEditingIndex(null); setFormData({ name: '', designation: '', organization: '', bio: '', avatar: '', linkedin: '', twitter: '', website: '', topic: '', isKeynote: false }); }} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-xs font-semibold">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Speakers List */}
      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Name</th>
              <th className="p-4">Designation</th>
              <th className="p-4">Topic</th>
              <th className="p-4">Type</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {speakers.map((speaker, index) => (
              <tr key={index} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 font-semibold">{speaker.name}</td>
                <td className="p-4 text-xs text-muted-foreground">{speaker.designation || '—'}</td>
                <td className="p-4 text-xs text-accent">{speaker.topic || '—'}</td>
                <td className="p-4">
                  {speaker.isKeynote && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded">Keynote</span>}
                </td>
                <td className="p-4 text-right">
                  <button type="button" onClick={() => handleEdit(index)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground mr-2">Edit</button>
                  <button type="button" onClick={() => handleDelete(index)} className="px-2 py-1 text-xs text-red-500 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {speakers.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No speakers added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ PROGRAM TAB ============
function ProgramTab() {
  const { eventPage, updateEventField } = useAppStore();
  const program: ProgramDay[] = (eventPage as any)?.program || [];
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [dayForm, setDayForm] = useState<ProgramDay>({ dayNumber: 1, title: '', description: '', sessions: [] });
  const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(null);
  const [sessionForm, setSessionForm] = useState<ItineraryItem>({ time: '', title: '', description: '', speaker: '', track: '', type: 'session' });

  const handleSaveDay = () => {
    const updatedProgram = [...program];
    if (editingDayIndex !== null) {
      updatedProgram[editingDayIndex] = dayForm;
    } else {
      updatedProgram.push(dayForm);
    }
    updateEventField('program', updatedProgram);
    setEditingDayIndex(null);
    setDayForm({ dayNumber: program.length + 1, title: '', description: '', sessions: [] });
  };

  const handleSaveSession = () => {
    if (editingDayIndex === null) return;
    const updatedProgram = [...program];
    const sessions = [...(updatedProgram[editingDayIndex].sessions || [])];
    if (editingSessionIndex !== null) {
      sessions[editingSessionIndex] = sessionForm;
    } else {
      sessions.push(sessionForm);
    }
    updatedProgram[editingDayIndex] = { ...updatedProgram[editingDayIndex], sessions };
    updateEventField('program', updatedProgram);
    setEditingSessionIndex(null);
    setSessionForm({ time: '', title: '', description: '', speaker: '', track: '', type: 'session' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">Program ({program.length} days)</h3>
        <button type="button" onClick={() => { setEditingDayIndex(null); setDayForm({ dayNumber: program.length + 1, title: '', description: '', sessions: [] }); }} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold flex items-center gap-1">
          <Plus size={14} /> Add Day
        </button>
      </div>

      {/* Day Form */}
      {(editingDayIndex !== null || dayForm.title) && (
        <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-sm">{editingDayIndex !== null ? 'Edit Day' : 'Add New Day'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Day Number *</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={dayForm.dayNumber} onChange={(e) => setDayForm({ ...dayForm, dayNumber: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={dayForm.title || ''} onChange={(e) => setDayForm({ ...dayForm, title: e.target.value })} placeholder="e.g., Day 1 - Opening Ceremony" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</label>
              <input type="date" className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={dayForm.date || ''} onChange={(e) => setDayForm({ ...dayForm, date: e.target.value })} />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
              <textarea className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" rows={2} value={dayForm.description || ''} onChange={(e) => setDayForm({ ...dayForm, description: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleSaveDay} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold">Save Day</button>
            <button type="button" onClick={() => { setEditingDayIndex(null); setDayForm({ dayNumber: program.length + 1, title: '', description: '', sessions: [] }); }} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-xs font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {/* Days List */}
      {program.map((day, dayIdx) => (
        <div key={dayIdx} className="border border-foreground/10 rounded-xl overflow-hidden">
          <div className="bg-muted/50 p-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold">Day {day.dayNumber}{day.title && ` - ${day.title}`}</h4>
              {day.date && <p className="text-xs text-muted-foreground">{new Date(day.date).toLocaleDateString()}</p>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setEditingDayIndex(dayIdx); setDayForm(day); }} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground">Edit Day</button>
              <button type="button" onClick={() => { setEditingSessionIndex(null); setSessionForm({ time: '', title: '', description: '', speaker: '', track: '', type: 'session' }); setEditingDayIndex(dayIdx); }} className="px-2 py-1 text-xs text-secondary hover:text-secondary/80 flex items-center gap-1"><Plus size={12} /> Add Session</button>
            </div>
          </div>
          
          {/* Session Form */}
          {editingDayIndex === dayIdx && (
            <div className="bg-muted/20 p-4 border-t border-foreground/5 space-y-3">
              <h5 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{editingSessionIndex !== null ? 'Edit Session' : 'Add Session'}</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold">Time *</label>
                  <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={sessionForm.time} onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })} placeholder="e.g., 09:00 AM" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold">Title *</label>
                  <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Type</label>
                  <select className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={sessionForm.type} onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value as any })}>
                    <option value="session">Session</option>
                    <option value="keynote">Keynote</option>
                    <option value="panel">Panel</option>
                    <option value="workshop">Workshop</option>
                    <option value="break">Break</option>
                    <option value="networking">Networking</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold">Speaker</label>
                  <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={sessionForm.speaker || ''} onChange={(e) => setSessionForm({ ...sessionForm, speaker: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Track</label>
                  <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={sessionForm.track || ''} onChange={(e) => setSessionForm({ ...sessionForm, track: e.target.value })} />
                </div>
                <div className="md:col-span-4">
                  <label className="text-xs font-semibold">Description</label>
                  <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={sessionForm.description || ''} onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleSaveSession} disabled={!sessionForm.time || !sessionForm.title} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold disabled:opacity-50">Save Session</button>
                <button type="button" onClick={() => { setEditingSessionIndex(null); setSessionForm({ time: '', title: '', description: '', speaker: '', track: '', type: 'session' }); }} className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-semibold">Cancel</button>
              </div>
            </div>
          )}
          
          {/* Sessions List */}
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground font-semibold text-xs">
                <th className="p-3">Time</th>
                <th className="p-3">Session</th>
                <th className="p-3">Speaker</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {day.sessions.map((session, sIdx) => (
                <tr key={sIdx} className="border-t border-foreground/5 hover:bg-foreground/[0.02]">
                  <td className="p-3 font-mono text-xs">{session.time}</td>
                  <td className="p-3 font-semibold">{session.title}</td>
                  <td className="p-3 text-xs text-muted-foreground">{session.speaker || '—'}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold uppercase">{session.type}</span></td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => { setEditingSessionIndex(sIdx); setSessionForm(session); }} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground mr-2">Edit</button>
                    <button type="button" onClick={() => { const updated = [...program]; updated[dayIdx].sessions = day.sessions.filter((_, i) => i !== sIdx); updateEventField('program', updated); }} className="px-2 py-1 text-xs text-red-500 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {day.sessions.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground text-xs">No sessions added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ============ ITINERARY TAB ============
function ItineraryTab() {
  const { eventPage, updateEventField } = useAppStore();
  const itinerary: ItineraryItem[] = (eventPage as any)?.itinerary || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ItineraryItem>({ time: '', title: '', description: '', speaker: '', track: '', type: 'session' });

  const handleSave = () => {
    const updated = [...itinerary];
    if (editingIndex !== null) {
      updated[editingIndex] = formData;
    } else {
      updated.push(formData);
    }
    updateEventField('itinerary', updated);
    setEditingIndex(null);
    setFormData({ time: '', title: '', description: '', speaker: '', track: '', type: 'session' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">Itinerary ({itinerary.length} items)</h3>
        <button type="button" onClick={() => { setEditingIndex(null); setFormData({ time: '', title: '', description: '', speaker: '', track: '', type: 'session' }); }} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold flex items-center gap-1">
          <Plus size={14} /> Add Item
        </button>
      </div>

      {/* Form */}
      {(editingIndex !== null || formData.title) && (
        <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-sm">{editingIndex !== null ? 'Edit Item' : 'Add New Item'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time *</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder="e.g., 09:00 AM" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title *</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</label>
              <select className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                <option value="session">Session</option>
                <option value="keynote">Keynote</option>
                <option value="panel">Panel</option>
                <option value="workshop">Workshop</option>
                <option value="break">Break</option>
                <option value="networking">Networking</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Speaker</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.speaker || ''} onChange={(e) => setFormData({ ...formData, speaker: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} disabled={!formData.time || !formData.title} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold disabled:opacity-50">
              {editingIndex !== null ? 'Update' : 'Add'} Item
            </button>
            <button type="button" onClick={() => { setEditingIndex(null); setFormData({ time: '', title: '', description: '', speaker: '', track: '', type: 'session' }); }} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-xs font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Time</th>
              <th className="p-4">Title</th>
              <th className="p-4">Speaker</th>
              <th className="p-4">Type</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {itinerary.map((item, index) => (
              <tr key={index} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 font-mono text-xs">{item.time}</td>
                <td className="p-4 font-semibold">{item.title}</td>
                <td className="p-4 text-xs text-muted-foreground">{item.speaker || '—'}</td>
                <td className="p-4"><span className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold uppercase">{item.type}</span></td>
                <td className="p-4 text-right">
                  <button type="button" onClick={() => { setEditingIndex(index); setFormData(item); }} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground mr-2">Edit</button>
                  <button type="button" onClick={() => { const updated = itinerary.filter((_, i) => i !== index); updateEventField('itinerary', updated); }} className="px-2 py-1 text-xs text-red-500 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {itinerary.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No itinerary items added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ FAQS TAB ============
function FAQsTab() {
  const { eventPage, updateEventField } = useAppStore();
  const faqs: FAQ[] = (eventPage as any)?.faqs || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<FAQ>({ question: '', answer: '', order: 0 });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleSave = () => {
    const updated = [...faqs];
    if (editingIndex !== null) {
      updated[editingIndex] = formData;
    } else {
      updated.push(formData);
    }
    updateEventField('faqs', updated);
    setEditingIndex(null);
    setFormData({ question: '', answer: '', order: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">FAQs ({faqs.length})</h3>
        <button type="button" onClick={() => { setEditingIndex(null); setFormData({ question: '', answer: '', order: faqs.length }); }} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold flex items-center gap-1">
          <Plus size={14} /> Add FAQ
        </button>
      </div>

      {/* Form */}
      {(editingIndex !== null || formData.question) && (
        <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-sm">{editingIndex !== null ? 'Edit FAQ' : 'Add New FAQ'}</h4>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Question *</label>
              <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Answer *</label>
              <textarea className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" rows={4} value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order</label>
                <input type="number" className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.order || 0} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} disabled={!formData.question || !formData.answer} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold disabled:opacity-50">
              {editingIndex !== null ? 'Update' : 'Add'} FAQ
            </button>
            <button type="button" onClick={() => { setEditingIndex(null); setFormData({ question: '', answer: '', order: 0 }); }} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-xs font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-foreground/10 rounded-xl overflow-hidden">
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{faq.question}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={(e) => { e.stopPropagation(); setEditingIndex(index); setFormData(faq); }} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground">Edit</button>
                <button type="button" onClick={(e) => { e.stopPropagation(); const updated = faqs.filter((_, i) => i !== index); updateEventField('faqs', updated); }} className="px-2 py-1 text-xs text-red-500 hover:text-red-600">Delete</button>
                {expandedIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            {expandedIndex === index && (
              <div className="p-4 pt-0 text-sm text-muted-foreground border-t border-foreground/5">{faq.answer}</div>
            )}
          </div>
        ))}
        {faqs.length === 0 && (
          <div className="p-8 text-center text-muted-foreground border border-foreground/10 rounded-xl">No FAQs added yet.</div>
        )}
      </div>
    </div>
  );
}

// ============ SPONSORS TAB ============
function PartnersTab() {
  const { eventPage, updateEventField } = useAppStore();
  const rawPartners = (eventPage as any)?.partners?.length
    ? (eventPage as any).partners
    : ((eventPage as any)?.sponsors?.length
      ? (eventPage as any).sponsors
      : (eventPage as any)?.exhibitors || []);
  const partners: EventPartner[] = Array.isArray(rawPartners)
    ? rawPartners.map((p: any, idx: number) => ({ title: p.title || p.name || '', order: typeof p.order === 'number' ? p.order : idx }))
    : [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [title, setTitle] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;
    const updated = [...partners];
    if (editingIndex !== null) {
      updated[editingIndex] = { title: title.trim(), order: editingIndex };
    } else {
      updated.push({ title: title.trim(), order: partners.length });
    }
    updateEventField('partners', updated);
    setEditingIndex(null);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">Sponsors / Exhibitors ({partners.length})</h3>
        <button type="button" onClick={() => { setEditingIndex(null); setTitle(''); }} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold flex items-center gap-1">
          <Plus size={14} /> Add Sponsor / Exhibitor
        </button>
      </div>

      {(editingIndex !== null || title) && (
        <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-sm">{editingIndex !== null ? 'Edit Sponsor / Exhibitor' : 'Add New Sponsor / Exhibitor'}</h4>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title *</label>
            <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }} placeholder="e.g. Gold Sponsor, Silver Exhibitor..." />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} disabled={!title.trim()} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold disabled:opacity-50">
              {editingIndex !== null ? 'Update' : 'Add'} Sponsor / Exhibitor
            </button>
            <button type="button" onClick={() => { setEditingIndex(null); setTitle(''); }} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-xs font-semibold">Cancel</button>
          </div>
        </div>
      )}

      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">#</th>
              <th className="p-4">Title</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner, index) => (
              <tr key={index} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 text-muted-foreground">{index + 1}</td>
                <td className="p-4 font-semibold">{partner.title}</td>
                <td className="p-4 text-right">
                  <button type="button" onClick={() => { setEditingIndex(index); setTitle(partner.title); }} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground mr-2">Edit</button>
                  <button type="button" onClick={() => { const updated = partners.filter((_, i) => i !== index); updateEventField('partners', updated); }} className="px-2 py-1 text-xs text-red-500 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No partners added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ GUIDELINES TAB ============
function GuidelinesTab() {
  const { eventPage, updateEventField } = useAppStore();
  const guidelines = (eventPage as any)?.guidelines || '';
  const [content, setContent] = useState(guidelines);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    updateEventField('guidelines', content);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">Guidelines</h3>
        <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Guidelines Content (HTML supported)</label>
        <textarea
          className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-lg text-sm font-mono"
          rows={20}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter guidelines content here... HTML is supported."
        />
        <p className="mt-2 text-xs text-muted-foreground">You can use HTML tags for formatting. Preview will be shown on the conference website.</p>
      </div>
      {content && (
        <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Preview</h4>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  );
}

// ============ BANNERS TAB ============
function BannersTab() {
  const { eventPage, eventPageType, uploadHeaderBannerForEvent, removeHeaderBannerForEvent, user } = useAppStore();
  const [uploading, setUploading] = useState(false);
  const banners: string[] = (eventPage as any)?.headerBanners || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventPage || !eventPageType) return;
    setUploading(true);
    await uploadHeaderBannerForEvent(eventPage._id, eventPageType, file);
    setUploading(false);
    e.target.value = '';
  };

  const handleRemove = async (index: number) => {
    if (!eventPage || !eventPageType) return;
    await removeHeaderBannerForEvent(eventPage._id, eventPageType, index);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Header Banners (Carousel)</h3>
          <p className="text-sm text-muted-foreground mt-1">Add images that will rotate in the banner carousel on the event homepage.</p>
        </div>
        <label className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Add Banner'}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {banners.length === 0 ? (
        <div className="border border-dashed border-foreground/20 rounded-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">No banners uploaded yet. Add images for the carousel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((url, i) => (
            <div key={i} className="relative group border border-foreground/10 rounded-xl overflow-hidden">
              <img src={mediaUrl(url)} alt={`Banner ${i + 1}`} className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
              >
                Remove
              </button>
              <div className="p-3 text-xs text-muted-foreground">Banner {i + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ TRACKS TAB ============
function TracksTab() {
  const { eventPage, updateEventField, user } = useAppStore();
  const tracks: any[] = (eventPage as any)?.tracks || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', image: '', referenceLinks: [] as { label: string; url: string }[] });

  const resetForm = () => {
    setFormData({ title: '', description: '', image: '', referenceLinks: [] });
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleEdit = (index: number) => {
    const track = tracks[index];
    setFormData({ title: track.title, description: track.description || '', image: track.image || '', referenceLinks: track.referenceLinks || [] });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleSave = () => {
    const updated = [...tracks];
    if (editingIndex !== null) {
      updated[editingIndex] = formData;
    } else {
      updated.push(formData);
    }
    updateEventField('tracks', updated);
    resetForm();
  };

  const handleDelete = (index: number) => {
    const updated = tracks.filter((_, i) => i !== index);
    updateEventField('tracks', updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0];
    if (!file || !eventPage) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/uploads/upload`, {
      method: 'POST',
      headers: { 'x-user-role': user?.role || '', 'x-user-name': user?.username || '' },
      body: fd,
    });
    const data = await res.json();
    if (data.url) {
      if (index !== undefined) {
        const updated = [...tracks];
        updated[index] = { ...updated[index], image: data.url };
        updateEventField('tracks', updated);
      } else {
        setFormData(prev => ({ ...prev, image: data.url }));
      }
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Conference Tracks</h3>
          <p className="text-sm text-muted-foreground mt-1">Define the main themes or tracks for this event.</p>
        </div>
        <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90">
          Add Track
        </button>
      </div>

      {showForm && (
        <div className="border border-foreground/10 rounded-xl p-5 space-y-4 bg-muted/20">
          <h4 className="font-bold text-sm">{editingIndex !== null ? 'Edit Track' : 'New Track'}</h4>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Title</label>
            <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="Track title" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
            <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" rows={3} placeholder="Brief description" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Image</label>
            {formData.image && <img src={mediaUrl(formData.image)} alt="Track" className="w-32 h-20 object-cover rounded-lg mb-2" />}
            <label className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold cursor-pointer">
              Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
            </label>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} disabled={!formData.title} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold disabled:opacity-50">
              {editingIndex !== null ? 'Update' : 'Add Track'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">#</th>
              <th className="p-4">Title</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr key={index} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 text-muted-foreground">{index + 1}</td>
                <td className="p-4 font-semibold">{track.title}</td>
                <td className="p-4 text-muted-foreground text-xs max-w-xs truncate">{track.description || '—'}</td>
                <td className="p-4 text-right">
                  <button type="button" onClick={() => handleEdit(index)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground mr-2">Edit</button>
                  <button type="button" onClick={() => handleDelete(index)} className="px-2 py-1 text-xs text-red-500 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {tracks.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No tracks added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ FEES TAB ============
function FeesTab() {
  const { eventPage, updateEventField } = useAppStore();
  const fees: { label: string; amount: number }[] = (eventPage as any)?.fees || [];
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSave = () => {
    if (!label || !amount) return;
    const updated = [...fees];
    const entry = { label, amount: Number(amount) };
    if (editingIndex !== null) {
      updated[editingIndex] = entry;
    } else {
      updated.push(entry);
    }
    updateEventField('fees', updated);
    setLabel('');
    setAmount('');
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    setLabel(fees[index].label);
    setAmount(String(fees[index].amount));
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    updateEventField('fees', fees.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold tracking-tight">Registration Fees</h3>
        <p className="text-sm text-muted-foreground mt-1">Define registration categories and their fees.</p>
      </div>

      <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Category Label</label>
            <input value={label} onChange={e => setLabel(e.target.value)} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="e.g. Early Bird, Student" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Amount (INR)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="e.g. 5000" />
          </div>
          <div className="flex items-end gap-2">
            <button type="button" onClick={handleSave} disabled={!label || !amount} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold disabled:opacity-50">
              {editingIndex !== null ? 'Update' : 'Add Fee'}
            </button>
            {editingIndex !== null && (
              <button type="button" onClick={() => { setLabel(''); setAmount(''); setEditingIndex(null); }} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">#</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Amount (INR)</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee, index) => (
              <tr key={index} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 text-muted-foreground">{index + 1}</td>
                <td className="p-4 font-semibold">{fee.label}</td>
                <td className="p-4 text-right">₹{fee.amount.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <button type="button" onClick={() => handleEdit(index)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground mr-2">Edit</button>
                  <button type="button" onClick={() => handleDelete(index)} className="px-2 py-1 text-xs text-red-500 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No fee categories defined yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ ORGANIZER CONTACT TAB ============
function OrganizerContactTab() {
  const { eventPage, updateEventField } = useAppStore();
  const contact: any = (eventPage as any)?.organizerContact || {};
  const [form, setForm] = useState({
    name: contact.name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    website: contact.website || '',
    address: contact.address || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    updateEventField('organizerContact', form);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Organizer Contact</h3>
          <p className="text-sm text-muted-foreground mt-1">Contact information displayed on the event website.</p>
        </div>
        <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Contact Person Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="Full name" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="contact@example.com" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Phone</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="+91 XXXXX XXXXX" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Website</label>
            <input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="https://..." />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Address</label>
          <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" rows={2} placeholder="Full address" />
        </div>
      </div>
    </div>
  );
}

// ============ ORGANIZING COMMITTEE TAB ============
function OrganizingCommitteeTab() {
  const { eventPage, updateEventField, user } = useAppStore();
  const committee: any[] = (eventPage as any)?.organizingCommittee || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', degree: '', specialization: '', country: '', biography: '', researchArea: '', image: '' });

  const resetForm = () => {
    setFormData({ name: '', degree: '', specialization: '', country: '', biography: '', researchArea: '', image: '' });
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleEdit = (index: number) => {
    const member = committee[index];
    setFormData({ name: member.name || '', degree: member.degree || '', specialization: member.specialization || '', country: member.country || '', biography: member.biography || '', researchArea: member.researchArea || '', image: member.image || '' });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleSave = () => {
    const updated = [...committee];
    if (editingIndex !== null) {
      updated[editingIndex] = formData;
    } else {
      updated.push(formData);
    }
    updateEventField('organizingCommittee', updated);
    resetForm();
  };

  const handleDelete = (index: number) => {
    updateEventField('organizingCommittee', committee.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/uploads/upload`, {
      method: 'POST',
      headers: { 'x-user-role': user?.role || '', 'x-user-name': user?.username || '' },
      body: fd,
    });
    const data = await res.json();
    if (data.url) setFormData(prev => ({ ...prev, image: data.url }));
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Organizing Committee</h3>
          <p className="text-sm text-muted-foreground mt-1">Members of the organizing committee for this event.</p>
        </div>
        <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90">
          Add Member
        </button>
      </div>

      {showForm && (
        <div className="border border-foreground/10 rounded-xl p-5 space-y-4 bg-muted/20">
          <h4 className="font-bold text-sm">{editingIndex !== null ? 'Edit Member' : 'New Member'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Name</label>
              <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="Full name" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Degree / Title</label>
              <input value={formData.degree} onChange={e => setFormData(p => ({ ...p, degree: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="e.g. MD, PhD" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Specialization</label>
              <input value={formData.specialization} onChange={e => setFormData(p => ({ ...p, specialization: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="e.g. Cardiology" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Country</label>
              <input value={formData.country} onChange={e => setFormData(p => ({ ...p, country: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="Country" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Research Area</label>
            <input value={formData.researchArea} onChange={e => setFormData(p => ({ ...p, researchArea: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="Research interests" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Biography</label>
            <textarea value={formData.biography} onChange={e => setFormData(p => ({ ...p, biography: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" rows={3} placeholder="Brief bio" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Photo</label>
            {formData.image && <img src={mediaUrl(formData.image)} alt="Member" className="w-20 h-20 object-cover rounded-full mb-2" />}
            <label className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold cursor-pointer">
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} disabled={!formData.name} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold disabled:opacity-50">
              {editingIndex !== null ? 'Update' : 'Add Member'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {committee.map((member, index) => (
          <div key={index} className="border border-foreground/10 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {member.image ? (
                  <img src={mediaUrl(member.image)} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold">{member.name?.charAt(0)}</div>
                )}
                <div>
                  <div className="font-semibold text-sm">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.degree} {member.specialization}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => handleEdit(index)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground">Edit</button>
                <button type="button" onClick={() => handleDelete(index)} className="px-2 py-1 text-xs text-red-500 hover:text-red-600">Delete</button>
              </div>
            </div>
            {member.country && <div className="text-xs text-muted-foreground">{member.country}</div>}
            {member.researchArea && <div className="text-xs text-muted-foreground">Research: {member.researchArea}</div>}
          </div>
        ))}
        {committee.length === 0 && (
          <div className="col-span-full border border-dashed border-foreground/20 rounded-xl p-12 text-center">
            <p className="text-sm text-muted-foreground">No committee members added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ VENUE DETAILS TAB ============
function VenueDetailsTab() {
  const { eventPage, updateEventField } = useAppStore();
  const venueDetails: VenueDetails = (eventPage as any)?.venueDetails || {};
  const [formData, setFormData] = useState<VenueDetails>({
    name: venueDetails.name || '',
    address: venueDetails.address || '',
    city: venueDetails.city || '',
    state: venueDetails.state || '',
    country: venueDetails.country || '',
    pincode: venueDetails.pincode || '',
    description: venueDetails.description || '',
    mapUrl: venueDetails.mapUrl || '',
    directions: venueDetails.directions || '',
    parking: venueDetails.parking || '',
    accommodation: venueDetails.accommodation || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    updateEventField('venueDetails', formData);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight">Venue Details</h3>
        <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Venue Name</label>
            <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Convention Center" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address</label>
            <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City</label>
            <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">State</label>
            <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.state || ''} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</label>
            <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.country || ''} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pincode</label>
            <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.pincode || ''} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Google Maps Embed URL</label>
            <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.mapUrl || ''} onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })} placeholder="https://www.google.com/maps/embed?..." />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
            <textarea className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" rows={3} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">How to Reach (Directions)</label>
            <textarea className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" rows={3} value={formData.directions || ''} onChange={(e) => setFormData({ ...formData, directions: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Parking Information</label>
            <textarea className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" rows={2} value={formData.parking || ''} onChange={(e) => setFormData({ ...formData, parking: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Accommodation</label>
            <textarea className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" rows={2} value={formData.accommodation || ''} onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  );
}

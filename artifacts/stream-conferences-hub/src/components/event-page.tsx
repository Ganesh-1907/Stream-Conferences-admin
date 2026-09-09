import { useAppStore } from '@/store/app-store';
import { registerLinkFor, subdomainUrlFor, mediaUrl, cohortSiteUrlFor, stringToDate, dateToString } from '@/lib/utils';
import { API_BASE } from '@/lib/constants';
import { EventPageTab, Webinar, Speaker, ProgramDay, FAQ, EventPartner, VenueDetails, CourseCohort, Conference, EventType, FeeEntry, FeeGroup } from '@/lib/types';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { FileUploadCard } from '@/components/file-upload-card';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState, FormEvent, useEffect, Fragment, useRef, useMemo } from 'react';
import {
  Plus, Trash2, GripVertical, Upload, X, ChevronDown, ChevronUp,
  ArrowLeft, ExternalLink, Link as LinkIcon,
  LayoutDashboard, FileText, CreditCard, Users, Receipt,
  FileCheck, MessageSquare, Download, GraduationCap,
  Mic, Layers, CalendarDays, Clock, Image as ImageIcon,
  HelpCircle, Handshake, ShieldAlert, Phone, Users2, MapPin, Building2,
  MoreVertical, UserPlus, Pencil, Eye, Check, Copy, Video, Save, UploadCloud
} from 'lucide-react';

interface SubtabItem {
  tab: EventPageTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SubtabGroup {
  title: string;
  items: SubtabItem[];
  viewOnly?: boolean;
}

const SUBTAB_GROUPS: SubtabGroup[] = [
  {
    title: 'General',
    items: [
      { tab: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { tab: 'details', label: 'Details / About', icon: FileText },
      { tab: 'scientific-program', label: 'Scientific Program', icon: FileCheck },
      { tab: 'color-theme', label: 'Color Theme', icon: Layers },
      { tab: 'fees', label: 'Fees & Pricing', icon: CreditCard },
      { tab: 'banners', label: 'Header & Banners', icon: ImageIcon },
    ],
  },
  {
    title: 'Attendees & Submissions',
    viewOnly: true,
    items: [
      { tab: 'participants', label: 'Participants', icon: Users },
      { tab: 'payments', label: 'Payments', icon: Receipt },
      { tab: 'abstracts', label: 'Abstracts', icon: FileCheck },
      { tab: 'enquiries', label: 'Enquiries', icon: MessageSquare },
      { tab: 'brochures', label: 'Brochure Leads', icon: Download },
      { tab: 'cohorts', label: 'Cohorts', icon: GraduationCap },
    ],
  },
  {
    title: 'Program & Agenda',
    items: [
      { tab: 'speakers', label: 'Speakers', icon: Mic },
      { tab: 'tracks', label: 'Tracks', icon: Layers },
      { tab: 'program', label: 'Program Schedule', icon: CalendarDays },
    ],
  },
  {
    title: 'Information & Setup',
    items: [
      { tab: 'faqs', label: 'FAQs', icon: HelpCircle },
      { tab: 'partners', label: 'Sponsors & Exhibitors', icon: Handshake },
      { tab: 'guidelines', label: 'Guidelines', icon: ShieldAlert },
      { tab: 'venue-details', label: 'Venue & Schedule', icon: MapPin },
      { tab: 'organizer-contact', label: 'Organizer Contact', icon: Phone },
      { tab: 'organizing-committee', label: 'Organizing Committee', icon: Users2 },
    ],
  },
];

export function EventPage() {
  const store = useAppStore();
  const { eventPage, eventPageType, currentEventLoading, eventParticipants } = store;
  const [actionsOpen, setActionsOpen] = useState(false);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    }
    if (actionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [actionsOpen]);

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    setCopyNotice(msg);
    setTimeout(() => setCopyNotice(null), 2500);
  };

  const eventIdDisplay = useMemo(() => {
    if (!eventPage) return '—';
    return eventPage.eventId || (eventPage._id ? `EV-${eventPage._id.slice(-6).toUpperCase()}` : '—');
  }, [eventPage]);

  const dateDisplay = useMemo(() => {
    if (!eventPage) return 'Date TBA';
    if (eventPage.startDate && eventPage.endDate) {
      const start = new Date(eventPage.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const end = new Date(eventPage.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const time = eventPage.startTime ? ` ${eventPage.startTime}` : '';
      return `${start} to ${end}${time}`;
    }
    if (eventPage.eventDate) return eventPage.eventDate;
    if (eventPage.day && eventPage.month) return `${eventPage.day} ${eventPage.month}`;
    return 'Date TBA';
  }, [eventPage]);

  const attendeesCount = eventParticipants?.length ?? 0;

  const locationDisplay = useMemo(() => {
    if (!eventPage) return '—';
    if (eventPageType === 'webinar') {
      return 'Online Webinar';
    }
    return eventPage.location || eventPage.venue || 'Venue TBA';
  }, [eventPage, eventPageType]);

  const feeDisplay = useMemo(() => {
    if (!eventPage?.fees || eventPage.fees.length === 0) return null;
    const first = eventPage.fees[0];
    if (first.usd) return `$${first.usd}`;
    if (first.eur) return `€${first.eur}`;
    if (first.gbp) return `£${first.gbp}`;
    return null;
  }, [eventPage]);

  const isActive = eventPage?.date !== 'past';
  const subdomainUrl = eventPage ? subdomainUrlFor(eventPage) : null;
  const registerUrl = eventPage ? registerLinkFor(eventPage) : null;

  if (currentEventLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">Loading event…</div>;
  }

  if (!eventPage || !eventPageType) return null;

  return (
    <div className="w-full space-y-6">
      {/* Event Top Bar (Matching Reference Layout) */}
      <div className="bg-card border border-foreground/10 rounded-2xl px-6 py-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left Side: Back Arrow, Title, Subtitle, and Metadata strip */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {store.eventPageMode === 'view' ? (
            <button
              type="button"
              onClick={store.closeEventPage}
              title={`Back to ${eventPageType === 'conference' ? 'Conferences' : 'Webinars'}`}
              className="mt-0.5 p-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl border border-foreground/10 transition duration-150 cursor-pointer shrink-0"
            >
              <ArrowLeft size={17} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => store.setEventPageMode('view')}
              title="Back to View Details"
              className="mt-0.5 p-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl border border-foreground/10 transition duration-150 cursor-pointer shrink-0 inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={17} />
              <span className="text-xs font-bold hidden sm:inline">Back</span>
            </button>
          )}

          <div className="min-w-0 flex-1 space-y-1">
            {/* Title */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {eventPage.title}
              </h1>
              {store.eventPageMode === 'edit' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  Editing
                </span>
              )}
            </div>

            {/* Subtitle / Theme / Tagline */}
            {(eventPage.theme || eventPage.description) && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {eventPage.theme || (eventPageType === 'conference' ? 'International Conference' : 'Interactive Online Webinar')}
              </p>
            )}

            {/* Metadata Row */}
            <div className="flex items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground flex-wrap pt-1 font-medium">
              {/* Event ID */}
              <div className="flex items-center gap-1 text-foreground/80 font-semibold">
                <span className="text-muted-foreground font-normal">ID:</span>
                <span>{eventIdDisplay}</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5">
                <CalendarDays size={14} className="text-primary/70 shrink-0" />
                <span>{dateDisplay}</span>
              </div>

              {/* Attendees / Participants */}
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-primary/70 shrink-0" />
                <span>{attendeesCount}</span>
                <span className="text-muted-foreground/60 text-[11px]">Attendees</span>
              </div>

              {/* Location or Webinar Mode */}
              <div className="flex items-center gap-1.5">
                {eventPageType === 'webinar' ? (
                  <Video size={14} className="text-primary/70 shrink-0" />
                ) : (
                  <MapPin size={14} className="text-primary/70 shrink-0" />
                )}
                <span>{locationDisplay}</span>
              </div>

              {/* Price / Fee (if available) */}
              {feeDisplay && (
                <div className="flex items-center gap-1.5 text-foreground/90 font-semibold">
                  <CreditCard size={14} className="text-primary/70 shrink-0" />
                  <span>{feeDisplay}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Status Badges, Share, Actions Button */}
        <div className="flex flex-row lg:flex-col items-end justify-between lg:justify-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-foreground/10">
          {/* Top Row: Status and Type Pills */}
          <div className="flex items-center gap-2">
            {/* Event Status */}
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-foreground/10">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                Past
              </span>
            )}

            {/* Event Type */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {eventPageType}
            </span>
          </div>

          {/* Bottom Row: Edit Button + Actions Dropdown */}
          <div className="flex items-center gap-2">
            {store.eventPageMode === 'view' ? (
              <button
                type="button"
                onClick={() => store.setEventPageMode('edit')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold transition hover:opacity-90 inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Pencil size={13} />
                <span>Edit</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => store.setEventPageMode('view')}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-xs font-bold transition hover:opacity-90 inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Eye size={13} />
                <span>View Details</span>
              </button>
            )}

            {/* Actions ▾ Dropdown */}
            <div className="relative" ref={actionsDropdownRef}>
              <button
                type="button"
                onClick={() => setActionsOpen((prev) => !prev)}
                className="px-3.5 py-2 bg-card hover:bg-muted/60 text-foreground border border-foreground/15 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Actions</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-150 ${actionsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {actionsOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-card border border-foreground/15 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setActionsOpen(false);
                      store.setEventPageMode('view');
                      store.openEventTab('details');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-foreground/5 transition text-left cursor-pointer"
                  >
                    <Eye size={14} className="text-muted-foreground" />
                    <span>View Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionsOpen(false);
                      store.setEventPageMode('edit');
                      store.openEventTab('details');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-foreground/5 transition text-left cursor-pointer"
                  >
                    <Pencil size={14} className="text-muted-foreground" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionsOpen(false);
                      store.openEventTab('dashboard');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-foreground/5 transition text-left cursor-pointer"
                  >
                    <LayoutDashboard size={14} className="text-muted-foreground" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionsOpen(false);
                      store.openEventTab('participants');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-foreground/5 transition text-left cursor-pointer"
                  >
                    <Users size={14} className="text-muted-foreground" />
                    <span>Participants</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionsOpen(false);
                      store.openEventTab('payments');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-foreground/5 transition text-left cursor-pointer"
                  >
                    <Receipt size={14} className="text-muted-foreground" />
                    <span>Payments</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionsOpen(false);
                      store.openEventTab('cohorts');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-foreground/5 transition text-left cursor-pointer"
                  >
                    <GraduationCap size={14} className="text-muted-foreground" />
                    <span>Cohorts</span>
                  </button>

                  {(subdomainUrl || registerUrl) && <div className="border-t border-foreground/10 my-1" />}

                  {subdomainUrl && (
                    <a
                      href={subdomainUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setActionsOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-foreground/5 transition text-left"
                    >
                      <ExternalLink size={14} className="text-muted-foreground" />
                      <span>View Public Site</span>
                    </a>
                  )}

                  {registerUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setActionsOpen(false);
                        copyToClipboard(registerUrl, 'Registration link copied!');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-foreground/5 transition text-left cursor-pointer"
                    >
                      <LinkIcon size={14} className="text-muted-foreground" />
                      <span>Copy Registration Link</span>
                    </button>
                  )}

                  <div className="border-t border-foreground/10 my-1" />

                  <button
                    type="button"
                    onClick={async () => {
                      setActionsOpen(false);
                      if (window.confirm(`Are you sure you want to delete this ${eventPageType}?`)) {
                        await store.handleDeleteItem(eventPage._id, eventPageType === 'conference' ? 'conferences' : 'webinars');
                        store.closeEventPage();
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 transition text-left cursor-pointer"
                  >
                    <Trash2 size={14} className="text-red-500" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Copy Notice Toast */}
      {copyNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          {copyNotice}
        </div>
      )}

      {/* Main 2-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
        {/* Inner Event Sidebar - subtabs now start right at the top */}
        <aside className="w-full lg:w-72 shrink-0 bg-card border border-foreground/10 rounded-2xl p-4 shadow-sm space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto">
          <nav className="space-y-4">
            {SUBTAB_GROUPS.filter(g => !g.viewOnly || store.eventPageMode === 'view').map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="text-xs font-black uppercase tracking-wider text-black dark:text-white px-3 py-1">
                  {group.title}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = store.eventPageTab === item.tab;
                    return (
                      <button
                        key={item.tab}
                        type="button"
                        onClick={() => store.openEventTab(item.tab)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition duration-150 cursor-pointer text-left ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                            : 'text-foreground/75 hover:text-foreground hover:bg-foreground/5'
                        }`}
                      >
                        <Icon size={17} className={isActive ? 'text-primary-foreground' : 'text-foreground/70'} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-card border border-foreground/10 rounded-2xl p-6 md:p-8 shadow-sm w-full">
        {store.eventPageTab === 'dashboard' && <OverviewTab />}
        {store.eventPageTab === 'details' && <DetailsTab />}
        {store.eventPageTab === 'scientific-program' && <ScientificProgramTab />}
        {store.eventPageTab === 'color-theme' && <ColorThemeTab />}
        {store.eventPageTab === 'fees' && <FeesTab />}
        {store.eventPageTab === 'participants' && <ParticipantsTab />}
        {store.eventPageTab === 'payments' && <PaymentsTab />}
        {store.eventPageTab === 'abstracts' && <AbstractsTab />}
        {store.eventPageTab === 'enquiries' && <EnquiriesTab />}
        {store.eventPageTab === 'brochures' && <BrochureLeadsTab />}
        {store.eventPageTab === 'speakers' && <SpeakersTab />}
        {store.eventPageTab === 'tracks' && <TracksTab />}
        {store.eventPageTab === 'program' && <ProgramTab />}
        {store.eventPageTab === 'banners' && <BannersTab />}
        {store.eventPageTab === 'faqs' && <FAQsTab />}
        {store.eventPageTab === 'partners' && <PartnersTab />}
        {store.eventPageTab === 'guidelines' && <GuidelinesTab />}
        {store.eventPageTab === 'organizer-contact' && <OrganizerContactTab />}
        {store.eventPageTab === 'organizing-committee' && <OrganizingCommitteeTab />}
        {store.eventPageTab === 'venue-details' && <VenueDetailsTab />}
        {store.eventPageTab === 'cohorts' && <CohortsTab />}
      </main>
    </div>
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
  const { eventPage, eventPageType, eventPageMode, updateEventFields } = useAppStore();
  const [formData, setFormData] = useState({
    title: eventPage?.title || '',
    description: eventPage?.description || '',
    subdomain: eventPage?.subdomain || '',
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const logoUrl = (eventPage as any)?.logoUrl || '';
  const brochureUrl = (eventPage as any)?.brochureUrl || '';

  useEffect(() => {
    if (eventPage) {
      setFormData({
        title: eventPage.title || '',
        description: eventPage.description || '',
        subdomain: eventPage.subdomain || '',
      });
    }
  }, [eventPage]);

  if (!eventPage || !eventPageType) return null;

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    await updateEventFields({
      title: formData.title,
      description: formData.description,
      subdomain: formData.subdomain,
    });
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, setLoading: (v: boolean) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        await updateEventFields({ [field]: data.url });
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
    setLoading(false);
    e.target.value = '';
  };

  const handleFileSelect = async (file: File | null, field: string, setLoading: (v: boolean) => void) => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        await updateEventFields({ [field]: data.url });
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
    setLoading(false);
  };

  const handleFileClear = async (field: string) => {
    await updateEventFields({ [field]: '' });
  };

  if (eventPageMode === 'view') {
    return (
      <div className="space-y-6">
        <div className="bg-muted/10 border border-foreground/10 rounded-2xl p-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Title</h4>
          <p className="text-base font-bold text-foreground">{eventPage.title || '—'}</p>
        </div>

        <div className="bg-muted/10 border border-foreground/10 rounded-2xl p-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Subdomain</h4>
          <p className="text-sm font-medium text-foreground">{eventPage.subdomain || '—'}</p>
          {eventPage.subdomain && (
            <p className="text-xs text-muted-foreground mt-1">
              Microsite URL: {eventPage.subdomain}.event.webcouts.com
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/10 border border-foreground/10 rounded-2xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Logo</h4>
            {(eventPage as any).logoUrl ? (
              <img src={mediaUrl((eventPage as any).logoUrl)} alt="Logo" className="h-16 w-16 rounded-xl object-contain border border-foreground/10" />
            ) : (
              <p className="text-sm text-muted-foreground italic">No logo uploaded.</p>
            )}
          </div>
          <div className="bg-muted/10 border border-foreground/10 rounded-2xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Brochure</h4>
            {(eventPage as any).brochureUrl ? (
              <a href={`${API_BASE}${(eventPage as any).brochureUrl}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-semibold">
                <Download size={14} /> View Brochure
              </a>
            ) : (
              <p className="text-sm text-muted-foreground italic">No brochure uploaded.</p>
            )}
          </div>
        </div>

        <div className="bg-muted/10 border border-foreground/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText size={15} className="text-primary" />
              About / Description
            </h3>
          </div>
          {eventPage.description ? (
            <div className="text-base text-foreground/90 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: eventPage.description }} />
          ) : (
            <p className="text-sm text-muted-foreground italic">No description provided yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Edit Event Details</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Update core event information and about section.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
              <Check size={14} /> Saved!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-muted/20 border border-foreground/10 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Title *</label>
          <input
            className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm font-semibold"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Subdomain</label>
          <input
            className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm"
            placeholder="e.g. ai-conference"
            value={formData.subdomain}
            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Microsite URL: {formData.subdomain || 'your-subdomain'}.event.webcouts.com
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FileUploadCard
            title="Logo"
            accept="image/*"
            preview={logoUrl ? mediaUrl(logoUrl) : ''}
            onSelect={(f) => handleFileSelect(f, 'logoUrl', setUploadingLogo)}
            onClear={() => handleFileClear('logoUrl')}
          />
          <FileUploadCard
            title="Brochure"
            accept=".pdf,.doc,.docx,image/*"
            preview={brochureUrl ? mediaUrl(brochureUrl) : ''}
            onSelect={(f) => handleFileSelect(f, 'brochureUrl', setUploadingBrochure)}
            onClear={() => handleFileClear('brochureUrl')}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">About / Description</label>
          <RichTextEditor
            value={formData.description}
            onChange={(html) => setFormData({ ...formData, description: html })}
          />
        </div>
      </div>
    </div>
  );
}

function ScientificProgramTab() {
  const { eventPage, updateEventField, eventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
  const scientificProgramUrl = (eventPage as any)?.scientificProgramUrl || '';
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState(scientificProgramUrl);

  useEffect(() => {
    setUrl((eventPage as any)?.scientificProgramUrl || '');
  }, [eventPage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
        updateEventField('scientificProgramUrl', data.url);
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
    setUploading(false);
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
        updateEventField('scientificProgramUrl', data.url);
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
    setUploading(false);
  };

  const handleRemove = () => {
    setUrl('');
    updateEventField('scientificProgramUrl', '');
  };

  if (!isEditMode) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold tracking-tight">Scientific Program</h3>
        {url ? (
          <div className="bg-muted/10 border border-foreground/10 rounded-2xl p-6">
            <a href={`${API_BASE}${url}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-semibold">
              <Download size={16} /> Download Scientific Program
            </a>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No scientific program uploaded yet.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold tracking-tight">Scientific Program</h3>
        <p className="text-sm text-muted-foreground mt-1">Upload a PDF or document file for the scientific program.</p>
      </div>

      <div className="max-w-lg">
        <FileUploadCard
          title="Scientific Program"
          accept=".pdf,.doc,.docx"
          preview={url ? `${API_BASE}${url}` : ''}
          onSelect={handleFileSelect}
          onClear={handleRemove}
        />
      </div>
    </div>
  );
}

function ColorThemeTab() {
  const { eventPage, updateEventField, eventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
  const themeColor = (eventPage as any)?.themeColor || '#0f4c81';

  if (!isEditMode) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold tracking-tight">Website Color Theme</h3>
        <div className="bg-muted/10 border border-foreground/10 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl border border-foreground/15 shadow-xs shrink-0" style={{ backgroundColor: themeColor }} />
            <span className="font-mono text-sm font-bold text-foreground">{themeColor}</span>
            <span className="text-xs text-muted-foreground">(Applied to user website buttons, navigation, and accents)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold tracking-tight">Website Color Theme</h3>
        <p className="text-sm text-muted-foreground mt-1">Choose a color theme for the user-facing website.</p>
      </div>

      <div className="max-w-lg space-y-4">
        <div className="bg-muted/30 border border-foreground/10 rounded-2xl p-6 space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Theme Color</label>
          <div className="flex flex-wrap items-center gap-2.5">
            {[
              { label: 'Conference Blue', color: '#0f4c81' },
              { label: 'Royal Navy', color: '#1e3a8a' },
              { label: 'Ocean Teal', color: '#0e7490' },
              { label: 'Emerald', color: '#047857' },
              { label: 'Ruby Red', color: '#991b1b' },
              { label: 'Deep Violet', color: '#581c87' },
              { label: 'Slate Grey', color: '#334155' },
            ].map((preset) => (
              <button
                key={preset.color}
                type="button"
                onClick={() => updateEventField('themeColor', preset.color)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  themeColor?.toLowerCase() === preset.color.toLowerCase()
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/10 font-bold text-foreground'
                    : 'border-foreground/10 hover:border-foreground/30 bg-card text-muted-foreground'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-foreground/10" style={{ backgroundColor: preset.color }} />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={themeColor}
              onChange={(e) => updateEventField('themeColor', e.target.value)}
              className="w-10 h-10 p-0.5 rounded-xl border border-foreground/10 cursor-pointer bg-background"
            />
            <input
              type="text"
              placeholder="#0f4c81"
              value={themeColor}
              onChange={(e) => updateEventField('themeColor', e.target.value)}
              className="w-32 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm font-mono font-semibold"
            />
            <span className="text-xs text-muted-foreground">Select preset or enter custom HEX color</span>
          </div>
        </div>
      </div>
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
  const { eventPage, updateEventField, user, eventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
  const speakers: Speaker[] = (eventPage as any)?.speakers || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState<Speaker>({
    name: '', degree: '', designation: '', organization: '', bio: '', avatar: '',
    linkedin: '', twitter: '', website: '', topic: '', isKeynote: false
  });

  const resetForm = () => {
    setEditingIndex(null);
    setFormData({ name: '', degree: '', designation: '', organization: '', bio: '', avatar: '', linkedin: '', twitter: '', website: '', topic: '', isKeynote: false });
    setShowForm(false);
  };

  const handleSave = () => {
    const updatedSpeakers = [...speakers];
    if (editingIndex !== null) {
      updatedSpeakers[editingIndex] = formData;
    } else {
      updatedSpeakers.push(formData);
    }
    updateEventField('speakers', updatedSpeakers);
    resetForm();
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData(speakers[index]);
    setShowForm(true);
  };

  const handleDelete = (index: number) => {
    const updatedSpeakers = speakers.filter((_, i) => i !== index);
    updateEventField('speakers', updatedSpeakers);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user?.role || '', 'x-user-name': user?.username || '' },
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, avatar: data.url }));
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6">
      {isEditMode && showForm ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} /> Back to Speakers
            </button>
            <h3 className="text-lg font-bold tracking-tight">
              {editingIndex !== null ? 'Edit Speaker' : 'Add New Speaker'}
            </h3>
          </div>

          <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">{editingIndex !== null ? 'Edit Speaker' : 'Add New Speaker'}</h4>
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Avatar Profile Photo Upload */}
              <div className="md:col-span-2 p-4 rounded-2xl border border-foreground/15 bg-card/60 shadow-xs flex flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-foreground/15 bg-muted flex items-center justify-center shrink-0 shadow-xs">
                  {formData.avatar ? (
                    <img src={mediaUrl(formData.avatar)} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">
                      {(formData.name || 'S').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Profile Photo / Avatar
                    </label>
                    <span className="text-[11px] text-muted-foreground">PNG, JPG or WebP</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs inline-flex items-center gap-1.5">
                      <Upload size={13} />
                      <span>{uploadingAvatar ? 'Uploading...' : formData.avatar ? 'Replace Photo' : 'Upload Photo'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                    </label>
                    {formData.avatar && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                        className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold cursor-pointer transition inline-flex items-center gap-1.5"
                        title="Remove photo"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name *</label>
                <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Degree / Qualification</label>
                <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="e.g. MD, PhD, MBBS" value={formData.degree || ''} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Designation</label>
                <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="e.g. Keynote Speaker, Professor" value={formData.designation || ''} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organization / University</label>
                <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="e.g. Harvard Medical School" value={formData.organization || ''} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic / Presentation</label>
                <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.topic || ''} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="isKeynote" checked={formData.isKeynote || false} onChange={(e) => setFormData({ ...formData, isKeynote: e.target.checked })} className="rounded w-4 h-4" />
                <label htmlFor="isKeynote" className="text-sm font-semibold cursor-pointer">Mark as Keynote Speaker</label>
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
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Website URL</label>
                <input className="w-full mt-1 px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" value={formData.website || ''} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleSave} disabled={!formData.name} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer">
                {editingIndex !== null ? 'Update' : 'Add'} Speaker
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-xs font-semibold cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight">Speakers ({speakers.length})</h3>
            {isEditMode && (
              <button
                type="button"
                onClick={() => { resetForm(); setShowForm(true); }}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add Speaker
              </button>
            )}
          </div>

          {/* Speakers List */}
          <div className="border border-foreground/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
                  <th className="p-4 w-12">Photo</th>
                  <th className="p-4">Name & Degree</th>
                  <th className="p-4">Designation & Org</th>
                  <th className="p-4">Topic</th>
                  <th className="p-4">Type</th>
                  {isEditMode && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {speakers.map((speaker, index) => (
                  <tr key={index} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
                        {speaker.avatar ? (
                          <img src={mediaUrl(speaker.avatar)} alt={speaker.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-xs text-muted-foreground">
                            {(speaker.name || 'S').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold">
                      <div>{speaker.name}</div>
                      {speaker.degree && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded mt-0.5">
                          {speaker.degree}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      <div>{speaker.designation || '—'}</div>
                      {speaker.organization && <div className="text-[11px] opacity-80">{speaker.organization}</div>}
                    </td>
                    <td className="p-4 text-xs text-accent">{speaker.topic || '—'}</td>
                    <td className="p-4">
                      {speaker.isKeynote && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded">Keynote</span>}
                    </td>
                    {isEditMode && (
                      <td className="p-4 text-right">
                        <button type="button" onClick={() => handleEdit(index)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground mr-2 cursor-pointer">Edit</button>
                        <button type="button" onClick={() => handleDelete(index)} className="px-2 py-1 text-xs text-red-500 hover:text-red-600 cursor-pointer">Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
                {speakers.length === 0 && (
                  <tr><td colSpan={isEditMode ? 6 : 5} className="p-8 text-center text-muted-foreground">No speakers added yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ============ PROGRAM TAB ============
function ProgramTab() {
  const { eventPage, updateEventField, eventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
  const program: ProgramDay[] = (eventPage as any)?.program || [];
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [showDayForm, setShowDayForm] = useState(false);
  const [dayForm, setDayForm] = useState<ProgramDay>({ dayNumber: 1, title: '', description: '', sessions: [] });
  const [sessionDayIndex, setSessionDayIndex] = useState<number | null>(null);
  const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(null);
  const [sessionForm, setSessionForm] = useState<any>({ time: '', title: '', description: '', speaker: '', track: '', type: 'session' });

  const resetDayForm = () => {
    setEditingDayIndex(null);
    setDayForm({ dayNumber: program.length + 1, title: '', description: '', sessions: [] });
    setShowDayForm(false);
  };

  const handleSaveDay = () => {
    const updatedProgram = [...program];
    if (editingDayIndex !== null) {
      updatedProgram[editingDayIndex] = dayForm;
    } else {
      updatedProgram.push(dayForm);
    }
    updateEventField('program', updatedProgram);
    resetDayForm();
  };

  const resetSessionForm = () => {
    setSessionDayIndex(null);
    setEditingSessionIndex(null);
    setSessionForm({ time: '', title: '', description: '', speaker: '', track: '', type: 'session' });
  };

  const handleSaveSession = () => {
    if (sessionDayIndex === null) return;
    const updatedProgram = [...program];
    const sessions = [...(updatedProgram[sessionDayIndex].sessions || [])];
    if (editingSessionIndex !== null) {
      sessions[editingSessionIndex] = sessionForm;
    } else {
      sessions.push(sessionForm);
    }
    updatedProgram[sessionDayIndex] = { ...updatedProgram[sessionDayIndex], sessions };
    updateEventField('program', updatedProgram);
    resetSessionForm();
  };

  const handleDeleteDay = (index: number) => {
    if (confirm('Delete this day and all its sessions?')) {
      const updated = program.filter((_, i) => i !== index);
      updateEventField('program', updated);
    }
  };

  return (
    <div className="space-y-6">
      {isEditMode && showDayForm ? (
        /* Day Form view (listing is hidden) */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={resetDayForm}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} /> Back to Program Schedule
            </button>
            <h3 className="text-lg font-bold tracking-tight">
              {editingDayIndex !== null ? 'Edit Day' : 'Add New Day'}
            </h3>
          </div>

          <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">{editingDayIndex !== null ? 'Edit Day' : 'Add New Day'}</h4>
              <button type="button" onClick={resetDayForm} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
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
              <button type="button" onClick={handleSaveDay} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold cursor-pointer">Save Day</button>
              <button type="button" onClick={resetDayForm} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-xs font-semibold cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      ) : (
        /* Days List view */
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight">Program ({program.length} days)</h3>
            {isEditMode && (
              <button type="button" onClick={() => { resetDayForm(); setShowDayForm(true); }} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer">
                <Plus size={14} /> Add Day
              </button>
            )}
          </div>

          {program.map((day, dayIdx) => (
            <div key={dayIdx} className="border border-foreground/10 rounded-xl overflow-hidden">
              <div className="bg-muted/50 p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Day {day.dayNumber}{day.title && ` - ${day.title}`}</h4>
                  {day.date && <p className="text-xs text-muted-foreground">{new Date(day.date).toLocaleDateString()}</p>}
                </div>
                {isEditMode && (
                  <div className="flex items-center gap-2">
                    {sessionDayIndex !== dayIdx && (
                      <>
                        <button type="button" onClick={() => { setEditingDayIndex(dayIdx); setDayForm(day); setShowDayForm(true); }} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer">Edit Day</button>
                        <button type="button" onClick={() => { handleDeleteDay(dayIdx); }} className="px-2 py-1 text-xs text-red-500 hover:text-red-600 cursor-pointer">Delete Day</button>
                        <button type="button" onClick={() => { resetSessionForm(); setSessionDayIndex(dayIdx); }} className="px-2 py-1 text-xs text-secondary hover:text-secondary/80 flex items-center gap-1 cursor-pointer font-semibold"><Plus size={12} /> Add Session</button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* If editing/adding session for this day, show ONLY session form */}
              {isEditMode && sessionDayIndex === dayIdx ? (
                <div className="bg-muted/20 p-5 border-t border-foreground/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                      {editingSessionIndex !== null ? 'Edit Session' : 'Add Session to Day ' + day.dayNumber}
                    </h5>
                    <button type="button" onClick={resetSessionForm} className="text-muted-foreground hover:text-foreground">
                      <X size={15} />
                    </button>
                  </div>
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
                    <button type="button" onClick={handleSaveSession} disabled={!sessionForm.time || !sessionForm.title} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer">
                      {editingSessionIndex !== null ? 'Update Session' : 'Save Session'}
                    </button>
                    <button type="button" onClick={resetSessionForm} className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-semibold cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Sessions List for this day */
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-muted-foreground font-semibold text-xs">
                      <th className="p-3">Time</th>
                      <th className="p-3">Session</th>
                      <th className="p-3">Speaker</th>
                      <th className="p-3">Type</th>
                      {isEditMode && <th className="p-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {day.sessions.map((session, sIdx) => (
                      <tr key={sIdx} className="border-t border-foreground/5 hover:bg-foreground/[0.02]">
                        <td className="p-3 font-mono text-xs">{session.time}</td>
                        <td className="p-3 font-semibold">{session.title}</td>
                        <td className="p-3 text-xs text-muted-foreground">{session.speaker || '—'}</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold uppercase">{session.type}</span></td>
                        {isEditMode && (
                          <td className="p-3 text-right">
                            <button type="button" onClick={() => { setSessionDayIndex(dayIdx); setEditingSessionIndex(sIdx); setSessionForm(session); }} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground mr-2 cursor-pointer">Edit</button>
                            <button type="button" onClick={() => { const updated = [...program]; updated[dayIdx].sessions = day.sessions.filter((_, i) => i !== sIdx); updateEventField('program', updated); }} className="px-2 py-1 text-xs text-red-500 hover:text-red-600 cursor-pointer">Delete</button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {day.sessions.length === 0 && (
                      <tr><td colSpan={isEditMode ? 5 : 4} className="p-4 text-center text-muted-foreground text-xs">No sessions added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          ))}
          {program.length === 0 && (
            <div className="border border-dashed border-foreground/20 rounded-xl p-12 text-center">
              <p className="text-sm text-muted-foreground">No program days added yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============ FAQS TAB ============
function FAQsTab() {
  const { eventPage, updateEventField, eventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
  const faqs: FAQ[] = (eventPage as any)?.faqs || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FAQ>({ question: '', answer: '', order: 0 });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const resetForm = () => {
    setEditingIndex(null);
    setFormData({ question: '', answer: '', order: faqs.length });
    setShowForm(false);
  };

  const handleSave = () => {
    const updated = [...faqs];
    if (editingIndex !== null) {
      updated[editingIndex] = formData;
    } else {
      updated.push(formData);
    }
    updateEventField('faqs', updated);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {isEditMode && showForm ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} /> Back to FAQs
            </button>
            <h3 className="text-lg font-bold tracking-tight">
              {editingIndex !== null ? 'Edit FAQ' : 'Add New FAQ'}
            </h3>
          </div>

          <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">{editingIndex !== null ? 'Edit FAQ' : 'Add New FAQ'}</h4>
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
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
              <button type="button" onClick={handleSave} disabled={!formData.question || !formData.answer} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer">
                {editingIndex !== null ? 'Update' : 'Add'} FAQ
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-xs font-semibold cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight">FAQs ({faqs.length})</h3>
            {isEditMode && (
              <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer">
                <Plus size={14} /> Add FAQ
              </button>
            )}
          </div>

          {/* List */}
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-foreground/10 rounded-xl overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{faq.question}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditMode && (
                      <>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setEditingIndex(index); setFormData(faq); setShowForm(true); }} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer">Edit</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); const updated = faqs.filter((_, i) => i !== index); updateEventField('faqs', updated); }} className="px-2 py-1 text-xs text-red-500 hover:text-red-600 cursor-pointer">Delete</button>
                      </>
                    )}
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
        </>
      )}
    </div>
  );
}

// ============ SPONSORS TAB ============
function PartnersTab() {
  const { eventPage, updateEventField, eventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';

  // Read from existing partners/sponsors/exhibitors array
  const rawPartners = (eventPage as any)?.partners?.length
    ? (eventPage as any).partners
    : ((eventPage as any)?.sponsors?.length
      ? (eventPage as any).sponsors
      : (eventPage as any)?.exhibitors || []);
  const currentTitle = rawPartners?.[0]?.title || '';

  const [title, setTitle] = useState(currentTitle);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTitle(currentTitle);
  }, [eventPage]);

  const handleSave = () => {
    if (!title.trim()) {
      updateEventField('partners', []);
      updateEventField('sponsors', []);
      updateEventField('exhibitors', []);
    } else {
      const updated = [{ title: title.trim(), order: 0 }];
      updateEventField('partners', updated);
      updateEventField('sponsors', updated);
      updateEventField('exhibitors', updated);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isEditMode) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold tracking-tight">Sponsors & Exhibitors</h3>
        {currentTitle ? (
          <div className="bg-muted/10 border border-foreground/10 rounded-2xl p-6">
            <p className="text-sm font-bold text-foreground">{currentTitle}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No sponsors or exhibitors added.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold tracking-tight">Sponsors & Exhibitors</h3>
        <p className="text-sm text-muted-foreground mt-1">Enter the title or name for sponsors / exhibitors section.</p>
      </div>
      <div className="max-w-lg space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="e.g. Gold Sponsor, Silver Exhibitor..."
        />
        <button type="button" onClick={handleSave}
          className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold cursor-pointer">
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ============ GUIDELINES TAB ============
function GuidelinesTab() {
  const { eventPage, updateEventField, eventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
  const guidelines = (eventPage as any)?.guidelines || '';
  const [content, setContent] = useState(guidelines);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setContent((eventPage as any)?.guidelines || '');
  }, [eventPage]);

  const handleSave = async () => {
    setSaving(true);
    await updateEventField('guidelines', content);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!isEditMode) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Guidelines</h3>
          <p className="text-sm text-muted-foreground mt-1">Author and presentation guidelines for this conference.</p>
        </div>
        {guidelines ? (
          <div className="bg-muted/10 border border-foreground/10 rounded-2xl p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: guidelines }} />
          </div>
        ) : (
          <div className="border border-dashed border-foreground/20 rounded-xl p-12 text-center text-muted-foreground">
            No guidelines defined yet. Switch to Edit mode to add guidelines.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Edit Guidelines</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Author and presentation guidelines (HTML supported).</p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
              <Check size={14} /> Saved!
            </span>
          )}
          <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Guidelines Content (HTML supported)</label>
        <textarea
          className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-lg text-sm font-mono"
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter guidelines content here... HTML is supported."
        />
        <p className="mt-2 text-xs text-muted-foreground">You can use HTML tags for formatting. Preview will be shown on the conference website.</p>
      </div>
      {content && (
        <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Live Preview</h4>
          <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  );
}

// ============ BANNERS TAB ============
function BannersTab() {
  const { eventPage, eventPageType, uploadHeaderBannerForEvent, removeHeaderBannerForEvent, user, eventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
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
          <p className="text-sm text-muted-foreground mt-1">Images that rotate in the banner carousel on the event homepage.</p>
        </div>
        {isEditMode && (
          <label className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Add Banner'}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>

      {banners.length === 0 ? (
        <div className="border border-dashed border-foreground/20 rounded-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {isEditMode ? 'No banners uploaded yet. Add images for the carousel.' : 'No banners uploaded yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((url, i) => (
            <div key={i} className="p-4 rounded-2xl border border-foreground/15 bg-card/60 shadow-xs flex flex-row items-center gap-4">
              <div className="w-36 sm:w-44 h-24 shrink-0 rounded-xl overflow-hidden border border-foreground/10 bg-muted/10 flex items-center justify-center p-1 relative shadow-xs">
                <img src={mediaUrl(url)} alt={`Banner ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground truncate">Banner {i + 1}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Slide {i + 1}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Carousel header banner image</p>
                </div>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold cursor-pointer transition inline-flex items-center gap-1.5"
                    title="Remove banner"
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ TRACKS TAB ============
function TracksTab() {
  const { eventPage, updateEventField, user, eventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
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

  const handleImageSelect = async (file: File | null) => {
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
      setFormData(prev => ({ ...prev, image: data.url }));
    }
  };

  return (
    <div className="space-y-6">
      {isEditMode && showForm ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} /> Back to Tracks
            </button>
            <h3 className="text-lg font-bold tracking-tight">
              {editingIndex !== null ? 'Edit Track' : 'Add New Track'}
            </h3>
          </div>

          <div className="border border-foreground/10 rounded-xl p-5 space-y-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">{editingIndex !== null ? 'Edit Track' : 'New Track'}</h4>
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Title</label>
              <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="Track title" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
              <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" rows={3} placeholder="Brief description" />
            </div>
            <div>
              <FileUploadCard
                title="Track Image"
                accept="image/*"
                preview={formData.image ? mediaUrl(formData.image) : ''}
                onSelect={handleImageSelect}
                onClear={() => setFormData(p => ({ ...p, image: '' }))}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleSave} disabled={!formData.title} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer">
                {editingIndex !== null ? 'Update' : 'Add Track'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Conference Tracks ({tracks.length})</h3>
              <p className="text-sm text-muted-foreground mt-1">Define the main themes or tracks for this event.</p>
            </div>
            {isEditMode && (
              <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer flex items-center gap-1">
                <Plus size={14} /> Add Track
              </button>
            )}
          </div>

          <div className="border border-foreground/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
                  <th className="p-4">#</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Description</th>
                  {isEditMode && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {tracks.map((track, index) => (
                  <tr key={index} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                    <td className="p-4 text-muted-foreground">{index + 1}</td>
                    <td className="p-4 font-semibold">{track.title}</td>
                    <td className="p-4 text-muted-foreground text-xs max-w-xs truncate">{track.description || '—'}</td>
                    {isEditMode && (
                      <td className="p-4 text-right">
                        <button type="button" onClick={() => handleEdit(index)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground mr-2 cursor-pointer">Edit</button>
                        <button type="button" onClick={() => handleDelete(index)} className="px-2 py-1 text-xs text-red-500 hover:text-red-600 cursor-pointer">Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
                {tracks.length === 0 && (
                  <tr><td colSpan={isEditMode ? 4 : 3} className="p-8 text-center text-muted-foreground">No tracks added yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ============ FEES TAB ============
function FeesTab() {
  const { eventPage, updateEventField, eventPageMode, setEventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
  const fees: FeeEntry[] = (eventPage as any)?.fees || [];
  const [localFees, setLocalFees] = useState<FeeEntry[]>(fees);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(0);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setLocalFees(fees);
  }, [eventPage]);

  // Group by type
  const groups: FeeGroup[] = [];
  localFees.forEach(entry => {
    const last = groups[groups.length - 1];
    if (last && last.type === entry.type) {
      last.rows.push(entry);
    } else {
      groups.push({ type: entry.type, rows: [entry] });
    }
  });

  const getGlobalIndex = (groupIdx: number, rowIdx: number) => {
    let count = 0;
    for (let i = 0; i < groupIdx; i++) count += groups[i].rows.length;
    return count + rowIdx;
  };

  const handleRowChange = (globalIdx: number, field: keyof FeeEntry, value: string | number) => {
    setLocalFees(prev => {
      const updated = [...prev];
      updated[globalIdx] = { ...updated[globalIdx], [field]: value };
      return updated;
    });
  };

  const handleGroupTypeChange = (groupIdx: number, newType: string) => {
    setLocalFees(prev => {
      const updated = [...prev];
      const start = getGlobalIndex(groupIdx, 0);
      for (let i = start; i < start + groups[groupIdx].rows.length; i++) {
        updated[i] = { ...updated[i], type: newType };
      }
      return updated;
    });
  };

  const handleSaveFees = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateEventField('fees', localFees);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save fees:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = () => {
    updateEventField('fees', localFees);
  };

  const handleAddGroup = () => {
    const newRow: FeeEntry = { type: '', dateLabel: '', usd: 0, gbp: 0, eur: 0 };
    const updated = [...localFees, newRow];
    setLocalFees(updated);
    updateEventField('fees', updated);
    setActiveGroupIndex(groups.length);
  };

  const handleAddRow = (groupIdx: number) => {
    const group = groups[groupIdx];
    const type = group.type;
    const insertAfter = getGlobalIndex(groupIdx, group.rows.length - 1);
    const newRow: FeeEntry = { type, dateLabel: '', usd: 0, gbp: 0, eur: 0 };
    const updated = [...localFees];
    updated.splice(insertAfter + 1, 0, newRow);
    setLocalFees(updated);
    updateEventField('fees', updated);
  };

  const handleRemoveRow = (globalIdx: number) => {
    const updated = localFees.filter((_, i) => i !== globalIdx);
    setLocalFees(updated);
    updateEventField('fees', updated);
  };

  const handleRemoveGroup = (groupIdx: number) => {
    const group = groups[groupIdx];
    const startIdx = getGlobalIndex(groupIdx, 0);
    const updated = localFees.filter((_, i) => i < startIdx || i >= startIdx + group.rows.length);
    setLocalFees(updated);
    updateEventField('fees', updated);
    if (activeGroupIndex === groupIdx) {
      setActiveGroupIndex(null);
    } else if (activeGroupIndex !== null && activeGroupIndex > groupIdx) {
      setActiveGroupIndex(activeGroupIndex - 1);
    }
  };

  const toggleGroup = (gIdx: number) => {
    setActiveGroupIndex(prev => (prev === gIdx ? null : gIdx));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Registration Fees</h3>
          <p className="text-sm text-muted-foreground mt-1">Create fee categories with installment rows.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
              <Check size={14} className="stroke-[2.5]" /> Saved Successfully!
            </span>
          )}
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={handleAddGroup}
                className="px-4 py-2 bg-secondary text-secondary-foreground border border-foreground/15 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs hover:bg-secondary/80 transition"
              >
                <Plus size={14} /> Add Fee Type
              </button>
              <button
                type="button"
                onClick={handleSaveFees}
                disabled={saving}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm hover:bg-primary/90 transition disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Fees'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEventPageMode('edit')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm hover:bg-primary/90 transition"
            >
              <Pencil size={14} /> Edit Fees
            </button>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="border-2 border-dashed border-foreground/20 rounded-2xl p-8 text-center text-sm text-muted-foreground">
          {isEditMode ? 'No fees yet. Click "Add Fee Type" to start.' : 'No fee information available for this event yet.'}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group, gIdx) => {
            const isOpen = activeGroupIndex === gIdx;
            return (
              <div key={gIdx} className="border border-foreground/10 rounded-2xl overflow-hidden bg-card shadow-xs">
                {/* Accordion / Category Header */}
                <div className="flex items-center justify-between px-6 py-3.5 bg-muted/20 border-b border-foreground/10">
                  <div
                    onClick={() => toggleGroup(gIdx)}
                    className="flex items-center gap-3 cursor-pointer select-none flex-1"
                  >
                    <ChevronDown
                      size={18}
                      className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                    {isEditMode ? (
                      <input
                        value={group.type}
                        onChange={e => handleGroupTypeChange(gIdx, e.target.value)}
                        onBlur={handleSaveAll}
                        onClick={e => e.stopPropagation()}
                        className="px-3.5 py-1.5 bg-background border border-foreground/15 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[240px]"
                        placeholder="Fee type name"
                      />
                    ) : (
                      <span className="text-base font-bold text-foreground">{group.type || 'Untitled Fee Type'}</span>
                    )}
                  </div>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(gIdx)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-xl cursor-pointer transition-colors"
                      title="Delete fee type"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Table with Equal Column Widths */}
                {isOpen && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse table-fixed">
                      <thead>
                        <tr className="bg-[#f0f2fe] text-[#2c3e50] dark:bg-indigo-950/30 dark:text-indigo-200 font-semibold border-b border-foreground/10">
                          <th className="p-3.5 pl-6 text-xs uppercase tracking-wider font-bold w-[34%]">HEADING</th>
                          <th className="p-3.5 text-xs uppercase tracking-wider font-bold text-center w-[20%]">USD</th>
                          <th className="p-3.5 text-xs uppercase tracking-wider font-bold text-center w-[20%]">GBP</th>
                          <th className="p-3.5 text-xs uppercase tracking-wider font-bold text-center w-[20%]">EUR</th>
                          {isEditMode && <th className="p-3.5 text-xs uppercase tracking-wider font-bold text-center w-[6%]">ACTIONS</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((entry, rIdx) => {
                          const gi = getGlobalIndex(gIdx, rIdx);
                          return (
                            <tr key={gi} className="border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.015] transition-colors">
                              <td className="p-3 pl-6">
                                {isEditMode ? (
                                  <input
                                    value={entry.dateLabel}
                                    onChange={e => handleRowChange(gi, 'dateLabel', e.target.value)}
                                    onBlur={handleSaveAll}
                                    className="w-full px-4 py-2.5 bg-background border border-foreground/15 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition shadow-xs"
                                    placeholder="e.g. on/before 25 Dec"
                                  />
                                ) : (
                                  <span className="text-sm font-medium text-foreground px-2">{entry.dateLabel || '—'}</span>
                                )}
                              </td>
                              {(['usd', 'gbp', 'eur'] as const).map(c => (
                                <td key={c} className="p-3 text-center">
                                  {isEditMode ? (
                                    <input
                                      type="number"
                                      min={0}
                                      value={entry[c] ?? ''}
                                      onChange={e => handleRowChange(gi, c, e.target.value === '' ? 0 : Number(e.target.value))}
                                      onBlur={handleSaveAll}
                                      className="w-full px-4 py-2.5 bg-background border border-foreground/15 rounded-xl text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-primary/20 transition shadow-xs"
                                      placeholder="0"
                                    />
                                  ) : (
                                    <span className="text-sm font-mono font-semibold text-foreground">
                                      {c === 'usd' ? '$' : c === 'gbp' ? '£' : '€'}{entry[c] ?? 0}
                                    </span>
                                  )}
                                </td>
                              ))}
                              {isEditMode && (
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleAddRow(gIdx)}
                                      title="Add row"
                                      className="w-8 h-8 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                                    >
                                      <Plus size={15} strokeWidth={2.5} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRow(gi)}
                                      title="Delete row"
                                      className="w-8 h-8 rounded-xl text-red-500 hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ ORGANIZER CONTACT TAB ============
function OrganizerContactTab() {
  const { eventPage, updateEventField, eventPageMode, mentors } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
  const contact: any = (eventPage as any)?.organizerContact || {};
  const [selectedMentor, setSelectedMentor] = useState<string>(contact.name || '');
  const [form, setForm] = useState({
    name: contact.name || '',
    email: contact.email || '',
    phone: contact.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const c = (eventPage as any)?.organizerContact || {};
    setForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
    });
    setSelectedMentor(c.name || '');
  }, [eventPage]);

  const handleMentorSelect = (mentorName: string) => {
    setSelectedMentor(mentorName);
    const mentor = mentors.find((m: any) => m.fullName === mentorName || m.username === mentorName);
    if (mentor) {
      setForm({
        name: mentor.fullName || mentor.username || mentorName,
        email: mentor.email || '',
        phone: (mentor as any).phone || '',
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await updateEventField('organizerContact', form);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!isEditMode) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Organizer Contact</h3>
          <p className="text-sm text-muted-foreground mt-1">Contact information displayed on the event website.</p>
        </div>
        <div className="bg-muted/10 border border-foreground/10 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Contact Person</span>
              <p className="text-base font-semibold">{form.name || '—'}</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Email</span>
              <p className="text-base font-semibold">{form.email || '—'}</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Phone</span>
              <p className="text-base font-semibold">{form.phone || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Edit Organizer Contact</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Select a mentor to auto-fill contact details.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
              <Check size={14} /> Saved!
            </span>
          )}
          <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-muted/30 border border-foreground/10 rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Select Mentor</label>
          <select
            value={selectedMentor}
            onChange={(e) => handleMentorSelect(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm"
          >
            <option value="">— Select a mentor —</option>
            {mentors.map((m: any) => (
              <option key={m.username || m._id} value={m.fullName || m.username}>
                {m.fullName || m.username}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" readOnly={!!selectedMentor} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" readOnly={!!selectedMentor} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Phone</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" readOnly={!!selectedMentor} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ORGANIZING COMMITTEE TAB ============
function OrganizingCommitteeTab() {
  const { eventPage, updateEventField, user, eventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
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
      {isEditMode && showForm ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} /> Back to Committee
            </button>
            <h3 className="text-lg font-bold tracking-tight">
              {editingIndex !== null ? 'Edit Member' : 'Add New Member'}
            </h3>
          </div>

          <div className="border border-foreground/10 rounded-xl p-5 space-y-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">{editingIndex !== null ? 'Edit Member' : 'New Member'}</h4>
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
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
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Photo</label>
              {formData.image ? (
                <div className="p-3.5 rounded-2xl border border-foreground/15 bg-card/60 shadow-xs flex flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-foreground/15 bg-muted flex items-center justify-center shrink-0 shadow-xs">
                    <img src={mediaUrl(formData.image)} alt="Member" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Committee Member Photo</span>
                      <span className="text-[10px] text-muted-foreground">PNG, JPG or WebP</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs inline-flex items-center gap-1.5">
                        <Upload size={13} />
                        <span>Replace Photo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, image: '' }))}
                        className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold cursor-pointer transition inline-flex items-center gap-1.5"
                        title="Remove photo"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-foreground/20 hover:border-primary/50 hover:bg-primary/5 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition group">
                  <UploadCloud size={20} className="text-muted-foreground group-hover:text-primary transition mb-1" />
                  <span className="text-xs font-bold text-foreground">Upload Member Photo</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Click to choose image file</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleSave} disabled={!formData.name} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer">
                {editingIndex !== null ? 'Update' : 'Add Member'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Organizing Committee ({committee.length})</h3>
              <p className="text-sm text-muted-foreground mt-1">Members of the organizing committee for this event.</p>
            </div>
            {isEditMode && (
              <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer flex items-center gap-1">
                <Plus size={14} /> Add Member
              </button>
            )}
          </div>

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
                  {isEditMode && (
                    <div className="flex gap-1">
                      <button type="button" onClick={() => handleEdit(index)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer">Edit</button>
                      <button type="button" onClick={() => handleDelete(index)} className="px-2 py-1 text-xs text-red-500 hover:text-red-600 cursor-pointer">Delete</button>
                    </div>
                  )}
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
        </>
      )}
    </div>
  );
}

// ============ SCHEDULE & VENUE TAB ============
function VenueDetailsTab() {
  const { eventPage, updateEventFields, eventPageMode, venues, user } = useAppStore();
  const isEditMode = eventPageMode === 'edit';

  const formatIsoDate = (d: any) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? '' : dt.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const vd: VenueDetails = (eventPage as any)?.venueDetails || {};
  const ep = (eventPage as any) || {};

  const [formData, setFormData] = useState({
    venueId: vd.venueId || '',
    name: vd.name || ep.venue || '',
    address: vd.address || ep.venueAddress || '',
    locationUrl: vd.locationUrl || ep.venueMapUrl || '',
    startDate: vd.startDate ? formatIsoDate(vd.startDate) : formatIsoDate(ep.startDate),
    endDate: vd.endDate ? formatIsoDate(vd.endDate) : formatIsoDate(ep.endDate),
    startTime: vd.startTime || ep.startTime || '',
    endTime: vd.endTime || ep.endTime || '',
    mainImage: vd.mainImage || (vd.images && vd.images[0]) || '',
    subImages: [
      (vd.subImages && vd.subImages[0]) || (vd.images && vd.images[1]) || '',
      (vd.subImages && vd.subImages[1]) || (vd.images && vd.images[2]) || '',
      (vd.subImages && vd.subImages[2]) || (vd.images && vd.images[3]) || '',
    ],
    description: vd.description || '',
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingSubIndex, setUploadingSubIndex] = useState<number | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const formatFriendlyDate = (str: string) => {
    if (!str) return null;
    const d = stringToDate(str);
    if (!d) return str;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    const curVd: VenueDetails = (eventPage as any)?.venueDetails || {};
    const curEp = (eventPage as any) || {};
    setFormData({
      venueId: curVd.venueId || '',
      name: curVd.name || curEp.venue || '',
      address: curVd.address || curEp.venueAddress || '',
      locationUrl: curVd.locationUrl || curEp.venueMapUrl || '',
      startDate: curVd.startDate ? formatIsoDate(curVd.startDate) : formatIsoDate(curEp.startDate),
      endDate: curVd.endDate ? formatIsoDate(curVd.endDate) : formatIsoDate(curEp.endDate),
      startTime: curVd.startTime || curEp.startTime || '',
      endTime: curVd.endTime || curEp.endTime || '',
      mainImage: curVd.mainImage || (curVd.images && curVd.images[0]) || '',
      subImages: [
        (curVd.subImages && curVd.subImages[0]) || (curVd.images && curVd.images[1]) || '',
        (curVd.subImages && curVd.subImages[1]) || (curVd.images && curVd.images[2]) || '',
        (curVd.subImages && curVd.subImages[2]) || (curVd.images && curVd.images[3]) || '',
      ],
      description: curVd.description || '',
    });
  }, [eventPage]);

  // Match existing selected venue from registered venues list
  const selectedVenue = useMemo(() => {
    if (formData.venueId) {
      const byId = venues.find((v: any) => v._id === formData.venueId);
      if (byId) return byId;
    }
    if (formData.name) {
      const byName = venues.find((v: any) => v.name && v.name.trim().toLowerCase() === formData.name.trim().toLowerCase());
      if (byName) return byName;
    }
    return null;
  }, [formData.venueId, formData.name, venues]);

  const selectedVenueId = selectedVenue?._id || '';

  // Handle venue selection from dropdown
  const handleVenueSelect = (venueId: string) => {
    if (!venueId) {
      setFormData(prev => ({
        ...prev,
        venueId: '',
        name: '',
        address: '',
        locationUrl: '',
      }));
      return;
    }
    const found = venues.find((v: any) => v._id === venueId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        venueId: found._id,
        name: found.name || '',
        address: found.address || '',
        locationUrl: found.locationUrl || '',
      }));
    }
  };

  // Upload main image
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user?.role || '', 'x-user-name': user?.username || '' },
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, mainImage: data.url }));
      }
    } catch (err) {
      console.error('Main image upload error:', err);
    } finally {
      setUploadingMain(false);
    }
    e.target.value = '';
  };

  // Upload sub image at index (0, 1, or 2)
  const handleSubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSubIndex(index);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user?.role || '', 'x-user-name': user?.username || '' },
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => {
          const nextSubs = [...prev.subImages];
          nextSubs[index] = data.url;
          return { ...prev, subImages: nextSubs };
        });
      }
    } catch (err) {
      console.error('Sub image upload error:', err);
    } finally {
      setUploadingSubIndex(null);
    }
    e.target.value = '';
  };

  const handleRemoveMainImage = () => {
    setFormData(prev => ({ ...prev, mainImage: '' }));
  };

  const handleRemoveSubImage = (index: number) => {
    setFormData(prev => {
      const nextSubs = [...prev.subImages];
      nextSubs[index] = '';
      return { ...prev, subImages: nextSubs };
    });
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const venuePayload: VenueDetails = {
        venueId: formData.venueId || undefined,
        name: formData.name || '',
        address: formData.address || '',
        locationUrl: formData.locationUrl || '',
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        startTime: formData.startTime || '',
        endTime: formData.endTime || '',
        mainImage: formData.mainImage || '',
        subImages: formData.subImages,
        description: formData.description || '',
        images: [formData.mainImage, ...formData.subImages].filter(Boolean),
      };

      await updateEventFields({
        venueDetails: venuePayload,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        startTime: formData.startTime || '',
        endTime: formData.endTime || '',
        venue: formData.name || '',
        venueAddress: formData.address || '',
        venueMapUrl: formData.locationUrl || '',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save schedule and venue:', err);
      alert('Failed to save schedule and venue. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isEditMode) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Schedule & Venue</h3>
          <p className="text-sm text-muted-foreground mt-1">Event schedule, venue location, and venue media highlights.</p>
        </div>

        {/* Section 1: Schedule */}
        <div className="bg-card/70 border border-foreground/10 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-foreground/10 pb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CalendarDays size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight text-foreground">Schedule</h4>
              <p className="text-[11px] text-muted-foreground">Event dates and timings</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Start Date</span>
              <p className="text-base font-semibold">{formatFriendlyDate(formData.startDate) || formData.startDate || '—'}</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">End Date</span>
              <p className="text-base font-semibold">{formatFriendlyDate(formData.endDate) || formData.endDate || '—'}</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Start Time</span>
              <p className="text-base font-semibold">{formData.startTime || '—'}</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">End Time</span>
              <p className="text-base font-semibold">{formData.endTime || '—'}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Venue */}
        <div className="bg-card/70 border border-foreground/10 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Building2 size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight text-foreground">Venue Information</h4>
                <p className="text-[11px] text-muted-foreground">Registered venue and address details</p>
              </div>
            </div>
            {formData.locationUrl && (
              <a
                href={formData.locationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition"
              >
                <ExternalLink size={13} /> Open Map
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Venue Name</span>
              <p className="text-base font-semibold">{formData.name || '—'}</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Address</span>
              <p className="text-sm font-medium">{formData.address || '—'}</p>
            </div>
          </div>
          {formData.locationUrl && (
            <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Map / Location URL</span>
              <p className="text-xs font-mono text-muted-foreground break-all">{formData.locationUrl}</p>
            </div>
          )}
        </div>

        {/* Section 3: Custom Conference Media & Description */}
        <div className="bg-card/70 border border-foreground/10 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-foreground/10 pb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ImageIcon size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight text-foreground">Venue Highlights & Media</h4>
              <p className="text-[11px] text-muted-foreground">Conference venue showcase images and description</p>
            </div>
          </div>

          {/* Main Image */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Main Image</span>
            {formData.mainImage ? (
              <div className="p-4 sm:p-5 rounded-2xl border border-foreground/10 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-full sm:w-72 md:w-80 h-44 shrink-0 rounded-xl overflow-hidden border border-foreground/10 bg-background flex items-center justify-center p-2 shadow-xs">
                  <img
                    src={mediaUrl(formData.mainImage)}
                    alt="Main Venue"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Featured Banner
                  </span>
                  <h5 className="text-sm font-bold text-foreground mt-0.5">Main Venue Showcase</h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    Primary showcase image displayed at the top of the venue details section on public event pages.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">No main venue image uploaded.</div>
            )}
          </div>

          {/* Sub Images */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Sub Images</span>
            {formData.subImages.some(Boolean) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {formData.subImages.map((url, idx) => (
                  <div key={idx} className="bg-muted/20 rounded-2xl p-2.5 border border-foreground/5">
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Sub Image {idx + 1}</span>
                    {url ? (
                      <img
                        src={mediaUrl(url)}
                        alt={`Venue Sub Image ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-xl border border-foreground/10 shadow-xs"
                      />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center bg-muted/30 rounded-xl text-xs text-muted-foreground border border-dashed border-foreground/10">
                        Empty slot
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">No sub images uploaded.</div>
            )}
          </div>

          {/* Description */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Description</span>
            {formData.description ? (
              <div
                className="bg-muted/20 p-5 rounded-2xl border border-foreground/5 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none shadow-xs"
                dangerouslySetInnerHTML={{ __html: formData.description }}
              />
            ) : (
              <div className="text-xs text-muted-foreground italic">No venue description provided.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Schedule & Venue</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure event dates, times, select venue, and provide venue media highlights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-green-500 font-semibold flex items-center gap-1 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">
              <Check size={14} /> Saved successfully!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition disabled:opacity-50 cursor-pointer shadow-sm hover:shadow"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* SECTION 1: SCHEDULE */}
      <div className="bg-card/70 border border-foreground/10 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CalendarDays size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight text-foreground">1. Schedule</h4>
              <p className="text-[11px] text-muted-foreground">Select start/end dates with the interactive calendar and specify timing</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Start Date Popover */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Start Date
            </label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="h-12 w-full px-3.5 rounded-xl border border-foreground/15 bg-background hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition flex items-center justify-between text-left shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CalendarDays size={16} className="text-primary/70 group-hover:text-primary transition shrink-0" />
                    <span className={formData.startDate ? 'text-sm font-semibold text-foreground truncate' : 'text-sm text-muted-foreground truncate'}>
                      {formData.startDate ? formatFriendlyDate(formData.startDate) : 'Select start date'}
                    </span>
                  </div>
                  {formData.startDate ? (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, startDate: '' }));
                      }}
                      className="p-1 text-muted-foreground/60 hover:text-foreground rounded-md hover:bg-muted transition cursor-pointer"
                      title="Clear date"
                    >
                      <X size={13} />
                    </span>
                  ) : (
                    <ChevronDown size={14} className="text-muted-foreground/50 group-hover:text-muted-foreground transition shrink-0" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="!w-[340px] p-0 rounded-2xl border border-border/80 bg-white dark:bg-card text-foreground shadow-2xl z-[100] overflow-hidden" align="start">
                <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-white dark:bg-card">
                  <span className="text-xs font-bold text-foreground">Select Start Date</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const today = dateToString(new Date());
                        setFormData(prev => ({ ...prev, startDate: today }));
                        setStartDateOpen(false);
                      }}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Today
                    </button>
                    {formData.startDate && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, startDate: '' }));
                          setStartDateOpen(false);
                        }}
                        className="text-[11px] font-semibold text-muted-foreground hover:text-red-500 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={stringToDate(formData.startDate)}
                  onSelect={(date) => {
                    setFormData(prev => ({ ...prev, startDate: date ? dateToString(date) : '' }));
                    setStartDateOpen(false);
                  }}
                  initialFocus
                  className="p-3 bg-white dark:bg-card rounded-none"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date Popover */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              End Date
            </label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="h-12 w-full px-3.5 rounded-xl border border-foreground/15 bg-background hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition flex items-center justify-between text-left shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CalendarDays size={16} className="text-primary/70 group-hover:text-primary transition shrink-0" />
                    <span className={formData.endDate ? 'text-sm font-semibold text-foreground truncate' : 'text-sm text-muted-foreground truncate'}>
                      {formData.endDate ? formatFriendlyDate(formData.endDate) : 'Select end date'}
                    </span>
                  </div>
                  {formData.endDate ? (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, endDate: '' }));
                      }}
                      className="p-1 text-muted-foreground/60 hover:text-foreground rounded-md hover:bg-muted transition cursor-pointer"
                      title="Clear date"
                    >
                      <X size={13} />
                    </span>
                  ) : (
                    <ChevronDown size={14} className="text-muted-foreground/50 group-hover:text-muted-foreground transition shrink-0" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="!w-[340px] p-0 rounded-2xl border border-border/80 bg-white dark:bg-card text-foreground shadow-2xl z-[100] overflow-hidden" align="start">
                <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-white dark:bg-card">
                  <span className="text-xs font-bold text-foreground">Select End Date</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const today = dateToString(new Date());
                        setFormData(prev => ({ ...prev, endDate: today }));
                        setEndDateOpen(false);
                      }}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Today
                    </button>
                    {formData.endDate && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, endDate: '' }));
                          setEndDateOpen(false);
                        }}
                        className="text-[11px] font-semibold text-muted-foreground hover:text-red-500 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={stringToDate(formData.endDate)}
                  onSelect={(date) => {
                    setFormData(prev => ({ ...prev, endDate: date ? dateToString(date) : '' }));
                    setEndDateOpen(false);
                  }}
                  initialFocus
                  className="p-3 bg-white dark:bg-card rounded-none"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Start Time */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Start Time
            </label>
            <div className="h-12 px-3.5 rounded-xl border border-foreground/15 bg-background focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition flex items-center shadow-xs group">
              <Clock size={16} className="text-primary/70 group-hover:text-primary transition shrink-0 mr-2.5" />
              <input
                type="time"
                className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              End Time
            </label>
            <div className="h-12 px-3.5 rounded-xl border border-foreground/15 bg-background focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition flex items-center shadow-xs group">
              <Clock size={16} className="text-primary/70 group-hover:text-primary transition shrink-0 mr-2.5" />
              <input
                type="time"
                className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: VENUE */}
      <div className="bg-card/70 border border-foreground/10 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight text-foreground">2. Venue Location</h4>
              <p className="text-[11px] text-muted-foreground">Select a registered venue. Linked details will auto-populate as read-only</p>
            </div>
          </div>
        </div>

        {/* Dropdown */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Select Venue
          </label>
          <div className="relative h-12 rounded-xl border border-foreground/15 bg-background shadow-xs flex items-center px-3.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition">
            <MapPin size={16} className="text-primary/70 shrink-0 mr-2.5" />
            <select
              value={selectedVenueId}
              onChange={(e) => handleVenueSelect(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer pr-8"
            >
              <option value="">— Select a venue —</option>
              {venues.map((v: any) => (
                <option key={v._id} value={v._id}>
                  {v.name} {v.address ? `• ${v.address}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Read-only details as modern cards - ONLY SHOWN ONCE A REGISTERED VENUE IS SELECTED */}
        {Boolean(selectedVenue) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 animate-in fade-in-50 duration-200">
            <div className="p-4 rounded-xl border border-foreground/10 bg-muted/20 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building2 size={13} className="text-primary" /> Venue Name
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-foreground/5">
                  Read-only
                </span>
              </div>
              <p className="text-sm font-bold text-foreground">
                {selectedVenue.name || formData.name}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-foreground/10 bg-muted/20 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MapPin size={13} className="text-primary" /> Venue Address
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-foreground/5">
                  Read-only
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {selectedVenue.address || formData.address || <span className="text-muted-foreground font-normal italic">No address specified</span>}
              </p>
            </div>

            <div className="md:col-span-2 p-4 rounded-xl border border-foreground/10 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ExternalLink size={13} className="text-primary" /> Location URL / Map Link
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-foreground/5">
                    Read-only
                  </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {selectedVenue.locationUrl || formData.locationUrl || <span className="italic font-sans">No map link assigned</span>}
                </p>
              </div>
              {(selectedVenue.locationUrl || formData.locationUrl) && (
                <a
                  href={selectedVenue.locationUrl || formData.locationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 self-start sm:self-center"
                >
                  <ExternalLink size={13} /> Open in Google Maps
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: CUSTOM CONFERENCE MEDIA & DESCRIPTION */}
      <div className="bg-card/70 border border-foreground/10 rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ImageIcon size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight text-foreground">
                3. Conference Venue Highlights & Media
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Custom media showcase and rich text presentation for this conference's venue
              </p>
            </div>
          </div>
        </div>

        {/* Main Image */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Main Image (Featured Banner)
            </label>
            <span className="text-[11px] text-muted-foreground">16:9 ratio recommended</span>
          </div>

          {formData.mainImage ? (
            <div className="p-4 sm:p-5 rounded-2xl border border-foreground/15 bg-background shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* One Side: Image Preview */}
              <div className="w-full sm:w-72 md:w-80 h-44 shrink-0 rounded-xl overflow-hidden border border-foreground/15 bg-muted/10 flex items-center justify-center p-2 relative shadow-xs">
                <img
                  src={mediaUrl(formData.mainImage)}
                  alt="Main Venue"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md">
                  Main Image
                </span>
              </div>

              {/* Other Side: Info & Actions in the same box */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Featured Banner
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                      Active
                    </span>
                  </div>
                  <h5 className="text-base font-bold text-foreground mt-0.5">Main Venue Showcase</h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    Primary showcase image for the venue. Displayed at the top of the venue details section on public event pages.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <label className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5">
                    <Upload size={14} />
                    <span>{uploadingMain ? 'Uploading...' : 'Replace Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMainImageUpload}
                      disabled={uploadingMain}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRemoveMainImage}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <label className="h-44 border-2 border-dashed border-foreground/20 hover:border-primary/50 hover:bg-primary/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition p-6 text-center group">
              {uploadingMain ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <span>Uploading image...</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 group-hover:bg-primary/20 text-primary flex items-center justify-center mb-2.5 transition">
                    <Upload size={20} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Upload Main Venue Image</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Click to choose image file (PNG, JPG, WebP)</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMainImageUpload}
                disabled={uploadingMain}
              />
            </label>
          )}
        </div>

        {/* Three Sub Images */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Three Sub Images
            </label>
            <span className="text-[11px] text-muted-foreground">3 photo slots</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((idx) => {
              const url = formData.subImages[idx];
              const isUploadingThis = uploadingSubIndex === idx;

              return (
                <div key={idx} className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground block">
                    Sub Image {idx + 1}
                  </span>
                  {url ? (
                    <div className="p-3.5 rounded-2xl border border-foreground/15 bg-card/60 shadow-xs flex flex-row items-center gap-3.5 min-h-[120px]">
                      {/* One Side: Image */}
                      <div className="w-28 h-22 shrink-0 rounded-xl overflow-hidden border border-foreground/10 bg-muted/10 flex items-center justify-center p-1 relative shadow-xs">
                        <img
                          src={mediaUrl(url)}
                          alt={`Sub ${idx + 1}`}
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                        <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white bg-black/70 backdrop-blur-xs px-1.5 py-0.5 rounded">
                          Slot {idx + 1}
                        </span>
                      </div>

                      {/* Beside: Info & Replace / Remove */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <span className="text-xs font-bold text-foreground block truncate">
                            Sub Image {idx + 1}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">Venue gallery photo</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <label className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-1">
                            <Upload size={12} />
                            <span>{isUploadingThis ? '...' : 'Replace'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleSubImageUpload(e, idx)}
                              disabled={isUploadingThis}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubImage(idx)}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1"
                            title="Remove image"
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="min-h-[120px] border-2 border-dashed border-foreground/20 hover:border-primary/50 hover:bg-primary/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition p-4 text-center group">
                      {isUploadingThis ? (
                        <span className="text-xs text-muted-foreground font-medium">Uploading...</span>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-xl bg-muted/40 group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary flex items-center justify-center mb-1 transition">
                            <Plus size={16} />
                          </div>
                          <span className="text-xs font-bold text-foreground">Upload Slot {idx + 1}</span>
                          <span className="text-[10px] text-muted-foreground">Click to choose photo</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSubImageUpload(e, idx)}
                        disabled={isUploadingThis}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TipTap Rich Text Editor for Description */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Venue Description
          </label>
          <div className="rounded-2xl border border-foreground/15 overflow-hidden shadow-xs bg-background">
            <RichTextEditor
              value={formData.description}
              onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Describe the hall, auditorium, transportation details, nearby accommodations, or parking information.
          </p>
        </div>
      </div>
    </div>
  );
}

function CohortsTab() {
  const { eventPage, eventPageType, eventCohorts, eventCohortsLoading, createCohort, setCurrentCohort, deleteCohort, assignCohortMentor, mentors, user, openCohortTab, eventPageMode } = useAppStore();
  const isEditMode = eventPageMode === 'edit';
  const [showAdd, setShowAdd] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [assignCohort, setAssignCohort] = useState<CourseCohort | null>(null);
  const [assignUsername, setAssignUsername] = useState('');

  if (!eventPage || !eventPageType) return null;

  const nextBatchNo = eventCohorts.reduce((max, c) => Math.max(max, c.batchNo || 0), 0) + 1;
  const labelFor = (c: CourseCohort) => c.cohortId || c.title || `${c.year} Batch ${c.batchNo}`;
  const mentorNameFor = (username: string | null | undefined) => {
    if (!username) return '—';
    const m = mentors.find((x) => x.username === username);
    return m ? m.fullName : username;
  };

  const handleSetCurrent = async (id: string) => {
    try { await setCurrentCohort(id); } catch (err: any) { alert(err.message || 'Failed to set current cohort'); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cohort?')) return;
    try { await deleteCohort(id); } catch (err: any) { alert(err.message || 'Failed to delete cohort'); }
  };
  const submitAssign = async () => {
    if (!assignCohort) return;
    try { await assignCohortMentor(assignCohort._id, assignUsername || null); setAssignCohort(null); }
    catch (err: any) { alert(err.message || 'Failed to assign mentor'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full capitalize">{eventPageType}</span>
            <span className="text-xs text-muted-foreground font-mono">{eventPage.eventId}</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight">Cohorts — {eventPage.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage yearly &amp; batch-based launches for this {eventPageType}.</p>
        </div>
        {isEditMode && (
          <button onClick={() => setShowAdd(true)} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
            <Plus size={14} /> Add Cohort
          </button>
        )}
      </div>

      <div className="border border-foreground/10 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#f0f2fe] text-[#2c3e50] dark:bg-indigo-950/30 dark:text-indigo-200 font-semibold border-b border-foreground/10">
              <th className="p-4">ID</th>
              <th className="p-4">Cohort</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Mentor</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventCohortsLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">Loading cohorts...</td></tr>
            ) : (
              eventCohorts.map((c, idx) => {
                const isLastRow = idx >= eventCohorts.length - 1 && eventCohorts.length > 1;
                return (
                  <tr key={c._id} className="border-b border-foreground/5 bg-card hover:bg-foreground/[0.015] last:border-0 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-accent whitespace-nowrap">{c.cohortId || '—'}</td>
                    <td className="p-4 font-semibold">
                      {labelFor(c)}
                      {c.isCurrent && <span className="ml-2 px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded">Current</span>}
                      {c.title && <div className="text-xs text-muted-foreground font-normal mt-0.5">{c.title}</div>}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                      {c.startDate ? new Date(c.startDate).toLocaleDateString() : '—'}
                      {c.endDate && c.endDate !== c.startDate ? ` – ${new Date(c.endDate).toLocaleDateString()}` : ''}
                    </td>
                    <td className="p-4 text-xs font-semibold text-accent">{mentorNameFor(c.assignedMentor)}</td>
                    <td className="p-4 capitalize">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'active' ? 'bg-green-500/10 text-green-500' : c.status === 'completed' ? 'bg-foreground/10 text-muted-foreground' : 'bg-amber-500/10 text-amber-500'}`}>{c.status || 'upcoming'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {cohortSiteUrlFor(eventPage.subdomain, c) && (
                          <a href={cohortSiteUrlFor(eventPage.subdomain, c)!} target="_blank" rel="noreferrer" title="View site" className="p-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full transition duration-150 cursor-pointer inline-flex">
                            <ExternalLink size={15} />
                          </a>
                        )}
                        {isEditMode && user?.role === 'admin' && (
                          <button type="button" onClick={() => { setAssignCohort(c); setAssignUsername(c.assignedMentor || ''); }} title="Assign mentor" className="p-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full transition duration-150 cursor-pointer inline-flex">
                            <UserPlus size={15} />
                          </button>
                        )}
                        <div className="relative inline-block text-left">
                          <button type="button" onClick={() => setOpenMenuId(openMenuId === c._id ? null : c._id)} className="p-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full transition duration-150 active:scale-90 cursor-pointer">
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === c._id && (
                            <>
                              <div className="fixed inset-0 z-30 cursor-default" onClick={() => setOpenMenuId(null)} />
                              <div className={`absolute right-0 w-48 bg-card border border-foreground/15 rounded-xl shadow-2xl z-50 py-1.5 focus:outline-none text-left animate-fade-in ${
                                isLastRow ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                              }`}>
                                <button type="button" onClick={() => { setOpenMenuId(null); openCohortTab(c, 'dashboard'); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer">Dashboard</button>
                                <button type="button" onClick={() => { setOpenMenuId(null); openCohortTab(c, 'participants'); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer">Participants</button>
                                <button type="button" onClick={() => { setOpenMenuId(null); openCohortTab(c, 'payments'); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer">Payments</button>
                                <button type="button" onClick={() => { setOpenMenuId(null); openCohortTab(c, 'abstracts'); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer">Abstracts</button>
                                <button type="button" onClick={() => { setOpenMenuId(null); openCohortTab(c, 'enquiries'); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer">Enquiries</button>
                                {isEditMode && (
                                  <>
                                    <div className="border-t border-foreground/10 my-1" />
                                    <button type="button" onClick={() => { setOpenMenuId(null); handleSetCurrent(c._id); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer">{c.isCurrent ? 'Unset Current' : 'Set Current'}</button>
                                    <div className="border-t border-foreground/10 my-1" />
                                    <button type="button" onClick={() => { setOpenMenuId(null); handleDelete(c._id); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-red-500/10 text-red-500 hover:text-red-600 transition duration-150 font-bold cursor-pointer">Delete</button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            {!eventCohortsLoading && eventCohorts.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No cohorts yet. Add the first cohort.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <AddCohortModal
          eventPage={eventPage}
          eventPageType={eventPageType}
          nextBatchNo={nextBatchNo}
          existingYears={eventCohorts.map((c) => c.year)}
          onClose={() => setShowAdd(false)}
          onSave={async (payload) => { await createCohort(payload); setShowAdd(false); }}
        />
      )}

      {assignCohort && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-card text-foreground border border-foreground/10 rounded-2xl w-[92vw] md:w-[46vw] max-w-xl p-8 relative shadow-2xl space-y-6">
            <button type="button" onClick={() => setAssignCohort(null)} className="absolute top-6 right-6 p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground transition duration-150 cursor-pointer">Close</button>
            <div>
              <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">Assign Mentor</span>
              <h2 className="text-2xl font-bold tracking-tight mt-2">{assignCohort.cohortId || assignCohort.label || 'Cohort'}</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose a mentor who will manage this cohort's content.</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Mentor</label>
              <select value={assignUsername} onChange={(e) => setAssignUsername(e.target.value)} className="w-full px-4 py-3 bg-muted/20 border border-foreground/10 rounded-xl text-base text-foreground focus:outline-none focus:border-secondary transition cursor-pointer">
                <option value="">No mentor (unassigned)</option>
                {mentors.map((m) => (
                  <option key={m.username} value={m.username}>{m.fullName} ({m.username})</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setAssignCohort(null)} className="px-5 py-2.5 bg-muted text-foreground text-sm font-semibold rounded-xl hover:bg-muted/80 transition duration-150 cursor-pointer">Cancel</button>
              <button type="button" onClick={submitAssign} className="px-6 py-2.5 bg-secondary text-secondary-foreground text-sm font-semibold rounded-xl hover:bg-secondary/90 transition duration-150 cursor-pointer">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddCohortModal({
  eventPage,
  eventPageType,
  nextBatchNo,
  existingYears,
  onClose,
  onSave,
}: {
  eventPage: Conference | Webinar;
  eventPageType: EventType;
  nextBatchNo: number;
  existingYears: number[];
  onClose: () => void;
  onSave: (payload: Partial<CourseCohort>) => Promise<void>;
}) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [batchNo, setBatchNo] = useState(String(nextBatchNo));
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const y = Number(year);
    const b = Number(batchNo);
    if (!Number.isInteger(y) || y < 2000 || y > 2100) { setError('Year must be between 2000 and 2100'); return; }
    if (!Number.isInteger(b) || b < 1) { setError('Batch must be a positive integer'); return; }
    setSaving(true);
    try {
      await onSave({
        year: y,
        batchNo: b,
        title: title.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isCurrent,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create cohort');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card text-foreground border border-foreground/10 rounded-2xl w-[92vw] md:w-[60vw] max-w-2xl p-8 relative shadow-2xl space-y-6">
        <button type="button" onClick={onClose} className="absolute top-6 right-6 p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground transition duration-150 cursor-pointer">Close</button>
        <div>
          <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full capitalize">{eventPageType}</span>
          <h2 className="text-2xl font-bold tracking-tight mt-2">Add Cohort</h2>
          <p className="text-sm text-muted-foreground mt-1">New cohort under {eventPage.title}. The ID is auto-generated ({eventPage.eventId || ''}-{batchNo || '?'}).</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Year *</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="e.g. 2027" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Batch *</label>
              <input type="number" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="e.g. 1" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Title (optional)</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" placeholder="e.g. Spring Cohort" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg text-sm" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-semibold pb-2">
                <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="rounded" />
                Set as current
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-muted text-foreground text-sm font-semibold rounded-xl hover:bg-muted/80 transition duration-150 cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-secondary text-secondary-foreground text-sm font-semibold rounded-xl hover:bg-secondary/90 transition duration-150 cursor-pointer disabled:opacity-50">
              {saving ? 'Creating...' : 'Add Cohort'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

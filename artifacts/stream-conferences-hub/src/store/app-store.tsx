import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  FormEvent,
} from 'react';
import { useLocation } from 'wouter';
import { io, type Socket } from 'socket.io-client';
import { API_BASE, SERVER_ORIGIN } from '@/lib/constants';
import {
  computeDayAndMonth,
  mediaUrl,
  parseStartAndEndDates,
} from '@/lib/utils';
import {
  Abstract,
  Blog,
  ChatMessage,
  ChatSession,
  Collaborator,
  Conference,
  Contact,
  EventDetail,
  EventPageTab,
  EventType,
  EventSponsor,
  EventExhibitor,
  Exhibitor,
  FAQ,
  LogoKind,
  MediaAssetState,
  MediaPartner,
  MentorProfile,
  Order,
  PartnerFormState,
  Registration,
  Tab,
  Track,
  User,
  Venue,
  VenueFormState,
  Webinar,
} from '@/lib/types';

type EditableType = 'conference' | 'webinar' | 'blog';
type DeleteType = 'conferences' | 'webinars' | 'blogs';

interface FeeRow {
  label: string;
  amount: number;
}

interface OrganizerContact {
  name: string;
  email: string;
  phone: string;
}

interface AppStoreValue {
  // Session
  user: User | null;
  loginLoading: boolean;
  loginError: string;
  usernameInput: string;
  passwordInput: string;
  setUsernameInput: (v: string) => void;
  setPasswordInput: (v: string) => void;
  handleLogin: (e: FormEvent) => Promise<void>;
  handleLogout: () => void;

  // Navigation
  activeTab: Tab;
  goToTab: (tab: Tab) => void;
  isEventPage: boolean;
  eventPageType: EventType | null;
  eventPageId: string | null;
  eventPageTab: EventPageTab;
  eventPage: Conference | Webinar | null;
  openEventPage: (item: Conference | Webinar, type: EventType, tab?: EventPageTab) => void;
  closeEventPage: () => void;
  updateEventField: (field: string, value: any) => void;

  // Data lists
  loadingData: boolean;
  conferences: Conference[];
  webinars: Webinar[];
  blogs: Blog[];
  registrations: Registration[];
  abstracts: Abstract[];
  contacts: Contact[];
  orders: Order[];
  mediaPartners: MediaPartner[];
  collaborators: Collaborator[];
  exhibitors: Exhibitor[];
  venues: Venue[];
  profile: MentorProfile | null;
  mentors: MentorProfile[];
  refreshData: () => Promise<void>;
  loadTabData: (tab: Tab) => Promise<void>;

  // Generic add/edit modal
  showForm: boolean;
  editingItemType: EditableType | null;
  editingItemId: string | null;
  openAddForm: (type: EditableType) => void;
  openEditForm: (item: any, type: EditableType) => void;
  closeForm: () => void;
  handleSaveItem: (e: FormEvent) => Promise<void>;
  handleDeleteItem: (id: string, type: DeleteType) => Promise<void>;
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;

  // Wizard state (conference/webinar)
  wizardOpen: boolean;
  wizardType: EventType | null;
  wizardStep: number;
  wizardEditId: string | null;
  wizardSaving: boolean;
  wizardError: string;
  setWizardStep: (step: number) => void;
  closeWizard: () => void;
  canGoNext: () => boolean;
  canGoToStep: (step: number) => boolean;
  submitWizard: () => Promise<void>;

  // Wizard fields (conference)
  confTitle: string;
  setConfTitle: (v: string) => void;
  confDesc: string;
  setConfDesc: (v: string) => void;
  confLocation: string;
  setConfLocation: (v: string) => void;
  confStartDate: string;
  setConfStartDate: (v: string) => void;
  confEndDate: string;
  setConfEndDate: (v: string) => void;
  confIsOnline: boolean;
  setConfIsOnline: (v: boolean) => void;
  confVenue: string;
  setConfVenue: (v: string) => void;
  confSubdomain: string;
  setConfSubdomain: (v: string) => void;
  confOnlineLink: string;
  setConfOnlineLink: (v: string) => void;
  confStartTime: string;
  setConfStartTime: (v: string) => void;
  confEndTime: string;
  setConfEndTime: (v: string) => void;
  confFees: FeeRow[];
  setConfFees: (fees: FeeRow[]) => void;
  confOrg: OrganizerContact;
  setConfOrg: (org: OrganizerContact) => void;
  confMedia: MediaAssetState;
  setConfMedia: Dispatch<SetStateAction<MediaAssetState>>;
  confTracks: Track[];
  setConfTracks: Dispatch<SetStateAction<Track[]>>;

  // Wizard fields (webinar)
  webTitle: string;
  setWebTitle: (v: string) => void;
  webDesc: string;
  setWebDesc: (v: string) => void;
  webLocation: string;
  setWebLocation: (v: string) => void;
  webSpeaker: string;
  setWebSpeaker: (v: string) => void;
  webStartDate: string;
  setWebStartDate: (v: string) => void;
  webEndDate: string;
  setWebEndDate: (v: string) => void;
  webIsOnline: boolean;
  setWebIsOnline: (v: boolean) => void;
  webVenue: string;
  setWebVenue: (v: string) => void;
  webSubdomain: string;
  setWebSubdomain: (v: string) => void;
  webOnlineLink: string;
  setWebOnlineLink: (v: string) => void;
  webStartTime: string;
  setWebStartTime: (v: string) => void;
  webEndTime: string;
  setWebEndTime: (v: string) => void;
  webFees: FeeRow[];
  setWebFees: (fees: FeeRow[]) => void;
  webOrg: OrganizerContact;
  setWebOrg: (org: OrganizerContact) => void;
  webMedia: MediaAssetState;
  setWebMedia: Dispatch<SetStateAction<MediaAssetState>>;
  webTracks: Track[];
  setWebTracks: Dispatch<SetStateAction<Track[]>>;

  // Wizard helpers
  wizardTitle: () => string;
  setWizardTitle: (v: string) => void;
  wizardDesc: () => string;
  setWizardDesc: (v: string) => void;
  wizardStartDate: () => string;
  setWizardStartDate: (v: string) => void;
  wizardEndDate: () => string;
  setWizardEndDate: (v: string) => void;
  wizardIsOnline: () => boolean;
  setWizardIsOnline: (v: boolean) => void;
  wizardVenue: () => string;
  setWizardVenue: (v: string) => void;
  wizardSubdomain: () => string;
  setWizardSubdomain: (v: string) => void;
  wizardOnlineLink: () => string;
  setWizardOnlineLink: (v: string) => void;
  wizardStartTime: () => string;
  setWizardStartTime: (v: string) => void;
  wizardEndTime: () => string;
  setWizardEndTime: (v: string) => void;
  wizardFees: () => FeeRow[];
  setWizardFees: (fees: FeeRow[]) => void;
  wizardOrg: () => OrganizerContact;
  setWizardOrg: (org: OrganizerContact) => void;
  wizardMedia: () => MediaAssetState;
  setWizardMedia: (m: SetStateAction<MediaAssetState>) => void;
  wizardTracks: () => Track[];
  setWizardTracks: (tracks: SetStateAction<Track[]>) => void;
  wizardFaqs: () => FAQ[];
  setWizardFaqs: (v: SetStateAction<FAQ[]>) => void;
  wizardSponsors: () => EventSponsor[];
  setWizardSponsors: (v: SetStateAction<EventSponsor[]>) => void;
  wizardExhibitors: () => EventExhibitor[];
  setWizardExhibitors: (v: SetStateAction<EventExhibitor[]>) => void;
  wizardGuidelines: () => string;
  setWizardGuidelines: (v: string) => void;
  wizardTerms: () => string;
  setWizardTerms: (v: string) => void;
  addFeeRow: () => void;
  updateFeeRow: (index: number, field: 'label' | 'amount', value: string) => void;
  removeFeeRow: (index: number) => void;
  addTrack: () => void;
  updateTrack: (index: number, field: 'title' | 'description', value: string) => void;
  removeTrack: (index: number) => void;
  addFaq: () => void;
  updateFaq: (index: number, field: keyof FAQ, value: string | number) => void;
  removeFaq: (index: number) => void;
  addSponsor: () => void;
  updateSponsor: (index: number, field: keyof EventSponsor, value: string) => void;
  removeSponsor: (index: number) => void;
  addExhibitor: () => void;
  updateExhibitor: (index: number, field: keyof EventExhibitor, value: string) => void;
  removeExhibitor: (index: number) => void;
  addReferenceLink: (trackIndex: number) => void;
  updateReferenceLink: (trackIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => void;
  removeReferenceLink: (trackIndex: number, linkIndex: number) => void;
  handleTrackImageUpload: (trackIndex: number, file: File | null) => Promise<void>;
  handleSponsorLogoUpload: (index: number, file: File | null) => Promise<void>;
  handleExhibitorLogoUpload: (index: number, file: File | null) => Promise<void>;
  handleMediaUpload: (kind: 'brochure' | 'banner' | 'logo', file: File | null) => Promise<void>;
  clearMedia: (kind: 'brochure' | 'banner' | 'logo') => void;

  // Blog fields
  blogTitle: string;
  setBlogTitle: (v: string) => void;
  blogLabel: string;
  setBlogLabel: (v: string) => void;
  blogCopy: string;
  setBlogCopy: (v: string) => void;
  blogContent: string;
  setBlogContent: (v: string) => void;
  blogBannerUrl: string;
  setBlogBannerUrl: (v: string) => void;
  blogBannerPreview: string;
  setBlogBannerPreview: (v: string) => void;
  handleBlogBannerUpload: (file: File | null) => Promise<void>;

  // Content sections (partners/collaborators/exhibitors/venues)
  partnerForm: PartnerFormState;
  setPartnerForm: Dispatch<SetStateAction<PartnerFormState>>;
  collaboratorForm: PartnerFormState;
  setCollaboratorForm: Dispatch<SetStateAction<PartnerFormState>>;
  exhibitorForm: PartnerFormState;
  setExhibitorForm: Dispatch<SetStateAction<PartnerFormState>>;
  venueForm: VenueFormState;
  setVenueForm: Dispatch<SetStateAction<VenueFormState>>;
  openPartnerForm: (item: MediaPartner | null) => void;
  savePartner: () => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  openCollaboratorForm: (item: Collaborator | null) => void;
  saveCollaborator: () => Promise<void>;
  deleteCollaborator: (id: string) => Promise<void>;
  openExhibitorForm: (item: Exhibitor | null) => void;
  saveExhibitor: () => Promise<void>;
  deleteExhibitor: (id: string) => Promise<void>;
  openVenueForm: (item: Venue | null) => void;
  saveVenue: () => Promise<void>;
  deleteVenue: (id: string) => Promise<void>;
  handleLogoUpload: (kind: LogoKind, file: File | null) => void;

  // Profile
  profileForm: MentorProfile & { avatarPreview?: string };
  setProfileForm: Dispatch<SetStateAction<MentorProfile & { avatarPreview?: string }>>;
  saveProfile: () => Promise<void>;
  handleProfileAvatarUpload: (file: File | null) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;

  // Per-event data
  eventDetail: EventDetail | null;
  eventDetailLoading: boolean;
  eventDetailError: string;
  eventAbstracts: Abstract[];
  eventEnquiries: Contact[];
  eventAbstractsLoading: boolean;
  eventEnquiriesLoading: boolean;
  abstractActionLoading: string | null;
  handleAbstractAction: (id: string, action: 'approve' | 'reject', reason?: string) => Promise<void>;
  viewingParticipant: Registration | null;
  setViewingParticipant: (p: Registration | null) => void;

  // Mentor assignment
  assignOpen: boolean;
  assignTarget: Conference | Webinar | null;
  assignUsername: string;
  openAssignMentor: (item: Conference | Webinar) => void;
  closeAssignMentor: () => void;
  setAssignUsername: (v: string) => void;
  submitAssignMentor: () => Promise<void>;

  // Live chat
  chatSessions: ChatSession[];
  activeChatId: string | null;
  activeChatMessages: ChatMessage[];
  chatLoading: boolean;
  setActiveChatId: (id: string | null) => void;
  sendChatReply: (text: string) => Promise<void>;
  markChatRead: (sessionId: string) => Promise<void>;
  setChatStatus: (sessionId: string, status: 'open' | 'closed') => Promise<void>;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

const EMPTY_MEDIA: MediaAssetState = {
  brochureUrl: '',
  bannerUrl: '',
  logoUrl: '',
  brochurePreview: '',
  bannerPreview: '',
  logoPreview: '',
};

const EMPTY_ORG: OrganizerContact = { name: '', email: '', phone: '' };

const EMPTY_PARTNER_FORM: PartnerFormState = {
  open: false,
  editingId: null,
  name: '',
  logo: '',
  logoPreview: '',
  description: '',
};

const EMPTY_VENUE_FORM: VenueFormState = {
  open: false,
  editingId: null,
  name: '',
  address: '',
  locationUrl: '',
};

const EMPTY_PROFILE: MentorProfile & { avatarPreview?: string } = {
  username: '',
  fullName: '',
  title: '',
  bio: '',
  avatar: '',
  avatarPreview: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  website: '',
  expertise: [],
  education: [],
  experiences: [],
  certifications: [],
};

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();

  // Session
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('stream-admin-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Data lists
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [abstracts, setAbstracts] = useState<Abstract[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mediaPartners, setMediaPartners] = useState<MediaPartner[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modal / form state
  const [showForm, setShowForm] = useState(false);
  const [editingItemType, setEditingItemType] = useState<EditableType | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Event detail data
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [eventDetailLoading, setEventDetailLoading] = useState(false);
  const [eventDetailError, setEventDetailError] = useState('');

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<EventType | null>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardEditId, setWizardEditId] = useState<string | null>(null);
  const [wizardSaving, setWizardSaving] = useState(false);
  const [wizardError, setWizardError] = useState('');

  // Conference fields
  const [confTitle, setConfTitle] = useState('');
  const [confDesc, setConfDesc] = useState('');
  const [confLocation, setConfLocation] = useState('');
  const [confStartDate, setConfStartDate] = useState('');
  const [confEndDate, setConfEndDate] = useState('');
  const [confIsOnline, setConfIsOnline] = useState(false);
  const [confVenue, setConfVenue] = useState('');
  const [confSubdomain, setConfSubdomain] = useState('');
  const [confOnlineLink, setConfOnlineLink] = useState('');
  const [confStartTime, setConfStartTime] = useState('');
  const [confEndTime, setConfEndTime] = useState('');
  const [confFees, setConfFees] = useState<FeeRow[]>([]);
  const [confOrg, setConfOrg] = useState<OrganizerContact>(EMPTY_ORG);
  const [confMedia, setConfMedia] = useState<MediaAssetState>(EMPTY_MEDIA);
  const [confTracks, setConfTracks] = useState<Track[]>([]);
  const [confFaqs, setConfFaqs] = useState<FAQ[]>([]);
  const [confSponsors, setConfSponsors] = useState<EventSponsor[]>([]);
  const [confExhibitors, setConfExhibitors] = useState<EventExhibitor[]>([]);
  const [confGuidelines, setConfGuidelines] = useState('');
  const [confTerms, setConfTerms] = useState('');

  // Webinar fields
  const [webTitle, setWebTitle] = useState('');
  const [webDesc, setWebDesc] = useState('');
  const [webLocation, setWebLocation] = useState('');
  const [webSpeaker, setWebSpeaker] = useState('');
  const [webStartDate, setWebStartDate] = useState('');
  const [webEndDate, setWebEndDate] = useState('');
  const [webIsOnline, setWebIsOnline] = useState(false);
  const [webVenue, setWebVenue] = useState('');
  const [webSubdomain, setWebSubdomain] = useState('');
  const [webOnlineLink, setWebOnlineLink] = useState('');
  const [webStartTime, setWebStartTime] = useState('');
  const [webEndTime, setWebEndTime] = useState('');
  const [webFees, setWebFees] = useState<FeeRow[]>([]);
  const [webOrg, setWebOrg] = useState<OrganizerContact>(EMPTY_ORG);
  const [webMedia, setWebMedia] = useState<MediaAssetState>(EMPTY_MEDIA);
  const [webTracks, setWebTracks] = useState<Track[]>([]);
  const [webFaqs, setWebFaqs] = useState<FAQ[]>([]);
  const [webSponsors, setWebSponsors] = useState<EventSponsor[]>([]);
  const [webExhibitors, setWebExhibitors] = useState<EventExhibitor[]>([]);
  const [webGuidelines, setWebGuidelines] = useState('');
  const [webTerms, setWebTerms] = useState('');

  // Blog fields
  const [blogTitle, setBlogTitle] = useState('');
  const [blogLabel, setBlogLabel] = useState('');
  const [blogCopy, setBlogCopy] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogBannerUrl, setBlogBannerUrl] = useState('');
  const [blogBannerPreview, setBlogBannerPreview] = useState('');

  // Content section forms
  const [partnerForm, setPartnerForm] = useState<PartnerFormState>(EMPTY_PARTNER_FORM);
  const [collaboratorForm, setCollaboratorForm] = useState<PartnerFormState>(EMPTY_PARTNER_FORM);
  const [exhibitorForm, setExhibitorForm] = useState<PartnerFormState>(EMPTY_PARTNER_FORM);
  const [venueForm, setVenueForm] = useState<VenueFormState>(EMPTY_VENUE_FORM);

  // Profile
  const [profileForm, setProfileForm] = useState<MentorProfile & { avatarPreview?: string }>(EMPTY_PROFILE);

  // Per-event extras
  const [viewingParticipant, setViewingParticipant] = useState<Registration | null>(null);

  // Mentor assignment
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Conference | Webinar | null>(null);
  const [assignUsername, setAssignUsername] = useState('');

  // Live chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatSocketRef = useRef<Socket | null>(null);
  const activeChatIdRef = useRef<string | null>(null);
  const [eventAbstracts, setEventAbstracts] = useState<Abstract[]>([]);
  const [eventEnquiries, setEventEnquiries] = useState<Contact[]>([]);
  const [eventAbstractsLoading, setEventAbstractsLoading] = useState(false);
  const [eventEnquiriesLoading, setEventEnquiriesLoading] = useState(false);
  const [abstractActionLoading, setAbstractActionLoading] = useState<string | null>(null);

  // URL-driven event page resolution
  const eventPageTab: EventPageTab =
    (['dashboard', 'details', 'participants', 'payments', 'abstracts', 'enquiries'] as const).find(
      (t) => location.includes(`/${t}`),
    ) || 'dashboard';
  const eventPageType: EventType | null = location.startsWith('/conference/')
    ? 'conference'
    : location.startsWith('/webinar/')
      ? 'webinar'
      : null;
  const eventPageId = eventPageType ? location.split('/')[2] || null : null;
  const isEventPage = Boolean(eventPageType && eventPageId);

  const eventPage: Conference | Webinar | null = isEventPage
    ? eventPageType === 'conference'
      ? conferences.find((c) => c._id === eventPageId) || null
      : webinars.find((w) => w._id === eventPageId) || null
    : null;

  const openEventPage = (
    item: Conference | Webinar,
    type: EventType,
    tab: EventPageTab = 'dashboard',
  ) => {
    navigate(`/${type}/${item._id}/${tab}`);
  };

  const closeEventPage = () => {
    navigate('/');
  };

  const updateEventField = async (field: string, value: any) => {
    if (!eventPage || !eventPageType) return;
    
    const endpoint = eventPageType === 'conference' ? 'conferences' : 'webinars';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': user?.role || '',
      'x-user-name': user?.username || '',
    };
    
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ [field]: value }),
      });
      
      if (res.ok) {
        const updated = await res.json();
        if (eventPageType === 'conference') {
          setConferences((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        } else {
          setWebinars((prev) => prev.map((w) => (w._id === updated._id ? updated : w)));
        }
      }
    } catch (error) {
      console.error('Failed to update event field:', error);
    }
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setWizardType(null);
    setWizardStep(1);
    setWizardEditId(null);
    setWizardError('');
    resetWizardFields();
  };

  const goToTab = (tab: Tab) => {
    if (tab !== activeTab) {
      closeWizard();
      setPartnerForm(EMPTY_PARTNER_FORM);
      setCollaboratorForm(EMPTY_PARTNER_FORM);
      setExhibitorForm(EMPTY_PARTNER_FORM);
      setVenueForm(EMPTY_VENUE_FORM);
      setShowForm(false);
    }
    setActiveTab(tab);
    navigate('/');
  };

  const resetWizardFields = () => {
    setConfTitle(''); setConfDesc(''); setConfLocation(''); setConfStartDate(''); setConfEndDate('');
    setConfIsOnline(false); setConfVenue(''); setConfSubdomain(''); setConfOnlineLink('');
    setConfStartTime(''); setConfEndTime(''); setConfFees([]); setConfOrg(EMPTY_ORG);
    setConfMedia(EMPTY_MEDIA); setConfTracks([]);
    setConfFaqs([]); setConfSponsors([]); setConfExhibitors([]); setConfGuidelines(''); setConfTerms('');
    setWebTitle(''); setWebDesc(''); setWebLocation(''); setWebSpeaker('');
    setWebStartDate(''); setWebEndDate(''); setWebIsOnline(false); setWebVenue(''); setWebSubdomain(''); setWebOnlineLink('');
    setWebStartTime(''); setWebEndTime(''); setWebFees([]); setWebOrg(EMPTY_ORG);
    setWebMedia(EMPTY_MEDIA); setWebTracks([]);
    setWebFaqs([]); setWebSponsors([]); setWebExhibitors([]); setWebGuidelines(''); setWebTerms('');
    setBlogTitle(''); setBlogLabel(''); setBlogCopy(''); setBlogContent('');
    setBlogBannerUrl(''); setBlogBannerPreview('');
  };

  const loadProfile = async () => {
    if (!user) return;
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    try {
      const profileRes = await fetch(`${API_BASE}/mentors/me`, { headers });
      if (profileRes.ok) {
        const prof = await profileRes.json();
        setProfile(prof);
        setProfileForm({ ...prof, avatarPreview: prof.avatar ? mediaUrl(prof.avatar) : '' });
      } else {
        setProfile(null);
        setProfileForm((cur) => ({ ...cur, username: user.username }));
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  };

  const loadTabData = async (tab: Tab) => {
    if (!user) return;
    setLoadingData(true);
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    const isAdmin = user.role === 'admin';

    const fetchInto = async (url: string, setter: (d: any) => void) => {
      const res = await fetch(url, { headers });
      if (res.ok) setter(await res.json());
    };

    try {
      switch (tab) {
        case 'overview':
          await fetchInto(`${API_BASE}/conferences`, setConferences);
          await fetchInto(`${API_BASE}/webinars`, setWebinars);
          await fetchInto(`${API_BASE}/blogs`, setBlogs);
          if (isAdmin) {
            await fetchInto(`${API_BASE}/registrations`, setRegistrations);
            await fetchInto(`${API_BASE}/abstracts`, setAbstracts);
            await fetchInto(`${API_BASE}/contacts`, setContacts);
            await fetchInto(`${API_BASE}/orders`, setOrders);
          }
          break;
        case 'conferences':
          await fetchInto(`${API_BASE}/conferences`, setConferences);
          if (isAdmin) await fetchInto(`${API_BASE}/mentors`, setMentors);
          await fetchInto(`${API_BASE}/venues`, setVenues);
          break;
        case 'webinars':
          await fetchInto(`${API_BASE}/webinars`, setWebinars);
          if (isAdmin) await fetchInto(`${API_BASE}/mentors`, setMentors);
          await fetchInto(`${API_BASE}/venues`, setVenues);
          break;
        case 'blogs':
          await fetchInto(`${API_BASE}/blogs`, setBlogs);
          break;
        case 'registrations':
          await fetchInto(`${API_BASE}/registrations`, setRegistrations);
          break;
        case 'abstracts':
          await fetchInto(`${API_BASE}/abstracts`, setAbstracts);
          break;
        case 'contacts':
          await fetchInto(`${API_BASE}/contacts`, setContacts);
          break;
        case 'orders':
          await fetchInto(`${API_BASE}/orders`, setOrders);
          break;
        case 'mediaPartners':
          await fetchInto(`${API_BASE}/media-partners`, setMediaPartners);
          break;
        case 'collaborators':
          await fetchInto(`${API_BASE}/collaborators`, setCollaborators);
          break;
        case 'exhibitors':
          await fetchInto(`${API_BASE}/exhibitors`, setExhibitors);
          break;
        case 'venues':
          await fetchInto(`${API_BASE}/venues`, setVenues);
          break;
        case 'profile':
          await loadProfile();
          break;
        case 'mentors':
          await fetchInto(`${API_BASE}/mentors`, setMentors);
          break;
        case 'liveChat':
          // chat is loaded via socket; no REST fetch
          break;
        default:
          break;
      }
    } catch (e) {
      console.error('Failed to load data from backend API server', e);
    } finally {
      setLoadingData(false);
    }
  };

  // Kept for backward compatibility with post-mutation refreshes: reloads the current tab's data.
  const refreshData = async () => {
    if (!user) return;
    await loadTabData(activeTab);
  };

  const loadEventTabData = async () => {
    if (!eventPage || !eventPageType) return;
    const headers: Record<string, string> = {
      'x-user-role': user?.role || '',
      'x-user-name': user?.username || '',
    };
    const endpoint = eventPageType === 'conference' ? 'conferences' : 'webinars';
    const tab = eventPageTab;

    try {
      // dashboard (stats) / participants / payments all come from the participants endpoint
      if (tab === 'dashboard' || tab === 'participants' || tab === 'payments') {
        setEventDetail(null);
        setEventDetailError('');
        setEventDetailLoading(true);
        try {
          const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}/participants`, { headers });
          if (!res.ok) throw new Error('Failed to load event details');
          setEventDetail(await res.json());
        } catch (err: any) {
          console.error('Load event details error:', err);
          setEventDetailError(err.message || 'Failed to load event details');
        } finally {
          setEventDetailLoading(false);
        }
      }

      // abstracts tab
      if (tab === 'abstracts') {
        setEventAbstractsLoading(true);
        try {
          const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}/abstracts`, { headers });
          if (res.ok) setEventAbstracts(await res.json());
        } catch (err) {
          console.error('Load event abstracts error:', err);
        } finally {
          setEventAbstractsLoading(false);
        }
      }

      // enquiries tab
      if (tab === 'enquiries') {
        setEventEnquiriesLoading(true);
        try {
          const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}/enquiries`, { headers });
          if (res.ok) setEventEnquiries(await res.json());
        } catch (err) {
          console.error('Load event enquiries error:', err);
        } finally {
          setEventEnquiriesLoading(false);
        }
      }
    } catch (err) {
      console.error('Load event tab data error:', err);
    }
  };

  const handleAbstractAction = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    if (!user) return;
    setAbstractActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/abstracts/${id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to ${action} abstract`);
      }
      const updated = await res.json();
      setAbstracts((prev) => prev.map((a) => (a._id === id ? updated : a)));
      setEventAbstracts((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch (err: any) {
      console.error(`Abstract ${action} error:`, err);
      alert(err.message || `Failed to ${action} abstract`);
    } finally {
      setAbstractActionLoading(null);
    }
  };

  const loadChatSessions = async () => {
    if (!user) return;
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    try {
      const res = await fetch(`${API_BASE}/chat/sessions`, { headers });
      if (res.ok) setChatSessions(await res.json());
    } catch (err) {
      console.error('Load chat sessions error:', err);
    }
  };

  const loadChatMessages = async (sessionId: string) => {
    if (!user) return;
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`, { headers });
      if (res.ok) setActiveChatMessages(await res.json());
    } catch (err) {
      console.error('Load chat messages error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const selectChat = (sessionId: string | null) => {
    setActiveChatId(sessionId);
    activeChatIdRef.current = sessionId;
    if (sessionId) {
      loadChatMessages(sessionId);
      markChatRead(sessionId);
      chatSocketRef.current?.emit('admin:join', sessionId);
    } else {
      setActiveChatMessages([]);
    }
  };

  const sendChatReply = async (text: string) => {
    if (!user || !activeChatId) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const session = chatSessions.find((s) => s._id === activeChatId);
    const socket = chatSocketRef.current;
    if (socket) {
      socket.emit('admin:message', {
        sessionId: activeChatId,
        visitorId: session?.visitorId,
        senderName: user.username,
        text: trimmed
      });
      return;
    }

    // Fallback: REST append if socket is not connected
    try {
      const res = await fetch(`${API_BASE}/chat/sessions/${activeChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify({ text: trimmed, senderName: user.username })
      });
      if (!res.ok) throw new Error('Failed to send reply');
      const message = await res.json();
      setActiveChatMessages((prev) => [...prev, message]);
    } catch (err) {
      console.error('Send chat reply error:', err);
    }
  };

  const markChatRead = async (sessionId: string) => {
    if (!user) return;
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    try {
      await fetch(`${API_BASE}/chat/sessions/${sessionId}/read`, { method: 'POST', headers });
      setChatSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, unreadByAdmin: 0 } : s)));
    } catch (err) {
      console.error('Mark chat read error:', err);
    }
  };

  const setChatStatus = async (sessionId: string, status: 'open' | 'closed') => {
    if (!user) return;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    try {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setChatSessions((prev) => prev.map((s) => (s._id === sessionId ? updated : s)));
      }
    } catch (err) {
      console.error('Set chat status error:', err);
    }
  };

  // Realtime socket for the team member
  useEffect(() => {
    if (!user) return;
    loadChatSessions();

    const socket = io(SERVER_ORIGIN, {
      query: { role: user.role, username: user.username }
    });
    chatSocketRef.current = socket;

    socket.on('admin:message', (payload: { session: ChatSession; message: ChatMessage }) => {
      setChatSessions((prev) => {
        const exists = prev.some((s) => s._id === payload.session._id);
        if (exists) {
          return prev
            .map((s) => (s._id === payload.session._id ? payload.session : s))
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        }
        return [payload.session, ...prev];
      });
      setActiveChatMessages((prev) => {
        if (activeChatIdRef.current === payload.session._id) {
          if (prev.some((m) => m._id === payload.message._id)) return prev;
          return [...prev, payload.message];
        }
        return prev;
      });
    });

    socket.on('admin:typing', (payload: { visitorId: string; typing: boolean }) => {
      // Optional: could surface "visitor is typing" in the active session
    });

    // The team member's own replies echo back through the session room
    socket.on('chat:message', (message: ChatMessage) => {
      if (message.sender !== 'admin') return;
      setActiveChatMessages((prev) => {
        if (activeChatIdRef.current === message.sessionId) {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
      chatSocketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) loadTabData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  useEffect(() => {
    loadEventTabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventPageId, eventPageType, eventPageTab, user]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Login failed');
      }

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('stream-admin-user', JSON.stringify(data.user));
        setUser(data.user);
        setUsernameInput('');
        setPasswordInput('');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Connection to database server failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('stream-admin-user');
    setUser(null);
  };

  const openAddForm = (type: EditableType) => {
    setEditingItemType(type);
    setEditingItemId(null);
    if (type === 'blog') {
      resetWizardFields();
      setShowForm(true);
      return;
    }
    resetWizardFields();
    setWizardType(type);
    setWizardStep(1);
    setWizardEditId(null);
    setWizardError('');
    setWizardOpen(true);
  };

  const openEditForm = (item: any, type: EditableType) => {
    setEditingItemType(type);
    setEditingItemId(item._id);
    if (type === 'blog') {
      setBlogTitle(item.title);
      setBlogLabel(item.label);
      setBlogCopy(item.copy);
      setBlogContent(item.content);
      setBlogBannerUrl(item.bannerUrl || '');
      setBlogBannerPreview('');
      setShowForm(true);
      return;
    }
    resetWizardFields();
    setWizardType(type);
    setWizardEditId(item._id);
    setWizardError('');
    setWizardOpen(true);

    const mapTracks = (tracks: any[]): Track[] =>
      Array.isArray(tracks)
        ? tracks.map((t: any) => ({
            title: t.title || '',
            description: t.description || '',
            image: t.image || '',
            imagePreview: mediaUrl(t.image || ''),
            referenceLinks: Array.isArray(t.referenceLinks)
              ? t.referenceLinks.map((l: any) => ({ label: l.label || '', url: l.url || '' }))
              : [],
          }))
        : [];

    const splitLocation = (loc: string) => {
      const isOnline = loc && /online/i.test(loc);
      if (isOnline) {
        const parts = loc.split(/[·•|:-]/);
        const link = parts.length > 1 ? parts.slice(1).join('·').trim() : '';
        return { isOnline: true, venue: '', onlineLink: link };
      }
      return { isOnline: false, venue: loc, onlineLink: '' };
    };

    if (type === 'conference') {
      setConfTitle(item.title);
      setConfDesc(item.description || '');
      setConfLocation(item.location);
      setConfStartTime(item.startTime || '');
      setConfEndTime(item.endTime || '');
      setConfFees(Array.isArray(item.fees) ? item.fees.map((f: any) => ({ label: f.label || '', amount: Number(f.amount) || 0 })) : []);
      setConfTracks(mapTracks(item.tracks));
      setConfOrg({ name: item.organizerContact?.name || '', email: item.organizerContact?.email || '', phone: item.organizerContact?.phone || '' });
      setConfMedia({
        brochureUrl: item.brochureUrl || '', bannerUrl: item.bannerUrl || '', logoUrl: item.logoUrl || '',
        brochurePreview: mediaUrl(item.brochureUrl || ''), bannerPreview: mediaUrl(item.bannerUrl || ''), logoPreview: mediaUrl(item.logoUrl || ''),
      });
      const parsedDates = parseStartAndEndDates(item.eventDate, item.day);
      setConfStartDate(parsedDates.start);
      setConfEndDate(parsedDates.end);
      const loc = splitLocation(item.location);
      setConfIsOnline(loc.isOnline);
      setConfOnlineLink(loc.onlineLink);
      setConfVenue(loc.venue);
      setConfSubdomain(item.subdomain || '');
      setConfFaqs(Array.isArray(item.faqs) ? item.faqs : []);
      setConfSponsors(Array.isArray(item.sponsors) ? item.sponsors : []);
      setConfExhibitors(Array.isArray(item.exhibitors) ? item.exhibitors : []);
      setConfGuidelines(item.guidelines || '');
      setConfTerms(item.termsAndConditions || '');
    } else if (type === 'webinar') {
      setWebTitle(item.title);
      setWebDesc(item.description || '');
      setWebLocation(item.location);
      setWebSpeaker(item.speaker);
      setWebStartTime(item.startTime || '');
      setWebEndTime(item.endTime || '');
      setWebFees(Array.isArray(item.fees) ? item.fees.map((f: any) => ({ label: f.label || '', amount: Number(f.amount) || 0 })) : []);
      setWebTracks(mapTracks(item.tracks));
      setWebOrg({ name: item.organizerContact?.name || '', email: item.organizerContact?.email || '', phone: item.organizerContact?.phone || '' });
      setWebMedia({
        brochureUrl: item.brochureUrl || '', bannerUrl: item.bannerUrl || '', logoUrl: item.logoUrl || '',
        brochurePreview: mediaUrl(item.brochureUrl || ''), bannerPreview: mediaUrl(item.bannerUrl || ''), logoPreview: mediaUrl(item.logoUrl || ''),
      });
      const parsedDates = parseStartAndEndDates(item.eventDate, item.day);
      setWebStartDate(parsedDates.start);
      setWebEndDate(parsedDates.end);
      const loc = splitLocation(item.location);
      setWebIsOnline(loc.isOnline);
      setWebOnlineLink(loc.onlineLink);
      setWebVenue(loc.venue);
      setWebFaqs(Array.isArray(item.faqs) ? item.faqs : []);
      setWebSponsors(Array.isArray(item.sponsors) ? item.sponsors : []);
      setWebExhibitors(Array.isArray(item.exhibitors) ? item.exhibitors : []);
      setWebGuidelines(item.guidelines || '');
      setWebTerms(item.termsAndConditions || '');
    }
  };

  // Wizard getters/setters
  const wizardFees = () => (wizardType === 'conference' ? confFees : webFees);
  const setWizardFees = (fees: FeeRow[]) => (wizardType === 'conference' ? setConfFees(fees) : setWebFees(fees));
  const wizardOrg = () => (wizardType === 'conference' ? confOrg : webOrg);
  const setWizardOrg = (org: OrganizerContact) => (wizardType === 'conference' ? setConfOrg(org) : setWebOrg(org));
  const wizardMedia = () => (wizardType === 'conference' ? confMedia : webMedia);
  const setWizardMedia = (m: SetStateAction<MediaAssetState>) => (wizardType === 'conference' ? setConfMedia(m) : setWebMedia(m));
  const wizardTracks = () => (wizardType === 'conference' ? confTracks : webTracks);
  const setWizardTracks = (tracks: SetStateAction<Track[]>) => (wizardType === 'conference' ? setConfTracks(tracks) : setWebTracks(tracks));
  const wizardFaqs = () => (wizardType === 'conference' ? confFaqs : webFaqs);
  const setWizardFaqs = (v: SetStateAction<FAQ[]>) => (wizardType === 'conference' ? setConfFaqs(v) : setWebFaqs(v));
  const wizardSponsors = () => (wizardType === 'conference' ? confSponsors : webSponsors);
  const setWizardSponsors = (v: SetStateAction<EventSponsor[]>) => (wizardType === 'conference' ? setConfSponsors(v) : setWebSponsors(v));
  const wizardExhibitors = () => (wizardType === 'conference' ? confExhibitors : webExhibitors);
  const setWizardExhibitors = (v: SetStateAction<EventExhibitor[]>) => (wizardType === 'conference' ? setConfExhibitors(v) : setWebExhibitors(v));
  const wizardGuidelines = () => (wizardType === 'conference' ? confGuidelines : webGuidelines);
  const setWizardGuidelines = (v: string) => (wizardType === 'conference' ? setConfGuidelines(v) : setWebGuidelines(v));
  const wizardTerms = () => (wizardType === 'conference' ? confTerms : webTerms);
  const setWizardTerms = (v: string) => (wizardType === 'conference' ? setConfTerms(v) : setWebTerms(v));
  const wizardTitle = () => (wizardType === 'conference' ? confTitle : webTitle);
  const setWizardTitle = (v: string) => (wizardType === 'conference' ? setConfTitle(v) : setWebTitle(v));
  const wizardDesc = () => (wizardType === 'conference' ? confDesc : webDesc);
  const setWizardDesc = (v: string) => (wizardType === 'conference' ? setConfDesc(v) : setWebDesc(v));
  const wizardStartDate = () => (wizardType === 'conference' ? confStartDate : webStartDate);
  const setWizardStartDate = (v: string) => (wizardType === 'conference' ? setConfStartDate(v) : setWebStartDate(v));
  const wizardEndDate = () => (wizardType === 'conference' ? confEndDate : webEndDate);
  const setWizardEndDate = (v: string) => (wizardType === 'conference' ? setConfEndDate(v) : setWebEndDate(v));
  const wizardIsOnline = () => (wizardType === 'conference' ? confIsOnline : webIsOnline);
  const setWizardIsOnline = (v: boolean) => (wizardType === 'conference' ? setConfIsOnline(v) : setWebIsOnline(v));
  const wizardVenue = () => (wizardType === 'conference' ? confVenue : webVenue);
  const setWizardVenue = (v: string) => (wizardType === 'conference' ? setConfVenue(v) : setWebVenue(v));
  const wizardSubdomain = () => (wizardType === 'conference' ? confSubdomain : webSubdomain);
  const setWizardSubdomain = (v: string) => (wizardType === 'conference' ? setConfSubdomain(v) : setWebSubdomain(v));
  const wizardOnlineLink = () => (wizardType === 'conference' ? confOnlineLink : webOnlineLink);
  const setWizardOnlineLink = (v: string) => (wizardType === 'conference' ? setConfOnlineLink(v) : setWebOnlineLink(v));
  const wizardStartTime = () => (wizardType === 'conference' ? confStartTime : webStartTime);
  const setWizardStartTime = (v: string) => (wizardType === 'conference' ? setConfStartTime(v) : setWebStartTime(v));
  const wizardEndTime = () => (wizardType === 'conference' ? confEndTime : webEndTime);
  const setWizardEndTime = (v: string) => (wizardType === 'conference' ? setConfEndTime(v) : setWebEndTime(v));

  const addFeeRow = () => setWizardFees([...wizardFees(), { label: '', amount: 0 }]);
  const updateFeeRow = (index: number, field: 'label' | 'amount', value: string) => {
    const next = [...wizardFees()];
    if (field === 'label') next[index].label = value;
    else next[index].amount = Number(value) || 0;
    setWizardFees(next);
  };
  const removeFeeRow = (index: number) => setWizardFees(wizardFees().filter((_, i) => i !== index));

  const addFaq = () => setWizardFaqs([...wizardFaqs(), { question: '', answer: '', category: '', order: 0 }]);
  const updateFaq = (index: number, field: keyof FAQ, value: string | number) => {
    const next = [...wizardFaqs()];
    next[index] = { ...next[index], [field]: value };
    setWizardFaqs(next);
  };
  const removeFaq = (index: number) => setWizardFaqs(wizardFaqs().filter((_, i) => i !== index));

  const addSponsor = () => setWizardSponsors([...wizardSponsors(), { name: '', logo: '', website: '', description: '', tier: 'supporter', order: 0 }]);
  const updateSponsor = (index: number, field: keyof EventSponsor, value: string) => {
    const next = [...wizardSponsors()];
    next[index] = { ...next[index], [field]: value };
    setWizardSponsors(next);
  };
  const removeSponsor = (index: number) => setWizardSponsors(wizardSponsors().filter((_, i) => i !== index));

  const addExhibitor = () => setWizardExhibitors([...wizardExhibitors(), { name: '', logo: '', website: '', description: '', boothNumber: '', contactEmail: '', order: 0 }]);
  const updateExhibitor = (index: number, field: keyof EventExhibitor, value: string) => {
    const next = [...wizardExhibitors()];
    next[index] = { ...next[index], [field]: value };
    setWizardExhibitors(next);
  };
  const removeExhibitor = (index: number) => setWizardExhibitors(wizardExhibitors().filter((_, i) => i !== index));

  const addTrack = () =>
    setWizardTracks([...wizardTracks(), { title: '', description: '', image: '', imagePreview: '', referenceLinks: [] }]);
  const updateTrack = (index: number, field: 'title' | 'description', value: string) => {
    const next = [...wizardTracks()];
    next[index][field] = value;
    setWizardTracks(next);
  };
  const removeTrack = (index: number) => setWizardTracks(wizardTracks().filter((_, i) => i !== index));

  const addReferenceLink = (trackIndex: number) => {
    const next = [...wizardTracks()];
    next[trackIndex].referenceLinks = [...next[trackIndex].referenceLinks, { label: '', url: '' }];
    setWizardTracks(next);
  };
  const updateReferenceLink = (trackIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => {
    const next = [...wizardTracks()];
    next[trackIndex].referenceLinks[linkIndex][field] = value;
    setWizardTracks(next);
  };
  const removeReferenceLink = (trackIndex: number, linkIndex: number) => {
    const next = [...wizardTracks()];
    next[trackIndex].referenceLinks = next[trackIndex].referenceLinks.filter((_, i) => i !== linkIndex);
    setWizardTracks(next);
  };

  const handleTrackImageUpload = async (trackIndex: number, file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...wizardTracks()];
      next[trackIndex].imagePreview = String(reader.result || '');
      setWizardTracks(next);
    };
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const next = [...wizardTracks()];
      next[trackIndex].image = data.url;
      setWizardTracks(next);
    } catch (err) {
      console.error('Track image upload error:', err);
      alert('Failed to upload track image');
    }
  };

  const handleSponsorLogoUpload = async (index: number, file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...wizardSponsors()];
      next[index].logoPreview = String(reader.result || '');
      setWizardSponsors(next);
    };
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const next = [...wizardSponsors()];
      next[index].logo = data.url;
      setWizardSponsors(next);
    } catch (err) {
      console.error('Sponsor logo upload error:', err);
      alert('Failed to upload sponsor logo');
    }
  };

  const handleExhibitorLogoUpload = async (index: number, file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...wizardExhibitors()];
      next[index].logoPreview = String(reader.result || '');
      setWizardExhibitors(next);
    };
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const next = [...wizardExhibitors()];
      next[index].logo = data.url;
      setWizardExhibitors(next);
    } catch (err) {
      console.error('Exhibitor logo upload error:', err);
      alert('Failed to upload exhibitor logo');
    }
  };

  const handleMediaUpload = async (kind: 'brochure' | 'banner' | 'logo', file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = String(reader.result || '');
      setWizardMedia((cur: MediaAssetState) => ({ ...cur, [`${kind}Preview`]: preview }));
    };
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setWizardMedia((cur: MediaAssetState) => ({ ...cur, [`${kind}Url`]: data.url }));
    } catch (err) {
      console.error('Media upload error:', err);
      alert('Failed to upload file');
    }
  };

  const clearMedia = (kind: 'brochure' | 'banner' | 'logo') => {
    setWizardMedia((cur: MediaAssetState) => ({ ...cur, [`${kind}Url`]: '', [`${kind}Preview`]: '' }));
  };

  const handleBlogBannerUpload = async (file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => setBlogBannerPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setBlogBannerUrl(data.url);
    } catch (err) {
      console.error('Blog banner upload error:', err);
      alert('Failed to upload blog banner');
    }
  };

  const canGoNext = () => {
    if (wizardStep === 1) {
      if (!wizardTitle().trim()) return false;
      if (!wizardSubdomain().trim()) return false;
      if (wizardType === 'webinar' && !webSpeaker.trim()) return false;
      return true;
    }
    return true;
  };

  const canGoToStep = (target: number) => {
    if (target === 1) return true;
    if (!wizardTitle().trim()) return false;
    if (!wizardSubdomain().trim()) return false;
    if (wizardType === 'webinar' && !webSpeaker.trim()) return false;
    return true;
  };

  const submitWizard = async () => {
    if (!user || !wizardType) return;
    setWizardSaving(true);
    setWizardError('');
    try {
      let url = `${API_BASE}/${wizardType === 'conference' ? 'conferences' : 'webinars'}`;
      let method = 'POST';
      if (wizardEditId) {
        url += `/${wizardEditId}`;
        method = 'PUT';
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-role': user.role,
        'x-user-name': user.username,
      };

      const { day, month } = computeDayAndMonth(wizardStartDate(), wizardEndDate());
      const location = wizardIsOnline()
        ? `Online · ${wizardOnlineLink() || 'TBD'}`
        : wizardVenue() || 'TBD';

      const bodyData: any = {
        title: wizardTitle(),
        description: wizardDesc(),
        day,
        month,
        location,
        venue: wizardIsOnline() ? '' : (wizardVenue() || ''),
        eventDate: wizardStartDate(),
        startDate: wizardStartDate(),
        endDate: wizardEndDate() || wizardStartDate(),
        subdomain: wizardSubdomain() || undefined,
        startTime: wizardStartTime(),
        endTime: wizardEndTime(),
        brochureUrl: wizardMedia().brochureUrl,
        bannerUrl: wizardMedia().bannerUrl,
        logoUrl: wizardMedia().logoUrl,
        fees: wizardFees().filter((f) => f.label.trim() && f.amount > 0),
        tracks: wizardTracks().filter((t) => t.title.trim()).map((t) => ({
          title: t.title,
          description: t.description,
          image: t.image,
          referenceLinks: t.referenceLinks.filter((l) => l.url.trim()),
        })),
        organizerContact: wizardOrg(),
        faqs: wizardFaqs().filter((f) => f.question.trim()),
        sponsors: wizardSponsors().filter((s) => s.name.trim()).map(({ logoPreview, ...rest }) => rest),
        exhibitors: wizardExhibitors().filter((e) => e.name.trim()).map(({ logoPreview, ...rest }) => rest),
        guidelines: wizardGuidelines(),
        termsAndConditions: wizardTerms(),
      };
      if (wizardType === 'webinar') bodyData.speaker = webSpeaker;

      const res = await fetch(url, { method, headers, body: JSON.stringify(bodyData) });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save event');
      }
      closeWizard();
      refreshData();
      goToTab(wizardType === 'conference' ? 'conferences' : 'webinars');
    } catch (err: any) {
      console.error('Save wizard error:', err);
      setWizardError(err.message || 'Failed to save event');
    } finally {
      setWizardSaving(false);
    }
  };

  const handleSaveItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let url = '';
    let method = 'POST';
    let bodyData: any = {};

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': user.role,
      'x-user-name': user.username,
    };

    if (editingItemType === 'blog') {
      url = `${API_BASE}/blogs`;
      if (editingItemId) {
        url += `/${editingItemId}`;
        method = 'PUT';
      }
      bodyData = {
        title: blogTitle,
        label: blogLabel,
        copy: blogCopy,
        content: blogContent,
        bannerUrl: blogBannerUrl,
      };
    }

    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(bodyData) });
      if (res.ok) {
        setShowForm(false);
        refreshData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save item');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving item');
    }
  };

  const handleDeleteItem = async (id: string, type: DeleteType) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this item?')) return;

    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };

    try {
      const res = await fetch(`${API_BASE}/${type}/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        refreshData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting item');
    }
  };

  const openPartnerForm = (item: MediaPartner | null) => {
    setPartnerForm(
      item
        ? { open: true, editingId: item._id, name: item.name, logo: item.logo || '', logoPreview: mediaUrl(item.logo || ''), description: item.description || '' }
        : { open: true, editingId: null, name: '', logo: '', logoPreview: '', description: '' },
    );
  };

  const savePartner = async () => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    const url = partnerForm.editingId ? `${API_BASE}/media-partners/${partnerForm.editingId}` : `${API_BASE}/media-partners`;
    const method = partnerForm.editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify({ name: partnerForm.name, logo: partnerForm.logo, description: partnerForm.description }) });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
      setPartnerForm(EMPTY_PARTNER_FORM);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save media partner');
    }
  };

  const deletePartner = async (id: string) => {
    if (!user || !confirm('Delete this media partner?')) return;
    await fetch(`${API_BASE}/media-partners/${id}`, { method: 'DELETE', headers: { 'x-user-role': user.role, 'x-user-name': user.username } });
    refreshData();
  };

  const openCollaboratorForm = (item: Collaborator | null) => {
    setCollaboratorForm(
      item
        ? { open: true, editingId: item._id, name: item.name, logo: item.logo || '', logoPreview: mediaUrl(item.logo || ''), description: item.description || '' }
        : { open: true, editingId: null, name: '', logo: '', logoPreview: '', description: '' },
    );
  };

  const saveCollaborator = async () => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    const url = collaboratorForm.editingId ? `${API_BASE}/collaborators/${collaboratorForm.editingId}` : `${API_BASE}/collaborators`;
    const method = collaboratorForm.editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify({ name: collaboratorForm.name, logo: collaboratorForm.logo, description: collaboratorForm.description }) });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
      setCollaboratorForm(EMPTY_PARTNER_FORM);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save collaborator');
    }
  };

  const deleteCollaborator = async (id: string) => {
    if (!user || !confirm('Delete this collaborator?')) return;
    await fetch(`${API_BASE}/collaborators/${id}`, { method: 'DELETE', headers: { 'x-user-role': user.role, 'x-user-name': user.username } });
    refreshData();
  };

  const openExhibitorForm = (item: Exhibitor | null) => {
    setExhibitorForm(
      item
        ? { open: true, editingId: item._id, name: item.name, logo: item.logo || '', logoPreview: mediaUrl(item.logo || ''), description: item.description || '' }
        : { open: true, editingId: null, name: '', logo: '', logoPreview: '', description: '' },
    );
  };

  const saveExhibitor = async () => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    const url = exhibitorForm.editingId ? `${API_BASE}/exhibitors/${exhibitorForm.editingId}` : `${API_BASE}/exhibitors`;
    const method = exhibitorForm.editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify({ name: exhibitorForm.name, logo: exhibitorForm.logo, description: exhibitorForm.description }) });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
      setExhibitorForm(EMPTY_PARTNER_FORM);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save exhibitor');
    }
  };

  const deleteExhibitor = async (id: string) => {
    if (!user || !confirm('Delete this exhibitor?')) return;
    await fetch(`${API_BASE}/exhibitors/${id}`, { method: 'DELETE', headers: { 'x-user-role': user.role, 'x-user-name': user.username } });
    refreshData();
  };

  const openVenueForm = (item: Venue | null) => {
    setVenueForm(
      item
        ? { open: true, editingId: item._id, name: item.name, address: item.address || '', locationUrl: item.locationUrl || '' }
        : { open: true, editingId: null, name: '', address: '', locationUrl: '' },
    );
  };

  const saveVenue = async () => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    const url = venueForm.editingId ? `${API_BASE}/venues/${venueForm.editingId}` : `${API_BASE}/venues`;
    const method = venueForm.editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify({ name: venueForm.name, address: venueForm.address, locationUrl: venueForm.locationUrl }) });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
      setVenueForm(EMPTY_VENUE_FORM);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save venue');
    }
  };

  const deleteVenue = async (id: string) => {
    if (!user || !confirm('Delete this venue?')) return;
    await fetch(`${API_BASE}/venues/${id}`, { method: 'DELETE', headers: { 'x-user-role': user.role, 'x-user-name': user.username } });
    refreshData();
  };

  const handleLogoUpload = (kind: LogoKind, file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = String(reader.result || '');
      if (kind === 'partner') setPartnerForm((cur) => ({ ...cur, logoPreview: preview }));
      else if (kind === 'collaborator') setCollaboratorForm((cur) => ({ ...cur, logoPreview: preview }));
      else setExhibitorForm((cur) => ({ ...cur, logoPreview: preview }));
    };
    reader.readAsDataURL(file);
    (async () => {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API_BASE}/uploads/upload`, { method: 'POST', headers: { 'x-user-role': user.role, 'x-user-name': user.username }, body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        if (kind === 'partner') setPartnerForm((cur) => ({ ...cur, logo: data.url }));
        else if (kind === 'collaborator') setCollaboratorForm((cur) => ({ ...cur, logo: data.url }));
        else setExhibitorForm((cur) => ({ ...cur, logo: data.url }));
      } catch (err) {
        console.error('Logo upload error:', err);
        alert('Failed to upload logo');
      }
    })();
  };

  const saveProfile = async () => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    try {
      const res = await fetch(`${API_BASE}/mentors/me`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          fullName: profileForm.fullName,
          title: profileForm.title,
          bio: profileForm.bio,
          avatar: profileForm.avatar,
          email: profileForm.email,
          phone: profileForm.phone,
          location: profileForm.location,
          linkedin: profileForm.linkedin,
          website: profileForm.website,
          expertise: profileForm.expertise,
          education: profileForm.education,
          experiences: profileForm.experiences,
          certifications: profileForm.certifications,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save profile');
      alert('Profile saved successfully');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save profile');
    }
  };

  const handleProfileAvatarUpload = async (file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => setProfileForm((cur) => ({ ...cur, avatarPreview: String(reader.result || '') }));
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/upload`, { method: 'POST', headers: { 'x-user-role': user.role, 'x-user-name': user.username }, body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setProfileForm((cur) => ({ ...cur, avatar: data.url }));
    } catch (err) {
      alert('Failed to upload avatar');
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to change password');
      alert('Password changed successfully');
      
      const updated = { ...user, isTempPassword: false };
      setUser(updated);
      localStorage.setItem('stream-admin-user', JSON.stringify(updated));
    } catch (err: any) {
      alert(err.message || 'Failed to change password');
      throw err;
    }
  };

  const closeForm = () => setShowForm(false);

  const openAssignMentor = (item: Conference | Webinar) => {
    setAssignTarget(item);
    setAssignUsername(item.assignedMentor || '');
    setAssignOpen(true);
  };

  const closeAssignMentor = () => {
    setAssignOpen(false);
    setAssignTarget(null);
    setAssignUsername('');
  };

  const submitAssignMentor = async () => {
    if (!user || !assignTarget) return;
    const endpoint = (assignTarget as Webinar).speaker ? 'webinars' : 'conferences';
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${assignTarget._id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify({ assignedMentor: assignUsername || null }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to assign mentor');
      }
      closeAssignMentor();
      refreshData();
    } catch (err: any) {
      console.error('Assign mentor error:', err);
      alert(err.message || 'Failed to assign mentor');
    }
  };

  const value: AppStoreValue = {
    user,
    loginLoading,
    loginError,
    usernameInput,
    passwordInput,
    setUsernameInput,
    setPasswordInput,
    handleLogin,
    handleLogout,
    activeTab,
    goToTab,
    isEventPage,
    eventPageType,
    eventPageId,
    eventPageTab,
    eventPage,
    openEventPage,
    closeEventPage,
    updateEventField,
    loadingData,
    conferences,
    webinars,
    blogs,
    registrations,
    abstracts,
    contacts,
    orders,
    mediaPartners,
    collaborators,
    exhibitors,
    venues,
    profile,
    mentors,
    refreshData,
    loadTabData,
    showForm,
    editingItemType,
    editingItemId,
    openAddForm,
    openEditForm,
    closeForm,
    handleSaveItem,
    handleDeleteItem,
    activeDropdownId,
    setActiveDropdownId,
    wizardOpen,
    wizardType,
    wizardStep,
    wizardEditId,
    wizardSaving,
    wizardError,
    setWizardStep,
    closeWizard,
    canGoNext,
    canGoToStep,
    submitWizard,
    confTitle,
    setConfTitle,
    confDesc,
    setConfDesc,
    confLocation,
    setConfLocation,
    confStartDate,
    setConfStartDate,
    confEndDate,
    setConfEndDate,
    confIsOnline,
    setConfIsOnline,
    confVenue,
    setConfVenue,
    confSubdomain,
    setConfSubdomain,
    confOnlineLink,
    setConfOnlineLink,
    confStartTime,
    setConfStartTime,
    confEndTime,
    setConfEndTime,
    confFees,
    setConfFees,
    confOrg,
    setConfOrg,
    confMedia,
    setConfMedia,
    confTracks,
    setConfTracks,
    webTitle,
    setWebTitle,
    webDesc,
    setWebDesc,
    webLocation,
    setWebLocation,
    webSpeaker,
    setWebSpeaker,
    webStartDate,
    setWebStartDate,
    webEndDate,
    setWebEndDate,
    webIsOnline,
    setWebIsOnline,
    webVenue,
    setWebVenue,
    webSubdomain,
    setWebSubdomain,
    webOnlineLink,
    setWebOnlineLink,
    webStartTime,
    setWebStartTime,
    webEndTime,
    setWebEndTime,
    webFees,
    setWebFees,
    webOrg,
    setWebOrg,
    webMedia,
    setWebMedia,
    webTracks,
    setWebTracks,
    wizardTitle,
    setWizardTitle,
    wizardDesc,
    setWizardDesc,
    wizardStartDate,
    setWizardStartDate,
    wizardEndDate,
    setWizardEndDate,
    wizardIsOnline,
    setWizardIsOnline,
    wizardVenue,
    setWizardVenue,
    wizardSubdomain,
    setWizardSubdomain,
    wizardOnlineLink,
    setWizardOnlineLink,
    wizardStartTime,
    setWizardStartTime,
    wizardEndTime,
    setWizardEndTime,
    wizardFees,
    setWizardFees,
    wizardOrg,
    setWizardOrg,
    wizardMedia,
    setWizardMedia,
    wizardTracks,
    setWizardTracks,
    wizardFaqs,
    setWizardFaqs,
    wizardSponsors,
    setWizardSponsors,
    wizardExhibitors,
    setWizardExhibitors,
    wizardGuidelines,
    setWizardGuidelines,
    wizardTerms,
    setWizardTerms,
    addFeeRow,
    updateFeeRow,
    removeFeeRow,
    addTrack,
    updateTrack,
    removeTrack,
    addReferenceLink,
    updateReferenceLink,
    removeReferenceLink,
    addFaq,
    updateFaq,
    removeFaq,
    addSponsor,
    updateSponsor,
    removeSponsor,
    addExhibitor,
    updateExhibitor,
    removeExhibitor,
    handleTrackImageUpload,
    handleSponsorLogoUpload,
    handleExhibitorLogoUpload,
    handleMediaUpload,
    clearMedia,
    blogTitle,
    setBlogTitle,
    blogLabel,
    setBlogLabel,
    blogCopy,
    setBlogCopy,
    blogContent,
    setBlogContent,
    blogBannerUrl,
    setBlogBannerUrl,
    blogBannerPreview,
    setBlogBannerPreview,
    handleBlogBannerUpload,
    partnerForm,
    setPartnerForm,
    collaboratorForm,
    setCollaboratorForm,
    exhibitorForm,
    setExhibitorForm,
    venueForm,
    setVenueForm,
    openPartnerForm,
    savePartner,
    deletePartner,
    openCollaboratorForm,
    saveCollaborator,
    deleteCollaborator,
    openExhibitorForm,
    saveExhibitor,
    deleteExhibitor,
    openVenueForm,
    saveVenue,
    deleteVenue,
    handleLogoUpload,
    profileForm,
    setProfileForm,
    saveProfile,
    handleProfileAvatarUpload,
    changePassword,
    eventDetail,
    eventDetailLoading,
    eventDetailError,
    eventAbstracts,
    eventEnquiries,
    eventAbstractsLoading,
    eventEnquiriesLoading,
    abstractActionLoading,
    handleAbstractAction,
    viewingParticipant,
    setViewingParticipant,
    assignOpen,
    assignTarget,
    assignUsername,
    openAssignMentor,
    closeAssignMentor,
    setAssignUsername,
    submitAssignMentor,
    chatSessions,
    activeChatId,
    activeChatMessages,
    chatLoading,
    setActiveChatId: selectChat,
    sendChatReply,
    markChatRead,
    setChatStatus,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

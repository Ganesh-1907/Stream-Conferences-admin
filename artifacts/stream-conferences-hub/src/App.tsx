import { useEffect, useState } from 'react';
import { 
  ArrowRight, CalendarDays, Moon, Sun, Users, LogOut, Plus, Trash2, Edit, Check, 
  Layers, FileText, LayoutDashboard, Send, Play, Eye, MoreVertical, UploadCloud,
  Maximize2, X
} from 'lucide-react';
import { Route, Switch, Link, useLocation } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const API_BASE = 'http://localhost:7867/api';
const SERVER_ORIGIN = API_BASE.replace(/\/api$/, '');

const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

const dateToString = (date: Date | undefined): string => {
  if (!date) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const stringToDate = (str: string): Date | undefined => {
  if (!str) return undefined;
  const parts = str.split('-');
  if (parts.length !== 3) return undefined;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? undefined : d;
};

const formatDisplayDate = (str: string): string => {
  if (!str) return 'mm/dd/yyyy';
  const parts = str.split('-');
  if (parts.length !== 3) return 'mm/dd/yyyy';
  return `${parts[1]}/${parts[2]}/${parts[0]}`; // MM/DD/YYYY
};

const registerLinkFor = (item: Conference | Webinar): string =>
  item.registrationLink || `${window.location.origin}/register?event=${item.eventId || item.slug || item._id}`;

function FileUploadCard({ title, accept, preview, onSelect, onClear }: { title: string; accept?: string; preview: string; onSelect: (f: File | null) => void; onClear: () => void }) {
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

type Role = 'admin' | 'mentor';
interface User {
  id: string;
  username: string;
  role: Role;
}

interface Conference {
  _id: string;
  eventId?: string;
  title: string;
  slug?: string;
  description: string;
  day: string;
  month: string;
  location: string;
  eventDate: string;
  date: 'upcoming' | 'past';
  announcedBy: string;
  registrationLink?: string;
}

interface Webinar {
  _id: string;
  eventId?: string;
  title: string;
  slug?: string;
  description: string;
  day: string;
  month: string;
  location: string;
  eventDate: string;
  date: 'upcoming' | 'past';
  speaker: string;
  announcedBy: string;
  registrationLink?: string;
}

interface Blog {
  _id: string;
  title: string;
  label: string;
  copy: string;
  content: string;
  bannerUrl?: string;
  announcedBy: string;
  createdAt: string;
}

interface Registration {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  institution: string;
  country: string;
  category: string;
  presentingAbstract: string;
  paymentStatus?: 'unpaid' | 'paid' | 'pending';
  eventId?: string;
  eventType?: string;
  eventTitle?: string;
  createdAt: string;
}

interface Abstract {
  _id: string;
  name: string;
  email: string;
  track: string;
  summary: string;
  createdAt: string;
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  conference?: string;
  message: string;
  createdAt: string;
}

interface Order {
  _id: string;
  orderId: string;
  paymentId?: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  mode: string;
  createdAt: string;
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 
    localStorage.getItem('stream-theme') === 'dark' ? 'dark' : 'light'
  );
  useEffect(() => { 
    document.documentElement.classList.toggle('dark', theme === 'dark'); 
    localStorage.setItem('stream-theme', theme); 
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => t === 'dark' ? 'light' : 'dark') };
}

export default function App() {
  const { theme, toggle } = useTheme();
  const [location, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('stream-admin-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active view
  const [activeTab, setActiveTab] = useState<'overview' | 'conferences' | 'webinars' | 'blogs' | 'registrations' | 'abstracts' | 'contacts' | 'orders'>('overview');

  // Data lists
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [abstracts, setAbstracts] = useState<Abstract[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modal / Form state
  const [showForm, setShowForm] = useState(false);
  const [editingItemType, setEditingItemType] = useState<'conference' | 'webinar' | 'blog' | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Actions dropdown state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Per-event dashboard data (participants / payments / stats)
  const [eventDetail, setEventDetail] = useState<null | {
    eventId: string;
    stats: { totalParticipants: number; totalPayments: number; paidCount: number; pendingCount: number; failedCount: number; revenue: string };
    participants: Registration[];
    payments: Order[];
  }>(null);
  const [eventDetailLoading, setEventDetailLoading] = useState(false);
  const [eventDetailError, setEventDetailError] = useState('');

  // Dedicated per-event page — driven by URL routes:
  //   /conference/:id/dashboard | /conference/:id/participants | /conference/:id/payments
  //   /webinar/:id/dashboard     | /webinar/:id/participants     | /webinar/:id/payments
  const eventPageTab = (['dashboard', 'details', 'participants', 'payments', 'abstracts', 'enquiries'] as const).find((t) => location.includes(`/${t}`)) || 'dashboard';
  const eventPageType = location.startsWith('/conference/') ? 'conference' : location.startsWith('/webinar/') ? 'webinar' : null;
  const eventPageId = eventPageType ? (location.split('/')[2] || null) : null;
  const isEventPage = Boolean(eventPageType && eventPageId);

  const openEventPage = (item: Conference | Webinar, type: 'conference' | 'webinar', tab: 'dashboard' | 'details' | 'participants' | 'payments' = 'dashboard') => {
    navigate(`/${type}/${item._id}/${tab}`);
  };

  const closeEventPage = () => {
    navigate('/');
  };

  const goToTab = (tab: 'overview' | 'conferences' | 'webinars' | 'blogs' | 'registrations' | 'abstracts' | 'contacts' | 'orders') => {
    if (tab !== activeTab) {
      closeWizard();
    }
    setActiveTab(tab);
    navigate('/');
  };

  const openEventDetails = async (item: Conference | Webinar, type: 'conference' | 'webinar') => {
    setEventDetail(null);
    setEventDetailError('');
    setEventDetailLoading(true);
    try {
      const headers: Record<string, string> = user ? {
        'x-user-role': user.role,
        'x-user-name': user.username,
      } : {};
      const endpoint = type === 'conference' ? 'conferences' : 'webinars';
      const res = await fetch(`${API_BASE}/${endpoint}/${item._id}/participants`, { headers });
      if (!res.ok) throw new Error('Failed to load event details');
      setEventDetail(await res.json());
    } catch (err: any) {
      console.error('Load event details error:', err);
      setEventDetailError(err.message || 'Failed to load event details');
    } finally {
      setEventDetailLoading(false);
    }
  };

  // Form Fields
  const [confTitle, setConfTitle] = useState('');
  const [confDesc, setConfDesc] = useState('');
  const [confDay, setConfDay] = useState('');
  const [confMonth, setConfMonth] = useState('');
  const [confLocation, setConfLocation] = useState('');
  const [confEventDate, setConfEventDate] = useState('');
  const [confStartDate, setConfStartDate] = useState('');
  const [confEndDate, setConfEndDate] = useState('');
  const [confIsOnline, setConfIsOnline] = useState(false);
  const [confVenue, setConfVenue] = useState('');
  const [confOnlineLink, setConfOnlineLink] = useState('');

  const [webTitle, setWebTitle] = useState('');
  const [webDesc, setWebDesc] = useState('');
  const [webDay, setWebDay] = useState('');
  const [webMonth, setWebMonth] = useState('');
  const [webLocation, setWebLocation] = useState('');
  const [webEventDate, setWebEventDate] = useState('');
  const [webSpeaker, setWebSpeaker] = useState('');
  const [webStartDate, setWebStartDate] = useState('');
  const [webEndDate, setWebEndDate] = useState('');
  const [webIsOnline, setWebIsOnline] = useState(false);
  const [webVenue, setWebVenue] = useState('');
  const [webOnlineLink, setWebOnlineLink] = useState('');

  const [blogTitle, setBlogTitle] = useState('');
  const [blogLabel, setBlogLabel] = useState('');
  const [blogCopy, setBlogCopy] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogBannerUrl, setBlogBannerUrl] = useState('');
  const [blogBannerPreview, setBlogBannerPreview] = useState('');

  // ---- Add/Edit wizard state (conferences & webinars) ----
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<'conference' | 'webinar' | null>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardEditId, setWizardEditId] = useState<string | null>(null);
  const [wizardSaving, setWizardSaving] = useState(false);
  const [wizardError, setWizardError] = useState('');

  // Time + media + fees + contact for conferences
  const [confStartTime, setConfStartTime] = useState('');
  const [confEndTime, setConfEndTime] = useState('');
  const [confFees, setConfFees] = useState<{ label: string; amount: number }[]>([]);
  const [confOrg, setConfOrg] = useState<{ name: string; email: string; phone: string }>({ name: '', email: '', phone: '' });
  const [confMedia, setConfMedia] = useState<{ brochureUrl: string; bannerUrl: string; logoUrl: string; brochurePreview: string; bannerPreview: string; logoPreview: string }>({ brochureUrl: '', bannerUrl: '', logoUrl: '', brochurePreview: '', bannerPreview: '', logoPreview: '' });

  // Time + media + fees + contact for webinars
  const [webStartTime, setWebStartTime] = useState('');
  const [webEndTime, setWebEndTime] = useState('');
  const [webFees, setWebFees] = useState<{ label: string; amount: number }[]>([]);
  const [webOrg, setWebOrg] = useState<{ name: string; email: string; phone: string }>({ name: '', email: '', phone: '' });
  const [webMedia, setWebMedia] = useState<{ brochureUrl: string; bannerUrl: string; logoUrl: string; brochurePreview: string; bannerPreview: string; logoPreview: string }>({ brochureUrl: '', bannerUrl: '', logoUrl: '', brochurePreview: '', bannerPreview: '', logoPreview: '' });

  // Per-event participant details viewer
  const [viewingParticipant, setViewingParticipant] = useState<Registration | null>(null);

  // Per-event abstracts & enquiries
  const [eventAbstracts, setEventAbstracts] = useState<Abstract[]>([]);
  const [eventEnquiries, setEventEnquiries] = useState<Contact[]>([]);
  const [eventAbstractsLoading, setEventAbstractsLoading] = useState(false);
  const [eventEnquiriesLoading, setEventEnquiriesLoading] = useState(false);

  // Helper parsing & formatting functions
  const parseStartAndEndDates = (eventDateStr: string, dayRangeStr: string) => {
    if (!eventDateStr) return { start: '', end: '' };
    const baseDate = new Date(eventDateStr);
    if (isNaN(baseDate.getTime())) return { start: '', end: '' };
    
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    
    let startDay = baseDate.getDate();
    let endDay = startDay;
    
    if (dayRangeStr) {
      const parts = dayRangeStr.split(/[-–—]/).map(p => p.trim());
      if (parts.length > 0 && !isNaN(parseInt(parts[0], 10))) {
        startDay = parseInt(parts[0], 10);
      }
      if (parts.length > 1 && !isNaN(parseInt(parts[1], 10))) {
        endDay = parseInt(parts[1], 10);
      } else {
        endDay = startDay;
      }
    }
    
    const formatLocalISO = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
    
    return {
      start: formatLocalISO(new Date(year, month, startDay)),
      end: formatLocalISO(new Date(year, month, endDay))
    };
  };

  const computeDayAndMonth = (startDateStr: string, endDateStr: string) => {
    const monthsAbbrev = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    if (!startDateStr) return { day: '', month: '' };
    
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return { day: '', month: '' };
    
    const monthName = monthsAbbrev[start.getMonth()];
    const yearSuffix = String(start.getFullYear()).slice(-2);
    const monthVal = `${monthName} ${yearSuffix}`;
    
    let dayVal = String(start.getDate());
    if (endDateStr && endDateStr !== startDateStr) {
      const end = new Date(endDateStr);
      if (!isNaN(end.getTime())) {
        dayVal = `${start.getDate()}–${end.getDate()}`;
      }
    }
    
    return { day: dayVal, month: monthVal };
  };

  // Fetch all database lists
  const refreshData = async () => {
    if (!user) return;
    setLoadingData(true);
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };

    try {
      // Fetch conferences
      const confRes = await fetch(`${API_BASE}/conferences`, { headers });
      if (confRes.ok) setConferences(await confRes.json());

      // Fetch webinars
      const webRes = await fetch(`${API_BASE}/webinars`, { headers });
      if (webRes.ok) setWebinars(await webRes.json());

      // Fetch blogs
      const blogRes = await fetch(`${API_BASE}/blogs`, { headers });
      if (blogRes.ok) setBlogs(await blogRes.json());

      // Admin only loads registrations and abstracts
      if (user.role === 'admin') {
        const regRes = await fetch(`${API_BASE}/registrations`, { headers });
        if (regRes.ok) setRegistrations(await regRes.json());

        const absRes = await fetch(`${API_BASE}/abstracts`, { headers });
        if (absRes.ok) setAbstracts(await absRes.json());

        const conRes = await fetch(`${API_BASE}/contacts`, { headers });
        if (conRes.ok) setContacts(await conRes.json());

        const ordRes = await fetch(`${API_BASE}/orders`, { headers });
        if (ordRes.ok) setOrders(await ordRes.json());
      }
    } catch (e) {
      console.error('Failed to load data from backend API server', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  // Resolve the current event page item from the URL route
  const eventPage: Conference | Webinar | null = isEventPage
    ? eventPageType === 'conference'
      ? conferences.find(c => c._id === eventPageId) || null
      : webinars.find(w => w._id === eventPageId) || null
    : null;

  // Load per-event data when the URL event id changes
  useEffect(() => {
    if (eventPage && eventPageType) {
      openEventDetails(eventPage, eventPageType);
      loadEventExtras(eventPage, eventPageType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventPageId, eventPageType, user]);

  const loadEventExtras = async (item: Conference | Webinar, type: 'conference' | 'webinar') => {
    if (!user) return;
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    const endpoint = type === 'conference' ? 'conferences' : 'webinars';
    setEventAbstractsLoading(true);
    setEventEnquiriesLoading(true);
    try {
      const absRes = await fetch(`${API_BASE}/${endpoint}/${item._id}/abstracts`, { headers });
      if (absRes.ok) setEventAbstracts(await absRes.json());
      const enqRes = await fetch(`${API_BASE}/${endpoint}/${item._id}/enquiries`, { headers });
      if (enqRes.ok) setEventEnquiries(await enqRes.json());
    } catch (err) {
      console.error('Load event abstracts/enquiries error:', err);
    } finally {
      setEventAbstractsLoading(false);
      setEventEnquiriesLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
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

  const resetWizardFields = () => {
    setConfTitle(''); setConfDesc(''); setConfDay(''); setConfMonth(''); setConfLocation(''); setConfEventDate('');
    setConfStartDate(''); setConfEndDate(''); setConfIsOnline(false); setConfVenue(''); setConfOnlineLink('');
    setConfStartTime(''); setConfEndTime(''); setConfFees([]); setConfOrg({ name: '', email: '', phone: '' });
    setConfMedia({ brochureUrl: '', bannerUrl: '', logoUrl: '', brochurePreview: '', bannerPreview: '', logoPreview: '' });
    setWebTitle(''); setWebDesc(''); setWebDay(''); setWebMonth(''); setWebLocation(''); setWebEventDate(''); setWebSpeaker('');
    setWebStartDate(''); setWebEndDate(''); setWebIsOnline(false); setWebVenue(''); setWebOnlineLink('');
    setWebStartTime(''); setWebEndTime(''); setWebFees([]); setWebOrg({ name: '', email: '', phone: '' });
    setWebMedia({ brochureUrl: '', bannerUrl: '', logoUrl: '', brochurePreview: '', bannerPreview: '', logoPreview: '' });
    setBlogTitle(''); setBlogLabel(''); setBlogCopy(''); setBlogContent('');
    setBlogBannerUrl(''); setBlogBannerPreview('');
  };

  const openAddForm = (type: 'conference' | 'webinar' | 'blog') => {
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

  const openEditForm = (item: any, type: 'conference' | 'webinar' | 'blog') => {
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

    if (type === 'conference') {
      setConfTitle(item.title);
      setConfDesc(item.description || '');
      setConfDay(item.day);
      setConfMonth(item.month);
      setConfLocation(item.location);
      setConfEventDate(item.eventDate ? item.eventDate.slice(0, 10) : '');
      setConfStartTime(item.startTime || '');
      setConfEndTime(item.endTime || '');
      setConfFees(Array.isArray(item.fees) ? item.fees.map((f: any) => ({ label: f.label || '', amount: Number(f.amount) || 0 })) : []);
      setConfOrg({ name: item.organizerContact?.name || '', email: item.organizerContact?.email || '', phone: item.organizerContact?.phone || '' });
      setConfMedia({
        brochureUrl: item.brochureUrl || '', bannerUrl: item.bannerUrl || '', logoUrl: item.logoUrl || '',
        brochurePreview: mediaUrl(item.brochureUrl || ''), bannerPreview: mediaUrl(item.bannerUrl || ''), logoPreview: mediaUrl(item.logoUrl || '')
      });

      const parsedDates = parseStartAndEndDates(item.eventDate, item.day);
      setConfStartDate(parsedDates.start);
      setConfEndDate(parsedDates.end);

      const isOnline = item.location && /online/i.test(item.location);
      setConfIsOnline(!!isOnline);
      if (isOnline) {
        const parts = item.location.split(/[·•|:-]/);
        const link = parts.length > 1 ? parts.slice(1).join('·').trim() : '';
        setConfOnlineLink(link);
        setConfVenue('');
      } else {
        setConfVenue(item.location);
        setConfOnlineLink('');
      }
    } else if (type === 'webinar') {
      setWebTitle(item.title);
      setWebDesc(item.description || '');
      setWebDay(item.day);
      setWebMonth(item.month);
      setWebLocation(item.location);
      setWebEventDate(item.eventDate ? item.eventDate.slice(0, 10) : '');
      setWebSpeaker(item.speaker);
      setWebStartTime(item.startTime || '');
      setWebEndTime(item.endTime || '');
      setWebFees(Array.isArray(item.fees) ? item.fees.map((f: any) => ({ label: f.label || '', amount: Number(f.amount) || 0 })) : []);
      setWebOrg({ name: item.organizerContact?.name || '', email: item.organizerContact?.email || '', phone: item.organizerContact?.phone || '' });
      setWebMedia({
        brochureUrl: item.brochureUrl || '', bannerUrl: item.bannerUrl || '', logoUrl: item.logoUrl || '',
        brochurePreview: mediaUrl(item.brochureUrl || ''), bannerPreview: mediaUrl(item.bannerUrl || ''), logoPreview: mediaUrl(item.logoUrl || '')
      });

      const parsedDates = parseStartAndEndDates(item.eventDate, item.day);
      setWebStartDate(parsedDates.start);
      setWebEndDate(parsedDates.end);

      const isOnline = item.location && /online/i.test(item.location);
      setWebIsOnline(!!isOnline);
      if (isOnline) {
        const parts = item.location.split(/[·•|:-]/);
        const link = parts.length > 1 ? parts.slice(1).join('·').trim() : '';
        setWebOnlineLink(link);
        setWebVenue('');
      } else {
        setWebVenue(item.location);
        setWebOnlineLink('');
      }
    }
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setWizardType(null);
    setWizardStep(1);
    setWizardEditId(null);
    setWizardError('');
  };

  const wizardFees = () => (wizardType === 'conference' ? confFees : webFees);
  const setWizardFees = (fees: { label: string; amount: number }[]) => (wizardType === 'conference' ? setConfFees(fees) : setWebFees(fees));
  const wizardOrg = () => (wizardType === 'conference' ? confOrg : webOrg);
  const setWizardOrg = (org: { name: string; email: string; phone: string }) => (wizardType === 'conference' ? setConfOrg(org) : setWebOrg(org));
  const wizardMedia = () => (wizardType === 'conference' ? confMedia : webMedia);
  const setWizardMedia = (m: any) => (wizardType === 'conference' ? setConfMedia(m) : setWebMedia(m));

  const addFeeRow = () => {
    setWizardFees([...wizardFees(), { label: '', amount: 0 }]);
  };

  const updateFeeRow = (index: number, field: 'label' | 'amount', value: string) => {
    const next = [...wizardFees()];
    if (field === 'label') next[index].label = value;
    else next[index].amount = Number(value) || 0;
    setWizardFees(next);
  };

  const removeFeeRow = (index: number) => {
    setWizardFees(wizardFees().filter((_, i) => i !== index));
  };

  const handleMediaUpload = async (kind: 'brochure' | 'banner' | 'logo', file: File | null) => {
    if (!file || !user) return;
    // Local preview
    const reader = new FileReader();
    reader.onload = () => {
      const preview = String(reader.result || '');
      setWizardMedia((cur: any) => ({ ...cur, [`${kind}Preview`]: preview }));
    };
    reader.readAsDataURL(file);
    // Upload to server
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setWizardMedia((cur: any) => ({ ...cur, [`${kind}Url`]: data.url }));
    } catch (err) {
      console.error('Media upload error:', err);
      alert('Failed to upload file');
    }
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
        body: fd
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setBlogBannerUrl(data.url);
    } catch (err) {
      console.error('Blog banner upload error:', err);
      alert('Failed to upload blog banner');
    }
  };

  const clearMedia = (kind: 'brochure' | 'banner' | 'logo') => {
    setWizardMedia((cur: any) => ({ ...cur, [`${kind}Url`]: '', [`${kind}Preview`]: '' }));
  };

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
  const wizardOnlineLink = () => (wizardType === 'conference' ? confOnlineLink : webOnlineLink);
  const setWizardOnlineLink = (v: string) => (wizardType === 'conference' ? setConfOnlineLink(v) : setWebOnlineLink(v));
  const wizardStartTime = () => (wizardType === 'conference' ? confStartTime : webStartTime);
  const setWizardStartTime = (v: string) => (wizardType === 'conference' ? setConfStartTime(v) : setWebStartTime(v));
  const wizardEndTime = () => (wizardType === 'conference' ? confEndTime : webEndTime);
  const setWizardEndTime = (v: string) => (wizardType === 'conference' ? setConfEndTime(v) : setWebEndTime(v));

  const canGoNext = () => {
    if (wizardStep === 1) {
      if (!wizardTitle().trim()) return false;
      if (wizardType === 'webinar' && !webSpeaker.trim()) return false;
      return true;
    }
    if (wizardStep === 2) {
      if (!wizardStartDate()) return false;
      if (wizardIsOnline() ? !wizardOnlineLink().trim() : !wizardVenue().trim()) return false;
      return true;
    }
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
        : (wizardVenue() || 'TBD');

      const bodyData: any = {
        title: wizardTitle(),
        description: wizardDesc(),
        day,
        month,
        location,
        eventDate: wizardStartDate(),
        startTime: wizardStartTime(),
        endTime: wizardEndTime(),
        brochureUrl: wizardMedia().brochureUrl,
        bannerUrl: wizardMedia().bannerUrl,
        logoUrl: wizardMedia().logoUrl,
        fees: wizardFees().filter(f => f.label.trim() && f.amount > 0),
        organizerContact: wizardOrg()
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

  const handleSaveItem = async (e: React.FormEvent) => {
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

    if (editingItemType === 'conference') {
      url = `${API_BASE}/conferences`;
      if (editingItemId) {
        url += `/${editingItemId}`;
        method = 'PUT';
      }
      const { day, month } = computeDayAndMonth(confStartDate, confEndDate);
      const location = confIsOnline 
        ? `Online · ${confOnlineLink || 'TBD'}` 
        : (confVenue || 'TBD');

      bodyData = {
        title: confTitle,
        description: confDesc,
        day,
        month,
        location,
        eventDate: confStartDate,
        startTime: confStartTime,
        endTime: confEndTime,
        brochureUrl: confMedia.brochureUrl,
        bannerUrl: confMedia.bannerUrl,
        logoUrl: confMedia.logoUrl,
        fees: confFees.filter(f => f.label.trim() && f.amount > 0),
        organizerContact: confOrg
      };
    } else if (editingItemType === 'webinar') {
      url = `${API_BASE}/webinars`;
      if (editingItemId) {
        url += `/${editingItemId}`;
        method = 'PUT';
      }
      const { day, month } = computeDayAndMonth(webStartDate, webEndDate);
      const location = webIsOnline 
        ? `Online · ${webOnlineLink || 'TBD'}` 
        : (webVenue || 'TBD');

      bodyData = {
        title: webTitle,
        description: webDesc,
        day,
        month,
        location,
        eventDate: webStartDate,
        speaker: webSpeaker,
        startTime: webStartTime,
        endTime: webEndTime,
        brochureUrl: webMedia.brochureUrl,
        bannerUrl: webMedia.bannerUrl,
        logoUrl: webMedia.logoUrl,
        fees: webFees.filter(f => f.label.trim() && f.amount > 0),
        organizerContact: webOrg
      };
    } else if (editingItemType === 'blog') {
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
        bannerUrl: blogBannerUrl
      };
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(bodyData)
      });

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

  const handleDeleteItem = async (id: string, type: 'conferences' | 'webinars' | 'blogs') => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this item?')) return;

    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };

    try {
      const res = await fetch(`${API_BASE}/${type}/${id}`, {
        method: 'DELETE',
        headers
      });

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

  if (!user) {
    // LOGIN PANEL UI
    return (
      <div className="site-shell bg-grid flex items-center justify-center min-h-screen px-4">
        <div className="absolute top-4 right-4">
          <button className="icon-button" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        
        <div className="w-full max-w-md bg-card border border-foreground/15 p-8 rounded-2xl shadow-2xl relative overflow-hidden reveal visible">
          <div className="absolute top-0 left-0 w-full h-[6px] bg-accent"></div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="brand-mark object-cover">SC</span>
              <span className="brand-word text-xl font-bold">Admin Console</span>
            </div>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">Stream Conferences Management Portal</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-lg text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Username</label>
              <input 
                required 
                type="text" 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. admin or mentor"
                className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Password</label>
              <input 
                required 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
              />
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full cta-button justify-center py-3 text-sm font-bold tracking-wide mt-2"
            >
              {loginLoading ? 'Verifying with DB...' : 'Sign In'} <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-foreground/10 text-center text-xs text-muted-foreground space-y-1">
            <p>Demo accounts seeded automatically:</p>
            <p><strong className="text-foreground">Admin:</strong> admin / admin123</p>
            <p><strong className="text-foreground">Mentor:</strong> mentor / mentor123</p>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD WORKSPACE UI
  return (
    <div className="site-shell min-h-screen bg-background flex flex-col">
      {/* HEADER NAVBAR */}
      <header className="site-header sticky top-0 z-40 bg-card border-b border-foreground/10">
        <div className="flex items-center justify-between w-full px-6 h-20">
          <div className="flex items-center gap-3">
            <span className="brand-mark">SC</span>
            <div>
              <span className="brand-word text-lg font-bold block">Console</span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">
                An event by Stream Conferences
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-foreground capitalize">{user.username}</span>
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-foreground/10 rounded ml-1">
                {user.role}
              </span>
            </div>
            
            <button className="icon-button" onClick={toggle} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition ml-2"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD WORKSPACE GRID */}
      <div className="flex-1 flex w-full px-6 py-8 gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => goToTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition ${activeTab === 'overview' ? 'bg-primary/10 text-primary font-bold dark:bg-primary/15 dark:text-white' : 'hover:bg-foreground/5 text-muted-foreground'}`}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button 
            onClick={() => goToTab('conferences')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition ${activeTab === 'conferences' ? 'bg-primary/10 text-primary font-bold dark:bg-primary/15 dark:text-white' : 'hover:bg-foreground/5 text-muted-foreground'}`}
          >
            <CalendarDays size={18} />
            <span>Conferences</span>
          </button>

          <button 
            onClick={() => goToTab('webinars')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition ${activeTab === 'webinars' ? 'bg-primary/10 text-primary font-bold dark:bg-primary/15 dark:text-white' : 'hover:bg-foreground/5 text-muted-foreground'}`}
          >
            <Play size={18} />
            <span>Webinars</span>
          </button>

          <button 
            onClick={() => goToTab('blogs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition ${activeTab === 'blogs' ? 'bg-primary/10 text-primary font-bold dark:bg-primary/15 dark:text-white' : 'hover:bg-foreground/5 text-muted-foreground'}`}
          >
            <FileText size={18} />
            <span>Blog Editor</span>
          </button>

          {user.role === 'admin' && (
            <>
              <div className="h-px bg-foreground/10 my-2" />
              
              <button 
                onClick={() => goToTab('registrations')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition ${activeTab === 'registrations' ? 'bg-primary/10 text-primary font-bold dark:bg-primary/15 dark:text-white' : 'hover:bg-foreground/5 text-muted-foreground'}`}
              >
                <Users size={18} />
                <span>Registrations</span>
              </button>

              <button 
                onClick={() => goToTab('abstracts')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition ${activeTab === 'abstracts' ? 'bg-primary/10 text-primary font-bold dark:bg-primary/15 dark:text-white' : 'hover:bg-foreground/5 text-muted-foreground'}`}
              >
                <Layers size={18} />
                <span>Abstracts</span>
              </button>

              <button 
                onClick={() => goToTab('contacts')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition ${activeTab === 'contacts' ? 'bg-primary/10 text-primary font-bold dark:bg-primary/15 dark:text-white' : 'hover:bg-foreground/5 text-muted-foreground'}`}
              >
                <Send size={18} />
                <span>Contact Inquiries</span>
              </button>

              <button 
                onClick={() => goToTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition ${activeTab === 'orders' ? 'bg-primary/10 text-primary font-bold dark:bg-primary/15 dark:text-white' : 'hover:bg-foreground/5 text-muted-foreground'}`}
              >
                <Eye size={18} />
                <span>Orders & Payments</span>
              </button>
            </>
          )}
        </aside>

        {/* MAIN PANEL CONTENT AREA */}
        <main className="flex-1 min-w-0 bg-card border border-foreground/10 rounded-2xl p-8 shadow-sm">

          {/* ADD / EDIT WIZARD PAGE (conferences & webinars) */}
          {wizardOpen && wizardType && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full capitalize">{wizardType}</span>
                    <span className="text-xs text-muted-foreground">{wizardEditId ? 'Editing existing event' : 'New announcement'}</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight capitalize">
                    {wizardEditId ? 'Edit' : 'Add'} {wizardType}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">Complete the steps below and publish when ready.</p>
                </div>
                <button
                  type="button"
                  onClick={closeWizard}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/70 border border-foreground/10 rounded-lg text-xs font-semibold transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Stepper */}
              <div className="flex flex-wrap gap-2">
                {['Event Info', 'Schedule & Venue', 'Fees', 'Contact'].map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => i + 1 < wizardStep && setWizardStep(i + 1)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition duration-150 cursor-pointer ${
                      wizardStep === i + 1
                        ? 'bg-primary text-primary-foreground'
                        : i + 1 < wizardStep
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-muted/40 text-muted-foreground border border-foreground/10'
                    }`}
                  >
                    {i + 1}. {label}
                  </button>
                ))}
              </div>

              {/* STEP 1: EVENT INFO + MEDIA */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title</label>
                    <input
                      required
                      type="text"
                      value={wizardTitle()}
                      onChange={(e) => setWizardTitle(e.target.value)}
                      placeholder={wizardType === 'conference' ? 'e.g. International Conference on Medical Sciences' : 'e.g. Precision systems: turning data into better decisions'}
                      className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
                    />
                  </div>

                  {wizardType === 'webinar' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Speaker</label>
                      <input
                        required
                        type="text"
                        value={webSpeaker}
                        onChange={(e) => setWebSpeaker(e.target.value)}
                        placeholder="e.g. Dr. Amina Rao"
                        className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
                    <textarea
                      value={wizardDesc()}
                      onChange={(e) => setWizardDesc(e.target.value)}
                      placeholder="Short summary/agenda outline..."
                      rows={5}
                      className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200 resize-none"
                    />
                  </div>

                  {/* Media uploads */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Media Assets (Brochure · Banner · Logo)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FileUploadCard title="Brochure" accept=".pdf,image/*" preview={wizardMedia().brochurePreview} onSelect={(f) => handleMediaUpload('brochure', f)} onClear={() => clearMedia('brochure')} />
                      <FileUploadCard title="Banner" preview={wizardMedia().bannerPreview} onSelect={(f) => handleMediaUpload('banner', f)} onClear={() => clearMedia('banner')} />
                      <FileUploadCard title="Logo" preview={wizardMedia().logoPreview} onSelect={(f) => handleMediaUpload('logo', f)} onClear={() => clearMedia('logo')} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SCHEDULE & VENUE */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Location Type</label>
                      <Select
                        value={wizardIsOnline() ? 'online' : 'offline'}
                        onValueChange={(val) => setWizardIsOnline(val === 'online')}
                      >
                        <SelectTrigger className="w-full pl-6 pr-12 py-4 h-auto bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200 text-left flex justify-between items-center cursor-pointer">
                          <SelectValue placeholder="Select Location Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border border-foreground/10 bg-card p-1 text-base shadow-2xl z-[100] min-w-[200px]">
                          <SelectItem value="offline" className="rounded-xl py-3 px-4 text-base font-semibold focus:bg-foreground/5 focus:text-foreground cursor-pointer">Offline (Venue)</SelectItem>
                          <SelectItem value="online" className="rounded-xl py-3 px-4 text-base font-semibold focus:bg-foreground/5 focus:text-foreground cursor-pointer">Online (Web link)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {wizardIsOnline() ? (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Online Link</label>
                        <input
                          required
                          type="text"
                          value={wizardOnlineLink()}
                          onChange={(e) => setWizardOnlineLink(e.target.value)}
                          placeholder="e.g. https://zoom.us/j/123456789"
                          className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Venue Location</label>
                        <input
                          required
                          type="text"
                          value={wizardVenue()}
                          onChange={(e) => setWizardVenue(e.target.value)}
                          placeholder="e.g. Boston, Massachusetts"
                          className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full pl-6 pr-12 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-lg font-semibold text-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200 cursor-pointer text-left flex justify-between items-center"
                          >
                            <span>{wizardStartDate() ? formatDisplayDate(wizardStartDate()) : 'mm/dd/yyyy'}</span>
                            <CalendarDays size={18} className="text-muted-foreground" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="!w-[360px] p-0 rounded-2xl border border-foreground/10 bg-card overflow-hidden shadow-2xl z-[100]" align="start">
                          <Calendar mode="single" selected={stringToDate(wizardStartDate())} onSelect={(date) => setWizardStartDate(date ? dateToString(date) : '')} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full pl-6 pr-12 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-lg font-semibold text-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200 cursor-pointer text-left flex justify-between items-center"
                          >
                            <span>{wizardEndDate() ? formatDisplayDate(wizardEndDate()) : 'mm/dd/yyyy'}</span>
                            <CalendarDays size={18} className="text-muted-foreground" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="!w-[360px] p-0 rounded-2xl border border-foreground/10 bg-card overflow-hidden shadow-2xl z-[100]" align="start">
                          <Calendar mode="single" selected={stringToDate(wizardEndDate())} onSelect={(date) => setWizardEndDate(date ? dateToString(date) : '')} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Start Time</label>
                      <input
                        type="time"
                        value={wizardStartTime()}
                        onChange={(e) => setWizardStartTime(e.target.value)}
                        className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">End Time</label>
                      <input
                        type="time"
                        value={wizardEndTime()}
                        onChange={(e) => setWizardEndTime(e.target.value)}
                        className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: FEES */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">Fee Structure</h3>
                      <p className="text-sm text-muted-foreground">Add registration categories and their amounts.</p>
                    </div>
                    <button type="button" onClick={addFeeRow} className="cta-button">
                      <Plus size={14} /> Add Fee
                    </button>
                  </div>

                  <div className="border border-foreground/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
                          <th className="p-4">Label</th>
                          <th className="p-4">Amount (₹)</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wizardFees().map((fee, index) => (
                          <tr key={index} className="border-b border-foreground/5 last:border-0">
                            <td className="p-3">
                              <input
                                type="text"
                                value={fee.label}
                                onChange={(e) => updateFeeRow(index, 'label', e.target.value)}
                                placeholder="e.g. Student, Regular, Repeater"
                                className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={fee.amount || ''}
                                onChange={(e) => updateFeeRow(index, 'amount', e.target.value)}
                                placeholder="e.g. 200"
                                className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition"
                              />
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => removeFeeRow(index)}
                                className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {wizardFees().length === 0 && (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-muted-foreground">
                              No fees added yet. Click "Add Fee" to create a registration category.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 4: ORGANIZER CONTACT */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">Organizer Contact</h3>
                    <p className="text-sm text-muted-foreground">Who should attendees reach out to for this {wizardType}?</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Contact Name</label>
                      <input
                        type="text"
                        value={wizardOrg().name}
                        onChange={(e) => setWizardOrg({ ...wizardOrg(), name: e.target.value })}
                        placeholder="e.g. Dr. Sarah Chen"
                        className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={wizardOrg().email}
                        onChange={(e) => setWizardOrg({ ...wizardOrg(), email: e.target.value })}
                        placeholder="e.g. organizer@example.com"
                        className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Contact Phone</label>
                      <input
                        type="text"
                        value={wizardOrg().phone}
                        onChange={(e) => setWizardOrg({ ...wizardOrg(), phone: e.target.value })}
                        placeholder="e.g. +1 555 010 0200"
                        className="w-full px-6 py-4 bg-muted/20 border border-foreground/10 rounded-2xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition duration-200"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-muted/20 border border-foreground/10 rounded-xl p-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Review & Publish</h4>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                      <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Title</dt><dd className="font-semibold">{wizardTitle() || '—'}</dd></div>
                      <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Schedule</dt><dd className="font-semibold">{wizardStartDate() ? `${formatDisplayDate(wizardStartDate())}${wizardEndDate() && wizardEndDate() !== wizardStartDate() ? ` – ${formatDisplayDate(wizardEndDate())}` : ''}` : '—'}{wizardStartTime() || wizardEndTime() ? ` · ${wizardStartTime() || '—'} to ${wizardEndTime() || '—'}` : ''}</dd></div>
                      <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Location</dt><dd className="font-semibold">{wizardIsOnline() ? `Online · ${wizardOnlineLink() || 'TBD'}` : (wizardVenue() || '—')}</dd></div>
                      <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Fees</dt><dd className="font-semibold">{wizardFees().filter(f => f.label.trim() && f.amount > 0).map(f => `${f.label} ₹${f.amount}`).join(', ') || 'None'}</dd></div>
                      <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Organizer</dt><dd className="font-semibold">{wizardOrg().name || '—'}{wizardOrg().email ? ` (${wizardOrg().email})` : ''}</dd></div>
                      <div><dt className="text-xs text-muted-foreground uppercase tracking-wider">Assets</dt><dd className="font-semibold">{[wizardMedia().brochureUrl && 'Brochure', wizardMedia().bannerUrl && 'Banner', wizardMedia().logoUrl && 'Logo'].filter(Boolean).join(', ') || 'None'}</dd></div>
                    </dl>
                  </div>

                  {wizardError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-lg text-center font-medium">
                      {wizardError}
                    </div>
                  )}
                </div>
              )}

              {/* Nav buttons */}
              <div className="pt-4 border-t border-foreground/10 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => (wizardStep > 1 ? setWizardStep(wizardStep - 1) : closeWizard())}
                  className="ghost-button"
                >
                  {wizardStep > 1 ? '← Back' : 'Cancel'}
                </button>
                {wizardStep < 4 ? (
                  <button
                    type="button"
                    disabled={!canGoNext()}
                    onClick={() => setWizardStep(wizardStep + 1)}
                    className="cta-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={wizardSaving}
                    onClick={submitWizard}
                    className="cta-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {wizardSaving ? 'Saving...' : wizardEditId ? 'Save Changes' : 'Publish'} <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DEDICATED PER-EVENT PAGE (opened from Actions ▾ → Dashboard/Participants/Payments) */}
          {eventPage && eventPageType && (
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
                    onClick={() => closeEventPage()}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/70 border border-foreground/10 rounded-lg text-xs font-semibold transition duration-150 cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Overview / Details / Participants / Payments / Abstracts / Enquiries */}
              <div className="flex flex-wrap gap-2">
                {(['dashboard', 'details', 'participants', 'payments', 'abstracts', 'enquiries'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => eventPageType && navigate(`/${eventPageType}/${eventPage._id}/${tab}`)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition duration-150 cursor-pointer ${
                      eventPageTab === tab
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/40 hover:bg-muted/70 text-muted-foreground border border-foreground/10'
                    }`}
                  >
                    {tab === 'dashboard' ? 'Overview' : tab === 'details' ? 'Details' : tab === 'participants' ? 'Participants' : tab === 'payments' ? 'Payments' : tab === 'abstracts' ? 'Abstracts' : 'Enquiries'}
                  </button>
                ))}
              </div>

              {/* OVERVIEW TAB */}
              {eventPageTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Stats */}
                  {eventDetailLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading event dashboard...</div>}
                  {eventDetailError && <div className="p-6 text-center text-sm text-red-500">{eventDetailError}</div>}
                  {eventDetail && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-background border border-foreground/10 rounded-xl p-5 text-center">
                        <div className="text-3xl font-bold tracking-tight">{eventDetail.stats.totalParticipants}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Participants</div>
                      </div>
                      <div className="bg-background border border-foreground/10 rounded-xl p-5 text-center">
                        <div className="text-3xl font-bold tracking-tight">{eventDetail.stats.totalPayments}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Payments</div>
                      </div>
                      <div className="bg-background border border-foreground/10 rounded-xl p-5 text-center">
                        <div className="text-3xl font-bold tracking-tight text-green-500">{eventDetail.stats.paidCount}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Paid</div>
                      </div>
                      <div className="bg-background border border-foreground/10 rounded-xl p-5 text-center">
                        <div className="text-3xl font-bold tracking-tight">₹{eventDetail.stats.revenue}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Revenue</div>
                      </div>
                    </div>
                  )}

                  {/* Event info */}
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
              )}

              {/* DETAILS TAB */}
              {eventPageTab === 'details' && (
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

                  {/* Registration link */}
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
              )}

              {/* PARTICIPANTS TAB */}
              {eventPageTab === 'participants' && (
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
                          {eventDetail.participants.map(p => (
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
              )}

              {/* PAYMENTS TAB */}
              {eventPageTab === 'payments' && (
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
                          {eventDetail.payments.map(o => (
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
              )}

              {/* ABSTRACTS TAB */}
              {eventPageTab === 'abstracts' && (
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
                          <th className="p-4">Track</th>
                          <th className="p-4">Summary</th>
                          <th className="p-4">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventAbstracts.map(abs => (
                          <tr key={abs._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                            <td className="p-4 font-semibold">
                              <div>{abs.name}</div>
                              <div className="text-xs text-muted-foreground font-normal">{abs.email}</div>
                            </td>
                            <td className="p-4 text-xs font-bold text-accent uppercase tracking-wider">{abs.track}</td>
                            <td className="p-4 text-xs text-muted-foreground max-w-md whitespace-pre-wrap">{abs.summary}</td>
                            <td className="p-4 text-xs text-muted-foreground">{new Date(abs.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {!eventAbstractsLoading && eventAbstracts.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No abstracts submitted for this {eventPageType} yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ENQUIRIES TAB */}
              {eventPageTab === 'enquiries' && (
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
                        {eventEnquiries.map(c => (
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
              )}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {!eventPage && activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back, {user.username}.</h1>
                <p className="text-sm text-muted-foreground">
                  {user.role === 'admin'
                    ? 'Here is the active summary of all conference activities across the server.'
                    : `Here is the summary of your announced conferences, webinars and blogs.`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-background border border-foreground/10 p-6 rounded-xl relative overflow-hidden">
                  <div className="text-muted-foreground font-bold text-xs uppercase tracking-wider mb-2">Conferences</div>
                  <div className="text-4xl font-bold tracking-tight">{conferences.length}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {user.role === 'admin' ? 'Total announced in DB' : 'Total announced by you'}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500">
                      {conferences.filter(c => c.date === 'upcoming').length} Upcoming
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-foreground/10 text-muted-foreground">
                      {conferences.filter(c => c.date === 'past').length} Completed
                    </span>
                  </div>
                </div>

                <div className="bg-background border border-foreground/10 p-6 rounded-xl relative overflow-hidden">
                  <div className="text-muted-foreground font-bold text-xs uppercase tracking-wider mb-2">Webinars</div>
                  <div className="text-4xl font-bold tracking-tight">{webinars.length}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {user.role === 'admin' ? 'Total scheduled sessions' : 'Total scheduled by you'}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500">
                      {webinars.filter(w => w.date === 'upcoming').length} Upcoming
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-foreground/10 text-muted-foreground">
                      {webinars.filter(w => w.date === 'past').length} Completed
                    </span>
                  </div>
                </div>

                <div className="bg-background border border-foreground/10 p-6 rounded-xl relative overflow-hidden">
                  <div className="text-muted-foreground font-bold text-xs uppercase tracking-wider mb-2">Blog Posts</div>
                  <div className="text-4xl font-bold tracking-tight">{blogs.length}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {user.role === 'admin' ? 'Published notes' : 'Published by you'}
                  </div>
                </div>
              </div>

              {user.role === 'admin' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="bg-background border border-foreground/10 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Recent Registrations</div>
                      <span className="text-xs bg-secondary/15 text-secondary px-2 py-0.5 rounded font-bold">{registrations.length} Total</span>
                    </div>
                    <div className="space-y-3">
                      {registrations.slice(0, 5).map(reg => (
                        <div key={reg._id} className="text-sm flex justify-between items-center py-2 border-b border-foreground/5 last:border-0">
                          <div>
                            <div className="font-semibold">{reg.name}</div>
                            <div className="text-xs text-muted-foreground">{reg.email} · {reg.category}</div>
                          </div>
                          <span className="text-xs text-muted-foreground">{reg.country}</span>
                        </div>
                      ))}
                      {registrations.length === 0 && <p className="text-xs text-muted-foreground">No registrations found.</p>}
                    </div>
                  </div>

                  <div className="bg-background border border-foreground/10 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Recent Abstracts</div>
                      <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded font-bold">{abstracts.length} Total</span>
                    </div>
                    <div className="space-y-3">
                      {abstracts.slice(0, 5).map(abs => (
                        <div key={abs._id} className="text-sm flex justify-between items-center py-2 border-b border-foreground/5 last:border-0">
                          <div>
                            <div className="font-semibold">{abs.name}</div>
                            <div className="text-xs text-muted-foreground">{abs.email} · {abs.track}</div>
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(abs.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                      {abstracts.length === 0 && <p className="text-xs text-muted-foreground">No abstracts submitted yet.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONFERENCES */}
          {!eventPage && !wizardOpen && activeTab === 'conferences' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-1">Manage Conferences</h1>
                  <p className="text-sm text-muted-foreground">Announce and oversee global conference schedules.</p>
                </div>
                <button onClick={() => openAddForm('conference')} className="cta-button">
                  <Plus size={14} /> Add Conference
                </button>
              </div>

              <div className="border border-foreground/10 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#f0f2fe] text-[#2c3e50] dark:bg-indigo-950/30 dark:text-indigo-200 font-semibold border-b border-foreground/10">
                      <th className="p-4 rounded-tl-xl">Schedule</th>
                      <th className="p-4">Title</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Announced By</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conferences.map(conf => (
                      <tr key={conf._id} className="border-b border-foreground/5 bg-card hover:bg-foreground/[0.015] last:border-0 transition-colors">
                        <td className="p-4 font-mono font-medium">
                          {conf.month} {conf.day}
                          {conf.eventDate && <div className="text-[10px] text-muted-foreground mt-1">{new Date(conf.eventDate).toLocaleDateString()}</div>}
                        </td>
                        <td className="p-4 font-semibold">{conf.title}</td>
                        <td className="p-4 text-xs text-muted-foreground">{conf.location}</td>
                        <td className="p-4 text-xs font-semibold">{conf.announcedBy}</td>
                        <td className="p-4 capitalize">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${conf.date === 'upcoming' ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-muted-foreground'}`}>
                            {conf.date}
                          </span>
                        </td>
                        <td className="p-4 text-right relative">
                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(activeDropdownId === conf._id ? null : conf._id);
                              }}
                              className="p-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full transition duration-150 active:scale-90 cursor-pointer"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {activeDropdownId === conf._id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-30 cursor-default" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownId(null);
                                  }} 
                                />
                                <div className="absolute right-0 mt-1.5 w-48 bg-card border border-foreground/10 rounded-xl shadow-xl z-40 py-1.5 focus:outline-none text-left animate-fade-in">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEventPage(conf, 'conference', 'details');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer"
                                  >
                                    View Details
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEditForm(conf, 'conference');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEventPage(conf, 'conference', 'dashboard');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer"
                                  >
                                    Dashboard
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEventPage(conf, 'conference', 'participants');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer"
                                  >
                                    Participants
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEventPage(conf, 'conference', 'payments');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer"
                                  >
                                    Payments
                                  </button>

                                  <div className="border-t border-foreground/5 my-1" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      handleDeleteItem(conf._id, 'conferences');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-red-500/10 text-red-500 hover:text-red-600 transition duration-150 font-bold cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {conferences.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">No conferences managed yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: WEBINARS */}
          {!eventPage && !wizardOpen && activeTab === 'webinars' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-1">Manage Webinars</h1>
                  <p className="text-sm text-muted-foreground">List and organize digital panel talks and webinars.</p>
                </div>
                <button onClick={() => openAddForm('webinar')} className="cta-button">
                  <Plus size={14} /> Add Webinar
                </button>
              </div>

              <div className="border border-foreground/10 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#f0f2fe] text-[#2c3e50] dark:bg-indigo-950/30 dark:text-indigo-200 font-semibold border-b border-foreground/10">
                      <th className="p-4 rounded-tl-xl">Date</th>
                      <th className="p-4">Title</th>
                      <th className="p-4">Speaker</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Announced By</th>
                      <th className="p-4 text-right rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webinars.map(web => (
                      <tr key={web._id} className="border-b border-foreground/5 bg-card hover:bg-foreground/[0.015] last:border-0 transition-colors">
                        <td className="p-4 font-mono font-medium">
                          {web.month} {web.day}
                          {web.eventDate && <div className="text-[10px] text-muted-foreground mt-1">{new Date(web.eventDate).toLocaleDateString()}</div>}
                        </td>
                        <td className="p-4 font-semibold">{web.title}</td>
                        <td className="p-4 text-xs font-bold text-accent">{web.speaker}</td>
                        <td className="p-4 text-xs text-muted-foreground">{web.location}</td>
                        <td className="p-4 text-xs font-semibold">{web.announcedBy}</td>
                        <td className="p-4 text-right relative">
                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(activeDropdownId === web._id ? null : web._id);
                              }}
                              className="p-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full transition duration-150 active:scale-90 cursor-pointer"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {activeDropdownId === web._id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-30 cursor-default" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownId(null);
                                  }} 
                                />
                                <div className="absolute right-0 mt-1.5 w-48 bg-card border border-foreground/10 rounded-xl shadow-xl z-40 py-1.5 focus:outline-none text-left animate-fade-in">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEventPage(web, 'webinar', 'details');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer"
                                  >
                                    View Details
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEditForm(web, 'webinar');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEventPage(web, 'webinar', 'dashboard');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer"
                                  >
                                    Dashboard
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEventPage(web, 'webinar', 'participants');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer"
                                  >
                                    Participants
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      openEventPage(web, 'webinar', 'payments');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer"
                                  >
                                    Payments
                                  </button>

                                  <div className="border-t border-foreground/5 my-1" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      handleDeleteItem(web._id, 'webinars');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-red-500/10 text-red-500 hover:text-red-600 transition duration-150 font-bold cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {webinars.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">No webinars scheduled.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: BLOGS */}
          {!eventPage && activeTab === 'blogs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-1">Blog Publisher</h1>
                  <p className="text-sm text-muted-foreground">Draft and edit research findings and notes.</p>
                </div>
                <button onClick={() => openAddForm('blog')} className="cta-button">
                  <Plus size={14} /> Write Blog Post
                </button>
              </div>

              <div className="border border-foreground/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
                      <th className="p-4">Label</th>
                      <th className="p-4">Title</th>
                      <th className="p-4">Excerpt</th>
                      <th className="p-4">Publisher</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map(blog => (
                      <tr key={blog._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                        <td className="p-4 font-mono font-medium text-xs uppercase tracking-wider text-accent">{blog.label}</td>
                        <td className="p-4 font-semibold">{blog.title}</td>
                        <td className="p-4 text-xs text-muted-foreground max-w-xs truncate">{blog.copy}</td>
                        <td className="p-4 text-xs font-semibold">{blog.announcedBy}</td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => openEditForm(blog, 'blog')} className="p-1 hover:text-secondary inline-block">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteItem(blog._id, 'blogs')} className="p-1 hover:text-red-500 inline-block">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {blogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">No blog posts written.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: REGISTRATIONS (ADMIN ONLY) */}
          {!eventPage && activeTab === 'registrations' && user.role === 'admin' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Registrations</h1>
                <p className="text-sm text-muted-foreground">Verify and organize user registrations.</p>
              </div>

              <div className="border border-foreground/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
                      <th className="p-4">Name</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Institution</th>
                      <th className="p-4">Country</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Abstract?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                        <td className="p-4 font-semibold">{reg.name}</td>
                        <td className="p-4 text-xs">
                          <div>{reg.email}</div>
                          {reg.phone && <div className="text-muted-foreground">{reg.phone}</div>}
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">{reg.institution}</td>
                        <td className="p-4 text-xs">{reg.country}</td>
                        <td className="p-4 text-xs font-bold text-accent">{reg.category}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${reg.presentingAbstract === 'Yes' ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-muted-foreground'}`}>
                            {reg.presentingAbstract}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {registrations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">No attendee registrations in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ABSTRACTS (ADMIN ONLY) */}
          {!eventPage && activeTab === 'abstracts' && user.role === 'admin' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Abstract Submissions</h1>
                <p className="text-sm text-muted-foreground">Incoming scholarly abstracts and talk summaries.</p>
              </div>

              <div className="border border-foreground/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
                      <th className="p-4">Author</th>
                      <th className="p-4">Track</th>
                      <th className="p-4">Submission Summary</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abstracts.map(abs => (
                      <tr key={abs._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                        <td className="p-4 font-semibold">
                          <div>{abs.name}</div>
                          <div className="text-xs text-muted-foreground font-normal">{abs.email}</div>
                        </td>
                        <td className="p-4 text-xs font-bold text-accent uppercase tracking-wider">{abs.track}</td>
                        <td className="p-4 text-xs text-muted-foreground max-w-md whitespace-pre-wrap">{abs.summary}</td>
                        <td className="p-4 text-xs text-muted-foreground">{new Date(abs.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {abstracts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">No abstract submissions in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: CONTACTS (ADMIN ONLY) */}
          {!eventPage && activeTab === 'contacts' && user.role === 'admin' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Contact Inquiries</h1>
                <p className="text-sm text-muted-foreground">Messages received through the contact form on the user website.</p>
              </div>

              <div className="border border-foreground/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
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
                    {contacts.map(c => (
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
                    {contacts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">No contact inquiries yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: ORDERS & PAYMENTS (ADMIN ONLY) */}
          {!eventPage && activeTab === 'orders' && user.role === 'admin' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Orders & Payments</h1>
                <p className="text-sm text-muted-foreground">Track registration payments processed via Razorpay.</p>
              </div>

              <div className="border border-foreground/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Delegate</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                        <td className="p-4 font-mono text-xs text-muted-foreground">{o.orderId}</td>
                        <td className="p-4">
                          <div className="font-semibold">{o.name}</div>
                          <div className="text-xs text-muted-foreground">{o.email}</div>
                        </td>
                        <td className="p-4 text-xs font-bold text-accent">{o.category}</td>
                        <td className="p-4 font-mono font-semibold">₹{(o.amount / 100).toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                            o.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">No payment orders yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="footer bg-card border-t border-foreground/10 py-6 mt-auto">
        <div className="w-full px-6 text-center text-xs text-muted-foreground flex justify-between items-center">
          <span>© 2027 Stream Conferences Admin Dashboard</span>
          <span>Unified Data Layer</span>
        </div>
      </footer>

      {/* POPUP / MODAL EDITOR FORM */}
      {showForm && (
        <div className="lightbox fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="lightbox-card w-[75%] bg-card border border-foreground/15 rounded-2xl shadow-2xl p-8 relative overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight capitalize">
                {editingItemId ? 'Edit' : 'Add New'} {editingItemType}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-6">
              
              {/* BLOG FORM */}
              {editingItemType === 'blog' && (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title</label>
                    <input 
                      required 
                      type="text" 
                      value={blogTitle} 
                      onChange={(e) => setBlogTitle(e.target.value)} 
                      placeholder="e.g. What happens when disciplines stop working in parallel?"
                      className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Banner Image</label>
                    <FileUploadCard 
                      title="Banner Image" 
                      preview={blogBannerPreview || blogBannerUrl} 
                      onSelect={(f) => handleBlogBannerUpload(f)} 
                      onClear={() => { setBlogBannerPreview(''); setBlogBannerUrl(''); }} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Label</label>
                    <input 
                      required 
                      type="text" 
                      value={blogLabel} 
                      onChange={(e) => setBlogLabel(e.target.value)} 
                      placeholder="e.g. FIELD NOTE · 08 MIN, PROCEEDINGS, JOURNAL"
                      className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Copy (Short Excerpt)</label>
                    <input 
                      required 
                      type="text" 
                      value={blogCopy} 
                      onChange={(e) => setBlogCopy(e.target.value)} 
                      placeholder="A short description summarizing the note..."
                      className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Full Content</label>
                    <textarea 
                      required 
                      value={blogContent} 
                      onChange={(e) => setBlogContent(e.target.value)} 
                      placeholder="Markdown or plain text content of the blog post..."
                      rows={8}
                      className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-foreground/10 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="ghost-button"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="cta-button"
                >
                  Save Changes <Check size={14} />
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PARTICIPANT DETAILS VIEW */}
      {viewingParticipant && (
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
      )}

    </div>
  );
}
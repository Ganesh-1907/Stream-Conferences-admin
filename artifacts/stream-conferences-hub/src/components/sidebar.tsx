import {
  Building2,
  CalendarDays,
  Eye,
  FileText,
  Handshake,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Play,
  Send,
  Share2,
  Store,
  UserCircle,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Tab } from '@/lib/types';

interface NavItem {
  tab: Tab;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const PRIMARY_ITEMS: NavItem[] = [
  { tab: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { tab: 'conferences', label: 'Conferences', icon: <CalendarDays size={18} /> },
  { tab: 'webinars', label: 'Webinars', icon: <Play size={18} /> },
  { tab: 'blogs', label: 'Blog Editor', icon: <FileText size={18} /> },
  { tab: 'liveChat', label: 'Live Chat', icon: <MessageSquare size={18} /> },
];

const CONTENT_ITEMS: NavItem[] = [
  { tab: 'mediaPartners', label: 'Media Partners', icon: <Share2 size={18} /> },
  { tab: 'collaborators', label: 'Collaborators', icon: <Handshake size={18} /> },
  { tab: 'exhibitors', label: 'Exhibitors', icon: <Store size={18} /> },
  { tab: 'venues', label: 'Venues', icon: <Building2 size={18} />, adminOnly: true },
  { tab: 'profile', label: 'My Profile', icon: <UserCircle size={18} /> },
];

const ADMIN_ITEMS: NavItem[] = [
  { tab: 'registrations', label: 'Registrations', icon: <Users size={18} />, adminOnly: true },
  { tab: 'abstracts', label: 'Abstracts', icon: <Layers size={18} />, adminOnly: true },
  { tab: 'contacts', label: 'Contact Inquiries', icon: <Send size={18} />, adminOnly: true },
  { tab: 'orders', label: 'Orders & Payments', icon: <Eye size={18} />, adminOnly: true },
  { tab: 'mentors', label: 'Manage Mentors', icon: <UserPlus size={18} />, adminOnly: true },
];

function NavButton({ item }: { item: NavItem }) {
  const { activeTab, goToTab, user } = useAppStore();
  const isActive = activeTab === item.tab;
  return (
    <button
      onClick={() => goToTab(item.tab)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition ${
        isActive
          ? 'bg-primary/10 text-primary font-bold dark:bg-primary/15 dark:text-white'
          : 'hover:bg-foreground/5 text-muted-foreground'
      }`}
    >
      {item.icon}
      <span>{item.label}</span>
    </button>
  );
}

export function Sidebar() {
  const { user } = useAppStore();

  return (
    <aside className="w-64 flex flex-col gap-2 shrink-0">
      {PRIMARY_ITEMS.map((item) => (
        <NavButton key={item.tab} item={item} />
      ))}

      <div className="h-px bg-foreground/10 my-2" />

      {CONTENT_ITEMS.filter((i) => !i.adminOnly || user?.role === 'admin').map((item) => (
        <NavButton key={item.tab} item={item} />
      ))}

      {user?.role === 'admin' && (
        <>
          <div className="h-px bg-foreground/10 my-2" />
          {ADMIN_ITEMS.map((item) => (
            <NavButton key={item.tab} item={item} />
          ))}
        </>
      )}
    </aside>
  );
}

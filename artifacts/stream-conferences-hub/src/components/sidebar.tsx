import {
  Building2,
  CalendarDays,
  FileText,
  Globe,
  Handshake,
  LayoutDashboard,
  MessageSquare,
  Share2,
  UserPlus,
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
  { tab: 'blogs', label: 'Blog Editor', icon: <FileText size={18} /> },
  { tab: 'liveChat', label: 'Live Chat', icon: <MessageSquare size={18} /> },
  { tab: 'userWebsite', label: 'User Website', icon: <Globe size={18} /> },
];

function NavButton({ item }: { item: NavItem }) {
  const { activeTab, goToTab } = useAppStore();

  const isUserWebsiteGroup =
    item.tab === 'userWebsite' &&
    (activeTab === 'userWebsite' ||
      activeTab === 'mediaPartners' ||
      activeTab === 'collaborators' ||
      activeTab === 'venues' ||
      activeTab === 'mentors' ||
      activeTab === 'gallery' ||
      activeTab === 'brochure' ||
      activeTab === 'abstractTemplate');

  const isActive = activeTab === item.tab || isUserWebsiteGroup;

  return (
    <button
      onClick={() => goToTab(item.tab)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${
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
  return (
    <aside className="w-64 flex flex-col gap-2 shrink-0">
      {PRIMARY_ITEMS.map((item) => (
        <NavButton key={item.tab} item={item} />
      ))}
    </aside>
  );
}

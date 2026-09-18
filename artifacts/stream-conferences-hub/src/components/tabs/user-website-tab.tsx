import { Share2, Handshake, Building2, UserPlus, Globe, Image as ImageIcon, FileText, FileCheck } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Tab } from '@/lib/types';
import { MediaPartnersTab } from './media-partners-tab';
import { CollaboratorsTab } from './collaborators-tab';
import { VenuesTab } from './venues-tab';
import { MentorsTab } from './mentors-tab';
import { GalleryTab } from './gallery-tab';
import { BrochureTab } from './brochure-tab';
import { AbstractTemplateTab } from './abstract-template-tab';

type SubTabId = 'mediaPartners' | 'collaborators' | 'venues' | 'mentors' | 'gallery' | 'brochure' | 'abstractTemplate';

interface SubNavItem {
  id: SubTabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  adminOnly?: boolean;
}

const SUB_NAV_ITEMS: SubNavItem[] = [
  {
    id: 'mediaPartners',
    label: 'Media Partners',
    icon: Share2,
  },
  {
    id: 'collaborators',
    label: 'Collaborators',
    icon: Handshake,
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: ImageIcon,
  },
  {
    id: 'brochure',
    label: 'Website Brochure',
    icon: FileText,
  },
  {
    id: 'abstractTemplate',
    label: 'Abstract Submission Template',
    icon: FileCheck,
  },
  {
    id: 'venues',
    label: 'Venues',
    icon: Building2,
    adminOnly: true,
  },
  {
    id: 'mentors',
    label: 'Manage Mentors',
    icon: UserPlus,
    adminOnly: true,
  },
];

export function UserWebsiteTab() {
  const { user, activeTab, goToTab } = useAppStore();

  const visibleItems = SUB_NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === 'admin');

  // Determine current active sub-tab
  const currentSubTab: SubTabId =
    activeTab === 'collaborators' || activeTab === 'venues' || activeTab === 'mentors' || activeTab === 'gallery' || activeTab === 'brochure' || activeTab === 'abstractTemplate'
      ? activeTab
      : 'mediaPartners';

  const handleSelectTab = (id: SubTabId) => {
    goToTab(id as Tab);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-2">
          <Globe size={22} className="text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">User Website Content</h1>
        </div>
      </div>

      {/* Main Body with Sidebar Sub-Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        {/* Left Sub-Sidebar Menu */}
        <div className="bg-background border border-foreground/10 rounded-xl p-2 space-y-1 shadow-xs sticky top-20">
          <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Website Content Sections
          </div>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition cursor-pointer group ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold border-l-4 border-l-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-l-4 border-l-transparent'
                }`}
              >
                <Icon size={18} className={`shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-snug">{item.label}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Active Sub-Tab View Content */}
        <div className="bg-background border border-foreground/10 rounded-xl p-6 shadow-xs min-h-[500px]">
          {currentSubTab === 'mediaPartners' && <MediaPartnersTab />}
          {currentSubTab === 'collaborators' && <CollaboratorsTab />}
          {currentSubTab === 'gallery' && <GalleryTab />}
          {currentSubTab === 'brochure' && <BrochureTab />}
          {currentSubTab === 'abstractTemplate' && <AbstractTemplateTab />}
          {currentSubTab === 'venues' && (user?.role === 'admin' ? <VenuesTab /> : null)}
          {currentSubTab === 'mentors' && (user?.role === 'admin' ? <MentorsTab /> : null)}
        </div>
      </div>
    </div>
  );
}

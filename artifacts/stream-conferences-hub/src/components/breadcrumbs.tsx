import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { useAppStore } from '@/store/app-store';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

const TAB_LABELS: Record<string, string> = {
  overview: 'Overview',
  conferences: 'Conferences',
  webinars: 'Webinars',
  blogs: 'Blog Editor',
  mediaPartners: 'Media Partners',
  collaborators: 'Collaborators',
  venues: 'Venues',
  mentors: 'Manage Mentors',
  liveChat: 'Live Chat',
};

const EVENT_TAB_LABELS: Record<string, string> = {
  dashboard: 'Overview',
  details: 'Details',
  'scientific-program': 'Scientific Program',
  'color-theme': 'Color Theme',
  fees: 'Fees & Pricing',
  participants: 'Participants',
  payments: 'Payments',
  abstracts: 'Abstracts',
  enquiries: 'Enquiries',
  brochures: 'Brochure Leads',
  speakers: 'Speakers',
  tracks: 'Tracks',
  program: 'Program Schedule',
  banners: 'Header & Banners',
  faqs: 'FAQs',
  partners: 'Sponsors & Exhibitors',
  guidelines: 'Guidelines',
  'organizer-contact': 'Organizer Contact',
  'organizing-committee': 'Organizing Committee',
  'venue-details': 'Schedule & Venue',
  cohorts: 'Cohorts',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  conference: 'Conferences',
  webinar: 'Webinars',
};

export function Breadcrumbs() {
  const [location, navigate] = useLocation();
  const { eventPage, eventPageType, eventPageTab, activeTab, goToTab, openEventPage, eventPageMode } =
    useAppStore();

  const items = useMemo(() => {
    const crumbs: { label: string; href?: string; onClick?: () => void; isLast?: boolean }[] = [];

    // Home
    crumbs.push({
      label: 'Home',
      onClick: () => {
        goToTab('overview');
      },
    });

    // Event detail pages: /conference/:id/:tab or /webinar/:id/:tab
    if (eventPageType && eventPage && eventPageTab) {
      // Parent type (Conferences / Webinars)
      const typeLabel = EVENT_TYPE_LABELS[eventPageType] || eventPageType;
      crumbs.push({
        label: typeLabel,
        onClick: () => goToTab(eventPageType === 'conference' ? 'conferences' : 'webinars'),
      });

      if (eventPageMode === 'edit') {
        // Event title (navigates back to view details)
        crumbs.push({
          label: eventPage.title,
          onClick: () => openEventPage(eventPage, eventPageType, eventPageTab, 'view'),
        });

        // Edit Sub-tab
        const tabLabel = EVENT_TAB_LABELS[eventPageTab] || eventPageTab;
        crumbs.push({
          label: `Edit ${tabLabel}`,
          isLast: true,
        });
      } else {
        // Event title
        crumbs.push({
          label: eventPage.title,
          onClick: () => openEventPage(eventPage, eventPageType, 'details', 'view'),
        });

        // Sub-tab
        const tabLabel = EVENT_TAB_LABELS[eventPageTab] || eventPageTab;
        crumbs.push({
          label: tabLabel,
          isLast: true,
        });
      }
    } else if (activeTab) {
      // Top-level tab pages
      const tabLabel = TAB_LABELS[activeTab] || activeTab;
      crumbs.push({
        label: tabLabel,
        isLast: true,
      });
    }

    return crumbs;
  }, [eventPageType, eventPage, eventPageTab, activeTab, goToTab, openEventPage, eventPageMode]);

  if (items.length <= 1) return null;

  return (
    <div className="w-full bg-card/60 border-b border-foreground/10 px-6 py-2">
      <nav aria-label="Breadcrumbs" className="flex items-center text-xs">
        <ol className="flex items-center flex-wrap gap-1">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={idx} className="inline-flex items-center">
                {idx > 0 && (
                  <span className="text-muted-foreground/50 mx-1.5 select-none font-normal">/</span>
                )}
                {isLast ? (
                  <span className="font-semibold text-foreground text-xs">{item.label}</span>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="text-primary hover:underline font-medium text-xs cursor-pointer transition-colors"
                  >
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

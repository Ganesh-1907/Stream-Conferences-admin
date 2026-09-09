import { AppStoreProvider, useAppStore } from '@/store/app-store';
import { LoginPanel } from '@/components/login-panel';
import { ResetPasswordPanel } from '@/components/reset-password-panel';
import { ForceChangePasswordPanel } from '@/components/force-change-password-panel';
import { Header } from '@/components/header';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useLocation } from 'wouter';
import { Wizard } from '@/components/wizard';
import { EventPage } from '@/components/event-page';
import { BlogFormModal } from '@/components/blog-form-modal';
import { ParticipantModal } from '@/components/participant-modal';
import { AssignMentorModal } from '@/components/assign-mentor-modal';
import { OverviewTab } from '@/components/tabs/overview-tab';
import { ConferencesTab } from '@/components/tabs/conferences-tab';
import { WebinarsTab } from '@/components/tabs/webinars-tab';
import { BlogsTab } from '@/components/tabs/blogs-tab';
import { LiveChatTab } from '@/components/tabs/live-chat-tab';
import { MediaPartnersTab } from '@/components/tabs/media-partners-tab';
import { CollaboratorsTab } from '@/components/tabs/collaborators-tab';
import { VenuesTab } from '@/components/tabs/venues-tab';
import { MentorsTab } from '@/components/tabs/mentors-tab';

export default function App() {
  return (
    <AppStoreProvider>
      <Root />
    </AppStoreProvider>
  );
}

function Root() {
  const store = useAppStore();
  const [location] = useLocation();
  const isResetRoute = location.startsWith('/reset-password');

  if (!store.user) {
    if (isResetRoute) return <ResetPasswordPanel />;
    return <LoginPanel />;
  }

  if (store.user.isTempPassword) {
    return <ForceChangePasswordPanel />;
  }

  return (
    <div className="site-shell min-h-screen bg-background flex flex-col">
      <Header />
      <Breadcrumbs />

      <div className="flex-1 w-full px-6 py-6">
        {store.wizardOpen && store.wizardType && (
          <main className="w-full bg-card border border-foreground/10 rounded-2xl p-8 shadow-sm">
            <Wizard />
          </main>
        )}
        {!store.wizardOpen && store.eventPage && store.eventPageType && (
          <EventPage />
        )}
        {!store.wizardOpen && !store.eventPage && (
          <main className="w-full bg-card border border-foreground/10 rounded-2xl p-8 shadow-sm">
            <TabPanel />
          </main>
        )}
      </div>

      <footer className="footer py-4 mt-auto border-t border-primary/20 dark:border-foreground/10">
        <div className="w-full px-6 text-xs text-white dark:text-foreground font-medium flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© {new Date().getFullYear()} Stream Conferences. All rights reserved.</span>
          <span className="font-semibold text-white/90 dark:text-foreground/80">Developed by BYV</span>
        </div>
      </footer>

      <BlogFormModal />
      <ParticipantModal />
      <AssignMentorModal />
    </div>
  );
}

function TabPanel() {
  const store = useAppStore();

  switch (store.activeTab) {
    case 'overview':
      return <OverviewTab />;
    case 'conferences':
      return <ConferencesTab />;
    case 'webinars':
      return <WebinarsTab />;
    case 'blogs':
      return <BlogsTab />;
    case 'mediaPartners':
      return <MediaPartnersTab />;
    case 'collaborators':
      return <CollaboratorsTab />;
    case 'venues':
      return store.user?.role === 'admin' ? <VenuesTab /> : null;
    case 'mentors':
      return store.user?.role === 'admin' ? <MentorsTab /> : null;
    case 'liveChat':
      return store.user?.role === 'admin' || store.user?.role === 'mentor' ? <LiveChatTab /> : null;
    default:
      return null;
  }
}

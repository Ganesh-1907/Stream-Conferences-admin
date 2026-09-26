import { AppStoreProvider, useAppStore } from '@/store/app-store';
import { GlobalModal } from '@/components/global-modal';
import { LoginPanel } from '@/components/login-panel';
import { ResetPasswordPanel } from '@/components/reset-password-panel';
import { ForceChangePasswordPanel } from '@/components/force-change-password-panel';
import { Header } from '@/components/header';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useLocation } from 'wouter';
import { Wizard } from '@/components/wizard';
import { EventPage } from '@/components/event-page';
import { ParticipantModal } from '@/components/participant-modal';
import { AssignMentorModal } from '@/components/assign-mentor-modal';
import { OverviewTab } from '@/components/tabs/overview-tab';
import { ConferencesTab } from '@/components/tabs/conferences-tab';
import { BlogsTab } from '@/components/tabs/blogs-tab';
import { LiveChatTab } from '@/components/tabs/live-chat-tab';
import { UserWebsiteTab } from '@/components/tabs/user-website-tab';

import { ImagePreviewModal } from '@/components/image-preview-modal';

export default function App() {
  return (
    <AppStoreProvider>
      <Root />
      <GlobalModal />
      <ImagePreviewModal />
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

      <div className={`flex-1 w-full px-6 ${!store.eventPage && store.activeTab === 'liveChat' ? 'py-3' : 'py-6'}`}>
        {store.wizardOpen && store.wizardType && (
          <main className="w-full bg-card border border-foreground/10 rounded-2xl p-8 shadow-sm">
            <Wizard />
          </main>
        )}
        {!store.wizardOpen && store.eventPage && store.eventPageType && (
          <EventPage />
        )}
        {!store.wizardOpen && !store.eventPage && (
          <main className={`w-full bg-card border border-foreground/10 rounded-2xl shadow-sm ${store.activeTab === 'liveChat' ? 'p-4' : 'p-8'}`}>
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
    case 'blogs':
      return <BlogsTab />;
    case 'userWebsite':
    case 'mediaPartners':
    case 'collaborators':
    case 'venues':
    case 'mentors':
    case 'gallery':
    case 'brochure':
    case 'abstractTemplate':
      return <UserWebsiteTab />;
    case 'liveChat':
      return store.user?.role === 'admin' || store.user?.role === 'mentor' ? <LiveChatTab /> : null;
    default:
      return null;
  }
}

import { AppStoreProvider, useAppStore } from '@/store/app-store';
import { LoginPanel } from '@/components/login-panel';
import { ResetPasswordPanel } from '@/components/reset-password-panel';
import { ForceChangePasswordPanel } from '@/components/force-change-password-panel';
import { Header } from '@/components/header';
import { useLocation } from 'wouter';
import { Sidebar } from '@/components/sidebar';
import { Wizard } from '@/components/wizard';
import { EventPage } from '@/components/event-page';
import { BlogFormModal } from '@/components/blog-form-modal';
import { ParticipantModal } from '@/components/participant-modal';
import { AssignMentorModal } from '@/components/assign-mentor-modal';
import { OverviewTab } from '@/components/tabs/overview-tab';
import { ConferencesTab } from '@/components/tabs/conferences-tab';
import { WebinarsTab } from '@/components/tabs/webinars-tab';
import { BlogsTab } from '@/components/tabs/blogs-tab';
import { RegistrationsTab } from '@/components/tabs/registrations-tab';
import { AbstractsTab } from '@/components/tabs/abstracts-tab';
import { ContactsTab } from '@/components/tabs/contacts-tab';
import { OrdersTab } from '@/components/tabs/orders-tab';
import { LiveChatTab } from '@/components/tabs/live-chat-tab';
import { MediaPartnersTab } from '@/components/tabs/media-partners-tab';
import { CollaboratorsTab } from '@/components/tabs/collaborators-tab';
import { ExhibitorsTab } from '@/components/tabs/exhibitors-tab';
import { VenuesTab } from '@/components/tabs/venues-tab';
import { ProfileTab } from '@/components/tabs/profile-tab';
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

      <div className="flex-1 flex w-full px-6 py-8 gap-8">
        <Sidebar />

        <main className="flex-1 min-w-0 bg-card border border-foreground/10 rounded-2xl p-8 shadow-sm">
          {store.wizardOpen && store.wizardType && <Wizard />}
          {!store.wizardOpen && store.eventPage && store.eventPageType && <EventPage />}
          {!store.wizardOpen && !store.eventPage && <TabPanel />}
        </main>
      </div>

      <footer className="footer bg-card border-t border-foreground/10 py-6 mt-auto">
        <div className="w-full px-6 text-center text-xs text-muted-foreground flex justify-between items-center">
          <span>© 2027 Stream Conferences Admin Dashboard</span>
          <span>Unified Data Layer</span>
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
    case 'exhibitors':
      return <ExhibitorsTab />;
    case 'venues':
      return store.user?.role === 'admin' ? <VenuesTab /> : null;
    case 'profile':
      return <ProfileTab />;
    case 'registrations':
      return store.user?.role === 'admin' ? <RegistrationsTab /> : null;
    case 'abstracts':
      return store.user?.role === 'admin' ? <AbstractsTab /> : null;
    case 'contacts':
      return store.user?.role === 'admin' ? <ContactsTab /> : null;
    case 'orders':
      return store.user?.role === 'admin' ? <OrdersTab /> : null;
    case 'mentors':
      return store.user?.role === 'admin' ? <MentorsTab /> : null;
    case 'liveChat':
      return store.user?.role === 'admin' || store.user?.role === 'mentor' ? <LiveChatTab /> : null;
    default:
      return null;
  }
}

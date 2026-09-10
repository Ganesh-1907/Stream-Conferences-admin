import {
  LogOut,
  Moon,
  Sun,
  Share2,
  Handshake,
  Building2,
  UserPlus,
  ChevronDown,
  Plus,
  CalendarDays,
  Video,
  FileText,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/app-store';
import { Tab } from '@/lib/types';

interface NavItem {
  tab: Tab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  adminOnly?: boolean;
}

const MORE_NAV_ITEMS: NavItem[] = [
  { tab: 'mediaPartners', label: 'Media Partners', icon: Share2 },
  { tab: 'collaborators', label: 'Collaborators', icon: Handshake },
  { tab: 'venues', label: 'Venues', icon: Building2, adminOnly: true },
  { tab: 'mentors', label: 'Manage Mentors', icon: UserPlus, adminOnly: true },
];

export function Header() {
  const { theme, toggle } = useTheme();
  const { user, handleLogout, activeTab, goToTab, isEventPage, closeEventPage, navigateToAddEvent, openAddForm } = useAppStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [conferencesDropdownOpen, setConferencesDropdownOpen] = useState(false);
  const [webinarsDropdownOpen, setWebinarsDropdownOpen] = useState(false);
  const [blogsDropdownOpen, setBlogsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const conferencesDropdownRef = useRef<HTMLDivElement>(null);
  const webinarsDropdownRef = useRef<HTMLDivElement>(null);
  const blogsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside or escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (conferencesDropdownRef.current && !conferencesDropdownRef.current.contains(e.target as Node)) {
        setConferencesDropdownOpen(false);
      }
      if (webinarsDropdownRef.current && !webinarsDropdownRef.current.contains(e.target as Node)) {
        setWebinarsDropdownOpen(false);
      }
      if (blogsDropdownRef.current && !blogsDropdownRef.current.contains(e.target as Node)) {
        setBlogsDropdownOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setUserMenuOpen(false);
    setConferencesDropdownOpen(false);
    setWebinarsDropdownOpen(false);
    setBlogsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavClick = (tab: Tab) => {
    if (isEventPage) {
      closeEventPage();
    }
    goToTab(tab);
    setDropdownOpen(false);
    setConferencesDropdownOpen(false);
    setWebinarsDropdownOpen(false);
  };

  const handleAddEvent = (type: 'conference' | 'webinar') => {
    setConferencesDropdownOpen(false);
    setWebinarsDropdownOpen(false);
    navigateToAddEvent(type);
  };

  const handleAddBlog = () => {
    setBlogsDropdownOpen(false);
    openAddForm('blog');
  };

  const visibleMoreItems = MORE_NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === 'admin',
  );
  const isMoreActive = !isEventPage && visibleMoreItems.some((item) => item.tab === activeTab);

  const isConferencesActive = !isEventPage && activeTab === 'conferences';
  const isWebinarsActive = !isEventPage && activeTab === 'webinars';
  const isOverviewActive = !isEventPage && activeTab === 'overview';
  const isBlogsActive = !isEventPage && activeTab === 'blogs';
  const isLiveChatActive = !isEventPage && activeTab === 'liveChat';

  const initials = (user?.username ? user.username.slice(0, 2) : 'SC').toUpperCase();
  const userEmail = user?.email || (user?.username ? `${user.username}@streamconferences.com` : 'user@streamconferences.com');

  return (
    <header className="site-header sticky top-0 z-40 bg-card border-b border-foreground/10">
      <div className="flex items-center justify-between w-full px-6 h-16 gap-4">
        {/* Brand */}
        <div
          onClick={() => handleNavClick('overview')}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0 mr-2 sm:mr-6"
        >
          <span className="brand-mark">SC</span>
          <div className="hidden sm:block">
            <span className="brand-word text-base font-bold block leading-tight">Stream Conferences</span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">
              Admin Console
            </span>
          </div>
        </div>

        {/* Top Navigation Links with Underline Indicator */}
        <nav className="flex items-center h-full gap-1 sm:gap-2">
          {/* Overview */}
          <button
            type="button"
            onClick={() => handleNavClick('overview')}
            className={`relative h-16 flex items-center px-3.5 text-[15px] transition-colors whitespace-nowrap cursor-pointer ${
              isOverviewActive
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <span>Overview</span>
            {isOverviewActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-t-sm" />
            )}
          </button>

          {/* Conferences Nav Item with Dropdown */}
          <div
            className="relative h-full flex items-center"
            ref={conferencesDropdownRef}
            onMouseEnter={() => setConferencesDropdownOpen(true)}
            onMouseLeave={() => setConferencesDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setConferencesDropdownOpen(false);
                handleNavClick('conferences');
              }}
              className={`relative h-16 flex items-center gap-1 px-3.5 text-[15px] transition-colors whitespace-nowrap cursor-pointer ${
                isConferencesActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              <span>Conferences</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-150 ${conferencesDropdownOpen ? 'rotate-180' : ''}`}
              />
              {isConferencesActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-t-sm" />
              )}
            </button>

            {conferencesDropdownOpen && (
              <div className="absolute left-0 top-full pt-2 w-52 bg-card border border-foreground/15 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setConferencesDropdownOpen(false);
                      handleAddEvent('conference');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition text-left cursor-pointer group"
                  >
                    <Plus size={16} className="text-primary shrink-0" />
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition">
                      New Conference
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setConferencesDropdownOpen(false);
                    handleNavClick('conferences');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted transition text-left cursor-pointer group"
                >
                  <CalendarDays size={16} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                  <span className="text-sm font-semibold text-foreground transition">
                    Find Conferences
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Webinars Nav Item with Dropdown */}
          <div
            className="relative h-full flex items-center"
            ref={webinarsDropdownRef}
            onMouseEnter={() => setWebinarsDropdownOpen(true)}
            onMouseLeave={() => setWebinarsDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setWebinarsDropdownOpen(false);
                handleNavClick('webinars');
              }}
              className={`relative h-16 flex items-center gap-1 px-3.5 text-[15px] transition-colors whitespace-nowrap cursor-pointer ${
                isWebinarsActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              <span>Webinars</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-150 ${webinarsDropdownOpen ? 'rotate-180' : ''}`}
              />
              {isWebinarsActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-t-sm" />
              )}
            </button>

            {webinarsDropdownOpen && (
              <div className="absolute left-0 top-full pt-2 w-52 bg-card border border-foreground/15 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
        setWebinarsDropdownOpen(false);
        setBlogsDropdownOpen(false);
                      handleAddEvent('webinar');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition text-left cursor-pointer group"
                  >
                    <Plus size={16} className="text-primary shrink-0" />
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition">
                      New Webinar
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setWebinarsDropdownOpen(false);
                    handleNavClick('webinars');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted transition text-left cursor-pointer group"
                >
                  <Video size={16} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                  <span className="text-sm font-semibold text-foreground transition">
                    Find Webinars
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Blog Editor with Dropdown */}
          <div
            className="relative h-full flex items-center"
            ref={blogsDropdownRef}
            onMouseEnter={() => setBlogsDropdownOpen(true)}
            onMouseLeave={() => setBlogsDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setBlogsDropdownOpen(false);
                handleNavClick('blogs');
              }}
              className={`relative h-16 flex items-center gap-1 px-3.5 text-[15px] transition-colors whitespace-nowrap cursor-pointer ${
                isBlogsActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
            >
              <span>Blogs</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-150 ${blogsDropdownOpen ? 'rotate-180' : ''}`}
              />
              {isBlogsActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-t-sm" />
              )}
            </button>

            {blogsDropdownOpen && (
              <div className="absolute left-0 top-full pt-2 w-52 bg-card border border-foreground/15 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={handleAddBlog}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition text-left cursor-pointer group"
                  >
                    <Plus size={16} className="text-primary shrink-0" />
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition">
                      New Blog
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setBlogsDropdownOpen(false);
                    handleNavClick('blogs');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted transition text-left cursor-pointer group"
                >
                  <FileText size={16} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                  <span className="text-sm font-semibold text-foreground transition">
                    All Blogs
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Live Chat (Admin & Mentor) */}
          {(user?.role === 'admin' || user?.role === 'mentor') && (
            <button
              type="button"
              onClick={() => handleNavClick('liveChat')}
            className={`relative h-16 flex items-center px-3.5 text-[15px] transition-colors whitespace-nowrap cursor-pointer ${
              isLiveChatActive
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <span>Live Chat</span>
              {isLiveChatActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-t-sm" />
              )}
            </button>
          )}

          {/* More dropdown - admin only */}
          {user?.role === 'admin' && visibleMoreItems.length > 0 && (
            <div className="relative h-full flex items-center" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={`relative h-16 flex items-center gap-1 px-3.5 text-[15px] transition-colors whitespace-nowrap cursor-pointer ${
                  isMoreActive
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground font-medium'
                }`}
              >
                <span>More</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
                {isMoreActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-t-sm" />
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-52 bg-card border border-foreground/15 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {visibleMoreItems.map((item) => {
                    const Icon = item.icon;
                    const isItemActive = !isEventPage && activeTab === item.tab;
                    return (
                      <button
                        key={item.tab}
                        type="button"
                        onClick={() => handleNavClick(item.tab)}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition cursor-pointer text-left ${
                          isItemActive
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                        }`}
                      >
                        <Icon
                          size={16}
                          className={isItemActive ? 'text-primary' : 'text-muted-foreground'}
                        />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User Actions: Role Badge, Dark/Light Mode Switcher & User Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* User Role Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-foreground/5 border border-foreground/10 select-none">
            <span
              className={`w-2 h-2 rounded-full ${
                user?.role === 'admin' ? 'bg-primary' : 'bg-emerald-500'
              }`}
            />
            <span className="text-foreground capitalize">{user?.role || 'Admin'}</span>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-xl transition cursor-pointer"
            onClick={toggle}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Avatar with Profile Dropdown (Contains Username, Email & Logout) */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs select-none border border-primary/25 shadow-xs cursor-pointer hover:ring-2 hover:ring-primary/30 transition"
              title={`${user?.username} (${user?.role || 'Admin'})`}
              aria-label="User profile menu"
            >
              {initials}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-foreground/15 rounded-xl shadow-2xl py-3 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Info Header */}
                <div className="flex items-center gap-3 px-1 pb-3 border-b border-foreground/10">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary/20">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-foreground truncate">
                      {user?.username || 'User'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate" title={userEmail}>
                      {userEmail}
                    </div>
                  </div>
                </div>

                {/* Logout Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign Out / Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

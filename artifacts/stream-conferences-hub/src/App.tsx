import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowRight, Atom, CalendarDays, Clock3, FlaskConical, HeartPulse, Lightbulb, Mail, MapPin, Menu, Moon, Play, Search, Send, Sun, Users, X } from 'lucide-react';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type EventItem = {
  id: string;
  day: string;
  month: string;
  type: 'Conference' | 'Webinar';
  title: string;
  location: string;
  date: 'upcoming' | 'past';
};

const tracks = [
  { id: '01', title: 'Life sciences', copy: 'From molecular frontiers to translational care.', icon: HeartPulse },
  { id: '02', title: 'Engineering', copy: 'Systems, materials, energy, and the built world.', icon: Atom },
  { id: '03', title: 'Technology', copy: 'The tools changing how knowledge moves.', icon: FlaskConical },
  { id: '04', title: 'Medical practice', copy: 'Clinical thinking for a changing patient.', icon: Users },
  { id: '05', title: 'Academic futures', copy: 'Ideas, institutions, and the next generation.', icon: Lightbulb },
];

const events: EventItem[] = [
  { id: 'med-27', day: '12–14', month: 'MAR 27', type: 'Conference', title: 'International Conference on Medical, Life & Health Sciences', location: 'Boston, Massachusetts · Hybrid', date: 'upcoming' },
  { id: 'ai-27', day: '08–09', month: 'MAY 27', type: 'Conference', title: 'Applied Intelligence & Emerging Technologies Forum', location: 'Singapore · In person', date: 'upcoming' },
  { id: 'web-26', day: '22', month: 'OCT 26', type: 'Webinar', title: 'Precision systems: turning data into better decisions', location: 'Online · 14:00 UTC', date: 'upcoming' },
  { id: 'climate-26', day: '04', month: 'DEC 26', type: 'Webinar', title: 'Engineering resilient cities under pressure', location: 'Online · 16:00 UTC', date: 'upcoming' },
  { id: 'past-25', day: '18–20', month: 'NOV 25', type: 'Conference', title: 'Global Forum on Research Translation', location: 'Copenhagen · Hybrid', date: 'past' },
  { id: 'past-web', day: '07', month: 'JUN 25', type: 'Webinar', title: 'The evidence gap: building trust in public health', location: 'Online · 13:00 UTC', date: 'past' },
];

const dates = [
  { n: '01', title: 'Abstract submissions', copy: 'Open until 28 November 2026' },
  { n: '02', title: 'Early registration', copy: 'Closes 12 January 2027' },
  { n: '03', title: 'Programme release', copy: 'Published 08 February 2027' },
  { n: '04', title: 'Conference week', copy: '12–14 March 2027 · Boston' },
];

const insights = [
  { label: 'FIELD NOTE · 08 MIN', title: 'What happens when disciplines stop working in parallel?', copy: 'A working brief on shared language, better questions, and the collaborations waiting in the middle.', featured: true },
  { label: 'PROCEEDINGS', title: 'The evidence is in the exchange.', copy: 'Selected findings from our latest rooms.', featured: false },
  { label: 'JOURNAL', title: 'Signals worth following.', copy: 'A new editorial surface is taking shape.', featured: false },
];

function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function useTheme() {
  const getInitial = () => {
    const saved = localStorage.getItem('stream-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getInitial());
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('stream-theme', theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((current) => current === 'dark' ? 'light' : 'dark') };
}

function Header({ theme, toggleTheme }: { theme: 'light' | 'dark'; toggleTheme: () => void }) {
  const [drawer, setDrawer] = useState(false);
  const close = () => setDrawer(false);
  const links = [['About', '#about'], ['Conferences', '#events'], ['Webinars', '#live'], ['Journal', '#insights']];
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a href="#top" className="brand" data-testid="link-brand">
            <span className="brand-mark">S<span className="sr-only">tream</span></span>
            <span><span className="brand-word">StreamConferences</span><span className="brand-sub">An event by Stream Conferences</span></span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([label, href]) => <a key={label} className="nav-link" href={href} data-testid={`link-nav-${label.toLowerCase()}`}>{label}</a>)}
            <a className="nav-link" href="#dates" data-testid="link-nav-dates">Important dates</a>
          </nav>
          <div className="header-actions">
            <button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} data-testid="button-theme-toggle">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a className="cta-button" href="#register" data-testid="button-header-register">Register now <ArrowRight size={14} /></a>
            <button className="icon-button mobile-trigger" onClick={() => setDrawer(true)} aria-label="Open menu" data-testid="button-open-menu"><Menu size={19} /></button>
          </div>
        </div>
      </header>
      <div className={`drawer-backdrop ${drawer ? 'open' : ''}`} onClick={close} />
      <aside className={`mobile-drawer ${drawer ? 'open' : ''}`} aria-label="Mobile navigation">
        <button className="icon-button drawer-close" onClick={close} aria-label="Close menu" data-testid="button-close-menu"><X size={18} /></button>
        <a href="#top" className="brand" onClick={close} data-testid="link-drawer-brand"><span className="brand-mark">S</span><span><span className="brand-word">StreamConferences</span><span className="brand-sub">Global research exchange</span></span></a>
        <nav className="drawer-nav">
          {links.concat([['Important dates', '#dates']]).map(([label, href]) => <a href={href} key={label} onClick={close} data-testid={`link-drawer-${label.toLowerCase().replace(' ', '-')}`}>{label}</a>)}
        </nav>
        <a className="cta-button" href="#register" onClick={close} style={{ marginTop: 34, justifyContent: 'center' }} data-testid="button-drawer-register">Register now <ArrowRight size={14} /></a>
      </aside>
    </>
  );
}

function Countdown() {
  const target = useMemo(() => new Date('2027-03-12T08:30:00Z').getTime(), []);
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));
  const [live, setLive] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  const units = [
    ['days', Math.floor(left / 86400000)],
    ['hours', Math.floor((left / 3600000) % 24)],
    ['minutes', Math.floor((left / 60000) % 60)],
    ['seconds', Math.floor((left / 1000) % 60)],
  ];
  return (
    <section className="countdown-section" id="live">
      <div className="countdown-inner reveal">
        <div>
          <div className="live-pill"><span className="live-dot" /> {live ? 'Webinar room is live' : 'Next on the programme'}</div>
          <h2 className="countdown-title">{live ? 'The room is open.' : 'The next conversation starts here.'}</h2>
          <p className="countdown-copy">{live ? 'Join researchers, practitioners, and peers in the live room. Questions are open throughout the session.' : 'A focused online briefing on precision systems, better decisions, and the evidence that makes both possible.'}</p>
          <button className="cta-button" onClick={() => setLive((value) => !value)} data-testid="button-webinar-live">{live ? 'Leave live room' : 'Preview webinar room'} <Play size={13} fill="currentColor" /></button>
        </div>
        <div className="countdown-boxes" aria-label="Countdown to next event" data-testid="status-countdown">
          {units.map(([label, value]) => <div className="count-box" key={label}><b>{String(value).padStart(2, '0')}</b><small>{label}</small></div>)}
        </div>
      </div>
    </section>
  );
}

function Events() {
  const [kind, setKind] = useState<'upcoming' | 'past'>('upcoming');
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'All' | 'Conference' | 'Webinar'>('All');
  const visible = events.filter((event) => event.date === kind && (type === 'All' || event.type === type) && `${event.title} ${event.location}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="section" id="events">
      <div className="section-heading reveal">
        <div><div className="section-kicker">The calendar · 2026—27</div><h2 className="section-title">Rooms for the questions that matter.</h2></div>
        <p className="section-intro">Meetings with a point of view. Find your next place to present, listen, challenge, and leave with better work.</p>
      </div>
      <div className="event-toolbar reveal">
        <div className="segmented" role="tablist" aria-label="Event status">
          {(['upcoming', 'past'] as const).map((tab) => <button key={tab} className={`segment ${kind === tab ? 'active' : ''}`} onClick={() => setKind(tab)} data-testid={`button-events-${tab}`}>{tab === 'upcoming' ? 'Upcoming' : 'Past archive'}</button>)}
        </div>
        <div className="segmented" role="tablist" aria-label="Event type">
          {(['All', 'Conference', 'Webinar'] as const).map((tab) => <button key={tab} className={`segment ${type === tab ? 'active' : ''}`} onClick={() => setType(tab)} data-testid={`button-filter-${tab.toLowerCase()}`}>{tab}</button>)}
        </div>
        <label className="search-box"><Search size={15} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" aria-label="Search events" data-testid="input-search-events" /></label>
      </div>
      <div className="event-list reveal">
        {visible.length ? visible.map((event) => <article className="event-card" key={event.id} data-testid={`card-event-${event.id}`}>
          <div className="event-date"><b>{event.day}</b><span>{event.month}</span></div>
          <div><div className="event-type">{event.type}</div><h3>{event.title}</h3><div className="event-meta"><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{event.location}</div></div>
          <a href="#register" className="event-arrow" aria-label={`View ${event.title}`} data-testid={`link-event-${event.id}`}><ArrowDownRight size={16} /></a>
        </article>) : <div className="empty-state" data-testid="status-events-empty">No events match that search. Try another field of study.</div>}
      </div>
    </section>
  );
}

function Gallery() {
  const [selected, setSelected] = useState<string | null>(null);
  const items = ['A room for exchange', 'The work between sessions', 'Questions in the margins', 'Proof, shared openly'];
  return (
    <>
      <section className="section" id="gallery">
        <div className="section-heading reveal"><div><div className="section-kicker">Inside the exchange</div><h2 className="section-title">Ideas are better in the room.</h2></div><p className="section-intro">A glimpse at the people, notes, and productive friction that make a Stream gathering feel different.</p></div>
        <div className="gallery-grid reveal">{items.map((item, index) => <button className="gallery-item" key={item} onClick={() => setSelected(item)} aria-label={`Open gallery image: ${item}`} data-testid={`button-gallery-${index}`}><span className="gallery-caption">{item}<ArrowRight size={14} style={{ marginLeft: 7, verticalAlign: 'middle' }} /></span></button>)}</div>
      </section>
      {selected && <div className="lightbox" onClick={() => setSelected(null)} role="dialog" aria-label="Gallery preview"><div className="lightbox-card" onClick={(event) => event.stopPropagation()}><button className="icon-button lightbox-close" onClick={() => setSelected(null)} aria-label="Close gallery preview" data-testid="button-close-lightbox"><X size={17} /></button><div className="lightbox-art"><h3>{selected}</h3></div></div></div>}
    </>
  );
}

function Home() {
  const { theme, toggle } = useTheme();
  useReveal();
  return (
    <div className="site-shell" id="top">
      <Header theme={theme} toggleTheme={toggle} />
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="reveal">
              <div className="eyebrow orange">The global conference hub · SC / 27</div>
              <h1>Where serious ideas <em>move forward.</em></h1>
              <p className="hero-copy">Stream Conferences brings the people who discover, test, build, and deliver better futures into one serious global conversation.</p>
              <div className="hero-actions"><a className="cta-button" href="#events" data-testid="button-hero-explore">Explore the calendar <ArrowRight size={14} /></a><a className="hero-link" href="#about" data-testid="link-hero-about">Why Stream <span>→</span></a></div>
            </div>
            <aside className="field-note reveal" aria-label="Stream field note">
              <div className="note-top"><span>Field note / 001</span><span>◌</span></div>
              <p className="note-quote">“Research becomes real when disciplines stop working in parallel.”</p>
              <div className="note-bottom"><span>Stream / Global</span><span>Est. 2014</span></div>
            </aside>
          </div>
        </section>
        <section className="info-strip" aria-label="Featured conference details">
          <div className="info-inner">
            <div className="info-cell"><div className="info-label">Featured conference</div><div className="info-value">International Conference on Medical, Life &amp; Health Sciences</div></div>
            <div className="info-cell"><div className="info-label"><CalendarDays size={12} style={{ verticalAlign: 'middle', marginRight: 6 }} />Dates</div><div className="info-value">March 12—14, 2027</div></div>
            <div className="info-cell"><div className="info-label"><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 6 }} />Venue</div><div className="info-value">Boston, Massachusetts · USA</div></div>
          </div>
        </section>
        <section className="section" id="about">
          <div className="narrative reveal">
            <p className="narrative-statement">Not just another event. <span>A better way to gather.</span></p>
            <div className="narrative-body"><p>Stream is an independent conference and webinar platform for the people doing the work. We build precise, generous spaces for research to meet practice — across medicine, technology, engineering, and academia.</p><p><strong>We care about the signal.</strong> That means fewer filler panels, more useful questions, and programmes shaped around the problems our communities are actually trying to solve.</p><div className="stat-row"><div className="stat"><strong>42</strong><small>Countries connected</small></div><div className="stat"><strong>18k</strong><small>Annual participants</small></div><div className="stat"><strong>11</strong><small>Years convening</small></div></div></div>
          </div>
        </section>
        <section className="section-tint" id="tracks"><div className="section"><div className="section-heading reveal"><div><div className="section-kicker">Five directions</div><h2 className="section-title">Find your current.</h2></div><p className="section-intro">One parent brand, five ways into the conversation. Follow a track or cross the lines between them.</p></div><div className="tracks reveal">{tracks.map((track) => { const Icon = track.icon; return <article className="track-card" key={track.id} data-testid={`card-track-${track.id}`}><div><div className="track-number">{track.id}</div><div className="track-icon"><Icon size={20} /></div></div><div><h3>{track.title}</h3><p>{track.copy}</p></div></article>; })}</div></div></section>
        <Countdown />
        <Events />
        <section className="section section-tint" id="dates"><div className="section"><div className="section-heading reveal"><div><div className="section-kicker">Keep the signal</div><h2 className="section-title">Important dates, without the noise.</h2></div><a className="ghost-button" href="#register" data-testid="button-save-dates"><Clock3 size={14} /> Save the conference dates</a></div><div className="dates-grid reveal">{dates.map((date) => <article className="date-card" key={date.n}><div className="date-number">{date.n}</div><div><h3>{date.title}</h3><p>{date.copy}</p></div></article>)}</div></div></section>
        <div className="marquee-wrap" aria-label="Media partners"><div className="marquee">{['Nature Briefing', 'IEEE Spectrum', 'The Lancet', 'MIT Technology Review', 'ResearchGate', 'Science Friday', 'Nature Briefing', 'IEEE Spectrum', 'The Lancet', 'MIT Technology Review', 'ResearchGate', 'Science Friday'].map((partner, index) => <span key={`${partner}-${index}`}>{partner} <b>·</b></span>)}</div></div>
        <section className="section" id="insights"><div className="section-heading reveal"><div><div className="section-kicker">The editorial desk</div><h2 className="section-title">A little more to take with you.</h2></div><p className="section-intro">Notes, proceedings, and useful context from the conversations we host.</p></div><div className="journal-grid reveal">{insights.map((insight) => <article className={`insight-card ${insight.featured ? 'featured' : ''}`} key={insight.label}><div><span className="soon">{insight.label}</span><h3>{insight.title}</h3><p>{insight.copy}</p></div>{insight.featured ? <a className="read-link" href="#register" data-testid="link-read-field-note">Read the field note <ArrowRight size={13} style={{ verticalAlign: 'middle' }} /></a> : <span className="soon">Coming soon</span>}</article>)}</div></section>
        <Gallery />
        <section className="contact-band" id="register"><div className="contact-inner reveal"><div><div className="eyebrow">Have a question or a proposal?</div><h2>Bring the next good question.</h2></div><a href="mailto:hello@streamconferences.org" className="cta-button" data-testid="link-contact-email">Start a conversation <Send size={14} /></a></div></section>
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div><a href="#top" className="brand" data-testid="link-footer-brand"><span className="brand-mark">S</span><span><span className="brand-word">StreamConferences</span><span className="brand-sub">An event by Stream Conferences</span></span></a><p className="footer-note">Independent spaces for the people moving knowledge forward.</p></div>
          <div><h3>Explore</h3><a href="#events">Conferences</a><a href="#live">Webinars</a><a href="#tracks">Research tracks</a><a href="#insights">Journal / Proceedings</a></div>
          <div><h3>Connect</h3><a href="mailto:hello@streamconferences.org"><Mail size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />hello@streamconferences.org</a><a href="#register">Partner with Stream</a><a href="#register">Press &amp; media</a></div>
          <div><h3>Trust</h3><a href="#about">About Stream</a><a href="#register">Code of conduct</a><a href="#register">Accessibility</a></div>
        </div>
        <div className="bottom-line"><span>© 2027 Stream Conferences</span><span>Global research exchange · Built for the work</span></div>
      </footer>
      <a href="#register" className="mobile-register" data-testid="button-mobile-register">Register now <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></a>
    </div>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { MessageSquare, Send, Mail, Phone, Globe, Search, User, CheckCheck, Clock, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export function LiveChatTab() {
  const {
    user,
    chatSessions,
    activeChatId,
    activeChatMessages,
    chatLoading,
    setActiveChatId,
    sendChatReply,
    setChatStatus
  } = useAppStore();

  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = chatSessions.find((s) => s._id === activeChatId);

  const filteredSessions = chatSessions.filter((s) => {
    const matchesFilter = filter === 'all' ? true : s.status === filter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesFilter;

    const matchesSearch =
      (s.visitorName && s.visitorName.toLowerCase().includes(q)) ||
      (s.visitorEmail && s.visitorEmail.toLowerCase().includes(q)) ||
      (s.visitorPhone && s.visitorPhone.toLowerCase().includes(q)) ||
      (s.visitorCountry && s.visitorCountry.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendChatReply(input);
    setInput('');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'V';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-foreground/10">
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-0.5">Live Chat & Support</h1>
          <p className="text-xs text-muted-foreground">
            Interact with visitors in real time. View detailed visitor leads (Name, Email, Phone, Country) and manage conversations.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-foreground/10 self-start sm:self-auto">
          {(['all', 'open', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                filter === f
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main WhatsApp-Style Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 border border-foreground/15 rounded-2xl overflow-hidden h-[calc(100vh-16.5rem)] min-h-[420px] bg-card shadow-lg">
        {/* Left Sidebar: Conversations List */}
        <div className="border-r border-foreground/10 bg-muted/20 flex flex-col h-full min-h-0 overflow-hidden">
          {/* Search Header */}
          <div className="p-3 border-b border-foreground/10 space-y-2 bg-card/50 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visitor, email, phone..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/40 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary transition"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 font-medium">
              <span>{filteredSessions.length} conversation{filteredSessions.length !== 1 ? 's' : ''}</span>
              <span className="text-[10px] uppercase font-semibold text-primary">WhatsApp Style</span>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-foreground/5">
            {filteredSessions.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
                No conversations found.
              </div>
            )}
            {filteredSessions.map((s) => {
              const isSelected = activeChatId === s._id;
              const initials = getInitials(s.visitorName);

              return (
                <button
                  key={s._id}
                  onClick={() => setActiveChatId(s._id)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border-l-4 border-l-primary'
                      : 'hover:bg-foreground/5 border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-primary/40 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20 shadow-xs">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-xs text-foreground truncate">{s.visitorName || 'Visitor'}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                        {s.lastMessageAt ? new Date(s.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground truncate mb-1">
                      {s.visitorEmail || 'No email provided'}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-2 h-2 rounded-full ${s.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
                        <span className="text-[10px] text-muted-foreground capitalize font-semibold">{s.status}</span>
                        {s.visitorCountry && (
                          <span className="text-[10px] bg-foreground/5 border border-foreground/10 px-1.5 py-0.5 rounded text-foreground/80 font-medium truncate max-w-[100px]">
                            {s.visitorCountry}
                          </span>
                        )}
                      </div>

                      {s.unreadByAdmin > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-xs">
                          {s.unreadByAdmin}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Chat Window */}
        <div className="flex flex-col h-full min-h-0 overflow-hidden bg-background/50">
          {!activeSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-bold text-base">Select a conversation</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Choose a visitor conversation from the left panel to inspect lead details and send live WhatsApp-style messages.
              </p>
            </div>
          ) : (
            <>
              {/* Active Visitor Header Bar with Lead Data */}
              <div className="p-3.5 border-b border-foreground/10 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground font-bold flex items-center justify-center text-sm shrink-0 shadow-md">
                    {getInitials(activeSession.visitorName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm text-foreground">{activeSession.visitorName || 'Visitor'}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        activeSession.status === 'open' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground'
                      }`}>
                        {activeSession.status}
                      </span>
                    </div>

                    {/* Lead details pills: Email, Phone, Country */}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {activeSession.visitorEmail && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/40 border border-foreground/10 px-2 py-0.5 rounded-md font-medium">
                          <Mail size={11} className="text-primary shrink-0" />
                          {activeSession.visitorEmail}
                        </span>
                      )}
                      {activeSession.visitorPhone && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/40 border border-foreground/10 px-2 py-0.5 rounded-md font-medium">
                          <Phone size={11} className="text-emerald-500 shrink-0" />
                          {activeSession.visitorPhone}
                        </span>
                      )}
                      {activeSession.visitorCountry && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/40 border border-foreground/10 px-2 py-0.5 rounded-md font-medium">
                          <Globe size={11} className="text-amber-500 shrink-0" />
                          {activeSession.visitorCountry}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Toggle Button */}
                <button
                  onClick={() => setChatStatus(activeSession._id, activeSession.status === 'open' ? 'closed' : 'open')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer self-start sm:self-center shrink-0 ${
                    activeSession.status === 'open'
                      ? 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                      : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                  }`}
                >
                  {activeSession.status === 'open' ? 'Close Conversation' : 'Reopen Conversation'}
                </button>
              </div>

              {/* Chat Thread Area */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 bg-muted/10">
                {chatLoading && (
                  <div className="text-center text-xs text-muted-foreground py-4">Loading messages…</div>
                )}

                {!chatLoading && activeChatMessages.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-12">
                    <p className="text-xl mb-1">💬</p>
                    No messages in this conversation yet. Send a greeting below!
                  </div>
                )}

                {activeChatMessages.map((m) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div key={m._id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-end gap-2 max-w-[80%]">
                        {!isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-muted text-foreground font-bold flex items-center justify-center text-[10px] shrink-0 mb-1 border border-foreground/10">
                            {getInitials(activeSession.visitorName)}
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isAdmin
                              ? 'bg-primary text-primary-foreground rounded-br-xs'
                              : 'bg-card border border-foreground/10 text-foreground rounded-bl-xs'
                          }`}
                        >
                          {m.text}
                        </div>
                        {isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px] shrink-0 mb-1 border border-primary/30">
                            SC
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-1 font-medium">
                        {m.senderName || (isAdmin ? user?.username || 'Team' : activeSession.visitorName)} ·{' '}
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isAdmin && <CheckCheck size={12} className="text-primary inline ml-0.5" />}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-3 bg-card border-t border-foreground/10 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Reply to ${activeSession.visitorName || 'visitor'} as ${user?.username || 'Admin'}…`}
                  className="flex-1 px-3.5 py-2.5 bg-muted/30 border border-foreground/10 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm cursor-pointer"
                >
                  <span>Send</span>
                  <Send size={13} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

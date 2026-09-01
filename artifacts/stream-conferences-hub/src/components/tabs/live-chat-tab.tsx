import { useState, useRef, useEffect, type FormEvent } from 'react';
import { MessageSquare, Send } from 'lucide-react';
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
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = chatSessions.find((s) => s._id === activeChatId);

  const filtered = chatSessions.filter((s) => (filter === 'all' ? true : s.status === filter));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendChatReply(input);
    setInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Live Chat</h1>
          <p className="text-sm text-muted-foreground">
            Reply to visitors in real time. Messages appear instantly while a visitor is on the site.
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'open', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted/40 hover:bg-muted/70 text-muted-foreground border border-foreground/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 border border-foreground/10 rounded-xl overflow-hidden min-h-[560px]">
        {/* Session list */}
        <div className="border-r border-foreground/10 bg-muted/20 flex flex-col">
          <div className="p-4 border-b border-foreground/10">
            <h2 className="text-sm font-bold">Conversations</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} total</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="p-6 text-center text-xs text-muted-foreground">No conversations yet.</p>
            )}
            {filtered.map((s) => (
              <button
                key={s._id}
                onClick={() => setActiveChatId(s._id)}
                className={`w-full text-left p-4 border-b border-foreground/5 transition ${
                  activeChatId === s._id ? 'bg-primary/10' : 'hover:bg-foreground/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm truncate">{s.visitorName || 'Visitor'}</span>
                  {s.unreadByAdmin > 0 && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
                      {s.unreadByAdmin}
                    </span>
                  )}
                </div>
                {s.visitorEmail && <div className="text-[11px] text-muted-foreground truncate">{s.visitorEmail}</div>}
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${s.status === 'open' ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {s.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(s.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="flex flex-col">
          {!activeSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <MessageSquare size={40} className="text-muted-foreground/40 mb-4" />
              <h3 className="font-bold">Select a conversation</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Choose a visitor conversation from the left to view and reply to messages.
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-foreground/10 flex items-center justify-between">
                <div>
                  <div className="font-bold">{activeSession.visitorName || 'Visitor'}</div>
                  {activeSession.visitorEmail && (
                    <div className="text-xs text-muted-foreground">{activeSession.visitorEmail}</div>
                  )}
                </div>
                <button
                  onClick={() => setChatStatus(activeSession._id, activeSession.status === 'open' ? 'closed' : 'open')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    activeSession.status === 'open'
                      ? 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                      : 'border-green-500/30 text-green-500 hover:bg-green-500/10'
                  }`}
                >
                  {activeSession.status === 'open' ? 'Close conversation' : 'Reopen'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
                {chatLoading && <p className="text-center text-xs text-muted-foreground">Loading…</p>}
                {!chatLoading && activeChatMessages.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground pt-8">No messages yet.</p>
                )}
                {activeChatMessages.map((m) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div key={m._id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isAdmin
                          ? 'bg-primary text-primary-foreground rounded-br-xs'
                          : 'bg-card border border-foreground/10 rounded-bl-xs'
                      }`}>
                        {m.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {m.senderName || (isAdmin ? 'Team' : 'Visitor')} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-3 border-t border-foreground/10 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Reply as ${user?.username || 'team'}…`}
                  className="flex-1 px-3 py-2 bg-muted/30 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary transition"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  aria-label="Send reply"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

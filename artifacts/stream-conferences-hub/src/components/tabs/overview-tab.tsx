import { useAppStore } from '@/store/app-store';

export function OverviewTab() {
  const { user, conferences, webinars, blogs, registrations, abstracts } = useAppStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back, {user?.username}.</h1>
        <p className="text-sm text-muted-foreground">
          {user?.role === 'admin'
            ? 'Here is the active summary of all conference activities across the server.'
            : 'Here is the summary of your announced conferences, webinars and blogs.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background border border-foreground/10 p-6 rounded-xl relative overflow-hidden">
          <div className="text-muted-foreground font-bold text-xs uppercase tracking-wider mb-2">Conferences</div>
          <div className="text-4xl font-bold tracking-tight">{conferences.length}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {user?.role === 'admin' ? 'Total announced in DB' : 'Total announced by you'}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500">
              {conferences.filter((c) => c.date === 'upcoming').length} Upcoming
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-foreground/10 text-muted-foreground">
              {conferences.filter((c) => c.date === 'past').length} Completed
            </span>
          </div>
        </div>

        <div className="bg-background border border-foreground/10 p-6 rounded-xl relative overflow-hidden">
          <div className="text-muted-foreground font-bold text-xs uppercase tracking-wider mb-2">Webinars</div>
          <div className="text-4xl font-bold tracking-tight">{webinars.length}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {user?.role === 'admin' ? 'Total scheduled sessions' : 'Total scheduled by you'}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500">
              {webinars.filter((w) => w.date === 'upcoming').length} Upcoming
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-foreground/10 text-muted-foreground">
              {webinars.filter((w) => w.date === 'past').length} Completed
            </span>
          </div>
        </div>

        <div className="bg-background border border-foreground/10 p-6 rounded-xl relative overflow-hidden">
          <div className="text-muted-foreground font-bold text-xs uppercase tracking-wider mb-2">Blog Posts</div>
          <div className="text-4xl font-bold tracking-tight">{blogs.length}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {user?.role === 'admin' ? 'Published notes' : 'Published by you'}
          </div>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-background border border-foreground/10 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Recent Registrations</div>
              <span className="text-xs bg-secondary/15 text-secondary px-2 py-0.5 rounded font-bold">{registrations.length} Total</span>
            </div>
            <div className="space-y-3">
              {registrations.slice(0, 5).map((reg) => (
                <div key={reg._id} className="text-sm flex justify-between items-center py-2 border-b border-foreground/5 last:border-0">
                  <div>
                    <div className="font-semibold">{reg.name}</div>
                    <div className="text-xs text-muted-foreground">{reg.email} · {reg.category}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{reg.country}</span>
                </div>
              ))}
              {registrations.length === 0 && <p className="text-xs text-muted-foreground">No registrations found.</p>}
            </div>
          </div>

          <div className="bg-background border border-foreground/10 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Recent Abstracts</div>
              <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded font-bold">{abstracts.length} Total</span>
            </div>
            <div className="space-y-3">
              {abstracts.slice(0, 5).map((abs) => (
                <div key={abs._id} className="text-sm flex justify-between items-center py-2 border-b border-foreground/5 last:border-0">
                  <div>
                    <div className="font-semibold">{abs.name}</div>
                    <div className="text-xs text-muted-foreground">{abs.email} · {abs.track}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(abs.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
              {abstracts.length === 0 && <p className="text-xs text-muted-foreground">No abstracts submitted yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

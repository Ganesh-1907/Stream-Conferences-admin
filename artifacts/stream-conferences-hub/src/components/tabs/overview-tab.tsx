import { useAppStore } from '@/store/app-store';
import { CalendarDays, Users, TrendingUp, FileText, CheckCircle2, Clock, XCircle, BarChart3 } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function BarChart({ data, maxVal }: { data: { label: string; conf: number }[]; maxVal: number }) {
  const scale = maxVal > 0 ? 100 / maxVal : 0;
  return (
    <div className="flex items-end gap-1.5 h-32 pt-2">
      {data.map((d, i) => {
        const confH = Math.max(d.conf * scale, d.conf > 0 ? 4 : 0);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap shadow-lg">
              {d.conf} conf
            </div>
            <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '120px' }}>
              <div
                className="w-[40%] rounded-t-sm bg-primary/80 transition-all"
                style={{ height: `${confH}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground font-medium mt-1">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function YearChart({ data }: { data: { year: number; conf: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.conf), 1);
  const scale = 100 / maxVal;
  return (
    <div className="flex items-end gap-3 h-32 pt-2">
      {data.map((d, i) => {
        const h = Math.max(d.conf * scale, d.conf > 0 ? 4 : 0);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap shadow-lg">
              {d.conf} conf
            </div>
            <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '120px' }}>
              <div
                className="w-[40%] rounded-t-sm bg-primary/80 transition-all"
                style={{ height: `${h}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground font-medium mt-1">{d.year}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-background border border-foreground/10 rounded-xl p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color} shrink-0`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export function OverviewTab() {
  const { user, dashboardStats } = useAppStore();
  const c = dashboardStats?.counts;
  const r = dashboardStats?.recent;
  const rev = dashboardStats?.revenue;
  const reg = dashboardStats?.registrations;
  const monthly = dashboardStats?.monthly;
  const yearly = dashboardStats?.yearly;

  if (!dashboardStats) {
    return <div className="p-8 text-muted-foreground">Loading dashboard...</div>;
  }

  const totalEvents = (c?.conferences ?? 0);
  const totalUpcoming = (c?.confUpcoming ?? 0);
  const totalCompleted = (c?.confPast ?? 0);

  // Build monthly chart data
  const currentYear = new Date().getFullYear();
  const confMap = new Map<number, number>();
  (monthly?.conferences || []).forEach((m: any) => confMap.set(m._id, m.count));
  const monthlyData = MONTHS.map((label, i) => ({
    label,
    conf: confMap.get(i + 1) || 0,
  }));
  const maxMonthly = Math.max(...monthlyData.map((d) => d.conf), 1);

  // Build yearly chart data
  const yearData = (yearly?.conferences || []).map((y: any) => ({
    year: y._id,
    conf: y.count,
  }));
  yearData.sort((a, b) => a.year - b.year);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Welcome back, {user?.username || 'Admin'}.
        </h1>
        <p className="text-sm text-muted-foreground">
          {user?.role === 'admin'
            ? 'Here is your platform-wide analytics and activity overview.'
            : 'Here is the summary of your conferences and blogs.'}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays}
          label="Total Conferences"
          value={c?.conferences ?? 0}
          sub={`${c?.confUpcoming ?? 0} upcoming · ${c?.confPast ?? 0} past`}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Users}
          label="Registrations"
          value={c?.registrations ?? 0}
          sub={`${reg?.paid ?? 0} paid · ${reg?.unpaid ?? 0} unpaid`}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue"
          value={`₹${(rev?.total ?? 0).toLocaleString('en-IN')}`}
          sub={`${rev?.paidOrders ?? 0} paid orders`}
          color="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          icon={FileText}
          label="Content"
          value={(c?.blogs ?? 0) + (c?.abstracts ?? 0)}
          sub={`${c?.blogs ?? 0} blogs · ${c?.abstracts ?? 0} abstracts`}
          color="bg-violet-500/10 text-violet-500"
        />
      </div>

      {/* Upcoming / Completed / Registration Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-foreground/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Breakdown</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Upcoming Events</span>
              <span className="text-sm font-bold text-green-500">{totalUpcoming}</span>
            </div>
            <div className="w-full bg-foreground/5 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${totalEvents > 0 ? (totalUpcoming / totalEvents) * 100 : 0}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed Events</span>
              <span className="text-sm font-bold text-muted-foreground">{totalCompleted}</span>
            </div>
            <div className="w-full bg-foreground/5 rounded-full h-2">
              <div className="bg-muted-foreground h-2 rounded-full transition-all" style={{ width: `${totalEvents > 0 ? (totalCompleted / totalEvents) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-background border border-foreground/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registration Status</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Paid</span>
              </div>
              <span className="text-sm font-bold">{reg?.paid ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <span className="text-sm font-bold">{reg?.pending ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-muted-foreground">Unpaid</span>
              </div>
              <span className="text-sm font-bold">{reg?.unpaid ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-background border border-foreground/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Financial Summary</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="text-sm font-bold text-green-500">₹{(rev?.total ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Paid Orders</span>
              <span className="text-sm font-bold">{rev?.paidOrders ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Orders</span>
              <span className="text-sm font-bold">{rev?.totalOrders ?? 0}</span>
            </div>
            <div className="w-full bg-foreground/5 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(rev?.totalOrders ?? 0) > 0 ? ((rev?.paidOrders ?? 0) / (rev?.totalOrders ?? 1)) * 100 : 0}%` }} />
            </div>
            <div className="text-[10px] text-muted-foreground text-right">
              {((rev?.totalOrders ?? 0) > 0 ? ((rev?.paidOrders ?? 0) / (rev?.totalOrders ?? 1)) * 100 : 0).toFixed(0)}% conversion rate
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-background border border-foreground/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Monthly Events — {currentYear}
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/80" />Conferences</span>
            </div>
          </div>
          <BarChart data={monthlyData} maxVal={maxMonthly} />
        </div>

        <div className="bg-background border border-foreground/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Year-wise Growth
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/80" />Conferences</span>
            </div>
          </div>
          {yearData.length > 0 ? (
            <YearChart data={yearData} />
          ) : (
            <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {user?.role === 'admin' && r && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-background border border-foreground/10 rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Registrations</span>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{c?.registrations ?? 0} total</span>
            </div>
            <div className="space-y-0">
              {r.registrations.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No registrations yet.</p>}
              {r.registrations.map((reg: any) => (
                <div key={reg._id} className="flex justify-between items-center py-2.5 border-b border-foreground/5 last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{reg.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{reg.email}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-3">{reg.country}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-background border border-foreground/10 rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Abstracts</span>
              <span className="text-[10px] bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded-full font-bold">{c?.abstracts ?? 0} total</span>
            </div>
            <div className="space-y-0">
              {r.abstracts.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No abstracts submitted yet.</p>}
              {r.abstracts.map((abs: any) => (
                <div key={abs._id} className="flex justify-between items-center py-2.5 border-b border-foreground/5 last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{abs.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{abs.email} · {abs.track}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-3">
                    {new Date(abs.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

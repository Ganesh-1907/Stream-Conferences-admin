import { useAppStore } from '@/store/app-store';
import {
  CalendarDays,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  GraduationCap,
  Coins,
} from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CURRENCY_CONFIG = [
  { currency: 'USD', symbol: '$', label: 'US Dollar', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' },
  { currency: 'EUR', symbol: '€', label: 'Euro', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20' },
  { currency: 'GBP', symbol: '£', label: 'British Pound', color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20' },
];

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
    <div className="bg-background border border-foreground/10 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
      <div className={`p-2.5 rounded-xl ${color} shrink-0`}>
        <Icon size={18} />
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
  const { user, dashboardStats, venues, mentors } = useAppStore();
  const c = dashboardStats?.counts;
  const rev = dashboardStats?.revenue;
  const monthly = dashboardStats?.monthly;
  const yearly = dashboardStats?.yearly;

  if (!dashboardStats) {
    return <div className="p-8 text-sm text-muted-foreground">Loading dashboard...</div>;
  }

  const totalEvents = c?.conferences ?? 0;
  const totalUpcoming = c?.confUpcoming ?? 0;
  const totalCompleted = c?.confPast ?? 0;
  const totalBlogs = c?.blogs ?? 0;
  const totalVenues = c?.venues !== undefined ? c.venues : (venues?.length ?? 0);
  const totalMentors = c?.mentors !== undefined ? c.mentors : (mentors?.length ?? 0);

  const currenciesData = CURRENCY_CONFIG.map((cConfig) => {
    const found = (rev?.currencies || []).find((curr: any) => curr.currency === cConfig.currency);
    return {
      ...cConfig,
      amount: found?.amount ?? 0,
      count: found?.count ?? 0,
    };
  });

  const totalPaidOrders = currenciesData.reduce((sum, item) => sum + item.count, 0);

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
            ? 'Here is your platform-wide analytics and conferences overview.'
            : 'Here is the summary of your conferences and blogs.'}
        </p>
      </div>

      {/* Key Counts Stats: Conferences, Upcoming, Completed, Blogs, Venues, Mentors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={CalendarDays}
          label="Conferences"
          value={totalEvents}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Clock}
          label="Upcoming"
          value={totalUpcoming}
          color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={totalCompleted}
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={FileText}
          label="Blogs"
          value={totalBlogs}
          color="bg-violet-500/10 text-violet-500"
        />
        <StatCard
          icon={MapPin}
          label="Venues"
          value={totalVenues}
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={GraduationCap}
          label="Mentors"
          value={totalMentors}
          color="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* Revenue Breakdown by Currency (USD, EUR, GBP) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Revenue Breakdown by Currency
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {totalPaidOrders} total paid orders
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currenciesData.map((curr) => (
            <div
              key={curr.currency}
              className="bg-background border border-foreground/10 rounded-xl p-5 flex items-center justify-between shadow-xs hover:border-foreground/20 transition"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {curr.currency} ({curr.label})
                </div>
                <div className="text-2xl font-black tracking-tight text-foreground">
                  {curr.symbol}
                  {curr.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] font-medium text-muted-foreground">
                  {curr.count} paid order{curr.count !== 1 ? 's' : ''}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${curr.color}`}>
                {curr.symbol}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Breakdown & Growth Charts Full View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Breakdown */}
        <div className="bg-background border border-foreground/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conference Status</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Upcoming Events</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalUpcoming}</span>
              </div>
              <div className="w-full bg-foreground/5 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${totalEvents > 0 ? (totalUpcoming / totalEvents) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Completed Events</span>
                <span className="font-bold text-muted-foreground">{totalCompleted}</span>
              </div>
              <div className="w-full bg-foreground/5 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-muted-foreground/60 h-full rounded-full transition-all"
                  style={{ width: `${totalEvents > 0 ? (totalCompleted / totalEvents) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-foreground/5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Tracked</span>
              <span className="font-bold text-foreground">{totalEvents} Events</span>
            </div>
          </div>
        </div>

        {/* Monthly Events Chart */}
        <div className="bg-background border border-foreground/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Monthly Events — {currentYear}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-sm bg-primary/80" />
              <span>Conferences</span>
            </div>
          </div>
          <BarChart data={monthlyData} maxVal={maxMonthly} />
        </div>

        {/* Year-wise Growth Chart */}
        <div className="bg-background border border-foreground/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Year-wise Growth
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-sm bg-primary/80" />
              <span>Conferences</span>
            </div>
          </div>
          {yearData.length > 0 ? (
            <YearChart data={yearData} />
          ) : (
            <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

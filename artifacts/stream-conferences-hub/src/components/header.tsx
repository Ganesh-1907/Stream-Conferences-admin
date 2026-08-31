import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/app-store';

export function Header() {
  const { theme, toggle } = useTheme();
  const { user, handleLogout } = useAppStore();

  return (
    <header className="site-header sticky top-0 z-40 bg-card border-b border-foreground/10">
      <div className="flex items-center justify-between w-full px-6 h-20">
        <div className="flex items-center gap-3">
          <span className="brand-mark">SC</span>
          <div>
            <span className="brand-word text-lg font-bold block">Stream Conferences Admin Console</span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">
              An event by Stream Conferences
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-foreground capitalize">{user?.username}</span>
            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-foreground/10 rounded ml-1">
              {user?.role}
            </span>
          </div>

          <button className="icon-button" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition ml-2"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

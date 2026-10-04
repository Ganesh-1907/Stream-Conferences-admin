import { useState, useMemo } from 'react';
import { Plus, MoreVertical, ExternalLink, UserPlus, Check } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { subdomainUrlFor, formatConferenceSchedule } from '@/lib/utils';
import { API_BASE } from '@/lib/constants';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationBar } from '@/components/ui/pagination-bar';
import type { Conference } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';

export function ConferencesTab() {
  const { conferences, openEventPage, openEditForm, handleDeleteItem, openAddForm, user, openAssignMentor, navigateToAddEvent, refreshData } = useAppStore();

  const sortedConferences = useMemo(() => {
    return [...conferences].sort((a: any, b: any) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (aTime && bTime && aTime !== bTime) return bTime - aTime;
      if (a._id && b._id) return String(b._id).localeCompare(String(a._id));
      return 0;
    });
  }, [conferences]);

  const { page, totalPages, totalItems, paginatedItems, setPage } = usePagination(sortedConferences);
  const [savingVisibility, setSavingVisibility] = useState<string | null>(null);

  const handleSetVisibility = async (conf: Conference, visibility: 'public' | 'private') => {
    if ((conf.visibility || 'public') === visibility) return;
    setSavingVisibility(conf._id);
    try {
      const res = await fetch(`${API_BASE}/conferences/${conf._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user?.role || '',
          'x-user-name': user?.username || '',
        },
        body: JSON.stringify({ visibility }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}) as any);
        alert(data?.error || 'Failed to update visibility. Please try again.');
        return;
      }
      await refreshData();
    } catch {
      alert('Failed to update visibility. Please try again.');
    } finally {
      setSavingVisibility(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Manage Conferences</h1>
          <p className="text-sm text-muted-foreground">Announce and oversee global conference schedules.</p>
        </div>
        {user?.role === 'admin' && (
          <button
            type="button"
            onClick={() => navigateToAddEvent('conference')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus size={16} />
            <span>New Conference</span>
          </button>
        )}
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#f0f2fe] text-[#2c3e50] dark:bg-indigo-950/30 dark:text-indigo-200 font-semibold border-b border-foreground/10 text-sm">
              <th className="p-3.5 rounded-tl-xl font-semibold">ID</th>
              <th className="p-3.5 font-semibold">Schedule</th>
              <th className="p-3.5 font-semibold">Title</th>
              <th className="p-3.5 font-semibold">Location</th>
              <th className="p-3.5 font-semibold">Mentor</th>
              <th className="p-3.5 font-semibold">Status</th>
              <th className="p-3.5 font-semibold">Visibility</th>
              <th className="p-3.5 text-right rounded-tr-xl font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((conf) => (
              <tr key={conf._id} className="border-b border-foreground/5 bg-card hover:bg-foreground/[0.015] last:border-0 transition-colors text-sm">
                <td className="p-3.5 font-mono text-xs font-bold">
                  {conf.eventId ? (
                    <button
                      type="button"
                      onClick={() => openEventPage(conf, 'conference', 'details', 'view')}
                      className="text-primary hover:text-primary/80 hover:underline cursor-pointer transition font-bold"
                      title="Click to view conference details"
                    >
                      {conf.eventId}
                    </button>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-3.5 font-medium text-xs sm:text-sm text-foreground whitespace-nowrap">
                  {formatConferenceSchedule(conf)}
                </td>
                <td
                  className="p-3.5 font-semibold text-foreground hover:text-primary cursor-pointer transition text-sm"
                  onClick={() => openEventPage(conf, 'conference', 'details', 'view')}
                  title="Click to view conference details"
                >
                  {conf.title}
                </td>
                <td className="p-3.5 text-xs text-muted-foreground">{conf.venue || conf.venueDetails?.name || conf.location || '—'}</td>
                <td className="p-3.5 text-xs font-semibold text-accent">{conf.mentorName || conf.assignedMentor || '—'}</td>
                <td className="p-3.5 capitalize">
                  {(() => {
                    const status = conf.date || (conf.eventDate && new Date(conf.eventDate).getTime() < Date.now() ? 'past' : 'upcoming');
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status === 'upcoming' ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-muted-foreground'}`}>
                        {status}
                      </span>
                    );
                  })()}
                </td>
                <td className="p-3.5 capitalize">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${(conf.visibility || 'public') === 'private' ? 'bg-foreground/10 text-muted-foreground' : 'bg-green-500/10 text-green-500'}`}>
                    {(conf.visibility || 'public') === 'private' ? 'Private' : 'Public'}
                  </span>
                </td>
                <td className="p-3.5 text-right relative">
                  <div className="flex items-center justify-end gap-1">
                    {subdomainUrlFor(conf) && (
                      <a
                        href={subdomainUrlFor(conf)!}
                        target="_blank"
                        rel="noreferrer"
                        title="View site"
                        className="p-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full transition duration-150 cursor-pointer inline-flex"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    {user?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => openAssignMentor(conf)}
                        title="Assign mentor"
                        className="p-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full transition duration-150 cursor-pointer inline-flex"
                      >
                        <UserPlus size={15} />
                      </button>
                    )}
                    <ActionDropdown
                      onViewDetails={() => openEventPage(conf, 'conference', 'details', 'view')}
                      onEdit={() => openEventPage(conf, 'conference', 'details', 'edit')}
                      onCohorts={() => openEventPage(conf, 'conference', 'cohorts', 'view')}
                      onDelete={() => handleDeleteItem(conf._id, 'conferences')}
                      isMentor={user?.role === 'mentor'}
                      visibility={(conf.visibility || 'public') as 'public' | 'private'}
                      savingVisibility={savingVisibility === conf._id}
                      onSetVisibility={(v) => handleSetVisibility(conf, v)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {totalItems === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">No conferences managed yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationBar page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
    </div>
  );
}

function ActionDropdown({
  onViewDetails,
  onEdit,
  onCohorts,
  onDelete,
  isMentor,
  visibility,
  onSetVisibility,
  savingVisibility,
}: {
  onViewDetails: () => void;
  onEdit: () => void;
  onCohorts: () => void;
  onDelete: () => void;
  isMentor?: boolean;
  visibility?: 'public' | 'private';
  onSetVisibility?: (v: 'public' | 'private') => void;
  savingVisibility?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="p-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full transition duration-150 active:scale-90 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-48 bg-card border border-foreground/10 rounded-xl shadow-xl py-1.5 z-50">
        <DropdownMenuItem
          onClick={onViewDetails}
          className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer rounded-lg"
        >
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onEdit}
          className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer rounded-lg"
        >
          Edit
        </DropdownMenuItem>
        {!isMentor && (
          <DropdownMenuItem
            onClick={onCohorts}
            className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer rounded-lg"
          >
            Cohorts
          </DropdownMenuItem>
        )}
        {!isMentor && onSetVisibility && (
          <>
            <DropdownMenuSeparator className="border-t border-foreground/5 my-1" />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer rounded-lg"
              >
                Visibility
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-card border border-foreground/10 rounded-xl shadow-xl p-1.5 z-50">
                <DropdownMenuItem
                  disabled={savingVisibility}
                  onClick={() => onSetVisibility('public')}
                  className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer rounded-lg"
                >
                  <Check size={14} className={visibility === 'public' ? 'opacity-100' : 'opacity-0'} />
                  Public
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={savingVisibility}
                  onClick={() => onSetVisibility('private')}
                  className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer rounded-lg"
                >
                  <Check size={14} className={visibility === 'private' ? 'opacity-100' : 'opacity-0'} />
                  Private
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
        <DropdownMenuSeparator className="border-t border-foreground/5 my-1" />
        <DropdownMenuItem
          onClick={onDelete}
          className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-red-500/10 text-red-500 hover:text-red-600 transition duration-150 font-bold cursor-pointer rounded-lg focus:text-red-600 focus:bg-red-500/10"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

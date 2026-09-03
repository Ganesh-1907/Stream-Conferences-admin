import { MoreVertical, Plus, ExternalLink, UserPlus } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { subdomainUrlFor } from '@/lib/utils';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationBar } from '@/components/ui/pagination-bar';

export function WebinarsTab() {
  const { webinars, activeDropdownId, setActiveDropdownId, openEventPage, openEditForm, handleDeleteItem, openAddForm, user, openAssignMentor } = useAppStore();
  const { page, totalPages, totalItems, paginatedItems, setPage } = usePagination(webinars);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Manage Webinars</h1>
          <p className="text-sm text-muted-foreground">List and organize digital panel talks and webinars.</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => openAddForm('webinar')} className="cta-button">
            <Plus size={14} /> Add Webinar
          </button>
        )}
      </div>

      <div className="border border-foreground/10 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#f0f2fe] text-[#2c3e50] dark:bg-indigo-950/30 dark:text-indigo-200 font-semibold border-b border-foreground/10">
              <th className="p-4 rounded-tl-xl">Date</th>
              <th className="p-4">Title</th>
              <th className="p-4">Speaker</th>
              <th className="p-4">Location</th>
              <th className="p-4">Announced By</th>
              <th className="p-4">Assigned Mentor</th>
              <th className="p-4 text-right rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((web) => (
              <tr key={web._id} className="border-b border-foreground/5 bg-card hover:bg-foreground/[0.015] last:border-0 transition-colors">
                <td className="p-4 font-mono font-medium">
                  {web.month} {web.day}
                  {web.eventDate && <div className="text-[10px] text-muted-foreground mt-1">{new Date(web.eventDate).toLocaleDateString()}</div>}
                </td>
                <td className="p-4 font-semibold">{web.title}</td>
                <td className="p-4 text-xs font-bold text-accent">{web.speaker}</td>
                <td className="p-4 text-xs text-muted-foreground">{web.location}</td>
                <td className="p-4 text-xs font-semibold">{web.announcedBy}</td>
                <td className="p-4 text-xs font-semibold text-accent">{web.assignedMentor || '—'}</td>
                <td className="p-4 text-right relative">
                  <div className="flex items-center justify-end gap-1">
                    {subdomainUrlFor(web) && (
                      <a
                        href={subdomainUrlFor(web)!}
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
                        onClick={() => openAssignMentor(web)}
                        title="Assign mentor"
                        className="p-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full transition duration-150 cursor-pointer inline-flex"
                      >
                        <UserPlus size={15} />
                      </button>
                    )}
                    <div className="inline-block text-left">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(activeDropdownId === web._id ? null : web._id);
                        }}
                        className="p-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full transition duration-150 active:scale-90 cursor-pointer"
                      >
                        <MoreVertical size={16} />
                      </button>

                    {activeDropdownId === web._id && (
                      <>
                        <div
                          className="fixed inset-0 z-30 cursor-default"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(null);
                          }}
                        />
                        <div className="absolute right-0 mt-1.5 w-48 bg-card border border-foreground/10 rounded-xl shadow-xl z-40 py-1.5 focus:outline-none text-left animate-fade-in">
                          <MenuBtn label="View Details" onClick={() => { setActiveDropdownId(null); openEventPage(web, 'webinar', 'details'); }} />
                          <MenuBtn label="Edit" onClick={() => { setActiveDropdownId(null); openEditForm(web, 'webinar'); }} />
                          <MenuBtn label="Dashboard" onClick={() => { setActiveDropdownId(null); openEventPage(web, 'webinar', 'dashboard'); }} />
                          <MenuBtn label="Participants" onClick={() => { setActiveDropdownId(null); openEventPage(web, 'webinar', 'participants'); }} />
                          <MenuBtn label="Payments" onClick={() => { setActiveDropdownId(null); openEventPage(web, 'webinar', 'payments'); }} />
                          <div className="border-t border-foreground/5 my-1" />
                          <button
                            type="button"
                            onClick={() => { setActiveDropdownId(null); handleDeleteItem(web._id, 'webinars'); }}
                            className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-red-500/10 text-red-500 hover:text-red-600 transition duration-150 font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {totalItems === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">No webinars scheduled.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationBar page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
    </div>
  );
}

function MenuBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-foreground/5 transition duration-150 text-foreground font-semibold cursor-pointer"
    >
      {label}
    </button>
  );
}

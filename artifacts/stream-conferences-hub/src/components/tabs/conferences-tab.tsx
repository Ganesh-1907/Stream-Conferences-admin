import { MoreVertical, Plus } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export function ConferencesTab() {
  const { conferences, activeDropdownId, setActiveDropdownId, openEventPage, openEditForm, handleDeleteItem, openAddForm } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Manage Conferences</h1>
          <p className="text-sm text-muted-foreground">Announce and oversee global conference schedules.</p>
        </div>
        <button onClick={() => openAddForm('conference')} className="cta-button">
          <Plus size={14} /> Add Conference
        </button>
      </div>

      <div className="border border-foreground/10 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#f0f2fe] text-[#2c3e50] dark:bg-indigo-950/30 dark:text-indigo-200 font-semibold border-b border-foreground/10">
              <th className="p-4 rounded-tl-xl">Schedule</th>
              <th className="p-4">Title</th>
              <th className="p-4">Location</th>
              <th className="p-4">Announced By</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {conferences.map((conf) => (
              <tr key={conf._id} className="border-b border-foreground/5 bg-card hover:bg-foreground/[0.015] last:border-0 transition-colors">
                <td className="p-4 font-mono font-medium">
                  {conf.month} {conf.day}
                  {conf.eventDate && <div className="text-[10px] text-muted-foreground mt-1">{new Date(conf.eventDate).toLocaleDateString()}</div>}
                </td>
                <td className="p-4 font-semibold">{conf.title}</td>
                <td className="p-4 text-xs text-muted-foreground">{conf.location}</td>
                <td className="p-4 text-xs font-semibold">{conf.announcedBy}</td>
                <td className="p-4 capitalize">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${conf.date === 'upcoming' ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-muted-foreground'}`}>
                    {conf.date}
                  </span>
                </td>
                <td className="p-4 text-right relative">
                  <ActionDropdown
                    id={conf._id}
                    activeId={activeDropdownId}
                    onToggle={setActiveDropdownId}
                    onViewDetails={() => openEventPage(conf, 'conference', 'details')}
                    onEdit={() => openEditForm(conf, 'conference')}
                    onDashboard={() => openEventPage(conf, 'conference', 'dashboard')}
                    onParticipants={() => openEventPage(conf, 'conference', 'participants')}
                    onPayments={() => openEventPage(conf, 'conference', 'payments')}
                    onDelete={() => handleDeleteItem(conf._id, 'conferences')}
                  />
                </td>
              </tr>
            ))}
            {conferences.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No conferences managed yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionDropdown({
  id,
  activeId,
  onToggle,
  onViewDetails,
  onEdit,
  onDashboard,
  onParticipants,
  onPayments,
  onDelete,
}: {
  id: string;
  activeId: string | null;
  onToggle: (id: string | null) => void;
  onViewDetails: () => void;
  onEdit: () => void;
  onDashboard: () => void;
  onParticipants: () => void;
  onPayments: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="inline-block text-left">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(activeId === id ? null : id);
        }}
        className="p-2 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-full transition duration-150 active:scale-90 cursor-pointer"
      >
        <MoreVertical size={16} />
      </button>

      {activeId === id && (
        <>
          <div
            className="fixed inset-0 z-30 cursor-default"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(null);
            }}
          />
          <div className="absolute right-0 mt-1.5 w-48 bg-card border border-foreground/10 rounded-xl shadow-xl z-40 py-1.5 focus:outline-none text-left animate-fade-in">
            <MenuItem label="View Details" onClick={onViewDetails} />
            <MenuItem label="Edit" onClick={onEdit} />
            <MenuItem label="Dashboard" onClick={onDashboard} />
            <MenuItem label="Participants" onClick={onParticipants} />
            <MenuItem label="Payments" onClick={onPayments} />
            <div className="border-t border-foreground/5 my-1" />
            <button
              type="button"
              onClick={onDelete}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-red-500/10 text-red-500 hover:text-red-600 transition duration-150 font-bold cursor-pointer"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
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

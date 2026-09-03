import { useAppStore } from '@/store/app-store';

export function AssignMentorModal() {
  const { assignOpen, assignTarget, assignUsername, setAssignUsername, closeAssignMentor, submitAssignMentor, mentors } = useAppStore();

  if (!assignOpen || !assignTarget) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card text-foreground border border-foreground/10 rounded-2xl w-[92vw] md:w-[46vw] max-w-xl p-8 relative shadow-2xl space-y-6">
        <button
          type="button"
          onClick={closeAssignMentor}
          className="absolute top-6 right-6 p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground transition duration-150 cursor-pointer"
        >
          Close
        </button>

        <div>
          <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">Assign Mentor</span>
          <h2 className="text-2xl font-bold tracking-tight mt-2">{assignTarget.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a mentor who will manage this event's content and public site.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Mentor</label>
          <select
            value={assignUsername}
            onChange={(e) => setAssignUsername(e.target.value)}
            className="w-full px-4 py-3 bg-muted/20 border border-foreground/10 rounded-xl text-base text-foreground focus:outline-none focus:border-secondary transition cursor-pointer"
          >
            <option value="">No mentor (unassigned)</option>
            {mentors.map((m) => (
              <option key={m.username} value={m.username}>
                {m.fullName} ({m.username})
              </option>
            ))}
          </select>
          {mentors.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              No mentors registered yet. Add one under Manage Mentors.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeAssignMentor}
            className="px-5 py-2.5 bg-muted text-foreground text-sm font-semibold rounded-xl hover:bg-muted/80 transition duration-150 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitAssignMentor}
            className="px-6 py-2.5 bg-secondary text-secondary-foreground text-sm font-semibold rounded-xl hover:bg-secondary/90 transition duration-150 cursor-pointer"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

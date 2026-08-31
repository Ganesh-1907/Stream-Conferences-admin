import { useAppStore } from '@/store/app-store';

export function RegistrationsTab() {
  const { registrations } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Registrations</h1>
        <p className="text-sm text-muted-foreground">Verify and organize user registrations.</p>
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Institution</th>
              <th className="p-4">Country</th>
              <th className="p-4">Category</th>
              <th className="p-4">Abstract?</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 font-semibold">{reg.name}</td>
                <td className="p-4 text-xs">
                  <div>{reg.email}</div>
                  {reg.phone && <div className="text-muted-foreground">{reg.phone}</div>}
                </td>
                <td className="p-4 text-xs text-muted-foreground">{reg.institution}</td>
                <td className="p-4 text-xs">{reg.country}</td>
                <td className="p-4 text-xs font-bold text-accent">{reg.category}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${reg.presentingAbstract === 'Yes' ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-muted-foreground'}`}>
                    {reg.presentingAbstract}
                  </span>
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No attendee registrations in database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

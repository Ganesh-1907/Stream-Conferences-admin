import { useAppStore } from '@/store/app-store';

export function ContactsTab() {
  const { contacts } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Contact Inquiries</h1>
        <p className="text-sm text-muted-foreground">Messages received through the contact form on the user website.</p>
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Inquiry Type</th>
              <th className="p-4">Message</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 font-semibold">{c.name}</td>
                <td className="p-4 text-xs">
                  <div>{c.email}</div>
                  {c.phone && <div className="text-muted-foreground">{c.phone}</div>}
                </td>
                <td className="p-4 text-xs font-bold text-accent">{c.subject || 'General'}</td>
                <td className="p-4 text-xs text-muted-foreground max-w-md whitespace-pre-wrap">{c.message}</td>
                <td className="p-4 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No contact inquiries yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

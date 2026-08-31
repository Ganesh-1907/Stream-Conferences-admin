import { useAppStore } from '@/store/app-store';
import { mediaUrl } from '@/lib/utils';

export function AbstractsTab() {
  const { abstracts } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Abstract Submissions</h1>
        <p className="text-sm text-muted-foreground">Incoming scholarly abstracts and talk summaries.</p>
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Author</th>
              <th className="p-4">Institution / Country</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Abstract</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {abstracts.map((abs) => (
              <tr key={abs._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 font-semibold">
                  <div>{abs.name || `${abs.firstName || ''} ${abs.lastName || ''}`.trim()}</div>
                  {abs.eventTitle && <div className="text-xs text-accent font-medium mt-0.5">{abs.eventTitle}</div>}
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground">{abs.institution || '—'}</div>
                  {abs.country && <div className="mt-0.5">{abs.country}</div>}
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  <div>{abs.email}</div>
                  {abs.phone && <div className="mt-0.5">{abs.phone}</div>}
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  {abs.track && <div className="font-bold text-accent uppercase tracking-wider">{abs.track}</div>}
                  {abs.summary && <div className="mt-1 max-w-md whitespace-pre-wrap">{abs.summary}</div>}
                  {abs.abstractFile && (
                    <a href={mediaUrl(abs.abstractFile)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-secondary hover:underline">
                      View PDF
                    </a>
                  )}
                </td>
                <td className="p-4 text-xs text-muted-foreground">{new Date(abs.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {abstracts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No abstract submissions in database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

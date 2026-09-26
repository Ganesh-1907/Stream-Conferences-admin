import { Check, Edit, ExternalLink, Plus, Power } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export function VenuesTab() {
  const { venues, venueForm, setVenueForm, openVenueForm, saveVenue, toggleVenueStatus } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Venues</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage event venues. Disabled venues cannot be selected for new conferences.</p>
        </div>
        <button onClick={() => openVenueForm(null)} className="cta-button">
          <Plus size={14} /> Add Venue
        </button>
      </div>

      {venueForm.open && (
        <div className="bg-muted/20 border border-foreground/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">{venueForm.editingId ? 'Edit Venue' : 'New Venue'}</h3>
            <button onClick={() => setVenueForm({ open: false, editingId: null, name: '', address: '', locationUrl: '' })} className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Venue Name</label>
            <input type="text" value={venueForm.name} onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })} placeholder="Enter venue name" className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Venue Address</label>
            <input type="text" value={venueForm.address} onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })} placeholder="Full address" className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Location URL</label>
            <input type="url" value={venueForm.locationUrl} onChange={(e) => setVenueForm({ ...venueForm, locationUrl: e.target.value })} placeholder="https://maps.google.com/..." className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={saveVenue} className="cta-button"><Check size={14} /> Save</button>
          </div>
        </div>
      )}

      {!venueForm.open && (
        <div className="border border-foreground/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
                <th className="p-4">Name</th>
                <th className="p-4">Address</th>
                <th className="p-4">Location URL</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                  <td className="p-4 font-semibold">{v.name}</td>
                  <td className="p-4 text-xs text-muted-foreground">{v.address || '—'}</td>
                  <td className="p-4 text-xs">{v.locationUrl ? <a href={v.locationUrl} target="_blank" rel="noreferrer" className="text-secondary inline-flex items-center gap-1"><ExternalLink size={12} /> View</a> : '—'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${v.isActive !== false ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}`}>
                      {v.isActive !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openVenueForm(v)} title="Edit Venue" className="p-1.5 hover:text-secondary hover:bg-muted rounded-lg transition inline-block"><Edit size={14} /></button>
                    <button
                      onClick={() => toggleVenueStatus(v._id, v.isActive !== false)}
                      title={v.isActive !== false ? 'Disable Venue' : 'Enable Venue'}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition inline-flex items-center gap-1.5 cursor-pointer ${
                        v.isActive !== false
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      <Power size={12} />
                      {v.isActive !== false ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
              {venues.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No venues added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

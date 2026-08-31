import { Check, Edit, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export function VenuesTab() {
  const { venues, venueForm, setVenueForm, openVenueForm, saveVenue, deleteVenue } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Venues</h1>
          <p className="text-sm text-muted-foreground">Manage physical venues used when announcing offline events.</p>
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
            <input type="text" value={venueForm.name} onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })} placeholder="e.g. Grand Convention Center" className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
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
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                  <td className="p-4 font-semibold">{v.name}</td>
                  <td className="p-4 text-xs text-muted-foreground">{v.address || '—'}</td>
                  <td className="p-4 text-xs">{v.locationUrl ? <a href={v.locationUrl} target="_blank" rel="noreferrer" className="text-secondary inline-flex items-center gap-1"><ExternalLink size={12} /> View</a> : '—'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openVenueForm(v)} className="p-1 hover:text-secondary inline-block"><Edit size={14} /></button>
                    <button onClick={() => deleteVenue(v._id)} className="p-1 hover:text-red-500 inline-block"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {venues.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No venues added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

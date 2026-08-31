import { Check, Edit, Plus, Share2, Trash2 } from 'lucide-react';
import { FileUploadCard } from '@/components/file-upload-card';
import { useAppStore } from '@/store/app-store';
import { mediaUrl } from '@/lib/utils';

export function MediaPartnersTab() {
  const { mediaPartners, partnerForm, setPartnerForm, openPartnerForm, savePartner, deletePartner, handleLogoUpload } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Media Partners</h1>
          <p className="text-sm text-muted-foreground">Organizations that promote the event across their channels.</p>
        </div>
        <button onClick={() => openPartnerForm(null)} className="cta-button">
          <Plus size={14} /> Add Media Partner
        </button>
      </div>

      {partnerForm.open && (
        <div className="bg-muted/20 border border-foreground/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">{partnerForm.editingId ? 'Edit Media Partner' : 'New Media Partner'}</h3>
            <button onClick={() => setPartnerForm({ open: false, editingId: null, name: '', logo: '', logoPreview: '', description: '' })} className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Name</label>
            <input type="text" value={partnerForm.name} onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })} placeholder="e.g. TechPress Media" className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
          <FileUploadCard
            title="Logo"
            preview={partnerForm.logoPreview || ''}
            onSelect={(f) => handleLogoUpload('partner', f)}
            onClear={() => setPartnerForm((cur) => ({ ...cur, logo: '', logoPreview: '' }))}
          />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
            <textarea value={partnerForm.description} onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })} placeholder="Short description..." rows={3} className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={savePartner} className="cta-button"><Check size={14} /> Save</button>
          </div>
        </div>
      )}

      {!partnerForm.open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mediaPartners.map((mp) => (
            <div key={mp._id} className="bg-background border border-foreground/10 rounded-xl p-5 flex items-start gap-4">
              {mp.logo ? <img src={mediaUrl(mp.logo)} alt={mp.name} className="w-14 h-14 rounded-lg object-contain border border-foreground/10 bg-muted/20 shrink-0" /> : <div className="w-14 h-14 rounded-lg bg-muted/20 flex items-center justify-center text-muted-foreground shrink-0"><Share2 size={20} /></div>}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{mp.name}</div>
                {mp.description && <p className="text-xs text-muted-foreground mt-1">{mp.description}</p>}
                <div className="text-[10px] text-muted-foreground mt-1">By {mp.createdBy}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openPartnerForm(mp)} className="p-1.5 hover:text-secondary"><Edit size={14} /></button>
                <button onClick={() => deletePartner(mp._id)} className="p-1.5 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {mediaPartners.length === 0 && <div className="col-span-full border border-foreground/10 rounded-xl p-8 text-center text-muted-foreground">No media partners added yet.</div>}
        </div>
      )}
    </div>
  );
}

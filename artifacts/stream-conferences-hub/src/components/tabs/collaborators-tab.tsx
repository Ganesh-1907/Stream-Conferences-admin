import { Check, Edit, Handshake, Plus, Trash2 } from 'lucide-react';
import { FileUploadCard } from '@/components/file-upload-card';
import { useAppStore } from '@/store/app-store';
import { mediaUrl } from '@/lib/utils';

export function CollaboratorsTab() {
  const { collaborators, collaboratorForm, setCollaboratorForm, openCollaboratorForm, saveCollaborator, deleteCollaborator, handleLogoUpload } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Collaborators</h1>
          <p className="text-sm text-muted-foreground">Organizations partnering with the event.</p>
        </div>
        <button onClick={() => openCollaboratorForm(null)} className="cta-button">
          <Plus size={14} /> Add Collaborator
        </button>
      </div>

      {collaboratorForm.open && (
        <div className="bg-muted/20 border border-foreground/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">{collaboratorForm.editingId ? 'Edit Collaborator' : 'New Collaborator'}</h3>
            <button onClick={() => setCollaboratorForm({ open: false, editingId: null, name: '', logo: '', logoPreview: '', description: '' })} className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Name</label>
            <input type="text" value={collaboratorForm.name} onChange={(e) => setCollaboratorForm({ ...collaboratorForm, name: e.target.value })} placeholder="e.g. Research Alliance" className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
          <FileUploadCard
            title="Logo"
            preview={collaboratorForm.logoPreview || ''}
            onSelect={(f) => handleLogoUpload('collaborator', f)}
            onClear={() => setCollaboratorForm((cur) => ({ ...cur, logo: '', logoPreview: '' }))}
          />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
            <textarea value={collaboratorForm.description} onChange={(e) => setCollaboratorForm({ ...collaboratorForm, description: e.target.value })} placeholder="Short description..." rows={3} className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={saveCollaborator} className="cta-button"><Check size={14} /> Save</button>
          </div>
        </div>
      )}

      {!collaboratorForm.open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collaborators.map((c) => (
            <div key={c._id} className="bg-background border border-foreground/10 rounded-xl p-5 flex items-start gap-4">
              {c.logo ? <img src={mediaUrl(c.logo)} alt={c.name} className="w-14 h-14 rounded-lg object-contain border border-foreground/10 bg-muted/20 shrink-0" /> : <div className="w-14 h-14 rounded-lg bg-muted/20 flex items-center justify-center text-muted-foreground shrink-0"><Handshake size={20} /></div>}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{c.name}</div>
                {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                <div className="text-[10px] text-muted-foreground mt-1">By {c.createdBy}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openCollaboratorForm(c)} className="p-1.5 hover:text-secondary"><Edit size={14} /></button>
                <button onClick={() => deleteCollaborator(c._id)} className="p-1.5 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {collaborators.length === 0 && <div className="col-span-full border border-foreground/10 rounded-xl p-8 text-center text-muted-foreground">No collaborators added yet.</div>}
        </div>
      )}
    </div>
  );
}

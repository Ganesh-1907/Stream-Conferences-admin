import { Check, Plus, Trash2 } from 'lucide-react';
import { FileUploadCard } from '@/components/file-upload-card';
import { useAppStore } from '@/store/app-store';

export function ProfileTab() {
  const { profileForm, setProfileForm, saveProfile, handleProfileAvatarUpload } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">My Profile</h1>
        <p className="text-sm text-muted-foreground">Update the personal and professional details shown on the user website mentors page.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Full Name</label>
            <input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} placeholder="e.g. Dr. Jane Doe" className="w-full px-4 py-3 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title / Designation</label>
            <input type="text" value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} placeholder="e.g. Professor of Oncology" className="w-full px-4 py-3 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Bio</label>
          <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} placeholder="A short professional bio..." className="w-full px-4 py-3 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition resize-none" />
        </div>

        <FileUploadCard
          title="Avatar"
          preview={profileForm.avatarPreview || ''}
          onSelect={(f) => handleProfileAvatarUpload(f)}
          onClear={() => setProfileForm((cur) => ({ ...cur, avatar: '', avatarPreview: '' }))}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Email</label>
            <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="email@example.com" className="w-full px-4 py-3 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Phone</label>
            <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+1 555 000 0000" className="w-full px-4 py-3 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Location</label>
            <input type="text" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} placeholder="e.g. Boston, MA" className="w-full px-4 py-3 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">LinkedIn</label>
            <input type="url" value={profileForm.linkedin} onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." className="w-full px-4 py-3 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Website</label>
            <input type="url" value={profileForm.website} onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
          </div>
        </div>

        <ListSection
          title="Expertise"
          placeholder="e.g. Machine Learning"
          items={profileForm.expertise}
          onAdd={() => setProfileForm({ ...profileForm, expertise: [...profileForm.expertise, ''] })}
          onChange={(i, v) => {
            const next = [...profileForm.expertise];
            next[i] = v;
            setProfileForm({ ...profileForm, expertise: next });
          }}
          onRemove={(i) => setProfileForm({ ...profileForm, expertise: profileForm.expertise.filter((_, j) => j !== i) })}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Education</label>
            <button type="button" onClick={() => setProfileForm({ ...profileForm, education: [...profileForm.education, { degree: '', institution: '', year: '' }] })} className="px-2.5 py-1 bg-muted hover:bg-muted/80 border border-foreground/10 rounded-md text-[10px] font-semibold cursor-pointer transition inline-flex items-center gap-1"><Plus size={12} /> Add</button>
          </div>
          {profileForm.education.map((edu, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <input type="text" value={edu.degree} onChange={(e) => { const next = [...profileForm.education]; next[i] = { ...next[i], degree: e.target.value }; setProfileForm({ ...profileForm, education: next }); }} placeholder="Degree" className="px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
              <input type="text" value={edu.institution} onChange={(e) => { const next = [...profileForm.education]; next[i] = { ...next[i], institution: e.target.value }; setProfileForm({ ...profileForm, education: next }); }} placeholder="Institution" className="px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
              <input type="text" value={edu.year} onChange={(e) => { const next = [...profileForm.education]; next[i] = { ...next[i], year: e.target.value }; setProfileForm({ ...profileForm, education: next }); }} placeholder="Year" className="px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
              <button type="button" onClick={() => setProfileForm({ ...profileForm, education: profileForm.education.filter((_, j) => j !== i) })} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg justify-self-start"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Experiences</label>
            <button type="button" onClick={() => setProfileForm({ ...profileForm, experiences: [...profileForm.experiences, { title: '', organization: '', duration: '', description: '' }] })} className="px-2.5 py-1 bg-muted hover:bg-muted/80 border border-foreground/10 rounded-md text-[10px] font-semibold cursor-pointer transition inline-flex items-center gap-1"><Plus size={12} /> Add</button>
          </div>
          {profileForm.experiences.map((exp, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <input type="text" value={exp.title} onChange={(e) => { const next = [...profileForm.experiences]; next[i] = { ...next[i], title: e.target.value }; setProfileForm({ ...profileForm, experiences: next }); }} placeholder="Title" className="px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
              <input type="text" value={exp.organization} onChange={(e) => { const next = [...profileForm.experiences]; next[i] = { ...next[i], organization: e.target.value }; setProfileForm({ ...profileForm, experiences: next }); }} placeholder="Organization" className="px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
              <input type="text" value={exp.duration} onChange={(e) => { const next = [...profileForm.experiences]; next[i] = { ...next[i], duration: e.target.value }; setProfileForm({ ...profileForm, experiences: next }); }} placeholder="Duration" className="px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
              <div className="flex gap-2 items-center">
                <input type="text" value={exp.description} onChange={(e) => { const next = [...profileForm.experiences]; next[i] = { ...next[i], description: e.target.value }; setProfileForm({ ...profileForm, experiences: next }); }} placeholder="Description" className="flex-1 px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
                <button type="button" onClick={() => setProfileForm({ ...profileForm, experiences: profileForm.experiences.filter((_, j) => j !== i) })} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Certifications</label>
            <button type="button" onClick={() => setProfileForm({ ...profileForm, certifications: [...profileForm.certifications, { name: '', issuer: '', year: '' }] })} className="px-2.5 py-1 bg-muted hover:bg-muted/80 border border-foreground/10 rounded-md text-[10px] font-semibold cursor-pointer transition inline-flex items-center gap-1"><Plus size={12} /> Add</button>
          </div>
          {profileForm.certifications.map((cert, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <input type="text" value={cert.name} onChange={(e) => { const next = [...profileForm.certifications]; next[i] = { ...next[i], name: e.target.value }; setProfileForm({ ...profileForm, certifications: next }); }} placeholder="Certification" className="px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
              <input type="text" value={cert.issuer} onChange={(e) => { const next = [...profileForm.certifications]; next[i] = { ...next[i], issuer: e.target.value }; setProfileForm({ ...profileForm, certifications: next }); }} placeholder="Issuer" className="px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
              <input type="text" value={cert.year} onChange={(e) => { const next = [...profileForm.certifications]; next[i] = { ...next[i], year: e.target.value }; setProfileForm({ ...profileForm, certifications: next }); }} placeholder="Year" className="px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
              <button type="button" onClick={() => setProfileForm({ ...profileForm, certifications: profileForm.certifications.filter((_, j) => j !== i) })} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg justify-self-start"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-foreground/10 flex justify-end">
          <button onClick={saveProfile} className="cta-button"><Check size={14} /> Save Profile</button>
        </div>
      </div>
    </div>
  );
}

function ListSection({
  title,
  placeholder,
  items,
  onAdd,
  onChange,
  onRemove,
}: {
  title: string;
  placeholder: string;
  items: string[];
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</label>
        <button type="button" onClick={onAdd} className="px-2.5 py-1 bg-muted hover:bg-muted/80 border border-foreground/10 rounded-md text-[10px] font-semibold cursor-pointer transition inline-flex items-center gap-1"><Plus size={12} /> Add</button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={item} onChange={(e) => onChange(i, e.target.value)} placeholder={placeholder} className="flex-1 px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition" />
            <button type="button" onClick={() => onRemove(i)} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

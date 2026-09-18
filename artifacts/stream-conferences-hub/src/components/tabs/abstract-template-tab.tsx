import { useEffect, useState } from 'react';
import { FileText, Upload, Download, Edit3, X } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { API_BASE } from '@/lib/constants';
import { mediaUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function AbstractTemplateTab() {
  const { user, abstractTemplate, loadAbstractTemplate, saveAbstractTemplate } = useAppStore();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(abstractTemplate?.title || 'Official Abstract Submission Template');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAbstractTemplate();
  }, []);

  useEffect(() => {
    if (abstractTemplate?.title) {
      setTitle(abstractTemplate.title);
    }
  }, [abstractTemplate]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !abstractTemplate) {
      toast({ title: 'Upload Required', description: 'Please select an abstract template file to upload.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      let fileUrl = abstractTemplate?.fileUrl || '';
      let fileName = abstractTemplate?.fileName || 'abstract-template.docx';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch(`${API_BASE}/uploads/upload`, {
          method: 'POST',
          headers: {
            'x-user-role': user?.role || '',
            'x-user-name': user?.username || '',
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || 'Failed to upload abstract template file');
        }

        const data = await uploadRes.json();
        fileUrl = data.url;
        fileName = file.name;
      }

      const success = await saveAbstractTemplate({ title, fileUrl, fileName });
      if (!success) {
        throw new Error('Failed to save abstract template details to backend');
      }

      setFile(null);
      setIsEditing(false);
      toast({ title: 'Template Saved', description: 'The official abstract template has been successfully updated.' });
    } catch (err: any) {
      console.error('Abstract template upload error:', err);
      toast({ title: 'Upload Error', description: err.message || 'Failed to save abstract template.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <FileText size={20} className="text-primary" /> Official Abstract Submission Template
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Upload the official abstract template available for attendees to download on the User Website.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* If template exists and user is not editing, show card only */}
        {abstractTemplate && !isEditing ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">{abstractTemplate.title}</h3>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{abstractTemplate.fileName || 'abstract-template.docx'}</p>
                  {abstractTemplate.updatedAt && (
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Updated {new Date(abstractTemplate.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <a
                  href={mediaUrl(abstractTemplate.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold flex items-center gap-2 transition shadow-2xs"
                >
                  <Download size={15} /> View / Download Template
                </a>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  <Edit3 size={15} /> Edit / Replace
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Show upload / edit form when no template exists OR when user clicks Edit/Replace */
          <form onSubmit={handleUpload} className="rounded-xl border border-foreground/10 bg-muted/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Upload size={16} className="text-primary" />
                {abstractTemplate ? 'Edit / Replace Abstract Submission Template' : 'Upload Abstract Submission Template'}
              </h3>
              {abstractTemplate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFile(null);
                  }}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Template Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Official Abstract Submission Template"
                  className="w-full px-3.5 py-2 bg-background border border-foreground/10 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Template Document File (.doc, .docx, .pdf)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {abstractTemplate && !file && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Current file: <span className="font-mono">{abstractTemplate.fileName || 'abstract-template.docx'}</span>. Leave blank to keep existing file.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {abstractTemplate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFile(null);
                  }}
                  className="px-4 py-2 bg-muted text-foreground text-xs font-semibold rounded-xl hover:bg-muted/80 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Upload size={14} />
                {uploading ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

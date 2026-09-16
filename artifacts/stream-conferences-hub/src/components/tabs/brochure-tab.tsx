import { useEffect, useState } from 'react';
import { FileText, Upload, Download, Edit3, X, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { API_BASE } from '@/lib/constants';
import { mediaUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function BrochureTab() {
  const { user, mainBrochure, loadMainBrochure, saveMainBrochure } = useAppStore();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(mainBrochure?.title || 'Official Conference Brochure');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMainBrochure();
  }, []);

  useEffect(() => {
    if (mainBrochure?.title) {
      setTitle(mainBrochure.title);
    }
  }, [mainBrochure]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !mainBrochure) {
      toast({ title: 'Upload Required', description: 'Please select a brochure file to upload.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      let fileUrl = mainBrochure?.fileUrl || '';
      let fileName = mainBrochure?.fileName || 'brochure.pdf';

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
          throw new Error(err.error || 'Failed to upload brochure file');
        }

        const data = await uploadRes.json();
        fileUrl = data.url;
        fileName = file.name;
      }

      const success = await saveMainBrochure({ title, fileUrl, fileName });
      if (!success) {
        throw new Error('Failed to save brochure details to backend');
      }

      setFile(null);
      setIsEditing(false);
      toast({ title: 'Brochure Saved', description: 'The website brochure has been successfully updated.' });
    } catch (err: any) {
      console.error('Brochure upload error:', err);
      toast({ title: 'Upload Error', description: err.message || 'Failed to save brochure.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <FileText size={20} className="text-primary" /> Official Portal Brochure
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Upload the single official brochure available for direct download on the User Website.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* If brochure exists and user is not editing, show card only */}
        {mainBrochure && !isEditing ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">{mainBrochure.title}</h3>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{mainBrochure.fileName || 'brochure.pdf'}</p>
                  {mainBrochure.updatedAt && (
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Updated {new Date(mainBrochure.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <a
                  href={mediaUrl(mainBrochure.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold flex items-center gap-2 transition shadow-2xs"
                >
                  <Download size={15} /> View Brochure
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
          /* Show upload / edit form when no brochure exists OR when user clicks Edit/Replace */
          <form onSubmit={handleUpload} className="rounded-xl border border-foreground/10 bg-muted/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Upload size={16} className="text-primary" />
                {mainBrochure ? 'Edit / Replace Website Brochure' : 'Upload Website Brochure'}
              </h3>
              {mainBrochure && (
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

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Brochure Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Official ICMLHS 2027 Conference Brochure"
                className="w-full px-3.5 py-2 rounded-lg border border-foreground/15 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                {mainBrochure ? 'Brochure File (Select file to replace existing document)' : 'Brochure Document File (PDF, DOCX)'}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-background text-xs cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                required={!mainBrochure}
              />
              {file && (
                <p className="text-xs text-primary font-medium mt-1.5 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
              {!file && mainBrochure && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current file: <span className="font-mono text-foreground font-medium">{mainBrochure.fileName || 'brochure.pdf'}</span> (leave empty to keep current file and only update title)
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Upload size={14} /> {mainBrochure ? 'Save & Replace' : 'Upload Brochure'}
                  </>
                )}
              </button>
              {mainBrochure && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFile(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-foreground/15 bg-background text-muted-foreground hover:text-foreground text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

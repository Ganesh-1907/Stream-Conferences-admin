import { useEffect, useState } from 'react';
import { FileText, Upload, Save, Check } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { API_BASE } from '@/lib/constants';
import { mediaUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { FileUploadCard } from '@/components/file-upload-card';

export function AbstractTemplateTab() {
  const { user, abstractTemplate, loadAbstractTemplate, saveAbstractTemplate } = useAppStore();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(abstractTemplate?.title || 'Official Abstract Submission Template');
  const [uploading, setUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadAbstractTemplate();
  }, []);

  useEffect(() => {
    if (abstractTemplate?.title) {
      setTitle(abstractTemplate.title);
    }
  }, [abstractTemplate]);

  const currentPreview = file
    ? URL.createObjectURL(file)
    : abstractTemplate?.fileUrl
    ? mediaUrl(abstractTemplate.fileUrl)
    : '';

  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleClearFile = async () => {
    if (abstractTemplate) {
      if (!window.confirm('Are you sure you want to remove the abstract submission template?')) return;
      setUploading(true);
      try {
        const res = await fetch(`${API_BASE}/abstract-template/main`, {
          method: 'DELETE',
          headers: {
            'x-user-role': user?.role || '',
            'x-user-name': user?.username || '',
          },
        });
        if (!res.ok) throw new Error('Failed to delete abstract template');
        await loadAbstractTemplate();
        setFile(null);
        toast({ title: 'Template Removed', description: 'The abstract template file has been removed.' });
      } catch (err: any) {
        toast({ title: 'Remove Error', description: err.message || 'Failed to remove template', variant: 'destructive' });
      } finally {
        setUploading(false);
      }
    } else {
      setFile(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !abstractTemplate?.fileUrl) {
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
        throw new Error('Failed to save abstract template details');
      }

      setFile(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      toast({ title: 'Template Saved', description: 'The official abstract template has been saved successfully.' });
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

      <form onSubmit={handleSave} className="rounded-2xl border border-foreground/10 bg-card p-6 space-y-6 shadow-xs">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Upload size={16} className="text-primary" /> Upload Abstract Submission Template
        </h3>

        <div className="space-y-4">
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
              className="w-full px-3.5 py-2.5 bg-background border border-foreground/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <FileUploadCard
              title="Template Document File (.doc, .docx, .pdf)"
              accept=".pdf,.doc,.docx"
              preview={currentPreview}
              onSelect={handleFileSelect}
              onClear={handleClearFile}
              loading={uploading}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <Check size={14} /> Saved successfully!
            </span>
          )}
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save size={14} />
            {uploading ? 'Saving Template...' : 'Save Template'}
          </button>
        </div>
      </form>
    </div>
  );
}

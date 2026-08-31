import { Check } from 'lucide-react';
import { FileUploadCard } from '@/components/file-upload-card';
import { useAppStore } from '@/store/app-store';

export function BlogFormModal() {
  const {
    showForm,
    editingItemId,
    editingItemType,
    closeForm,
    handleSaveItem,
    blogTitle,
    setBlogTitle,
    blogLabel,
    setBlogLabel,
    blogCopy,
    setBlogCopy,
    blogContent,
    setBlogContent,
    blogBannerUrl,
    setBlogBannerUrl,
    blogBannerPreview,
    setBlogBannerPreview,
    handleBlogBannerUpload,
  } = useAppStore();

  if (!showForm) return null;

  return (
    <div className="lightbox fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="lightbox-card w-[75%] bg-card border border-foreground/15 rounded-2xl shadow-2xl p-8 relative overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold tracking-tight capitalize">
            {editingItemId ? 'Edit' : 'Add New'} {editingItemType}
          </h2>
          <button
            onClick={closeForm}
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSaveItem} className="space-y-6">
          {editingItemType === 'blog' && (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title</label>
                <input
                  required
                  type="text"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. What happens when disciplines stop working in parallel?"
                  className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Banner Image</label>
                <FileUploadCard
                  title="Banner Image"
                  preview={blogBannerPreview || blogBannerUrl}
                  onSelect={(f) => handleBlogBannerUpload(f)}
                  onClear={() => { setBlogBannerPreview(''); setBlogBannerUrl(''); }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Label</label>
                <input
                  required
                  type="text"
                  value={blogLabel}
                  onChange={(e) => setBlogLabel(e.target.value)}
                  placeholder="e.g. FIELD NOTE · 08 MIN, PROCEEDINGS, JOURNAL"
                  className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Copy (Short Excerpt)</label>
                <input
                  required
                  type="text"
                  value={blogCopy}
                  onChange={(e) => setBlogCopy(e.target.value)}
                  placeholder="A short description summarizing the note..."
                  className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Full Content</label>
                <textarea
                  required
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  placeholder="Markdown or plain text content of the blog post..."
                  rows={8}
                  className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-foreground/10 flex justify-end gap-3">
            <button type="button" onClick={closeForm} className="ghost-button">
              Cancel
            </button>
            <button type="submit" className="cta-button">
              Save Changes <Check size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

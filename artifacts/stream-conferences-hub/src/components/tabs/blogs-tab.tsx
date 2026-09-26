import { Edit, Plus, Trash2, ArrowLeft, Check } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { FileUploadCard } from '@/components/file-upload-card';

export function BlogsTab() {
  const {
    blogs,
    openEditForm,
    handleDeleteItem,
    openAddForm,
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

  const { page, totalPages, totalItems, paginatedItems, setPage } = usePagination(blogs);

  // If user clicked "+ New Blog" or "Edit", render Full Page Form Editor
  if (showForm && editingItemType === 'blog') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Full Page Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-foreground/10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-foreground transition cursor-pointer"
              title="Back to Blogs list"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {editingItemId ? 'Edit Blog Post' : 'Add New Blog Post'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {editingItemId ? 'Update existing blog post details and content.' : 'Publish a new research article or announcement.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 rounded-xl border border-foreground/15 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="blog-editor-form"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <Check size={16} />
              <span>{editingItemId ? 'Save Changes' : 'Publish Blog'}</span>
            </button>
          </div>
        </div>

        {/* Full Page Editor Form Container */}
        <form id="blog-editor-form" onSubmit={handleSaveItem} className="bg-card border border-foreground/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Title *
            </label>
            <input
              required
              type="text"
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              placeholder="e.g. What happens when disciplines stop working in parallel?"
              className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl text-foreground text-sm font-semibold focus:outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Banner Image
            </label>
            <FileUploadCard
              title="Banner Image"
              preview={blogBannerPreview || blogBannerUrl}
              onSelect={(f) => handleBlogBannerUpload(f)}
              onClear={() => {
                setBlogBannerPreview('');
                setBlogBannerUrl('');
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Label / Category *
              </label>
              <input
                required
                type="text"
                value={blogLabel}
                onChange={(e) => setBlogLabel(e.target.value)}
                placeholder="e.g. FIELD NOTE · 08 MIN, PROCEEDINGS, JOURNAL"
                className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Copy (Short Excerpt) *
              </label>
              <input
                required
                type="text"
                value={blogCopy}
                onChange={(e) => setBlogCopy(e.target.value)}
                placeholder="A short summary description of the note..."
                className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Full Content *
            </label>
            <textarea
              required
              value={blogContent}
              onChange={(e) => setBlogContent(e.target.value)}
              placeholder="Write or paste full markdown/plain text content of the blog post..."
              rows={12}
              className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl text-foreground text-sm leading-relaxed focus:outline-none focus:border-primary transition"
            />
          </div>

          <div className="pt-4 border-t border-foreground/10 flex justify-between items-center">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 rounded-xl border border-foreground/15 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition cursor-pointer"
            >
              Back to Listing
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <Check size={16} />
              <span>{editingItemId ? 'Save Changes' : 'Publish Blog'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Default Listing Page View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Blog Publisher</h1>
          <p className="text-sm text-muted-foreground">Draft and edit research findings and notes.</p>
        </div>
        <button
          type="button"
          onClick={() => openAddForm('blog')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus size={16} />
          <span>New Blog</span>
        </button>
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-3.5">ID</th>
              <th className="p-3.5">Label</th>
              <th className="p-3.5">Title</th>
              <th className="p-3.5">Excerpt</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((blog) => (
              <tr key={blog._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0 text-sm">
                <td className="p-3.5 font-mono text-xs font-bold text-accent">{blog.eventId || '—'}</td>
                <td className="p-3.5 font-mono font-medium text-xs uppercase tracking-wider text-accent">{blog.label}</td>
                <td className="p-3.5 font-semibold text-sm">{blog.title}</td>
                <td className="p-3.5 text-xs text-muted-foreground max-w-xs truncate">{blog.copy}</td>
                <td className="p-3.5 text-right space-x-2">
                  <button onClick={() => openEditForm(blog, 'blog')} className="p-1.5 hover:text-secondary inline-block cursor-pointer" title="Edit Blog">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => handleDeleteItem(blog._id, 'blogs')} className="p-1.5 hover:text-red-500 inline-block cursor-pointer" title="Delete Blog">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {totalItems === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No blog posts written.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationBar page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
    </div>
  );
}

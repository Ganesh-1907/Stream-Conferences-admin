import { Edit, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationBar } from '@/components/ui/pagination-bar';

export function BlogsTab() {
  const { blogs, openEditForm, handleDeleteItem, openAddForm } = useAppStore();
  const { page, totalPages, totalItems, paginatedItems, setPage } = usePagination(blogs);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Blog Publisher</h1>
          <p className="text-sm text-muted-foreground">Draft and edit research findings and notes.</p>
        </div>
        <button onClick={() => openAddForm('blog')} className="cta-button">
          <Plus size={14} /> Write Blog Post
        </button>
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Label</th>
              <th className="p-4">Title</th>
              <th className="p-4">Excerpt</th>
              <th className="p-4">Publisher</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((blog) => (
              <tr key={blog._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 font-mono font-medium text-xs uppercase tracking-wider text-accent">{blog.label}</td>
                <td className="p-4 font-semibold">{blog.title}</td>
                <td className="p-4 text-xs text-muted-foreground max-w-xs truncate">{blog.copy}</td>
                <td className="p-4 text-xs font-semibold">{blog.announcedBy}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEditForm(blog, 'blog')} className="p-1 hover:text-secondary inline-block">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDeleteItem(blog._id, 'blogs')} className="p-1 hover:text-red-500 inline-block">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {totalItems === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No blog posts written.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationBar page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
    </div>
  );
}

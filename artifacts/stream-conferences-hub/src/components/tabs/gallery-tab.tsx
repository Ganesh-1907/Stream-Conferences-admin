import { useState } from 'react';
import { Check, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { FileUploadCard } from '@/components/file-upload-card';
import { useAppStore } from '@/store/app-store';
import { compressImage, mediaUrl } from '@/lib/utils';
import { API_BASE } from '@/lib/constants';

export function GalleryTab() {
  const { user, galleryItems, addGalleryItem, deleteGalleryItem } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = (file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result || ''));
    };
    reader.readAsDataURL(file);

    setUploading(true);
    (async () => {
      try {
        const compressed = await compressImage(file);
        const fd = new FormData();
        fd.append('file', compressed);
        const res = await fetch(`${API_BASE}/uploads/upload`, {
          method: 'POST',
          headers: {
            'x-user-role': user.role,
            'x-user-name': user.username,
          },
          body: fd,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setImage(data.url);
      } catch (err) {
        console.error('Image upload error:', err);
        alert('Failed to upload image');
      } finally {
        setUploading(false);
      }
    })();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    if (!image) {
      alert('Image is required');
      return;
    }
    setSubmitting(true);
    const success = await addGalleryItem(title.trim(), description.trim(), image);
    setSubmitting(false);
    if (success) {
      setTitle('');
      setDescription('');
      setImage('');
      setImagePreview('');
      setShowForm(false);
    } else {
      alert('Failed to save gallery item');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      await deleteGalleryItem(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gallery</h1>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="cta-button flex items-center gap-1.5 cursor-pointer">
            <Plus size={14} /> Add Image
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-muted/20 border border-foreground/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">New Gallery Item</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setTitle('');
                setDescription('');
                setImage('');
                setImagePreview('');
              }}
              className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Close
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Keynote Stage Session"
              className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Subtitle / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short caption or description..."
              rows={2}
              className="w-full px-4 py-2.5 bg-muted/20 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-secondary transition resize-none"
            />
          </div>
          <FileUploadCard
            title="Image *"
            preview={imagePreview || (image ? mediaUrl(image) : '')}
            onSelect={handleImageUpload}
            onClear={() => {
              setImage('');
              setImagePreview('');
            }}
          />
          {uploading && <div className="text-xs text-muted-foreground">Uploading image...</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={submitting || uploading}
              className="cta-button flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Check size={14} /> {submitting ? 'Saving...' : 'Save Gallery Image'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {galleryItems.map((item) => (
          <div key={item._id} className="bg-background border border-foreground/10 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between group">
            <div className="relative aspect-video bg-muted/20 overflow-hidden">
              {item.image ? (
                <img src={mediaUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground line-clamp-1">{item.title}</h4>
                {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
              </div>
              <div className="flex justify-end items-center mt-3 pt-2 border-t border-foreground/5">
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                  title="Delete image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {galleryItems.length === 0 && !showForm && (
          <div className="col-span-full border border-foreground/10 rounded-xl p-8 text-center text-muted-foreground">
            No gallery images added yet. Click &quot;Add Image&quot; to upload gallery images.
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { PreviewDialog } from "@/components/admin/PreviewDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Newspaper, Pencil, Trash2, Plus, X, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSection, createItem, updateItem, deleteItem, uploadImage } from "@/lib/api";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  image?: string | null;
  imagePublicId?: string | null;
  file?: File;
}

const generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export function LatestNewsSection() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    getSection("latest-news")
      .then((content) =>
        setItems(
          content.map((item) => ({
            id: item.id,
            title: item.title || "",
            summary: item.description || "",
            link: String(item.meta?.link || ""),
            image: item.imageUrl || null,
            imagePublicId: item.imagePublicId || null,
          }))
        )
      )
      .catch(() => toast.error("Unable to load latest news."));
  }, []);

  const openNew = () => {
    setEditing({ id: generateUUID(), title: "", summary: "", link: "", image: null });
    setIsNew(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditing({ ...item });
    setIsNew(false);
  };

  const save = async () => {
    if (!editing || !editing.title.trim() || !editing.summary.trim()) {
      toast.error("Title and summary are required");
      return;
    }

    let finalLink = editing.link.trim();
    if (finalLink) {
      if (!/^https?:\/\//i.test(finalLink)) {
        finalLink = `https://${finalLink}`;
      }
      if (!isValidUrl(finalLink)) {
        toast.error("Please enter a valid URL (starting with http:// or https://)");
        return;
      }
    }

    setSaving(true);
    try {
      let imageUrl = editing.image;
      let imagePublicId = editing.imagePublicId;

      if (editing.file) {
        const media = await uploadImage(editing.file);
        imageUrl = media.url;
        imagePublicId = media.publicId;
      }

      const payload = {
        id: editing.id,
        title: editing.title.trim(),
        description: editing.summary.trim(),
        imageUrl: imageUrl || null,
        imagePublicId: imagePublicId || null,
        meta: { link: finalLink },
      };

      if (isNew) {
        const created = await createItem("latest-news", payload);
        setItems((prev) => [
          ...prev,
          {
            id: created.id,
            title: created.title || "",
            summary: created.description || "",
            link: String(created.meta?.link || ""),
            image: created.imageUrl || null,
            imagePublicId: created.imagePublicId || null,
          },
        ]);
        toast.success("News item added!");
      } else {
        const updated = await updateItem("latest-news", editing.id, payload);
        setItems((prev) =>
          prev.map((item) =>
            item.id === editing.id
              ? {
                  id: updated.id,
                  title: updated.title || "",
                  summary: updated.description || "",
                  link: String(updated.meta?.link || ""),
                  image: updated.imageUrl || null,
                  imagePublicId: updated.imagePublicId || null,
                }
              : item
          )
        );
        toast.success("News item updated!");
      }
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save latest news.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (saving) return;
    setSaving(true);
    try {
      await deleteItem("latest-news", id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("News item deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete news item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      title="Latest News"
      description="Add, edit, and remove the latest news items shown on the site"
      icon={<Newspaper className="h-5 w-5" />}
    >
      <div className="flex flex-wrap gap-3 items-center">
        <Button onClick={openNew} disabled={saving} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add News Item
        </Button>
        <Button variant="outline" onClick={() => setPreviewOpen(true)} className="gap-1.5">
          <Eye className="h-4 w-4" /> Preview
        </Button>
      </div>

      {editing && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{isNew ? "New" : "Edit"} News Item</span>
            <button onClick={() => setEditing(null)} disabled={saving} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-w-lg">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="News title"
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5 max-w-lg">
            <label className="text-sm font-medium">Summary</label>
            <Textarea
              value={editing.summary}
              onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
              placeholder="Short summary of the news"
              rows={4}
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5 max-w-lg">
            <label className="text-sm font-medium">Link (optional)</label>
            <Input
              value={editing.link}
              onChange={(e) => setEditing({ ...editing, link: e.target.value })}
              placeholder="https://example.com"
              type="url"
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5 max-w-lg">
            <ImageUpload
              value={editing.image ?? null}
              onChange={(url, file) => setEditing({ ...editing, image: url, file })}
              label="Image (optional)"
              disabled={saving}
            />
          </div>

          <Button onClick={save} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      )}

      <PreviewDialog
        title="Latest News Preview"
        description="Preview how latest news items will appear on the frontend"
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      >
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No news items created yet. Add a news item to preview it.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl justify-items-center">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col w-full max-w-[340px] min-h-[382px] overflow-hidden rounded-[20px] bg-white border border-slate-200/60 shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all hover:translate-y-[-4px] text-slate-900 text-left">
                {item.image ? (
                  <div className="w-full h-[196px] overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-lg font-semibold text-slate-900 line-clamp-2 mb-2">{item.title}</p>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4">{item.summary}</p>
                  {item.link && (
                    <span className="mt-auto text-xs text-blue-600 truncate font-medium">
                      🔗 {item.link}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PreviewDialog>

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-background border border-border rounded-lg p-4 shadow-card hover:shadow-card-hover transition-shadow">
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-44 object-cover rounded-lg mb-4" />
              ) : null}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-foreground hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{item.summary}</p>
                  {item.link && (
                    <p className="text-xs text-slate-500 mt-1 truncate">{item.link}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} disabled={saving} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(item.id)} disabled={saving} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

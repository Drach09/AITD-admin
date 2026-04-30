import { useEffect, useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { PreviewDialog } from "@/components/admin/PreviewDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Newspaper, Pencil, Trash2, Plus, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { getSection, saveSection, uploadImage } from "@/lib/api";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  image?: string | null;
  imagePublicId?: string | null;
  file?: File;
}

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

  const persist = async (nextItems: NewsItem[]) => {
    if (saving) return;
    setSaving(true);
    try {
      const uploaded = await Promise.all(
        nextItems.map(async (item) => {
          if (!item.file) return item;
          const media = await uploadImage(item.file);
          return { ...item, image: media.url, imagePublicId: media.publicId, file: undefined };
        })
      );

      const saved = await saveSection(
        "latest-news",
        uploaded.map((item, index) => ({
          id: item.id,
          title: item.title,
          description: item.summary,
          imageUrl: item.image || null,
          imagePublicId: item.imagePublicId || null,
          sortOrder: index,
          meta: { link: item.link },
        }))
      );
      setItems(
        saved.map((item) => ({
          id: item.id,
          title: item.title || "",
          summary: item.description || "",
          link: String(item.meta?.link || ""),
          image: item.imageUrl || null,
          imagePublicId: item.imagePublicId || null,
        }))
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save latest news.");
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    setEditing({ id: crypto.randomUUID(), title: "", summary: "", link: "", image: null });
    setIsNew(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditing({ ...item });
    setIsNew(false);
  };

  const save = () => {
    if (!editing || !editing.title.trim() || !editing.summary.trim()) {
      toast.error("Title and summary are required");
      return;
    }

    if (isNew) {
      const nextItems = [...items, editing];
      setItems(nextItems);
      void persist(nextItems);
    } else {
      const nextItems = items.map((item) => (item.id === editing.id ? editing : item));
      setItems(nextItems);
      void persist(nextItems);
    }

    setEditing(null);
    toast.success(isNew ? "News item added!" : "News item updated!");
  };

  const remove = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id);
    setItems(nextItems);
    void persist(nextItems);
    toast.success("News item deleted");
  };

  return (
    <SectionCard
      title="Latest News"
      description="Add, edit, and remove the latest news items shown on the site"
      icon={<Newspaper className="h-5 w-5" />}
    >
      <div className="flex flex-wrap gap-3 items-center">
        <Button onClick={openNew} className="gap-1.5">
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
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-w-lg">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="News title"
            />
          </div>

          <div className="space-y-1.5 max-w-lg">
            <label className="text-sm font-medium">Summary</label>
            <Textarea
              value={editing.summary}
              onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
              placeholder="Short summary of the news"
              rows={4}
            />
          </div>

          <div className="space-y-1.5 max-w-lg">
            <label className="text-sm font-medium">Link (optional)</label>
            <Input
              value={editing.link}
              onChange={(e) => setEditing({ ...editing, link: e.target.value })}
              placeholder="https://example.com"
              type="url"
            />
          </div>

          <div className="space-y-1.5 max-w-lg">
            <ImageUpload
              value={editing.image ?? null}
              onChange={(url, file) => setEditing({ ...editing, image: url, file })}
              label="Image (optional)"
            />
          </div>

          <Button onClick={save}>Save</Button>
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
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-44 object-cover rounded-3xl mb-4" />
                ) : null}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.summary}</p>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-slate-900">
                      {item.link}
                    </a>
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
                      className="text-lg font-semibold text-foreground hover:text-slate-900 transition-colors"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  )}
                  <p className="text-sm text-slate-600 mt-2">{item.summary}</p>
                  {item.link && (
                    <p className="text-xs text-slate-500 mt-1 truncate">{item.link}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(item.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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

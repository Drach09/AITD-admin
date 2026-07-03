import { useEffect, useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { PreviewDialog } from "@/components/admin/PreviewDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, X, Quote, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSection, createItem, updateItem, deleteItem, uploadImage } from "@/lib/api";

interface Testimonial {
  id: string;
  name: string;
  text: string;
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

export function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    getSection("testimonials")
      .then((content) =>
        setItems(
          content.map((item) => ({
            id: item.id,
            name: item.title || "",
            text: item.description || "",
            image: item.imageUrl || null,
            imagePublicId: item.imagePublicId || null,
          }))
        )
      )
      .catch(() => toast.error("Unable to load testimonials."));
  }, []);

  const openNew = () => {
    setEditing({ id: generateUUID(), name: "", text: "", image: null });
    setIsNew(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditing({ ...item });
    setIsNew(false);
  };

  const save = async () => {
    if (!editing || !editing.name.trim() || !editing.text.trim()) {
      toast.error("All fields are required");
      return;
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
        title: editing.name.trim(),
        description: editing.text.trim(),
        imageUrl: imageUrl || null,
        imagePublicId: imagePublicId || null,
      };

      if (isNew) {
        const created = await createItem("testimonials", payload);
        setItems((prev) => [
          ...prev,
          {
            id: created.id,
            name: created.title || "",
            text: created.description || "",
            image: created.imageUrl || null,
            imagePublicId: created.imagePublicId || null,
          },
        ]);
        toast.success("Testimonial added!");
      } else {
        const updated = await updateItem("testimonials", editing.id, payload);
        setItems((prev) =>
          prev.map((item) =>
            item.id === editing.id
              ? {
                  id: updated.id,
                  name: updated.title || "",
                  text: updated.description || "",
                  image: updated.imageUrl || null,
                  imagePublicId: updated.imagePublicId || null,
                }
              : item
          )
        );
        toast.success("Testimonial updated!");
      }
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (saving) return;
    setSaving(true);
    try {
      await deleteItem("testimonials", id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Testimonial deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete testimonial.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Testimonials" description="Manage student testimonials">
      <div className="flex flex-wrap gap-3 items-center">
        <Button onClick={openNew} disabled={saving} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
        <Button variant="outline" onClick={() => setPreviewOpen(true)} className="gap-1.5">
          <Eye className="h-4 w-4" /> Preview
        </Button>
      </div>

      {editing && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{isNew ? "New" : "Edit"} Testimonial</span>
            <button onClick={() => setEditing(null)} disabled={saving} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <label className="text-sm font-medium">Student Name</label>
            <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Student name" disabled={saving} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Testimonial</label>
            <Textarea value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} placeholder="What the student said..." rows={3} disabled={saving} />
          </div>
          <div className="space-y-1.5">
            <ImageUpload
              value={editing.image ?? null}
              onChange={(url, file) => setEditing({ ...editing, image: url, file })}
              label="Student Image"
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
        title="Testimonials Preview"
        description="Preview testimonial cards as they will appear on the frontend"
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      >
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No testimonials yet. Add one to see the frontend preview.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 p-4 bg-slate-50 rounded-xl justify-items-center">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col w-full min-h-[220px] rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.06)] text-left">
                <div className="text-amber-500 text-sm mb-3">★★★★★</div>
                <p className="text-sm text-slate-700 italic flex-1 leading-relaxed mb-5">
                  "{item.text}"
                </p>
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-11 h-11 rounded-full object-cover border border-slate-100" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h4>
                    <span className="text-xs text-slate-500">AIEM Student</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PreviewDialog>

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-background border border-border rounded-lg p-4 shadow-card hover:shadow-card-hover transition-shadow">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4" />
              )}
              <Quote className="h-5 w-5 text-brand-orange mb-2" />
              <p className="text-sm text-foreground leading-relaxed mb-3">"{item.text}"</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">— {item.name}</span>
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

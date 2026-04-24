import { useEffect, useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, X, Quote } from "lucide-react";
import { toast } from "sonner";
import { getSection, saveSection, uploadImage } from "@/lib/api";

interface Testimonial {
  id: string;
  name: string;
  text: string;
  image?: string | null;
  imagePublicId?: string | null;
  file?: File;
}

export function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const persist = async (nextItems: Testimonial[]) => {
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
        "testimonials",
        uploaded.map((item, index) => ({
          id: item.id,
          title: item.name,
          description: item.text,
          imageUrl: item.image || null,
          imagePublicId: item.imagePublicId || null,
          sortOrder: index,
        }))
      );
      setItems(
        saved.map((item) => ({
          id: item.id,
          name: item.title || "",
          text: item.description || "",
          image: item.imageUrl || null,
          imagePublicId: item.imagePublicId || null,
        }))
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save testimonials.");
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => {
    setEditing({ id: crypto.randomUUID(), name: "", text: "", image: null });
    setIsNew(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditing({ ...item });
    setIsNew(false);
  };

  const save = () => {
    if (!editing || !editing.name.trim() || !editing.text.trim()) {
      toast.error("All fields are required");
      return;
    }
    if (isNew) {
      const nextItems = [...items, editing];
      setItems(nextItems);
      void persist(nextItems);
    } else {
      const nextItems = items.map((i) => (i.id === editing.id ? editing : i));
      setItems(nextItems);
      void persist(nextItems);
    }
    setEditing(null);
    toast.success(isNew ? "Testimonial added!" : "Testimonial updated!");
  };

  const remove = (id: string) => {
    const nextItems = items.filter((i) => i.id !== id);
    setItems(nextItems);
    void persist(nextItems);
    toast.success("Testimonial deleted");
  };

  return (
    <SectionCard title="Testimonials" description="Manage student testimonials">
      <Button onClick={openNew} className="gap-1.5">
        <Plus className="h-4 w-4" /> Add Testimonial
      </Button>

      {editing && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{isNew ? "New" : "Edit"} Testimonial</span>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <label className="text-sm font-medium">Student Name</label>
            <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Student name" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Testimonial</label>
            <Textarea value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} placeholder="What the student said..." rows={3} />
          </div>
          <div className="space-y-1.5">
            <ImageUpload
              value={editing.image ?? null}
              onChange={(url, file) => setEditing({ ...editing, image: url, file })}
              label="Student Image"
            />
          </div>
          <Button onClick={save}>Save</Button>
        </div>
      )}

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

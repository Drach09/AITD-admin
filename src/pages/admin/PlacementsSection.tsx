import { useEffect, useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { getSection, saveSection, uploadImage } from "@/lib/api";

interface PlacementItem {
  id: string;
  name: string;
  role: string;
  company: string;
  specialization: string;
  batch: string;
  preview: string | null;
  file?: File;
  imageFileName?: string;
}

export function PlacementsSection() {
  const [items, setItems] = useState<PlacementItem[]>([]);
  const [editing, setEditing] = useState<PlacementItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const persistPlacements = async (nextItems: PlacementItem[]) => {
    if (saving) return;
    setSaving(true);

    try {
      const payloadItems = await Promise.all(
        nextItems.map(async (item) => {
          const payloadItem: any = {
            id: item.id,
            title: item.name,
            subtitle: item.role,
            imageUrl: item.preview || null,
            imagePublicId: item.imageFileName || null,
            meta: {
              company: item.company,
              specialization: item.specialization,
              batch: item.batch,
            },
          };

          if (item.file) {
            const media = await uploadImage(item.file);
            payloadItem.imageUrl = media.url;
            payloadItem.imagePublicId = media.publicId;
          }

          return payloadItem;
        })
      );

      const savedItems = await saveSection("placements", payloadItems);
      setItems(
        savedItems.map((item: any) => ({
          id: item.id,
          name: item.title ?? "",
          role: item.subtitle ?? "",
          company: item.meta?.company ?? "",
          specialization: item.meta?.specialization ?? "",
          batch: item.meta?.batch ?? "",
          preview: item.imageUrl ?? "",
          imageFileName: item.imagePublicId,
        }))
      );

      toast.success("Placements saved!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save placements.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    getSection("placements")
      .then((data) => {
        setItems(
          data.map((item: any) => ({
            id: item.id,
            name: item.title ?? "",
            role: item.subtitle ?? "",
            company: item.meta?.company ?? "",
            specialization: item.meta?.specialization ?? "",
            batch: item.meta?.batch ?? "",
            preview: item.imageUrl ?? null,
            imageFileName: item.imagePublicId ?? undefined,
          }))
        );
      })
      .catch(() => {
        // ignore initial load errors
      });
  }, []);

  const openNew = () => {
    setEditing({
      id: crypto.randomUUID(),
      name: "",
      role: "",
      company: "",
      specialization: "",
      batch: "",
      preview: "",
    });
    setIsNew(true);
  };

  const openEdit = (item: PlacementItem) => {
    setEditing({ ...item });
    setIsNew(false);
  };

  const saveItem = () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.role.trim() || !editing.company.trim()) {
      toast.error("Name, role, and company are required.");
      return;
    }

    if (isNew) {
      const nextItems = [...items, editing];
      setItems(nextItems);
      void persistPlacements(nextItems);
      toast.success("Placement item added!");
    } else {
      const nextItems = items.map((item) => (item.id === editing.id ? editing : item));
      setItems(nextItems);
      void persistPlacements(nextItems);
      toast.success("Placement item updated!");
    }
    setEditing(null);
  };

  const removeItem = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id);
    setItems(nextItems);
    void persistPlacements(nextItems);
    toast.success("Placement item removed");
  };

  const savePlacements = async () => {
    await persistPlacements(items);
  };

  return (
    <SectionCard title="Placements" description="Manage placement records for the website" icon={<ImageIcon className="h-5 w-5" />}>
      <div className="flex flex-wrap gap-3 items-center">
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Placement
        </Button>
        <Button onClick={savePlacements} disabled={saving} variant="secondary">
          {saving ? "Saving..." : "Save Placements"}
        </Button>
      </div>

      {editing && (
        <div className="bg-muted/50 rounded-lg p-4 mt-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">{isNew ? "New" : "Edit"} Placement</span>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Student or alumnus name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                placeholder="Marketing Executive"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input
                value={editing.company}
                onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                placeholder="JW Marriott"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialization</label>
              <Input
                value={editing.specialization}
                onChange={(e) => setEditing({ ...editing, specialization: e.target.value })}
                placeholder="MBA (Operations)"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Batch / Year</label>
              <Input
                value={editing.batch}
                onChange={(e) => setEditing({ ...editing, batch: e.target.value })}
                placeholder="2023-25"
              />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                value={editing.preview || null}
                onChange={(preview, file) => setEditing({ ...editing, preview, file })}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={saveItem} className="gap-1.5">
              <Pencil className="h-4 w-4" /> Save Item
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {items.map((item) => (
            <div key={item.id} className="bg-background border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
              {item.preview ? (
                <img src={item.preview} alt={item.name} className="w-full h-52 object-cover" />
              ) : (
                <div className="w-full h-52 bg-slate-100 flex items-center justify-center text-slate-500">
                  No image
                </div>
              )}
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">{item.role}</span>
                  {item.company && ", "}
                  <span className="text-slate-700">{item.company}</span>
                </p>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 space-y-1">
                  <p>{item.specialization ? `Specialization: ${item.specialization}` : "Specialization: -"}</p>
                  <p>{item.batch ? item.batch : "Batch: -"}</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 mt-6">No placements added yet. Click &quot;Add Placement&quot; to create a new record.</p>
      )}
    </SectionCard>
  );
}

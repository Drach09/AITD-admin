import { useEffect, useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { PreviewDialog } from "@/components/admin/PreviewDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, X, Eye, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSection, createItem, updateItem, deleteItem, uploadImage } from "@/lib/api";

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

export function PlacementsSection() {
  const [items, setItems] = useState<PlacementItem[]>([]);
  const [editing, setEditing] = useState<PlacementItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    getSection("placements")
      .then((data) => {
        setItems(
          data.map((item) => ({
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
      id: generateUUID(),
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

  const saveItem = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.role.trim() || !editing.company.trim()) {
      toast.error("Name, role, and company are required.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = editing.preview;
      let imagePublicId = editing.imageFileName;

      if (editing.file) {
        const media = await uploadImage(editing.file);
        imageUrl = media.url;
        imagePublicId = media.publicId;
      }

      const payload = {
        id: editing.id,
        title: editing.name.trim(),
        subtitle: editing.role.trim(),
        imageUrl: imageUrl || null,
        imagePublicId: imagePublicId || null,
        meta: {
          company: editing.company.trim(),
          specialization: editing.specialization.trim(),
          batch: editing.batch.trim(),
        },
      };

      if (isNew) {
        const created = await createItem("placements", payload);
        setItems((prev) => [
          ...prev,
          {
            id: created.id,
            name: created.title || "",
            role: created.subtitle || "",
            company: created.meta?.company || "",
            specialization: created.meta?.specialization || "",
            batch: created.meta?.batch || "",
            preview: created.imageUrl || null,
            imageFileName: created.imagePublicId || undefined,
          },
        ]);
        toast.success("Placement item added!");
      } else {
        const updated = await updateItem("placements", editing.id, payload);
        setItems((prev) =>
          prev.map((item) =>
            item.id === editing.id
              ? {
                  id: updated.id,
                  name: updated.title || "",
                  role: updated.subtitle || "",
                  company: updated.meta?.company || "",
                  specialization: updated.meta?.specialization || "",
                  batch: updated.meta?.batch || "",
                  preview: updated.imageUrl || null,
                  imageFileName: updated.imagePublicId || undefined,
                }
              : item
          )
        );
        toast.success("Placement item updated!");
      }
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save placement.");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id: string) => {
    if (saving) return;
    setSaving(true);
    try {
      await deleteItem("placements", id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Placement item removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete placement.");
    } finally {
      setSaving(false);
    }
  };

  const savePlacements = () => {
    toast.success("All placements are up to date!");
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
        <Button variant="outline" onClick={() => setPreviewOpen(true)} className="gap-1.5">
          <Eye className="h-4 w-4" /> Preview
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
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                placeholder="Marketing Executive"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input
                value={editing.company}
                onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                placeholder="JW Marriott"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialization</label>
              <Input
                value={editing.specialization}
                onChange={(e) => setEditing({ ...editing, specialization: e.target.value })}
                placeholder="MBA (Operations)"
                disabled={saving}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Batch / Year</label>
              <Input
                value={editing.batch}
                onChange={(e) => setEditing({ ...editing, batch: e.target.value })}
                placeholder="2023-25"
                disabled={saving}
              />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                value={editing.preview || null}
                onChange={(preview, file) => setEditing({ ...editing, preview, file })}
                disabled={saving}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={saveItem} disabled={saving} className="gap-1.5">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" /> Save Item
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
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
                <div className="w-full h-52 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  No image
                </div>
              )}
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{item.role}</span>
                  {item.company && ", "}
                  <span className="text-slate-700 dark:text-slate-300">{item.company}</span>
                </p>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <p>{item.specialization ? `Specialization: ${item.specialization}` : "Specialization: -"}</p>
                  <p>{item.batch ? item.batch : "Batch: -"}</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => openEdit(item)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors disabled:opacity-50 text-sm"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors disabled:opacity-50 text-sm"
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

      <PreviewDialog
        title="Placements Preview"
        description="Preview placement entries as they will appear on the frontend"
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      >
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No placement records available yet. Add a placement to preview it.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4 bg-slate-50 rounded-xl justify-items-center">
            {items.map((item) => (
              <div key={item.id} className="w-[232px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)] p-3 text-left">
                {item.preview ? (
                  <img src={item.preview} alt={item.name} className="w-full h-[180px] object-cover rounded-xl mb-3" />
                ) : (
                  <div className="w-full h-[180px] bg-slate-100 flex items-center justify-center text-slate-400 text-sm rounded-xl mb-3">
                    No image
                  </div>
                )}
                <div className="text-[12px] text-slate-500 font-medium tracking-wide mb-1 uppercase">{item.name}</div>
                <hr className="border-t border-slate-100 my-2" />
                <div className="text-sm font-semibold text-slate-900 leading-snug">
                  {item.role}{item.company ? ", " : ""}
                  {item.company && <span className="font-extrabold text-slate-950">{item.company}</span>}
                </div>
                {(item.specialization || item.batch) && (
                  <div className="text-xs text-slate-600 mt-2 font-normal">
                    Specialization: <strong className="font-semibold text-slate-800">{[item.specialization, item.batch].filter(Boolean).join(" ")}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </PreviewDialog>
    </SectionCard>
  );
}

import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Pencil, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface FacultyItem {
  id: string;
  name: string;
  title: string;
  department: string;
  experience: string;
  image?: string | null;
}

export function FacultySection() {
  const [items, setItems] = useState<FacultyItem[]>([]);
  const [editing, setEditing] = useState<FacultyItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => {
    setEditing({ id: crypto.randomUUID(), name: "", title: "", department: "", experience: "", image: null });
    setIsNew(true);
  };

  const openEdit = (item: FacultyItem) => {
    setEditing({ ...item });
    setIsNew(false);
  };

  const save = () => {
    if (!editing || !editing.name.trim() || !editing.title.trim() || !editing.experience.trim()) {
      toast.error("Name, title, and experience are required.");
      return;
    }

    if (isNaN(Number(editing.experience)) || Number(editing.experience) < 0) {
      toast.error("Experience must be a valid number.");
      return;
    }

    if (isNew) {
      setItems([...items, editing]);
      toast.success("Faculty member added!");
    } else {
      setItems(items.map((item) => (item.id === editing.id ? editing : item)));
      toast.success("Faculty member updated!");
    }

    setEditing(null);
  };

  const remove = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success("Faculty member deleted");
  };

  return (
    <SectionCard
      title="Faculty"
      description="Add, edit, and remove faculty profiles"
      icon={<User className="h-5 w-5" />}
    >
      <Button onClick={openNew} className="gap-1.5">
        <Plus className="h-4 w-4" /> Add Faculty
      </Button>

      {editing && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4 border border-border mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{isNew ? "New" : "Edit"} Faculty Profile</span>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Mr. Frazer Rodrigues"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Designation</label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Assistant Professor"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input
                value={editing.department}
                onChange={(e) => setEditing({ ...editing, department: e.target.value })}
                placeholder="Department of Management Studies"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Experience (years)</label>
              <Input
                value={editing.experience}
                onChange={(e) => setEditing({ ...editing, experience: e.target.value })}
                placeholder="10+"
              />
            </div>

            <div className="lg:col-span-2">
              <ImageUpload
                value={editing.image ?? null}
                onChange={(url) => setEditing({ ...editing, image: url })}
                label="Faculty Photo"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={save} className="gap-2">
              <Pencil className="h-4 w-4" /> Save
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
            <div key={item.id} className="bg-background border border-border rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 bg-slate-100 flex items-center justify-center text-slate-500">
                  No photo uploaded
                </div>
              )}
              <div className="p-5 space-y-3">
                <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm font-medium text-slate-600">{item.title}</p>
                <p className="text-sm text-slate-500">{item.department || "Department not set"}</p>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 flex items-center justify-between">
                  <span>Experience</span>
                  <span className="font-semibold">{item.experience} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => remove(item.id)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 mt-6">No faculty added yet. Click "Add Faculty" to create a new profile.</p>
      )}
    </SectionCard>
  );
}

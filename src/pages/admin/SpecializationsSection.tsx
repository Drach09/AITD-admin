import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Specialization {
  id: string;
  name: string;
  description: string;
  image: string | null;
}

export function SpecializationsSection() {
  const [items, setItems] = useState<Specialization[]>([]);
  const [editing, setEditing] = useState<Specialization | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => {
    setEditing({ id: crypto.randomUUID(), name: "", description: "", image: null });
    setIsNew(true);
  };

  const openEdit = (item: Specialization) => {
    setEditing({ ...item });
    setIsNew(false);
  };

  const save = () => {
    if (!editing || !editing.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (isNew) {
      setItems([...items, editing]);
    } else {
      setItems(items.map((i) => (i.id === editing.id ? editing : i)));
    }
    setEditing(null);
    toast.success(isNew ? "Specialization added!" : "Specialization updated!");
  };

  const remove = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    toast.success("Specialization deleted");
  };

  return (
    <SectionCard title="Specializations" description="Manage the specializations offered">
      <Button onClick={openNew} className="gap-1.5">
        <Plus className="h-4 w-4" /> Add Specialization
      </Button>

      {editing && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{isNew ? "New" : "Edit"} Specialization</span>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <label className="text-sm font-medium">Name</label>
            <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Specialization name" />
          </div>
          <ImageUpload value={editing.image} onChange={(img) => setEditing({ ...editing, image: img })} />
          <Button onClick={save}>Save</Button>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-background border border-border rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
              {item.image && <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />}
              <div className="p-3 flex items-center justify-between">
                <span className="font-medium text-sm">{item.name}</span>
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

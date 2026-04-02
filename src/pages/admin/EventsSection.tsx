import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function EventsSection() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const handleSave = () => {
    toast.success("Event saved successfully!");
  };

  return (
    <SectionCard title="Events" description="Manage the events section on your homepage">
      <div className="space-y-4 max-w-lg">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event description" rows={4} />
        </div>
        <ImageUpload value={image} onChange={setImage} />
        <Button onClick={handleSave}>Save Event</Button>
      </div>
    </SectionCard>
  );
}

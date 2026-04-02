import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function HodSection() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);

  return (
    <SectionCard title="Head of Department" description="Manage HOD information displayed on the homepage">
      <div className="space-y-4 max-w-lg">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="HOD name" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" rows={4} />
        </div>
        <ImageUpload value={image} onChange={setImage} />
        <Button onClick={() => toast.success("HOD information saved!")}>Save</Button>
      </div>
    </SectionCard>
  );
}

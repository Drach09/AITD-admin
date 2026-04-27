import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { PreviewDialog } from "@/components/admin/PreviewDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { toast } from "sonner";

export function HodSection() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <SectionCard title="Head of Department" description="Manage HOD information displayed on the homepage">
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <Button onClick={() => setPreviewOpen(true)} variant="outline" className="gap-1.5">
          <Eye className="h-4 w-4" /> Preview
        </Button>
      </div>
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

      <PreviewDialog
        title="Head of Department Preview"
        description="Preview the HOD profile as it will appear on the frontend"
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm max-w-2xl mx-auto">
          {image ? (
            <img src={image} alt={name} className="w-full h-72 object-cover rounded-3xl mb-4" />
          ) : (
            <div className="w-full h-72 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
              No profile image uploaded
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-slate-900">{name || "HOD Name"}</h3>
            <p className="text-sm text-slate-600">{description || "HOD description will appear here."}</p>
          </div>
        </div>
      </PreviewDialog>
    </SectionCard>
  );
}

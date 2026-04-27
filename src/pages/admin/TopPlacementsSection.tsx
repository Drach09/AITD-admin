import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { PreviewDialog } from "@/components/admin/PreviewDialog";
import { MultiImageUpload, type UploadImageItem } from "@/components/admin/MultiImageUpload";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { toast } from "sonner";

export function TopPlacementsSection() {
  const [images, setImages] = useState<UploadImageItem[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <SectionCard title="Top 2 Placements" description="Upload exactly 2 images for top placements. New uploads replace existing ones.">
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <Button variant="outline" onClick={() => setPreviewOpen(true)} className="gap-1.5">
          <Eye className="h-4 w-4" /> Preview
        </Button>
      </div>
      <MultiImageUpload images={images} onChange={setImages} max={2} />
      <Button onClick={() => toast.success("Top placements saved!")}>Save</Button>

      <PreviewDialog
        title="Top Placements Preview"
        description="Preview the top placement images as they will appear on the homepage"
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      >
        {images.length === 0 ? (
          <p className="text-sm text-slate-500">No placement images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {images.map((imageItem, index) => (
              <div key={index} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <img src={imageItem.preview} alt={`Placement ${index + 1}`} className="w-full h-64 object-cover" />
              </div>
            ))}
          </div>
        )}
      </PreviewDialog>
    </SectionCard>
  );
}

import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TopPlacementsSection() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <SectionCard title="Top 2 Placements" description="Upload exactly 2 images for top placements. New uploads replace existing ones.">
      <MultiImageUpload images={images} onChange={setImages} max={2} />
      <Button onClick={() => toast.success("Top placements saved!")}>Save</Button>
    </SectionCard>
  );
}

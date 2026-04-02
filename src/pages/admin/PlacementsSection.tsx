import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PlacementsSection() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <SectionCard title="Placements" description="Upload placement company logos and images">
      <MultiImageUpload images={images} onChange={setImages} />
      <Button onClick={() => toast.success("Placements saved!")}>Save Placements</Button>
    </SectionCard>
  );
}

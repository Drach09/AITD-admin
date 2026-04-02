import React, { useRef } from "react";
import { Upload, X } from "lucide-react";

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  label?: string;
}

export function MultiImageUpload({ images, onChange, max, label = "Upload Images" }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    if (max) {
      const newImages = [...images, ...urls].slice(-max);
      onChange(newImages);
    } else {
      onChange([...images, ...urls]);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const canAdd = !max || images.length < max;

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <img src={img} alt={`Upload ${i + 1}`} className="w-full h-32 object-cover rounded-lg border border-border" />
            <button
              onClick={() => remove(i)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {canAdd && (
          <button
            onClick={() => inputRef.current?.click()}
            className="h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
          >
            <Upload className="h-6 w-6" />
            <span className="text-xs">Add Image</span>
          </button>
        )}
      </div>
      {max && <p className="text-xs text-muted-foreground">{images.length}/{max} images</p>}
    </div>
  );
}

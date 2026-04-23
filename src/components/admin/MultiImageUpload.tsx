import React, { useRef } from "react";
import { Upload, X } from "lucide-react";

export interface UploadImageItem {
  id: string;
  preview: string;
  file?: File;
  slot?: number;
}

interface MultiImageUploadProps {
  images: UploadImageItem[];
  onChange: (images: UploadImageItem[]) => void;
  max?: number;
  label?: string;
}

export function MultiImageUpload({ images, onChange, max, label = "Upload Images" }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [replaceIndex, setReplaceIndex] = React.useState<number | null>(null);
  const replaceRef = useRef<HTMLInputElement>(null);

  const createItem = (file: File) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    preview: URL.createObjectURL(file),
    file,
  });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const items = files.map(createItem);
    const newImages = max ? [...images, ...items].slice(0, max) : [...images, ...items];
    onChange(newImages);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && replaceIndex !== null) {
      const url = URL.createObjectURL(file);
      const newImages = [...images];
      newImages[replaceIndex] = { id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`, preview: url, file };
      onChange(newImages);
      setReplaceIndex(null);
    }
    if (replaceRef.current) replaceRef.current.value = "";
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const canAdd = !max || images.length < max;

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <input ref={replaceRef} type="file" accept="image/*" className="hidden" onChange={handleReplace} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div key={img.id} className="relative group">
            <img src={img.preview} alt={`Upload ${i + 1}`} className="w-full h-32 object-cover rounded-lg border border-border" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setReplaceIndex(i);
                  replaceRef.current?.click();
                }}
                className="px-2 py-1 text-xs font-semibold rounded bg-brand-sky/80 text-brand-white"
              >
                Edit
              </button>
              <button
                onClick={() => remove(i)}
                className="px-2 py-1 text-xs font-semibold rounded bg-brand-maroon/90 text-brand-white"
              >
                Delete
              </button>
            </div>
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

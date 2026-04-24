const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ContentItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  sortOrder?: number;
  meta?: Record<string, unknown>;
}

export async function getSection(section: string): Promise<ContentItem[]> {
  const response = await fetch(`${API_BASE_URL}/content/${section}`);
  if (!response.ok) {
    throw new Error("Failed to load data.");
  }
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function saveSection(section: string, items: ContentItem[]): Promise<ContentItem[]> {
  const response = await fetch(`${API_BASE_URL}/content/${section}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to save data.");
  }
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function uploadImage(file: File): Promise<{ url: string; publicId: string }> {
  const form = new FormData();
  form.append("image", file);

  const response = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Image upload failed.");
  }

  return response.json();
}

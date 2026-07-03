import { useEffect, useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { PreviewDialog } from "@/components/admin/PreviewDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Save, Eye, X, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSection, createItem, updateItem, deleteItem, uploadImage } from "@/lib/api";

const generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

type EventStatus = "upcoming" | "completed";

interface EventItem {
  id: string;
  title: string;
  description: string;
  detailDescription: string;
  date: string;
  location: string;
  status: EventStatus;
  image?: string | null;
  imagePublicId?: string | null;
  file?: File;
  galleryImages: string[];
  galleryPublicIds: string[];
  galleryFiles?: File[];
}

function parseEventStatus(value: unknown, fallback: EventStatus = "upcoming"): EventStatus {
  return value === "completed" || value === "upcoming" ? value : fallback;
}

export function EventsSection() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<EventStatus>("upcoming");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<EventItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    getSection("events")
      .then((content) =>
        setItems(
          content.map((item) => ({
            id: item.id,
            title: item.title || "",
            description: item.description || "",
            detailDescription: String(item.meta?.detailDescription || ""),
            date: String(item.meta?.date || ""),
            location: String(item.meta?.location || ""),
            status: parseEventStatus((item.meta as Record<string, unknown> | undefined)?.status),
            image: item.imageUrl || null,
            imagePublicId: item.imagePublicId || null,
            galleryImages: Array.isArray(item.meta?.galleryImages)
              ? item.meta.galleryImages.map((value) => String(value))
              : [],
            galleryPublicIds: Array.isArray(item.meta?.galleryPublicIds)
              ? item.meta.galleryPublicIds.map((value) => String(value))
              : [],
          }))
        )
      )
      .catch(() => {
        toast.error("Unable to load events.");
      });
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !date.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const existing = editingId ? items.find((item) => item.id === editingId) : undefined;

      let finalImage = image;
      let finalImagePublicId = existing?.imagePublicId || null;
      if (imageFile) {
        const media = await uploadImage(imageFile);
        finalImage = media.url;
        finalImagePublicId = media.publicId;
      }

      let finalGalleryImages = galleryPreviews;
      let finalGalleryPublicIds = existing?.galleryPublicIds || [];
      if (galleryFiles.length) {
        const uploaded = await Promise.all(galleryFiles.map((file) => uploadImage(file)));
        finalGalleryImages = uploaded.map((img) => img.url);
        finalGalleryPublicIds = uploaded.map((img) => img.publicId);
      }

      const payload = {
        id: editingId || generateUUID(),
        title: title.trim(),
        description: description.trim(),
        imageUrl: finalImage || null,
        imagePublicId: finalImagePublicId || null,
        meta: {
          date,
          location: location.trim(),
          status,
          detailDescription: detailDescription.trim() || description.trim(),
          galleryImages: finalGalleryImages,
          galleryPublicIds: finalGalleryPublicIds,
        },
      };

      if (editingId) {
        const updated = await updateItem("events", editingId, payload);
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  id: updated.id,
                  title: updated.title || "",
                  description: updated.description || "",
                  detailDescription: String(updated.meta?.detailDescription || ""),
                  date: String(updated.meta?.date || ""),
                  location: String(updated.meta?.location || ""),
                  status: parseEventStatus(updated.meta?.status),
                  image: updated.imageUrl || null,
                  imagePublicId: updated.imagePublicId || null,
                  galleryImages: Array.isArray(updated.meta?.galleryImages) ? updated.meta.galleryImages.map(String) : [],
                  galleryPublicIds: Array.isArray(updated.meta?.galleryPublicIds) ? updated.meta.galleryPublicIds.map(String) : [],
                }
              : item
          )
        );
        toast.success("Event updated successfully!");
      } else {
        const created = await createItem("events", payload);
        const newEvent: EventItem = {
          id: created.id,
          title: created.title || "",
          description: created.description || "",
          detailDescription: String(created.meta?.detailDescription || ""),
          date: String(created.meta?.date || ""),
          location: String(created.meta?.location || ""),
          status: parseEventStatus(created.meta?.status),
          image: created.imageUrl || null,
          imagePublicId: created.imagePublicId || null,
          galleryImages: Array.isArray(created.meta?.galleryImages) ? created.meta.galleryImages.map(String) : [],
          galleryPublicIds: Array.isArray(created.meta?.galleryPublicIds) ? created.meta.galleryPublicIds.map(String) : [],
        };
        setItems((prev) => [newEvent, ...prev]);
        toast.success("Event added successfully!");
      }

      setTitle("");
      setDescription("");
      setDetailDescription("");
      setDate("");
      setLocation("");
      setStatus("upcoming");
      setImage(null);
      setImageFile(undefined);
      setGalleryFiles([]);
      setGalleryPreviews([]);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save event.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (saving) return;
    setSaving(true);
    try {
      await deleteItem("events", id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Event deleted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete event.");
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setTitle("");
    setDescription("");
    setDetailDescription("");
    setDate("");
    setLocation("");
    setStatus("upcoming");
    setImage(null);
    setImageFile(undefined);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item: EventItem) => {
    setTitle(item.title);
    setDescription(item.description);
    setDetailDescription(item.detailDescription || "");
    setDate(item.date);
    setLocation(item.location);
    setStatus(item.status);
    setImage(item.image || null);
    setImageFile(undefined);
    setGalleryFiles([]);
    setGalleryPreviews(item.galleryImages || []);
    setEditingId(item.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Events Management"
        description="Create and manage events displayed on your homepage"
        icon={<Calendar className="h-5 w-5" />}
      >
        <div className="flex flex-wrap gap-3 items-center">
          <Button onClick={openCreate} disabled={saving} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Event
          </Button>
          <Button variant="outline" onClick={() => setPreviewOpen(true)} className="gap-1.5">
            <Eye className="h-4 w-4" /> Preview
          </Button>
        </div>

        {showForm && (
          <div className="bg-muted/50 rounded-lg p-4 mt-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold">{editingId ? "Edit Event" : "New Event"}</span>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                disabled={saving}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter event title"
                    disabled={saving}
                    className="border-slate-200 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Event Date</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={saving}
                    className="border-slate-200 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Event location"
                    disabled={saving}
                    className="border-slate-200 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Event Status
                  </label>
                  <Select value={status} onValueChange={(value: EventStatus) => setStatus(value)} disabled={saving}>
                    <SelectTrigger className="border-slate-200 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      <SelectValue placeholder="Select event status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the event in detail"
                    rows={6}
                    disabled={saving}
                    className="border-slate-200 focus:border-slate-900 focus:ring-slate-900 resize-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Detail Page Description
                  </label>
                  <Textarea
                    value={detailDescription}
                    onChange={(e) => setDetailDescription(e.target.value)}
                    placeholder="Detailed event description for the event page"
                    rows={7}
                    disabled={saving}
                    className="border-slate-200 focus:border-slate-900 focus:ring-slate-900 resize-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Event Image</label>
                <ImageUpload
                  value={image}
                  onChange={(preview, file) => {
                    setImage(preview);
                    setImageFile(file);
                  }}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Detail Page Gallery Images (multiple)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={saving}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const previews = files.map((file) => URL.createObjectURL(file));
                    setGalleryFiles(files);
                    setGalleryPreviews(previews);
                  }}
                  className="border-slate-200 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                {galleryPreviews.length ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {galleryPreviews.map((preview) => (
                      <img key={preview} src={preview} alt="Gallery preview" className="h-24 w-full rounded-lg object-cover border border-slate-200" />
                    ))}
                  </div>
                ) : null}
                {editingId && galleryPreviews.length ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={() => {
                      setGalleryFiles([]);
                      setGalleryPreviews([]);
                    }}
                    className="border-slate-300 hover:bg-slate-100"
                  >
                    Clear Gallery
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-md animate-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? "Update Event" : "Save Event"}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setPreviewOpen(true)} disabled={saving} className="border-slate-700/50 hover:bg-slate-900/10 text-slate-900 dark:text-slate-100">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Recent Events */}
      <SectionCard
        title="Recent Events"
        description="Your saved event drafts"
        icon={<Plus className="h-5 w-5" />}
      >
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">No events added yet.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">{item.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.date
                        ? new Date(item.date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "No date"} • {item.location || "No location"}
                    </p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{item.description}</p>
                    {item.detailDescription ? (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{item.detailDescription}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-500">Detail gallery images: {item.galleryImages.length}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        item.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }
                    >
                      {item.status === "completed" ? "Completed" : "Upcoming"}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      Saved
                    </Badge>
                    <Button
                      variant="outline"
                      onClick={() => openEdit(item)}
                      disabled={saving}
                      className="text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => deleteEvent(item.id)}
                      disabled={saving}
                      className="text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <PreviewDialog
        title="Events Preview"
        description="View your events as they will appear on the frontend"
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      >
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No events available yet. Add an event to preview it.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl justify-items-center">
            {items.map((item) => {
              const isCompleted = item.status === "completed";
              const statusBg = isCompleted ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-900 border-amber-200";
              return (
                <div key={item.id} className="flex flex-col w-full max-w-[340px] min-h-[382px] overflow-hidden rounded-[20px] bg-white border border-slate-200/60 shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all hover:translate-y-[-4px] text-slate-900 text-left">
                  {item.image ? (
                    <div className="w-full h-[196px] overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-[196px] bg-slate-100 flex items-center justify-center text-slate-400 text-sm flex-shrink-0">
                      No image available
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.date && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800">
                          {item.date}
                        </span>
                      )}
                      {item.location && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-slate-900 text-white">
                          {item.location}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium border ${statusBg}`}>
                        {isCompleted ? "Completed" : "Upcoming"}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 line-clamp-2 mb-2">{item.title}</p>
                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4">{item.description}</p>
                    <div className="mt-auto pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                      Click to view full event details
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PreviewDialog>
    </div>
  );
}

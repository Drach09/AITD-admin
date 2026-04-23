import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Save, Eye, X } from "lucide-react";
import { toast } from "sonner";

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string | null;
}

export function EventsSection() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<EventItem[]>([
    {
      id: "evt-1",
      title: "Tech Innovation Summit 2024",
      description: "Join industry leaders for an immersive tech conference.",
      date: "2024-03-15",
      location: "Main Auditorium",
      image: null,
    },
    {
      id: "evt-2",
      title: "AI Workshop Series",
      description: "Hands-on AI training sessions for students.",
      date: "2024-02-28",
      location: "Lab 201",
      image: null,
    },
  ]);

  const handleSave = () => {
    if (!title.trim() || !description.trim() || !date.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      date,
      location: location.trim(),
      image,
    };

    setItems([newEvent, ...items]);
    setTitle("");
    setDescription("");
    setDate("");
    setLocation("");
    setImage(null);
    setShowForm(false);
    toast.success("Event saved successfully!");
  };

  const handlePreview = () => {
    toast.info("Preview functionality coming soon!");
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Events Management"
        description="Create and manage events displayed on your homepage"
        icon={<Calendar className="h-5 w-5" />}
      >
        <div className="flex flex-wrap gap-3 items-center">
          <Button onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>

        {showForm && (
          <div className="bg-muted/50 rounded-lg p-4 mt-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold">New Event</span>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Event Date</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Event location"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
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
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Event Image</label>
                <ImageUpload value={image} onChange={setImage} />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-brand-navy to-brand-indigo hover:from-brand-indigo hover:to-brand-sky text-white shadow-md"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Event
              </Button>
              <Button variant="outline" onClick={handlePreview} className="border-brand-sky/50 hover:bg-brand-sky/10 text-brand-navy">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
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
              <div key={item.id} className="bg-slate-50 rounded-lg p-4 transition-colors hover:bg-slate-100">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-600">
                      {item.date
                        ? new Date(item.date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "No date"} • {item.location || "No location"}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Saved
                    </Badge>
                    <Button
                      variant="outline"
                      onClick={() => setItems(items.filter((event) => event.id !== item.id))}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
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
    </div>
  );
}

import { Calendar, Image, Award, BookOpen, User, MessageSquare } from "lucide-react";

const navItems = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "placements", label: "Placements", icon: Image },
  { id: "top-placements", label: "Top 2 Placements", icon: Award },
  { id: "specializations", label: "Specializations", icon: BookOpen },
  { id: "hod", label: "HOD", icon: User },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
];

interface AdminSidebarProps {
  active: string;
  onNavigate: (id: string) => void;
}

export function AdminSidebar({ active, onNavigate }: AdminSidebarProps) {
  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground min-h-screen">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary font-display tracking-tight">EduAdmin</h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export { navItems };

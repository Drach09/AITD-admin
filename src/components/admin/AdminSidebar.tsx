import { Calendar, Image, MessageSquare, Newspaper, User } from "lucide-react";

const navItems = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "placements", label: "Placements", icon: Image },
  { id: "latest-news", label: "Latest News", icon: Newspaper },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "faculty", label: "Faculty", icon: User },
];

interface AdminSidebarProps {
  active: string;
  onNavigate: (id: string) => void;
}

export function AdminSidebar({ active, onNavigate }: AdminSidebarProps) {
  return (
    <aside className="hidden md:flex w-72 flex-col bg-slate-950 text-white min-h-screen border-r border-slate-800/60 shadow-2xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-sm">
        <div className="flex items-center">
          <div>
            <h1 className="text-xl font-bold text-white">
              AITD Admin
            </h1>
            <p className="text-xs text-slate-400">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-slate-100 text-slate-950 shadow-lg shadow-slate-300/20"
                  : "text-slate-300 hover:bg-slate-900/80 hover:text-white hover:shadow-md"
              }`}
            >
              <item.icon className={`h-5 w-5 transition-colors ${
                isActive ? "text-white" : "text-slate-400 group-hover:text-slate-100"
              }`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

    </aside>
  );
}

export { navItems };

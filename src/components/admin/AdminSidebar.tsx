import { Calendar, Image, MessageSquare, BarChart3, Settings, LogOut, Newspaper, User } from "lucide-react";

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
    <aside className="hidden md:flex w-72 flex-col bg-gradient-to-b from-brand-navy via-brand-indigo to-brand-navy text-white min-h-screen border-r border-brand-graphite/60 shadow-2xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
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
                  ? "bg-gradient-to-r from-brand-sky to-brand-indigo text-white shadow-lg shadow-brand-sky/25"
                  : "text-slate-300 hover:bg-brand-sky/20 hover:text-brand-white hover:shadow-md"
              }`}
            >
              <item.icon className={`h-5 w-5 transition-colors ${
                isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
              }`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export { navItems };

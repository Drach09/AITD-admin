import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "./AdminSidebar";

interface MobileNavProps {
  active: string;
  onNavigate: (id: string) => void;
}

export function MobileNav({ active, onNavigate }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xl z-50 p-4 space-y-2 max-h-96 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active === item.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${
                active === item.id ? "text-white" : "text-slate-500"
              }`} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <button onClick={() => setOpen(!open)} className="p-2 text-foreground">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute top-14 left-0 right-0 bg-card border-b border-border shadow-card-hover z-50 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active === item.id ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

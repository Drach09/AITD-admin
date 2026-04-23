import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileNav } from "@/components/admin/MobileNav";
import { ThemeToggle } from "@/components/theme-toggle";
import { EventsSection } from "@/pages/admin/EventsSection";
import { PlacementsSection } from "@/pages/admin/PlacementsSection";
import { LatestNewsSection } from "@/pages/admin/LatestNewsSection";
import { TestimonialsSection } from "@/pages/admin/TestimonialsSection";

const sectionTitles: Record<string, string> = {
  events: "Events",
  placements: "Placements",
  "latest-news": "Latest News",
  testimonials: "Testimonials",
};

const Index = () => {
  const [active, setActive] = useState("events");

  const renderSection = () => {
    switch (active) {
      case "events": return <EventsSection />;
      case "placements": return <PlacementsSection />;
      case "latest-news": return <LatestNewsSection />;
      case "testimonials": return <TestimonialsSection />;
      default: return <EventsSection />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-brand-white to-brand-sky/10 dark:from-brand-navy dark:to-brand-indigo">
      <AdminSidebar active={active} onNavigate={setActive} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-brand-graphite/30 bg-brand-white/85 backdrop-blur-xl dark:bg-brand-navy/85 dark:border-brand-graphite/50 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <MobileNav active={active} onNavigate={setActive} />
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-display">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                {sectionTitles[active]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default Index;

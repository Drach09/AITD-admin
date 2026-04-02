import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileNav } from "@/components/admin/MobileNav";
import { EventsSection } from "@/pages/admin/EventsSection";
import { PlacementsSection } from "@/pages/admin/PlacementsSection";
import { TopPlacementsSection } from "@/pages/admin/TopPlacementsSection";
import { SpecializationsSection } from "@/pages/admin/SpecializationsSection";
import { HodSection } from "@/pages/admin/HodSection";
import { TestimonialsSection } from "@/pages/admin/TestimonialsSection";

const sectionTitles: Record<string, string> = {
  events: "Events",
  placements: "Placements",
  "top-placements": "Top 2 Placements",
  specializations: "Specializations",
  hod: "Head of Department",
  testimonials: "Testimonials",
};

const Index = () => {
  const [active, setActive] = useState("events");

  const renderSection = () => {
    switch (active) {
      case "events": return <EventsSection />;
      case "placements": return <PlacementsSection />;
      case "top-placements": return <TopPlacementsSection />;
      case "specializations": return <SpecializationsSection />;
      case "hod": return <HodSection />;
      case "testimonials": return <TestimonialsSection />;
      default: return <EventsSection />;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar active={active} onNavigate={setActive} />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <MobileNav active={active} onNavigate={setActive} />
            <h1 className="text-base font-semibold text-foreground font-display">
              Admin Dashboard
              <span className="text-muted-foreground font-normal ml-2 text-sm hidden sm:inline">/ {sectionTitles[active]}</span>
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-4xl">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default Index;

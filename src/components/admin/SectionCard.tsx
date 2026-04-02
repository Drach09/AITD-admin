import React from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-card p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground font-display">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

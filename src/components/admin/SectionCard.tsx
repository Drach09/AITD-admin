import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function SectionCard({ title, description, children, icon }: SectionCardProps) {
  return (
    <Card className="shadow-lg border-0 bg-brand-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 dark:bg-brand-navy/80 dark:border-brand-graphite/60">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}

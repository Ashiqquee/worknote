"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

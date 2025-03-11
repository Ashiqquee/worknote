"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  BarChart2, 
  Menu, 
  X,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const routes = [
    {
      icon: LayoutDashboard,
      href: "/dashboard",
      label: "Dashboard",
      description: "Overview of your work",
      active: pathname === "/dashboard",
    },
    
    {
      icon: FileText,
      href: "/notes",
      label: "Notes",
      description: "Manage your work notes",
      active: pathname === "/notes",
    },
    {
      icon: BarChart2,
      href: "/reports",
      label: "Reports & Analytics",
      description: "Track your productivity",
      active: pathname === "/reports",
    },
    // {
    //   icon: Clock,
    //   href: "/time-tracking",
    //   label: "Time Tracking",
    //   description: "Monitor work hours",
    //   active: pathname === "/time-tracking",
    // },
    // {
    //   icon: Settings,
    //   href: "/settings",
    //   label: "Settings",
    //   description: "Customize your workspace",
    //   active: pathname === "/settings",
    // },
  ];

  return (
    <>
      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-gradient-to-b from-blue-50 to-indigo-50">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">W</span>
                  </div>
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Work Notes
                  </h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 py-4">
              <nav className="space-y-1 px-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                      route.active
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
                    )}
                  >
                    <route.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      route.active ? "text-blue-600" : "text-gray-400"
                    )} />
                    <div>
                      <div>{route.label}</div>
                      <div className="text-xs text-gray-500">{route.description}</div>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-blue-100">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 backdrop-blur">
                <Avatar className="h-9 w-9 border-2 border-blue-100">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {session?.user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex h-screen w-64 flex-col fixed inset-y-0 z-50 bg-gradient-to-b from-blue-50 to-indigo-50 border-r",
        className
      )}>
        <div className="flex items-center gap-2 p-6 border-b border-blue-100">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Work Notes
          </h1>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <TooltipProvider>
            {routes.map((route) => (
              <Tooltip key={route.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                      route.active
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
                    )}
                  >
                    <route.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      route.active ? "text-blue-600" : "text-gray-400"
                    )} />
                    {route.label}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-blue-900 text-white">
                  <p>{route.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
        <div className="p-4 border-t border-blue-100">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 backdrop-blur">
            <Avatar className="h-9 w-9 border-2 border-blue-100">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {session?.user?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-gray-900"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-blue-900 text-white">
                  <p>Sign Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </>
  );
}

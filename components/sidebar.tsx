"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Download,
  Github,
  Globe,
  Home,
  Mic,
  Settings,
  Database,
  Cpu,
  BarChart3,
  FileText,
  Briefcase,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Update the navItems array to include the API Docs link
const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "AI Status", href: "/status", icon: Activity },
  { name: "API Docs", href: "/api-docs", icon: FileText },
  { name: "Web Browser", href: "/browser", icon: Globe },
  { name: "GitHub", href: "/github", icon: Github },
  { name: "Voice", href: "/settings/voice", icon: Mic },
  { name: "Download", href: "/download", icon: Download },
  { name: "Settings", href: "/settings", icon: Settings },
]

// Add a new link to the workspace in the navigation items array
const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Browser", href: "/browser", icon: Globe },
  { name: "GitHub", href: "/github", icon: Github },
  { name: "Workspace", href: "/workspace", icon: Briefcase },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Download", href: "/download", icon: Download },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-6 w-6" />
          <span className="text-lg font-bold">Alpha AI</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Database className="h-4 w-4" />
          <span>Alpha AI v1.2.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1">
          <div className="container py-6">
            <div className="flex items-center mb-6">
              <SidebarTrigger />
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

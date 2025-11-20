import {
  Sidebar,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  // This simplified structure ensures a two-column layout:
  // 1. A fixed sidebar.
  // 2. A main content area that fills the remaining space.
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-dvh">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}

import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  // The defaultOpen prop is read from a cookie `sidebar_state`
  // so that the sidebar state is preserved between page loads.
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-dvh">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <SidebarInset className="flex-1">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}

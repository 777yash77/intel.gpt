import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-dvh">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

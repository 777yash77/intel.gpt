import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function Header({ title, children, className }: { title: string, children?: React.ReactNode, className?: string }) {
  return (
    <header className={cn("sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 backdrop-blur-sm sm:h-16 sm:px-6", className)}>
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
      </div>
      {children}
    </header>
  );
}

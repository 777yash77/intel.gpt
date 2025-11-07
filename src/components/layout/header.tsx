import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
      </div>
    </header>
  );
}

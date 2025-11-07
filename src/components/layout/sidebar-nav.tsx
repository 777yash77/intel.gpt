'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
  Gavel,
  History,
  LogIn,
  LogOut,
  MessageSquare,
  BookText,
  UserPlus,
} from 'lucide-react';

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export function SidebarNav() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout Error', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
      });
    }
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <Button variant="ghost" className="flex h-auto justify-start gap-3 p-0">
          <Icons.logo className="size-8 text-primary" />
          <div className="flex flex-col items-start">
            <span className="font-headline text-lg font-bold tracking-tighter text-sidebar-foreground">
              Intel.gpt
            </span>
          </div>
        </Button>
      </SidebarHeader>

      <SidebarContent className="p-4 pt-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/'}
              tooltip={{ children: 'Intelligent Chat', side: 'right' }}
            >
              <Link href="/">
                <MessageSquare />
                <span>Intelligent Chat</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/document-analysis'}
              tooltip={{ children: 'Document Analysis', side: 'right' }}
            >
              <Link href="/document-analysis">
                <FileText />
                <span>Document Analysis</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/find-lawyer'}
              tooltip={{ children: 'Find a Lawyer', side: 'right' }}
            >
              <Link href="/find-lawyer">
                <Gavel />
                <span>Find a Lawyer</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/precedents'}
              tooltip={{ children: 'Legal Precedents', side: 'right' }}
            >
              <Link href="/precedents">
                <BookText />
                <span>Legal Precedents</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/history'}
                tooltip={{ children: 'Chat History', side: 'right' }}
              >
                <Link href="/history">
                  <History />
                  <span>Chat History</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          {!isUserLoading && !user && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/login'}
                  tooltip={{ children: 'Login', side: 'right' }}
                >
                  <Link href="/login">
                    <LogIn />
                    <span>Login</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/signup'}
                  tooltip={{ children: 'Sign Up', side: 'right' }}
                >
                  <Link href="/signup">
                    <UserPlus />
                    <span>Sign Up</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip={{ children: 'Logout', side: 'right' }}
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

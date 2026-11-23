'use client';

import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { Bell, Menu, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    FACULTY: 'Faculty',
    STUDENT: 'Student',
    PARENT: 'Parent',
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {mounted && (
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => router.push('/notifications')}>
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
          <User className="h-5 w-5" />
        </Button>
        {user && (
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{roleLabels[user.role] || user.role}</span>
          </div>
        )}
      </div>
    </header>
  );
}

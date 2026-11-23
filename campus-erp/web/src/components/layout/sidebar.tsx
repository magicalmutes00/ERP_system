'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-provider';
import {
  LayoutDashboard, GraduationCap, Users, BookOpen, CalendarCheck,
  FileText, ClipboardList, DollarSign, Bell, MessageSquare,
  Brain, Settings, LogOut, ChevronLeft, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = {
  SUPER_ADMIN: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/faculty', label: 'Faculty', icon: GraduationCap },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { href: '/exams', label: 'Exams', icon: FileText },
    { href: '/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/fees', label: 'Fees', icon: DollarSign },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/ai', label: 'AI Insights', icon: Brain },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
  ADMIN: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/faculty', label: 'Faculty', icon: GraduationCap },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { href: '/exams', label: 'Exams', icon: FileText },
    { href: '/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/fees', label: 'Fees', icon: DollarSign },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/ai', label: 'AI Insights', icon: Brain },
  ],
  FACULTY: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/courses', label: 'My Courses', icon: BookOpen },
    { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { href: '/exams', label: 'Exams', icon: FileText },
    { href: '/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
  ],
  STUDENT: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/courses', label: 'My Courses', icon: BookOpen },
    { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { href: '/exams', label: 'Exams & Results', icon: FileText },
    { href: '/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/fees', label: 'Fees', icon: DollarSign },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
  ],
  PARENT: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { href: '/exams', label: 'Results', icon: FileText },
    { href: '/fees', label: 'Fees', icon: DollarSign },
    { href: '/notifications', label: 'Notifications', icon: Bell },
  ],
};

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const items = navItems[user.role] || navItems.STUDENT;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300',
          'w-64',
          collapsed && 'lg:w-16',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-accent">
          {(!collapsed || mobileOpen) && (
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg" onClick={onMobileClose}>
              <GraduationCap className="h-6 w-6 text-primary" />
              <span>CampusERP</span>
            </Link>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="text-sidebar-foreground lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-sidebar-foreground hidden lg:inline-flex"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-accent p-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {(!collapsed || mobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

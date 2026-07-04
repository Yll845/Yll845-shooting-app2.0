import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Trophy, Medal, 
  ChevronLeft, ChevronRight, Target, Menu, X, Crosshair, FileCheck, Shield, FileSpreadsheet, BookOpen, Wallet, Truck, Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Paneli', icon: LayoutDashboard },
  { path: '/members', label: 'Anëtarët', icon: Users },
  { path: '/clubs', label: 'Klubet', icon: Building2 },
  { path: '/competitions', label: 'Garat', icon: Trophy },
  { path: '/results', label: 'Rezultatet', icon: Medal },
  { path: '/weapons', label: 'Armët', icon: Crosshair },
  { path: '/licensing', label: 'Licencimi', icon: FileCheck },
  { path: '/users', label: 'Përdoruesit', icon: Shield },
  { path: '/templates', label: 'Tabelat për Import', icon: FileSpreadsheet },
  { path: '/finance', label: 'Financat', icon: Wallet },
  { path: '/suppliers', label: 'Furnitorët', icon: Truck },
  { path: '/fund-sources', label: 'Burimet e Fondeve', icon: Landmark },
  { path: '/doracak', label: 'Doracak', icon: BookOpen },
  { path: '/prezantim', label: 'Prezantim', icon: Target },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-sidebar text-sidebar-foreground z-40 transition-all duration-300 flex flex-col border-r border-sidebar-border",
        collapsed ? "w-[72px]" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <Target className="h-7 w-7 text-sidebar-primary shrink-0" />
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <h1 className="font-display text-lg font-bold leading-tight truncate">FSHSK</h1>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">Shënjetaria Sportive e Kosovës</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "drop-shadow-sm")} />
                {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:flex p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </>
  );
}
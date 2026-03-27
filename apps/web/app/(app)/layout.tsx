'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Clock, LayoutDashboard, Menu, MessageSquare, Send, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { WalletButton } from '@/components/shared/wallet-button';
import { NetworkBadge } from '@/components/shared/network-badge';
import { ThemeToggle } from '@/components/shared/theme-toggle';

const ICONS = {
  MessageSquare,
  LayoutDashboard,
  Send,
  Clock,
  Settings,
} as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon as keyof typeof ICONS];
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-violet-50/30 to-emerald-50/20 dark:from-background dark:via-violet-950/20 dark:to-emerald-950/10">
      {/* Sidebar escritorio */}
      <aside className="hidden w-64 shrink-0 border-r border-border/80 bg-card/80 backdrop-blur-md lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border/80 px-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-emerald-600 text-sm font-bold text-white">
            B
          </div>
          <div>
            <p className="text-sm font-bold leading-none">Beexo</p>
            <p className="text-xs text-muted-foreground">AgentYield</p>
          </div>
        </div>
        <NavLinks />
        <div className="mt-auto border-t border-border/80 p-4">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </div>
      </aside>

      {/* Overlay móvil */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card shadow-xl transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="font-semibold">Menú</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </Button>
        </div>
        <NavLinks onNavigate={() => setMobileOpen(false)} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/80 bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </Button>
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">Panel</p>
              <p className="text-sm font-semibold">
                {NAV_ITEMS.find((i) => i.href === pathname)?.label ?? 'App'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <ThemeToggle />
            <NetworkBadge />
            <Separator orientation="vertical" className="hidden h-8 sm:block" />
            <WalletButton />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

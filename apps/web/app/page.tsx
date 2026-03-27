import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Bot,
  Coins,
  Heart,
  LineChart,
  Menu,
  Shield,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GlowCard } from '@/components/ui/spotlight-card';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { WalletButton } from '@/components/shared/wallet-button';
import { CTASection } from '@/components/ui/hero-dithering-card';
import appLogo from '../../../assets/logotipo-de-estilo-de-vida-saludable.png';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-violet-50/80 via-background to-emerald-50/40 dark:from-violet-950/40 dark:via-background dark:to-emerald-950/30">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.25),transparent)]"
        aria-hidden
      />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src={appLogo}
              alt="Logo de AlcancIA"
              className="size-9 rounded-xl border border-border/60 object-contain bg-white p-0.5 shadow-lg shadow-violet-500/15"
              priority
            />
            <div className="leading-tight">
              <span className="block text-base font-bold tracking-tight">AlcancIA</span>
              <span className="text-xs font-medium text-muted-foreground">
                Asistente financiero
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a
              href="#como-funciona"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Cómo funciona
            </a>
            <a
              href="#beneficios"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Beneficios
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#como-funciona"
              aria-label="Menú"
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
            >
              <Menu className="size-5" />
            </a>
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'hidden sm:inline-flex',
              )}
            >
              Ir al chat
            </Link>
            <ThemeToggle />
            <WalletButton />
          </div>
        </div>
      </header>

      <main>
        <CTASection />

        <section
          id="como-funciona"
          className="border-y border-border/60 bg-muted/30 py-20 dark:bg-muted/10"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Cómo funciona</h2>
              <p className="mt-3 text-muted-foreground">Tres pasos para empezar a usar AlcancIA</p>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Conectá tu wallet',
                  desc: 'Usá tu wallet compatible para conectarte de forma segura a Rootstock Testnet.',
                  icon: Wallet,
                  glow: 'purple' as const,
                },
                {
                  step: '2',
                  title: 'Hablá con tu asistente',
                  desc: 'Decile qué querés hacer en lenguaje natural: invertir, enviar o consultar balances.',
                  icon: Bot,
                  glow: 'green' as const,
                },
                {
                  step: '3',
                  title: 'Ahorrá y enviá',
                  desc: 'Tu dinero puede generar rendimiento y podés programar remesas recurrentes.',
                  icon: LineChart,
                  glow: 'orange' as const,
                },
              ].map((item) => (
                <GlowCard
                  key={item.step}
                  glowColor={item.glow}
                  customSize
                  className="h-full overflow-hidden border-border/80 bg-card/80 shadow-sm"
                >
                  <CardHeader className="relative gap-2">
                    <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <item.icon className="size-6" />
                    </div>
                    <Badge variant="outline" className="w-fit">
                      Paso {item.step}
                    </Badge>
                    <CardTitle className="mt-2 text-xl">{item.title}</CardTitle>
                    <CardDescription className="text-base">{item.desc}</CardDescription>
                  </CardHeader>
                </GlowCard>
              ))}
            </div>
          </div>
        </section>

        <section id="beneficios" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Beneficios</h2>
              <p className="mt-3 text-muted-foreground">Todo lo que necesitás en un solo lugar</p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'Dólares digitales',
                  desc: 'Convertí tus RBTC a dólares estables (DOC) cuando lo necesites.',
                  icon: Coins,
                  glow: 'blue' as const,
                },
                {
                  title: 'Rendimiento automático',
                  desc: 'Tu dinero puede crecer en Tropykus con estrategias guiadas por IA.',
                  icon: LineChart,
                  glow: 'green' as const,
                },
                {
                  title: 'Remesas programadas',
                  desc: 'Enviá dinero a tu familia cada mes sin complicaciones.',
                  icon: Heart,
                  glow: 'red' as const,
                },
                {
                  title: 'Asistente IA',
                  desc: 'Un copiloto financiero que habla español y entiende tu contexto.',
                  icon: Sparkles,
                  glow: 'purple' as const,
                },
              ].map((b) => (
                <GlowCard
                  key={b.title}
                  glowColor={b.glow}
                  customSize
                  className="h-full border-border/80 bg-card/80 transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-secondary">
                      <b.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{b.title}</CardTitle>
                    <CardDescription>{b.desc}</CardDescription>
                  </CardHeader>
                </GlowCard>
              ))}
            </div>
          </div>
        </section>

        <section
          id="demo"
          className="border-t border-border/60 bg-gradient-to-br from-violet-600/10 via-background to-emerald-600/10 py-20 dark:from-violet-900/20 dark:to-emerald-900/20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex justify-center">
              <Card className="w-full max-w-xl border-border/80 bg-card/90 shadow-xl backdrop-blur">
                <CardHeader>
                  <CardTitle>Probá el chat</CardTitle>
                  <CardDescription>
                    Entrá al área de la app y hablá con el agente como si fuera tu banquero
                    personal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/chat"
                    className={cn(buttonVariants(), 'flex-1 rounded-full justify-center')}
                  >
                    Abrir chat
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'flex-1 rounded-full justify-center',
                    )}
                  >
                    Ver dashboard
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-muted/20 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <div className="text-center text-sm text-muted-foreground sm:text-left">
            <p>© {new Date().getFullYear()} AlcancIA</p>
            <p className="mt-1">Rootstock Testnet · Solo para demostración</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/chat" className="text-muted-foreground hover:text-foreground">
              Chat
            </Link>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <Link href="/remesas" className="text-muted-foreground hover:text-foreground">
              Remesas
            </Link>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Hecho con <Heart className="mx-1 inline size-4 fill-red-500 text-red-500" /> para LATAM
          </p>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { ArrowRight, Sparkles, Wallet } from 'lucide-react';
import { useState, Suspense, lazy } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Dithering = lazy(() =>
  import('@paper-design/shaders-react').then((mod) => ({
    default: mod.Dithering,
  })),
);

export function CTASection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-12 w-full flex justify-center items-center px-4 md:px-6">
      <div
        className="w-full max-w-7xl relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-[48px] border border-border bg-card shadow-sm min-h-[600px] md:min-h-[600px] flex flex-col items-center justify-center duration-500">
          <Suspense fallback={<div className="absolute inset-0 bg-muted/20" />}>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen">
              <Dithering
                colorBack="#00000000"
                colorFront="#7c3aed"
                shape="warp"
                type="4x4"
                speed={isHovered ? 0.6 : 0.2}
                className="size-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>

          <div className="relative z-10 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
            <Badge
              variant="secondary"
              className="mb-6 mt-6 border-violet-500/20 bg-violet-500/10 text-violet-800 dark:text-violet-200 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
            >
              <Sparkles className="size-3" />
              DeFi en Rootstock para LATAM
            </Badge>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-foreground mb-8 leading-[1.05]">
              Protegé tu dinero. <br />
              <span className="bg-linear-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-emerald-400">
                Generá rendimiento.
              </span>{' '}
              <br />
              Enviá remesas.
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
              Un asistente de IA te guía para ahorrar en Bitcoin, obtener rendimiento en protocolos
              como Tropykus y programar remesas a tu familia, todo desde una experiencia simple y en
              tu idioma.
            </p>

            <div className="flex flex-col mb-6 items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/chat"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-linear-to-r from-violet-600 to-emerald-600 px-12 text-base font-medium text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:opacity-95 hover:scale-105 active:scale-95 hover:ring-4 hover:ring-violet-500/20',
                )}
              >
                <span className="relative z-10">Conectar wallet</span>
                <Wallet className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#como-funciona"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'h-14 rounded-full px-8 text-base transition-all duration-300 hover:scale-105 active:scale-95',
                )}
              >
                <span>Ver cómo funciona</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

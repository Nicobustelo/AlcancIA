import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';
import { getThemeScript } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'AlcancIA — Ahorro inteligente en Bitcoin',
  description:
    'Protegé tus ahorros, generá rendimiento y enviá remesas con inteligencia artificial en la red de Rootstock.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';
import { getThemeScript } from '@/lib/theme';
import appLogo from '../../../assets/logotipo-de-estilo-de-vida-saludable.png';

export const metadata: Metadata = {
  title: 'AlcancIA — Ahorro inteligente en Bitcoin',
  description:
    'Protegé tus ahorros, generá rendimiento y enviá remesas con inteligencia artificial en la red de Rootstock.',
  icons: {
    icon: appLogo.src,
    shortcut: appLogo.src,
    apple: appLogo.src,
  },
  openGraph: {
    images: [appLogo.src],
  },
  twitter: {
    images: [appLogo.src],
  },
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

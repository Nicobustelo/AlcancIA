import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Beexo AgentYield — Ahorro inteligente en Bitcoin',
  description:
    'Protegé tus ahorros, generá rendimiento y enviá remesas con inteligencia artificial en la red de Rootstock.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

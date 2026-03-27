export const APP_NAME = 'AlcancIA';
export const APP_DESCRIPTION =
  'Protegé tus ahorros, generá rendimiento y enviá remesas con inteligencia artificial';

export const QUICK_PROMPTS = [
  {
    label: 'Invertir RBTC',
    message: 'Quiero invertir 0.01 RBTC para generar rendimiento',
    icon: '💰',
  },
  {
    label: 'Programar remesa',
    message: 'Quiero enviar 50 dólares a mi mamá el día 1 de cada mes',
    icon: '💸',
  },
  {
    label: 'Ver mi balance',
    message: '¿Cuál es mi balance actual?',
    icon: '📊',
  },
  {
    label: 'Proteger ahorros',
    message: 'Quiero proteger 0.005 RBTC de la inflación',
    icon: '🛡️',
  },
];

export const EXPLORER_BASE_URL =
  process.env.NEXT_PUBLIC_RSK_EXPLORER_TESTNET || 'https://explorer.testnet.rootstock.io';

export const NAV_ITEMS = [
  { label: 'Chat', href: '/chat', icon: 'MessageSquare' },
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Remesas', href: '/remesas', icon: 'Send' },
  { label: 'Actividad', href: '/actividad', icon: 'Clock' },
  { label: 'Configuración', href: '/configuracion', icon: 'Settings' },
];

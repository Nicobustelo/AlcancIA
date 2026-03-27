# 🐝 AlcanIA AgentYield

**Plataforma DeFi con agente de IA en Rootstock: protección del valor, yield en Tropykus y remesas programadas.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Rootstock](https://img.shields.io/badge/Rootstock-Bitcoin%20Sidechain-F7931A?style=flat-square&logo=bitcoin&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-Agent-1C3C3C?style=flat-square)
![Hardhat](https://img.shields.io/badge/Hardhat-Contracts-F7DF1E?style=flat-square&logo=ethereum&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## Qué es

**Beexo AgentYield** es un prototipo de hackathon para una plataforma DeFi sobre **Rootstock (RSK)** donde los usuarios pueden orientar **RBTC → DOC (Money on Chain)**, depositar en **Tropykus** para obtener rendimiento y **programar remesas** en stablecoin, con un **agente conversacional** (LangGraph + OpenAI) que interpreta intenciones en español y propone planes antes de ejecutar.

### Problema

- En **Latinoamérica**, la inflación erosiona el poder adquisitivo y muchas personas no tienen acceso sencillo a instrumentos en dólares o DeFi.
- Las **remesas** suelen ser caras, lentas y poco transparentes.
- **DeFi en Bitcoin/Rootstock** existe, pero las interfaces y el encadenamiento de pasos (swap, supply, scheduler) siguen siendo barreras.

### Solución

Un flujo unificado: **wallet compatible (Beexo / WalletConnect)** → **frontend Next.js** → **API y agente** que consulta precios, APY y balances (reales o simulados según flags) → **contratos propios** (`VaultManager`, `StrategyExecutor`, `RemittanceScheduler`) e integraciones **Money on Chain** y **Tropykus**, con **base de datos** (Prisma + Postgres/Supabase) preparada para historial, planes y remesas.

## Arquitectura

```
Usuario → Beexo Wallet (o wallet compatible) → Next.js (App Router) → API Routes
                                              ↓
                                         Agente (LangGraph + OpenAI)
                                              ↓                    ↓
                                    Supabase / Postgres      Rootstock (RSK)
                                    (Prisma)                 Smart Contracts
                                                              VaultManager
                                                              StrategyExecutor
                                                              RemittanceScheduler
                                                                   ↓
                                                         Money on Chain (DOC)
                                                         Tropykus (yield)
```

## Stack tecnológico

| Capa           | Tecnología                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------- |
| Monorepo       | **pnpm** workspaces + **Turborepo**                                                          |
| Frontend       | **Next.js 15** (App Router), **React 19**, **Tailwind CSS 4**, componentes estilo **shadcn** |
| Web3           | **Wagmi** + **Viem**, **Reown AppKit** (WalletConnect)                                       |
| Contratos      | **Solidity 0.8.20**, **Hardhat**, **OpenZeppelin**                                           |
| Agente IA      | **LangGraph**, **LangChain Core**, **OpenAI** (`gpt-4o-mini`)                                |
| Datos          | **Prisma** + **PostgreSQL** (Supabase)                                                       |
| Validación API | **Zod**                                                                                      |
| Precios        | **CoinGecko** (con caché) + mocks configurables                                              |

## Estructura del monorepo

```
.
├── apps/
│   ├── web/                 # Next.js 15 — UI, API routes, Wagmi
│   └── agent/               # Servicio Express opcional (puerto 3001)
├── packages/
│   ├── agent-core/          # Grafo LangGraph, tools, prompts, schemas
│   ├── blockchain/          # Adaptadores MoC/Tropykus, oráculo, ABIs, feature flags
│   ├── db/                  # Prisma schema, cliente, seed
│   ├── types/               # Tipos compartidos (planes, API, etc.)
│   └── config/              # tsconfig base (Next.js / Node)
├── contracts/               # Hardhat: VaultManager, StrategyExecutor, RemittanceScheduler
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

## Quickstart

```bash
# 1. Clonar
git clone https://github.com/<tu-org>/beexo-agent-yield.git
cd beexo-agent-yield

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editá .env con tus claves (OpenAI, WalletConnect, Supabase, etc.)

# 4. Levantar en desarrollo
pnpm dev
```

- **Frontend:** http://localhost:3000
- **Agente (servicio standalone):** http://localhost:3001 (`pnpm --filter agent dev` si no arranca con el turbo global)

> `pnpm dev` ejecuta las tareas `dev` de los paquetes que las definen (p. ej. `web` y `agent`).

## Variables de entorno

| Variable                                                                   | Uso                                                                           |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL` / `DIRECT_URL`                                              | Postgres (Supabase): cadena de conexión y migraciones Prisma                  |
| `OPENAI_API_KEY`                                                           | Agente real; si falta, el chat usa respuestas **mock**                        |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`                                     | **Reown Cloud** — ID del proyecto para conectar wallets                       |
| `NEXT_PUBLIC_CHAIN_ID`                                                     | Red (p. ej. `31` testnet)                                                     |
| `NEXT_PUBLIC_*_RPC` / exploradores                                         | Nodos públicos Rootstock y enlaces al explorer                                |
| `NEXT_PUBLIC_VAULT_MANAGER_ADDRESS` / `STRATEGY` / `REMITTANCE`            | Direcciones tras **deploy** en testnet                                        |
| `NEXT_PUBLIC_ENABLE_REAL_MOC` / `TROPYKUS` / `PRICE_ORACLE` / `FIAT_RATES` | **Feature flags** real vs simulado                                            |
| `DEPLOYER_PRIVATE_KEY` / `RSK_TESTNET_RPC`                                 | Deploy de contratos con Hardhat                                               |
| `LANGCHAIN_*`                                                              | **LangSmith** (opcional): trazas si habilitás tracing en tu entorno LangChain |

Detalle en [`.env.example`](./.env.example).

## Contratos

```bash
# Compilar
pnpm --filter contracts compile

# Tests (20 escenarios)
pnpm test:contracts
# o: pnpm --filter contracts test

# Deploy a RSK testnet (requiere DEPLOYER_PRIVATE_KEY y saldo en RBTC testnet)
pnpm deploy:testnet
```

Tras el deploy, copiá las direcciones a las variables `NEXT_PUBLIC_*_ADDRESS` del `.env`.

## Integraciones reales vs simuladas

| Componente                              | Estado              | Notas                                                                      |
| --------------------------------------- | ------------------- | -------------------------------------------------------------------------- |
| Conexión wallet (WalletConnect / Reown) | ✅ Real             | Compatible con wallets estándar                                            |
| Lectura de balances (cadena)            | ✅ Real             | Vía RPC de Rootstock cuando la UI/capa blockchain lo usa                   |
| Contratos propios                       | ✅ Real             | Desplegables con Hardhat; tests en red local                               |
| Money on Chain (DOC)                    | ⚡ Híbrido          | Adaptador real + **fallback mock** si falla la red o el flag               |
| Tropykus (yield)                        | ⚡ Híbrido          | Igual: adaptador + mock                                                    |
| Precio BTC/USD (y referencia DOC)       | ✅ Real             | CoinGecko con caché ~5 min; respeta `NEXT_PUBLIC_ENABLE_REAL_PRICE_ORACLE` |
| Tasas USD/ARS (fiat)                    | 🔄 Mock             | Provider extensible; valores por env (`MOCK_USD_ARS_RATE`, etc.)           |
| Agente IA                               | ✅ Real (con clave) | `gpt-4o-mini`; sin `OPENAI_API_KEY`, respuesta **mock** en `/api/chat`     |
| Dashboard API (demo)                    | 🔄 Mock             | JSON estático de ejemplo para la UI                                        |

## Scripts disponibles (raíz)

| Script                         | Descripción                                         |
| ------------------------------ | --------------------------------------------------- |
| `pnpm dev`                     | Desarrollo paralelo (Turbo)                         |
| `pnpm build`                   | Build de todos los paquetes                         |
| `pnpm lint`                    | ESLint vía Turbo                                    |
| `pnpm typecheck`               | Typecheck                                           |
| `pnpm test`                    | Tests (incluye contratos según configuración Turbo) |
| `pnpm test:contracts`          | Solo tests Hardhat                                  |
| `pnpm format` / `format:check` | Prettier                                            |
| `pnpm db:generate`             | `prisma generate`                                   |
| `pnpm db:migrate`              | `prisma migrate dev`                                |
| `pnpm db:seed`                 | Seed de datos                                       |
| `pnpm deploy:testnet`          | Deploy contratos a testnet                          |
| `pnpm clean`                   | Limpieza Turbo + `node_modules` raíz                |

En **apps/web**: `dev`, `build`, `start`, `lint`, `typecheck`.  
En **apps/agent**: `dev`, `build`, `start`, `typecheck`.  
En **contracts**: `compile`, `test`, `deploy:testnet`, `deploy:localhost`.

## Testing

```bash
# Contratos (20 tests)
pnpm test:contracts

# Suite completa del monorepo
pnpm test
```

## Deployment

Guía paso a paso: **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** (RSK testnet, Vercel, variables, checklist pre-demo).

Documentación adicional:

- [Arquitectura](./docs/ARCHITECTURE.md)
- [Proceso del agente IA](./docs/AI_PROCESS.md)
- [Guion de demo](./docs/DEMO_SCRIPT.md)
- [Guía para jurados](./docs/JUDGES_GUIDE.md)

## Próximos pasos (hacia producción)

- Persistir conversaciones y planes en DB con políticas RLS en Supabase.
- Pasar la **dirección de wallet** del cliente al agente en `/api/chat` para alinear herramientas y UI.
- Mapear **tool calls** del agente a `ExecutionPlan` en el frontend cuando haya `OPENAI_API_KEY`.
- Ejecución on-chain firmada desde la wallet para `StrategyExecutor` / `RemittanceScheduler` con UX de revisión clara.
- Monitoreo (LangSmith u otro) y alertas de RPC/oráculo.
- Auditoría de contratos y límites de montos en testnet/mainnet.

## Licencia

MIT

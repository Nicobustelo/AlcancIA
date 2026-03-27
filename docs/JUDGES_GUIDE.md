# Guía para jurados — AlcancIA

Esta guía ayuda a evaluar el proyecto con criterios claros: qué mirar primero, qué es demostrable hoy y dónde está el valor técnico.

## Qué mirar primero (orden sugerido)

1. **README.md** — visión, stack, tabla real/mock, quickstart.
2. **Chat** (`/chat`) — interacción en español y flujo plan → confirmación.
3. **Contratos** — `contracts/contracts/*.sol` y `pnpm test:contracts` (**20 tests** pasando).
4. **Agente** — `packages/agent-core/src/graph/graph.ts` y `tools/`.
5. **Integraciones** — `packages/blockchain/src/adapters/` y `feature-flags.ts`.

## Transparencia: real vs mock

| Área                      | Estado en demo      | Cómo verificarlo                                                      |
| ------------------------- | ------------------- | --------------------------------------------------------------------- |
| Wallet + RPC              | Real (configurable) | Conectar wallet; explorador RSK.                                      |
| Contratos (código)        | Real                | Tests Hardhat; deploy testnet opcional.                               |
| Precio BTC/USD            | Real por defecto    | CoinGecko + caché; ver `price-oracle.ts`.                             |
| MoC / Tropykus            | Híbrido             | Flags `NEXT_PUBLIC_ENABLE_REAL_*`; fallback a mock.                   |
| Dashboard API             | Mock                | `app/api/dashboard/route.ts` devuelve JSON fijo marcado `mock: true`. |
| Chat sin `OPENAI_API_KEY` | Mock                | `buildMockReply` + indicador “Simulado” en UI.                        |
| Chat con clave            | Real (LLM + tools)  | Respuesta “OpenAI” en UI; tools con datos mixtos.                     |

**Honestidad:** el equipo documenta mocks donde existen; no se presentan datos estáticos del dashboard como “on-chain verificado” sin aclaración.

## Cómo levantar el proyecto en ~2 minutos

```bash
git clone https://github.com/<org>/alcancia.git
cd alcancia
pnpm install
cp .env.example .env
pnpm dev
```

- Abrí **http://localhost:3000**.
- Opcional: agregá `OPENAI_API_KEY` en `.env` y reiniciá para ver el agente completo.
- Contratos: `pnpm test:contracts` (no requiere red externa para la suite local).

Si algo falla, revisá **Node ≥ 20** y que el puerto **3000** esté libre.

## Highlights de arquitectura (profundidad técnica)

- **Monorepo disciplinado:** separación `@beexo/agent-core`, `@beexo/blockchain`, `@beexo/db`, `@beexo/types`.
- **LangGraph:** grafo `agent ↔ tools` con límite de recursión y estado extensible.
- **Feature flags por integración:** permite demo estable en hackathon y activación progresiva en testnet.
- **Contratos cohesionados:** `VaultManager` + `StrategyExecutor` (MoC/Tropykus + fallback) + `RemittanceScheduler`.
- **Prisma:** esquema listo para usuarios, conversaciones, planes, remesas y transacciones.
- **Next.js 15 App Router:** route groups, API con **Zod**, UI con Tailwind y patrones tipo shadcn.

## Qué hace diferente a este proyecto

- **Un solo copiloto** para tres necesidades: estabilidad (DOC), **yield** (Tropykus) y **remesas recurrentes** (scheduler), en la misma red (**Rootstock**).
- **Reglas de producto en el prompt:** confirmación explícita, advertencia de APY bajo, lenguaje para LATAM.
- **Puente claro entre “idea del usuario” y “pasos on-chain”** mediante tools y contratos propios, no solo chat genérico.

## Limitaciones conocidas (evaluación justa)

- La ruta **`/api/chat`** no envía aún la **wallet conectada** al `processMessage`; las tools usan mocks o heurísticas en ese camino.
- La **tarjeta de plan estructurada** en UI se alimenta principalmente del **mock HTTP**; con OpenAI el plan suele estar en **texto** hasta integrar tool outputs.
- **Dashboard / actividad:** datos de ejemplo vía API; la persistencia Prisma está preparada pero no es el único origen en la demo.
- **LangSmith:** variables documentadas; el tracing puede depender de configuración estándar de LangChain sin código dedicado adicional.
- **Seguridad de producción:** falta auditoría externa, políticas RLS completas en Supabase y hardening operativo (RPC, rate limits, etc.).

---

Gracias por evaluar el proyecto con este marco; cualquier duda técnica puede canalizarse contra los archivos citados y el código fuente.

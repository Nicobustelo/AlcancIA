# Arquitectura — AlcancIA

Documento técnico en español: cómo encajan el monorepo, la cadena, el agente y la base de datos.

## 1. Monorepo y rationale

El proyecto usa **pnpm workspaces** y **Turborepo** para:

- **Compartir tipos** (`@beexo/types`) entre frontend, agente y paquetes de dominio.
- **Aislar el agente** (`@beexo/agent-core`) de la UI y del transporte HTTP (Next.js puede importar el mismo núcleo que el servicio Express en `apps/agent`).
- **Centralizar integraciones Web3** en `@beexo/blockchain` (lecturas, adaptadores MoC/Tropykus, flags).
- **Versionar el esquema de datos** una sola vez con Prisma en `@beexo/db`.

Las dependencias entre paquetes siguen el sentido: `web` → `agent-core`, `blockchain`, `db`, `types`; `agent-core` → `blockchain`, `types`; `contracts` es independiente del grafo TypeScript salvo por ABIs copiados/exportados en `blockchain`.

## 2. Flujos de datos (texto)

### 2.1 Chat desde el navegador

```
Usuario escribe en /chat
    → POST /api/chat (Next.js Route Handler)
         • Valida cuerpo con Zod (mensaje + historial)
         • Si hay OPENAI_API_KEY: import dinámico de processMessage (@beexo/agent-core)
         • Si no: buildMockReply() — respuesta + plan estructurado opcional
    → JSON { content, plan?, source: 'openai' | 'mock' }
    → UI renderiza mensaje y, si existe, tarjeta "Plan propuesto"
```

**Nota:** En la ruta actual, `processMessage` se invoca con `walletAddress` vacío; las herramientas que dependen de dirección usan mocks internos o valores derivados. Mejorar en producción pasando la wallet conectada desde el cliente.

### 2.2 Servicio agente standalone (`apps/agent`)

```
POST http://localhost:3001/api/chat
    → Express + Zod
    → processMessage(message, walletAddress, history)
    → { content, toolCalls, ... }
```

Útil para demos desacopladas o para escalar el agente fuera del runtime de Next.js.

### 2.3 Dashboard y datos de demo

```
GET /api/dashboard
    → Respuesta JSON estática (balances, yield, remesa próxima, actividad) marcada como mock
```

Similar patrón en `/api/remittances` y `/api/activity` según evolucione el producto.

## 3. Smart contracts

### 3.1 Contratos principales

| Contrato                | Rol                                                                                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **VaultManager**        | Custodia lógica de **RBTC** (payable) y **DOC** (ERC20); balances por usuario; registro de shares Tropykus; solo el `StrategyExecutor` autorizado puede mutar ciertas posiciones.        |
| **StrategyExecutor**    | Orquesta **RBTC → DOC** vía interfaz **Money on Chain** y **supply** en **Tropykus**; soporta `useFallbackMode` para simular mint/supply cuando el protocolo externo no está disponible. |
| **RemittanceScheduler** | Programa remesas en **DOC**: destinatario, monto, día del mes (1–28); estados `Scheduled`, `Executed`, etc.                                                                              |

### 3.2 Interfaces y librerías

- `IMoneyOnChain`, `ITropykusMarket`, `IPriceOracle`, `IERC20` — abstracciones para test y distintos despliegues.
- `libraries/Errors.sol` — errores personalizados (`UnauthorizedCaller`, `InsufficientBalance`, etc.).
- `mocks/MockERC20.sol` — tests.

### 3.3 Flujo on-chain conceptual

```
Usuario (EOA) ──► VaultManager (depósitos)
              ──► StrategyExecutor.executeStrategy (RBTC, MoC, Tropykus)
              ──► RemittanceScheduler.scheduleRemittance / execute...
```

Los detalles de llamadas externas dependen de las direcciones desplegadas y del modo fallback.

## 4. Agente (LangGraph)

### 4.1 Grafo

Definido en `packages/agent-core/src/graph/graph.ts`:

- Nodos: **`agent`** (LLM con tools) y **`tools`** (`ToolNode` prebuilt).
- Aristas: `START → agent →` (condicional) `→ tools → agent` o `END`.
- Condición `shouldContinue`: si el último mensaje AI tiene `tool_calls`, ir a `tools`; si no, terminar.

El estado (`AgentState`) extiende `MessagesAnnotation` y añade campos como `walletAddress`, `currentPlan`, `awaitingConfirmation`, `executionResult`, `error` — listos para flujos más ricos aunque el bucle mínimo actual sea agente ↔ herramientas.

### 4.2 Modelo

- `ChatOpenAI` con modelo **`gpt-4o-mini`**, temperatura baja y límite de tokens definido en `agentConfig`.

### 4.3 Herramientas

Ver [AI_PROCESS.md](./AI_PROCESS.md) para el listado y comportamiento. Todas consumen `@beexo/blockchain` donde aplica.

## 5. Frontend (Next.js App Router)

### 5.1 Rutas

| Ruta                   | Descripción                              |
| ---------------------- | ---------------------------------------- |
| `/`                    | Landing                                  |
| `/(app)/chat`          | Chat con agente                          |
| `/(app)/dashboard`     | Resumen de saldos y yield (datos de API) |
| `/(app)/remesas`       | Lista / gestión de remesas               |
| `/(app)/actividad`     | Historial                                |
| `/(app)/configuracion` | Ajustes                                  |

El grupo `(app)` comparte layout (navegación, etc.) sin afectar la URL pública.

### 5.2 Stack UI

- **Tailwind CSS 4** + utilidades (`cn`, `cva` en componentes tipo shadcn).
- **Wagmi + Viem** envueltos en providers en `app/providers.tsx`.
- **Reown AppKit** para conexión de wallet.

### 5.3 API design

- **Route Handlers** bajo `app/api/*/route.ts`.
- Validación con **Zod** (`safeParse` / `parse`) y códigos HTTP 400/422/500 según el caso.
- Tipos de respuesta alineados con `@beexo/types` donde existen (`ExecutionPlan`, etc.).

## 6. Sistema de feature flags

Implementación en `packages/blockchain/src/feature-flags.ts`:

- Lectura de variables `NEXT_PUBLIC_ENABLE_REAL_*` (strings `"true"` / `"1"`).
- Integraciones: `enableRealMoc`, `enableRealTropykus`, `enableRealPriceOracle`, `enableRealFiatRates`.
- Helper `isUsingMock(integration)` para UI o logs.

Los adaptadores intentan la ruta “real” y, en varios tools, caen a **mock** ante error de red o configuración.

## 7. Esquema de base de datos (Prisma)

Modelos principales en `packages/db/prisma/schema.prisma`:

- **User** — identificado por `walletAddress` único.
- **Conversation** / **Message** — hilo con rol y `metadata` JSON opcional.
- **ExecutionPlan** — intención, pasos (`Json`), advertencias, estado (`draft` → `confirmed` → …).
- **Remittance** — programación, monto USD/DOC, día del mes, `onChainId` opcional.
- **Transaction** — registro de operaciones; flag `isMock`.
- **UserSettings** — moneda local y tasa de visualización.

El esquema está preparado para persistir el flujo del agente aunque parte de la demo aún use APIs mock en Next.js.

## 8. Seguridad y consideraciones

- **Claves privadas:** solo en servidor / CI para deploy; nunca en `NEXT_PUBLIC_*`.
- **API keys OpenAI:** solo en servidor; el cliente no debe recibirlas.
- **Confirmación humana:** el system prompt exige confirmación antes de ejecutar; la UI muestra “En demo no se ejecutan transacciones reales” en el botón de plan.
- **Validación de entrada:** Zod en APIs; límites de historial de chat para evitar payloads enormes.
- **Smart contracts:** uso de `ReentrancyGuard`, comprobaciones de montos y roles `owner` donde corresponde; **no sustituyen una auditoría formal**.
- **RPC públicos:** pueden rate-limitar; en producción conviene RPC dedicado o fallback multi-nodo.
- **Supabase:** aplicar RLS y políticas por `wallet` o sesión cuando se conecte el cliente directamente al backend de datos.

---

_Última actualización alineada con el código del repositorio AlcancIA._

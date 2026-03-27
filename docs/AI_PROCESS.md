# Proceso del agente IA — AlcancIA

Documentación del diseño del asistente: LangGraph, herramientas, prompts y comportamiento en modo real vs mock.

## 1. ¿Por qué LangGraph y no solo LangChain?

- **Ciclos explícitos:** El patrón agente → herramientas → agente se modela como un **grafo** con aristas condicionales, no solo una cadena lineal de mensajes.
- **Estado compartido:** `AgentState` puede crecer con `conversationId`, planes, flags de confirmación y errores sin rehacer toda la orquestación.
- **Prebuilt `ToolNode`:** Reduce código repetitivo para invocar tools y volver al modelo.
- **Límite de recursión:** `recursionLimit: 40` en `invoke` evita bucles infinitos en tool loops.
- **Extensibilidad:** Añadir nodos (p. ej. “human approval”, persistencia en Prisma) es más claro que anidar cadenas ad hoc.

LangChain (mensajes, tools, OpenAI) sigue siendo la base; LangGraph aporta la **máquina de estados** sobre ese stack.

## 2. Diseño tipo ReAct

El flujo implementado es el clásico **razonamiento + acción**:

1. El modelo recibe el **system prompt** y el historial (más un mensaje de contexto de wallet si existiera dirección).
2. El modelo **decide** si llama herramientas (`tool_calls`) o responde en texto.
3. Si hay tools → nodo `ToolNode` ejecuta y devuelve resultados al modelo.
4. El modelo puede iterar hasta responder sin más `tool_calls` → **END**.

Esto equivale a un **bucle ReAct** donde las “acciones” son las tools tipadas con Zod en el lado de esquemas y definiciones LangChain.

## 3. Estados y transiciones (máquina abstracta)

Aunque el grafo compilado solo tiene `agent` y `tools`, el **estado anotado** anticipa:

| Campo                  | Rol                                                        |
| ---------------------- | ---------------------------------------------------------- |
| `messages`             | Historial (usuario / asistente / tool).                    |
| `walletAddress`        | Dirección para tools de balance y ejecución.               |
| `conversationId`       | Correlación con DB futura.                                 |
| `currentPlan`          | Plan estructurado si se persiste.                          |
| `awaitingConfirmation` | Para flujos que exijan “sí” explícito antes de `execute*`. |
| `executionResult`      | Resultado de tools de ejecución.                           |
| `error`                | Mensaje de fallo.                                          |

Transición lógica deseada en producto: **consulta → plan → confirmación → execute**; hoy la **confirmación** está reforzada sobre todo por el **system prompt** y por la UI del plan en modo mock.

## 4. Herramientas disponibles (10)

Definidas en `packages/agent-core/src/tools/index.ts` (`allTools`):

| #   | Tool                     | Función                                                           |
| --- | ------------------------ | ----------------------------------------------------------------- |
| 1   | `get_rbtc_price`         | Precio BTC/USD (CoinGecko o mock según flags).                    |
| 2   | `get_tropykus_apy`       | APY de Tropykus (adapter real o mock).                            |
| 3   | `estimate_doc_output`    | Estimación RBTC → DOC.                                            |
| 4   | `get_wallet_balance`     | Balance RBTC/DOC (mock por dirección en parte del flujo).         |
| 5   | `get_portfolio_status`   | Resumen de posición.                                              |
| 6   | `build_execution_plan`   | Clasifica intención y arma pasos, advertencias (APY bajo, saldo). |
| 7   | `schedule_remittance`    | Programar remesa (capa adaptada / store según implementación).    |
| 8   | `execute_strategy`       | Pipeline MoC + Tropykus con fallback mock.                        |
| 9   | `execute_remittance`     | Ejecutar remesa identificada.                                     |
| 10  | `get_transaction_status` | Estado por `txHash`.                                              |

## 5. Decisiones de diseño del system prompt

Ubicación: `packages/agent-core/src/prompts/system.ts`.

- **Rol:** Asistente financiero para LATAM, tono claro y sin jerga innecesaria.
- **Reglas duras:** Siempre plan antes de ejecutar; **nunca** ejecutar sin confirmación explícita; advertir si APY &lt; 2%; verificar balance; mostrar USD + moneda local (ARS por defecto).
- **Honestidad:** No inventar integraciones; distinguir estimación vs ejecución real.
- **Formato de plan:** Objetivo, pasos numerados, montos, APY, advertencias, remesa si aplica.

`agentConfig` centraliza `minApyWarningThreshold` (2%), modelo, temperatura y `maxTokens`.

## 6. Flujo de confirmación

- **Prompt:** Pide confirmación verbal (“¿Confirmás este plan?”) antes de usar tools destructivas o de ejecución.
- **Frontend:** La tarjeta “Plan propuesto” con botón **Confirmar plan** actualiza estado local (`planConfirmed`); el texto aclara que en demo no hay tx reales.
- **Gap conocido:** Con **OpenAI** activo, la API `/api/chat` devuelve principalmente **texto**; la tarjeta estructurada (`ExecutionPlan`) viene del **mock** HTTP. Unificar implicaría parsear `toolCalls` o una tool que devuelva JSON de plan firmado.

## 7. Manejo de errores

- En **route** Next: si falla OpenAI, se hace **fallback** a `buildMockReply` y `source: 'mock'`.
- En **tools** de estrategia: `runWithMockFallback` intenta adaptador real y cae a mock ante excepción.
- **Errores on-chain:** el prompt pide explicarlos en lenguaje simple al usuario.

## 8. Real vs mock en el agente

- Sin `OPENAI_API_KEY`: respuestas **mock** con reglas por regex en `mock-chat-response.ts` + planes de ejemplo.
- Con clave: **LangGraph** ejecuta tools que a su vez respetan **feature flags** de `@beexo/blockchain`.
- Oráculo de precios: por defecto **real** (CoinGecko) con caché; desactivable vía flag para valores fijos.
- Fiat USD/ARS: típicamente **mock** hasta conectar un proveedor real.

## 9. Prompts de ejemplo probados (intención → resultado esperado)

| Prompt del usuario                    | Resultado esperado                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| “Quiero invertir 0.01 RBTC”           | Plan de estrategia: conversión a DOC / Tropykus, APY, advertencias si APY bajo. |
| “Mandá 50 dólares a mi mamá el día 1” | Plan de remesa recurrente, día del mes, validación 1–28.                        |
| “¿Cuál es mi balance?”                | Tool o texto con RBTC/DOC y equivalente USD/local.                              |
| “¿Cuánto rinde Tropykus?”             | Tool `get_tropykus_apy` o explicación con cifra y si es simulada.               |

**Quick prompts** en la UI (`lib/constants.ts`) alinean estos casos para la demo.

## 10. Prompts descartados o no usados

- **Prompts demasiado largos** con políticas legales completas: descartados para hackathon — mantienen el foco en UX y reglas operativas.
- **Instrucciones que sugerían ejecución silenciosa:** explícitamente prohibidas en el system prompt (riesgo de seguridad y confianza).
- **Respuestas solo en inglés:** descartadas; el producto es **es-AR / es-LATAM**.

## 11. Edge cases considerados

- **Sin balance suficiente:** `build_execution_plan` añade advertencias si el monto operativo supera ~99% del estimado.
- **APY bajo:** aviso si &lt; umbral configurado (2%).
- **Red incorrecta:** la app puede mostrar badge de red; el agente debe advertir si las tools fallan por RPC.
- **Sin API key:** degradación graceful a mock.
- **Rate limit CoinGecko:** caché 5 min; si falla, depende del modo mock del oráculo.

## 12. Latencia orientativa por operación

Estimaciones **orden de magnitud** (dependen de red, modelo y número de tool turns):

| Operación                           | Latencia típica                                          |
| ----------------------------------- | -------------------------------------------------------- |
| Respuesta mock (sin LLM)            | &lt; 50 ms                                               |
| Una vuelta LLM sin tools            | ~0,5–2 s                                                 |
| LLM + 1–3 tools (precio, APY, plan) | ~2–8 s                                                   |
| LLM + muchas iteraciones            | Hasta decenas de segundos (acotado por `recursionLimit`) |

## 13. LangSmith

- Variables en `.env.example`: `LANGCHAIN_TRACING_V2`, `LANGCHAIN_API_KEY`, `LANGCHAIN_PROJECT`, `LANGCHAIN_ENDPOINT`.
- El ecosistema LangChain suele respetar estas variables para enviar trazas a **LangSmith** cuando están habilitadas; conviene verificar en la versión exacta de dependencias del monorepo.
- `ENABLE_AGENT_LANGSMITH` aparece en el ejemplo de entorno como interruptor adicional para futura integración explícita en código.

---

_Para la arquitectura general del sistema, ver [ARCHITECTURE.md](./ARCHITECTURE.md)._

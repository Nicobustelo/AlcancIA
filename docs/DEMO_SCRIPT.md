# Guion de demo (3–5 minutos) — Beexo AgentYield

Guion en español para presentar el proyecto a jurados o en video. Ajustá tiempos según el formato.

**Antes de grabar o entrar en vivo:** tené la wallet en **Rootstock Testnet**, algo de **tRBTC** si querés mostrar conexión real, y decidí si mostrás el chat **con** `OPENAI_API_KEY` (respuesta rica) o **sin clave** (modo mock con tarjeta de plan estructurada).

---

## Introducción (30–45 s)

**Decís:** “Beexo AgentYield es una plataforma DeFi en **Rootstock** que combina **protección en DOC**, **yield en Tropykus** y **remesas programadas**, guiada por un **agente en español** que arma un plan antes de cualquier ejecución.”

Mostrá la **landing** (`/`) y el mensaje de valor: ahorro, inflación, remesas familiares.

---

## Paso 1 — Landing y propuesta de valor (45 s)

1. Abrí **http://localhost:3000** (o la URL desplegada).
2. Recorré en voz alta: qué problema atiende (inflación, remesas, acceso a DeFi).
3. Mencioná en una frase: **RBTC → DOC → Tropykus** + **scheduler de remesas**.

---

## Paso 2 — Conectar wallet (30 s)

1. Clic en conectar wallet (**Reown / WalletConnect**).
2. Elegí la cuenta y verificá que la red sea **RSK Testnet** (chain id 31) si la UI lo muestra.
3. Comentá: “Acá entra Beexo Wallet o cualquier wallet compatible.”

---

## Paso 3 — Ir al chat (15 s)

1. Navegá a **Chat** (`/chat`).
2. Mencioná que el asistente entiende **lenguaje natural** y no requiere saber los nombres de los protocolos.

---

## Paso 4 — Mensaje compuesto (45–60 s)

Escribí o dictá este prompt (o una variante cercana):

> “Quiero proteger **0,01 RBTC** de la inflación y mandar **10 dólares** a mi mamá el **1 de cada mes**.”

**Qué esperar:**

- **Sin OpenAI:** el mock puede combinar patrones de “proteger/inflación” y “remesa/mamá/mes”; si la respuesta es parcial, reforzá con un segundo mensaje o usá los **botones de sugerencias** de la UI.
- **Con OpenAI:** el agente debería integrar intención mixta (conversión + yield + remesa) y citar precios/APY vía tools cuando corresponda.

---

## Paso 5 — Plan, APY y advertencias (45 s)

1. Señalá el texto del plan (objetivo, pasos, montos).
2. Si aparece la **tarjeta “Plan propuesto”** (modo mock o futuro mapeo desde tools): mostrá **pasos numerados**, **APY** si figura, y el bloque de **advertencias**.
3. Explicá: “El sistema prompt obliga a **no ejecutar** sin confirmación y a advertir si el APY es muy bajo.”

---

## Paso 6 — Confirmar (20 s)

1. Clic en **Confirmar plan**.
2. Aclaré en voz alta la leyenda de la UI: en **demo** no se disparan transacciones reales desde ese botón; en producción esto enlazaría con firma en wallet.

---

## Paso 7 — Resultado de la “ejecución” (20 s)

1. Leé la respuesta del asistente (simulada o explicativa).
2. Si usás modo OpenAI con tools de ejecución en un entorno avanzado, podrías mostrar JSON de pasos; en la demo estándar, el foco es **transparencia del plan**.

---

## Paso 8 — Dashboard (30 s)

1. Andá a **Dashboard** (`/dashboard`).
2. Mostrá **balances**, **yield** y **próxima remesa** (en la demo actual los datos del endpoint pueden ser **mock** — decilo con honestidad).
3. Conectá con el discurso: “Acá converge lo que el usuario delegó al agente.”

---

## Paso 9 — Remesas (20 s)

1. Abrí **Remesas** (`/remesas`).
2. Explicá el vínculo con el contrato **RemittanceScheduler** y el modelo de datos en Prisma.

---

## Paso 10 — Cierre para jurados (30–45 s)

Cerrá con **tres pilares técnicos:**

1. **Monorepo** (pnpm + Turbo), **Next.js 15** y **contratos Hardhat** probados (**20 tests**).
2. **Agente LangGraph** con tools que leen **precios reales** (CoinGecko) y protocolos en modo **híbrido** (real + mock).
3. **Rootstock** como capa de liquidación compatible con el ecosistema Bitcoin.

Invitá a revisar **README**, **ARCHITECTURE.md** y **JUDGES_GUIDE.md** para profundidad.

---

**Tiempo total:** aprox. **3–5 minutos** si no profundizás en código; extendé el paso 4–5 si el formato lo permite.

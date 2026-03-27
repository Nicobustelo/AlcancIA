# Contexto del Proyecto: AlcancIA (Beexo AgentYield)

Este documento centraliza el conocimiento sobre el proyecto AlcancIA (también referido como Beexo AgentYield), una plataforma DeFi sobre **Rootstock (RSK)** que integra un agente de IA para facilitar la gestión de ahorros, rendimientos y remesas.

## 1. Visión General

AlcancIA es un prototipo de hackathon diseñado para usuarios en Latinoamérica que buscan proteger su capital de la inflación utilizando Bitcoin y Stablecoins.

- **Problema:** Inflación, acceso complejo a DeFi, remesas costosas.
- **Solución:** Flujo simplificado RBTC → DOC (Money on Chain) → Tropykus (Yield) + Remesas programadas, todo mediado por un agente conversacional en español.

## 2. Arquitectura del Monorepo (pnpm + Turborepo)

El proyecto está organizado en una estructura de monorepo para compartir tipos, lógica de negocio y configuraciones.

### Aplicaciones (`apps/`)

- **`web/`**: Frontend principal en **Next.js 15 (App Router)**.
  - Interfaz de usuario (Chat, Dashboard, Remesas, Actividad).
  - Integración con wallets vía **Reown AppKit** (WalletConnect).
  - API Routes para chat, dashboard y gestión de datos.
- **`agent/`**: Servicio standalone (Express) opcional para el agente de IA.

### Paquetes (`packages/`)

- **`agent-core/`**: El "cerebro" del proyecto.
  - Implementación del grafo de IA con **LangGraph**.
  - Definición de herramientas (Tools), prompts y esquemas de validación (Zod).
- **`blockchain/`**: Capa de integración con la red Rootstock.
  - Adaptadores para Money on Chain (DOC) y Tropykus.
  - ABIs de contratos y lógica de oráculos de precios.
  - **Feature Flags**: Sistema para alternar entre integraciones reales y mocks.
- **`db/`**: Persistencia de datos con **Prisma**.
  - Esquema para usuarios, conversaciones, planes de ejecución, remesas y transacciones.
- **`types/`**: Tipos TypeScript compartidos en todo el monorepo.
- **`config/`**: Configuraciones base de TypeScript (Next.js, Node).
- **`ui/`**: Componentes de UI compartidos (basados en Tailwind CSS 4).

### Contratos Inteligentes (`contracts/`)

Desarrollados en **Solidity** con **Hardhat**.

- **`VaultManager`**: Custodia RBTC y DOC, gestiona balances y posiciones.
- **`StrategyExecutor`**: Orquesta swaps de RBTC a DOC e ingresos a Tropykus.
- **`RemittanceScheduler`**: Permite programar y ejecutar remesas recurrentes.

## 3. Stack Tecnológico

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4, Lucide React.
- **Web3:** Wagmi, Viem, Reown AppKit.
- **IA:** LangGraph, LangChain, OpenAI (`gpt-4o-mini`).
- **Backend/DB:** Prisma, PostgreSQL (Supabase).
- **Blockchain:** Rootstock (RSK) Testnet/Mainnet.

## 4. El Agente de IA (LangGraph)

El agente sigue un patrón **ReAct** (Razonamiento + Acción) implementado como un grafo:

1.  **Entrada:** Mensaje del usuario + Historial.
2.  **Nodo Agente:** El LLM decide si responder o llamar a una herramienta.
3.  **Nodo Tools:** Ejecuta herramientas de balance, precios, APY o creación de planes.
4.  **Bucle:** El agente procesa los resultados de las herramientas hasta dar una respuesta final.

### Herramientas Clave:

- `get_rbtc_price`: Precio real vía CoinGecko.
- `get_tropykus_apy`: Rendimiento actual en Tropykus.
- `build_execution_plan`: Genera un plan estructurado (DOC + Yield + Remesa) para que el usuario confirme.
- `execute_strategy` / `execute_remittance`: Ejecución (simulada o real según flags).

## 5. Integración Blockchain y Mocks

El sistema es altamente configurable mediante variables de entorno:

- `NEXT_PUBLIC_ENABLE_REAL_MOC`: Habilita/deshabilita integración real con Money on Chain.
- `NEXT_PUBLIC_ENABLE_REAL_TROPYKUS`: Habilita/deshabilita integración real con Tropykus.
- **Fallback:** Los adaptadores tienen lógica de "mock fallback" para garantizar que la demo funcione incluso si los servicios externos fallan.

## 6. Modelos de Datos (Prisma)

- **User**: Identificado por `walletAddress`.
- **Conversation / Message**: Historial de chat persistente.
- **ExecutionPlan**: Planes propuestos por la IA (borrador → confirmado → ejecutado).
- **Remittance**: Detalles de envíos programados (monto, destinatario, día).
- **Transaction**: Historial de operaciones on-chain y off-chain.

## 7. Flujo de Usuario Típico

1.  **Conexión:** El usuario conecta su wallet (Beexo, Metamask).
2.  **Chat:** El usuario dice: "Quiero ahorrar 0.01 RBTC y mandar 50 USD a mi mamá el día 5".
3.  **Plan:** El agente consulta precios, APY y genera un **Plan de Ejecución**.
4.  **Confirmación:** El usuario revisa el plan en la UI y hace clic en "Confirmar".
5.  **Ejecución:** Se interactúa con los Smart Contracts en RSK para convertir, depositar y programar.

## 8. Scripts y Comandos Útiles

- `pnpm dev`: Inicia todo en modo desarrollo.
- `pnpm test:contracts`: Corre los tests de Solidity (20 escenarios).
- `pnpm db:migrate`: Aplica cambios en la base de datos.
- `pnpm deploy:testnet`: Despliega contratos a RSK Testnet.

---

_Este documento es una guía de referencia rápida para mantener la coherencia durante el desarrollo._

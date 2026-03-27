# Deployment — AlcancIA

Guía en español para desplegar contratos en RSK testnet, configurar entorno y publicar frontend/servicios.

## Prerrequisitos

- **Node.js ≥ 20** y **pnpm** (versión indicada en el `package.json` raíz).
- Cuenta en **Reown Cloud** para `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
- Proyecto **Supabase** (o Postgres compatible) para `DATABASE_URL` / `DIRECT_URL`.
- **Wallet** con **RBTC en testnet** para gas del deploy y pruebas.
- Opcional: cuenta **OpenAI** y **LangSmith** para el agente y observabilidad.

## 1. Deploy de contratos a RSK testnet

### 1.1 Variables

En `.env` (raíz del monorepo):

```env
DEPLOYER_PRIVATE_KEY=0x...   # sin compartir; solo CI/ máquina segura
RSK_TESTNET_RPC=https://public-node.testnet.rsk.co
```

### 1.2 Comandos

```bash
pnpm install
pnpm --filter contracts compile
pnpm deploy:testnet
```

El script `contracts/scripts/deploy.ts` despliega y suele dejar artefactos / direcciones en `contracts/deployments/`. Copiá las direcciones resultantes a:

```env
NEXT_PUBLIC_VAULT_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_STRATEGY_EXECUTOR_ADDRESS=0x...
NEXT_PUBLIC_REMITTANCE_SCHEDULER_ADDRESS=0x...
```

Ajustá también direcciones **MoC** / **Tropykus** de testnet si tu deploy las requiere (ver `.env.example`).

### 1.3 Verificación

- Explorador: `NEXT_PUBLIC_RSK_EXPLORER_TESTNET` (p. ej. https://explorer.testnet.rootstock.io).
- `pnpm test:contracts` en local antes del deploy para validar lógica.

## 2. Configuración de entorno (aplicación)

1. Copiá `.env.example` → `.env`.
2. Completá:
   - **DB:** `DATABASE_URL`, `DIRECT_URL`.
   - **Frontend público:** `NEXT_PUBLIC_*` (RPC, chain id `31` testnet, explorer, direcciones de contratos).
   - **Flags:** `NEXT_PUBLIC_ENABLE_REAL_MOC`, `NEXT_PUBLIC_ENABLE_REAL_TROPYKUS`, etc.
   - **OpenAI:** `OPENAI_API_KEY` si querés agente real en `/api/chat`.
   - **WalletConnect:** `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

3. Migraciones:

```bash
pnpm db:generate
pnpm db:migrate
# opcional
pnpm db:seed
```

## 3. Deploy en Vercel (frontend Next.js)

1. Conectá el repositorio a **Vercel**.
2. **Root directory:** `apps/web` (o el directorio que uses como app Next en el dashboard).
3. **Build command:** típicamente `cd ../.. && pnpm install && pnpm --filter web build` o un script que respete el monorepo (configurá según tu layout en Vercel; algunos usan `turbo build --filter=web`).
4. **Install command:** `pnpm install` (activar `corepack enable` y la versión de pnpm del package.json).
5. Inyectá todas las variables `NEXT_PUBLIC_*` y las secretas (`OPENAI_API_KEY`, `DATABASE_URL`, etc.) en el panel de Vercel.

> No expongas claves privadas del deployer ni `OPENAI_API_KEY` como variables públicas.

## 4. Servicio del agente (recomendaciones)

`apps/agent` es un servidor **Express** en el puerto **3001** (o `AGENT_PORT`).

Opciones:

- **Mismo proceso:** no aplica; es otro servicio.
- **VPS / Fly.io / Railway / Render:** Node 20, comando `pnpm --filter agent build && pnpm --filter agent start`, variables de entorno compartidas con el monorepo.
- **Integración futura:** cola de mensajes + worker si el tráfico crece.

Healthcheck: `GET /api/health`.

## 5. Checklist pre-demo

- [ ] Contratos desplegados y direcciones en env.
- [ ] `pnpm build` exitoso en `web`.
- [ ] Wallet con **testnet RBTC** y red correcta en la UI.
- [ ] Chat probado con y sin OpenAI (comportamiento esperado claro).
- [ ] RPC testnet respondiendo (o fallback mock activo sin sorpresas).
- [ ] Landing y rutas `(app)` cargan sin errores en consola críticos.

## 6. AlcancIA Wallet para la demo

- Instalá o abrí **AlcancIA Wallet** (o la wallet que usen en el hackathon).
- Agregá **Rootstock Testnet** si no está por defecto (chain id **31**).
- Conectá vía **WalletConnect** escaneando el QR de la dApp o usando el browser integrado si aplica.

## 7. Cómo obtener RBTC de testnet

1. Buscá el **faucet oficial** de Rootstock para testnet (documentación actual en https://dev.rootstock.io o canal del hackathon).
2. Solicitá tRBTC a la dirección de tu wallet de prueba.
3. Esperá confirmaciones y verificá saldo en el explorer de testnet.

_(Las URLs exactas de faucets cambian; usá la fuente oficial del evento o de Rootstock.)_

## 8. Troubleshooting

| Síntoma                 | Posible causa                 | Acción                                                    |
| ----------------------- | ----------------------------- | --------------------------------------------------------- |
| Deploy Hardhat falla    | Sin fondos / clave incorrecta | Verificar `DEPLOYER_PRIVATE_KEY` y saldo tRBTC            |
| Wallet no conecta       | Project ID inválido           | Revisar `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`            |
| Chat siempre “Simulado” | Sin `OPENAI_API_KEY`          | Esperado; agregar clave o mostrar mock a propósito        |
| Precios raros           | CoinGecko down / rate limit   | Revisar caché y flag del oráculo; mock temporal           |
| Prisma error al migrar  | `DIRECT_URL` incorrecto       | Supabase pooler vs conexión directa                       |
| CORS en agente          | Frontend en otro dominio      | Configurar `cors` en `apps/agent` con orígenes permitidos |

---

Para visión general del sistema: [ARCHITECTURE.md](./ARCHITECTURE.md). Para el guion de presentación: [DEMO_SCRIPT.md](./DEMO_SCRIPT.md).

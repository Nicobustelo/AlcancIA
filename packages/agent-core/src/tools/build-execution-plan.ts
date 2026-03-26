import { tool } from '@langchain/core/tools';
import { createPriceOracle, createTropykusAdapter, getFeatureFlags, MockTropykusAdapter } from '@beexo/blockchain';
import { BuildExecutionPlanInput } from '../schemas';
import { agentConfig } from '../config';
import { mockBalancesForAddress, parseRbtcHumanAmount, usdToLocal } from './utils';

type PlanKind = 'consult' | 'convert' | 'invest' | 'remit' | 'deposit' | 'unknown';

function classifyIntent(text: string): PlanKind {
  const t = text.toLowerCase();
  if (/(remes|enviar|transferir.*otra|destinatario)/i.test(t)) return 'remit';
  if (/(tropykus|invertir|rendimiento|yield|ahorr|inter[eé]s)/i.test(t)) return 'invest';
  if (/(convertir|doc|rbitcoin|rbbtc.*doc|swap)/i.test(t)) return 'convert';
  if (/(depositar|dep[oó]sito|fondear)/i.test(t)) return 'deposit';
  if (/(saldo|balance|portafolio|cartera|cu[aá]nto tengo)/i.test(t)) return 'consult';
  return 'unknown';
}

async function apySnapshot(): Promise<{ apy: number; isMock: boolean }> {
  const { enableRealTropykus } = getFeatureFlags();
  if (!enableRealTropykus) {
    return new MockTropykusAdapter().getApy();
  }
  try {
    return await createTropykusAdapter(true).getApy();
  } catch {
    return new MockTropykusAdapter().getApy();
  }
}

export const buildExecutionPlanTool = tool(
  async (input) => {
    const kind = classifyIntent(input.intent);
    const { rbtc, doc } = mockBalancesForAddress(input.walletAddress);
    const oracle = createPriceOracle();
    const btcQuote = await oracle.getBtcUsdPrice();
    const docQuote = await oracle.getDocUsdPrice();
    const rbtcN = parseRbtcHumanAmount(rbtc);
    const docN = Number.parseFloat(doc);
    const walletUsd = rbtcN * btcQuote.price + docN * docQuote.price;
    const apy = await apySnapshot();

    const amountHint = input.amount?.trim();
    let opRbtc = rbtcN * 0.25;
    if (amountHint) {
      try {
        opRbtc = parseRbtcHumanAmount(amountHint);
      } catch {
        const n = Number.parseFloat(amountHint.replace(',', '.'));
        if (Number.isFinite(n)) opRbtc = n;
      }
    }

    const estDocUsd = opRbtc * btcQuote.price;
    const localWallet = await usdToLocal(walletUsd);
    const localEst = await usdToLocal(estDocUsd);

    const warnings: string[] = [];
    if (apy.apy < agentConfig.minApyWarningThreshold) {
      warnings.push(
        `APY estimado Tropykus ${apy.apy.toFixed(2)}% inferior al ${agentConfig.minApyWarningThreshold}% de referencia.`,
      );
    }
    if (estDocUsd > walletUsd * 0.99) {
      warnings.push('El monto operativo parece cercano o superior al saldo estimado; verificá balance real antes de ejecutar.');
    }

    const steps: string[] = [];
    let objective = 'Operación general';

    switch (kind) {
      case 'consult':
        objective = 'Consultar saldos y posición';
        steps.push('Leer resumen de wallet (RBTC/DOC) y posición Tropykus.');
        steps.push('Mostrar totales en USD y moneda local.');
        break;
      case 'convert':
        objective = 'Convertir RBTC a DOC (Money on Chain)';
        steps.push(`Estimar DOC a recibir (~USD ${estDocUsd.toFixed(2)} / ${localEst.code} ${localEst.local.toFixed(2)}).`);
        steps.push('Ejecutar conversión MoC en Rootstock tras tu confirmación.');
        steps.push('Actualizar saldos y comprobante de transacción.');
        break;
      case 'invest':
        objective = 'Depositar DOC en Tropykus para rendimiento';
        steps.push('Verificar saldo DOC disponible (wallet o tras conversión previa).');
        steps.push(`Simular rendimiento con APY ~${apy.apy.toFixed(2)}% (dato ${apy.isMock ? 'simulado' : 'de mercado'}).`);
        steps.push('Ejecutar supply de DOC → kDOC tras confirmación explícita.');
        break;
      case 'remit':
        objective = 'Programar o ejecutar remesa recurrente';
        steps.push(
          `Definir destinatario (${input.recipientAddress ?? 'pendiente de indicar'}) y monto en USD.`,
        );
        steps.push(
          `Día sugerido del mes: ${input.dayOfMonth ?? 'a coordinar'} (máx. 28 para evitar meses cortos).`,
        );
        steps.push('Registrar schedule y ejecutar según política de confirmación.');
        break;
      case 'deposit':
        objective = 'Fondear wallet / preparar ahorro';
        steps.push('Recibir RBTC o DOC en la wallet del usuario (bridge o exchange).');
        steps.push('Validar saldo on-chain antes de estrategia RBTC→DOC→Tropykus.');
        break;
      default:
        objective = 'Aclarar intención con el usuario';
        steps.push('Preguntar si desea consultar saldos, convertir, invertir en Tropykus o configurar remesas.');
        steps.push('Repetir verificación de balance y presentar plan numerado antes de ejecutar.');
    }

    const plan = {
      kind,
      objective,
      walletAddress: input.walletAddress,
      context: {
        intent: input.intent,
        asset: input.asset ?? null,
        amount: input.amount ?? null,
        recipientAddress: input.recipientAddress ?? null,
        dayOfMonth: input.dayOfMonth ?? null,
      },
      estimates: {
        walletUsd,
        walletLocal: localWallet.local,
        localCurrency: localWallet.code,
        operationalRbtc: opRbtc,
        estimatedDocUsd: estDocUsd,
        estimatedDocLocal: localEst.local,
        btcPriceUsd: btcQuote.price,
        priceOracleMock: btcQuote.isMock,
      },
      apy: {
        percent: apy.apy,
        isMock: apy.isMock,
      },
      steps,
      warnings,
      confirmationRequired: agentConfig.confirmationRequired,
      distinctionNote:
        'Esto es un plan y estimaciones; la ejecución real ocurre solo tras tu confirmación explícita y puede diferir por fees y precio.',
    };

    return JSON.stringify(plan);
  },
  {
    name: 'build_execution_plan',
    description:
      'Arma un plan estructurado (pasos, montos USD y moneda local, APY, advertencias) a partir de la intención del usuario y la wallet. No ejecuta transacciones.',
    schema: BuildExecutionPlanInput,
  },
);

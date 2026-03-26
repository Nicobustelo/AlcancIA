import {
  IntentType,
  type ExecutionPlan,
  type ParsedIntent,
  type PlanStep,
} from '@beexo/types';

function baseIntent(raw: string, type: IntentType): ParsedIntent {
  return {
    type,
    rawMessage: raw,
    confidence: 0.85,
  };
}

function steps(list: Omit<PlanStep, 'id' | 'status'>[]): PlanStep[] {
  return list.map((s, i) => ({
    ...s,
    id: `step-${i + 1}`,
    status: 'pending' as const,
  }));
}

export function buildMockReply(message: string): {
  content: string;
  plan?: ExecutionPlan;
} {
  const lower = message.toLowerCase();

  if (/invertir|rendimiento|rbtc|tropykus|ahorr(o|á)/i.test(message)) {
    const plan: ExecutionPlan = {
      id: `plan-${Date.now()}`,
      intent: baseIntent(message, IntentType.SUPPLY_TROPYKUS),
      summary:
        'Depositar RBTC en Tropykus para generar rendimiento (simulado en demo).',
      steps: steps([
        {
          order: 1,
          action: 'swap_rbtc_doc',
          description: 'Convertir una parte de RBTC a DOC para estabilidad.',
          estimatedValue: 0.005,
        },
        {
          order: 2,
          action: 'supply_tropykus',
          description: 'Depositar en el pool de Tropykus y comenzar a acumular yield.',
          estimatedValue: 0.01,
        },
      ]),
      estimatedTotalUsd: 620,
      estimatedApy: 7.2,
      warnings: [
        'Esta es una simulación: confirmá montos y contratos en testnet antes de firmar.',
      ],
      risks: ['Riesgo de smart contract', 'Volatilidad de RBTC'],
      requiresConfirmation: true,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    return {
      content:
        'Perfecto. Armé un plan para que deposites en Tropykus vía DOC. Revisá los pasos y confirmá si querés seguir (en demo no se ejecuta on-chain).',
      plan,
    };
  }

  if (/remes(a|as)|enviar|mamá|familia|dólares|usd|\$|mes/i.test(message)) {
    const plan: ExecutionPlan = {
      id: `plan-${Date.now()}`,
      intent: baseIntent(message, IntentType.SCHEDULE_REMITTANCE),
      summary: 'Programar una remesa recurrente en stablecoins (demo).',
      steps: steps([
        {
          order: 1,
          action: 'quote_bridge',
          description: 'Cotizar ruta y comisión estimada para la remesa.',
        },
        {
          order: 2,
          action: 'schedule_remit',
          description: 'Programar envío mensual al destinatario indicado.',
          estimatedValue: 50,
        },
      ]),
      estimatedTotalUsd: 50,
      warnings: ['Verificá la dirección del destinatario antes de confirmar.'],
      risks: ['Tipo de cambio y fees de red'],
      requiresConfirmation: true,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    return {
      content:
        'Entendido: querés programar una remesa. Te dejo un plan con los pasos típicos. En producción esto se conectaría al scheduler on-chain.',
      plan,
    };
  }

  if (/balance|saldo|cuánto tengo/i.test(message)) {
    return {
      content:
        'En la demo mostramos balances simulados en el dashboard. Conectá tu wallet en Rootstock Testnet para ver datos reales cuando estén cableados.',
    };
  }

  if (/proteg|inflación|doc/i.test(message)) {
    return {
      content:
        'Para protegerte de la volatilidad podés orientar parte de tus RBTC hacia DOC (Money on Chain) y luego evaluar estrategias de yield. ¿Querés que armemos un plan paso a paso?',
    };
  }

  if (/hola|buenas|hey/i.test(lower)) {
    return {
      content:
        '¡Hola! Soy tu asistente de Beexo AgentYield. Podés pedirme invertir RBTC, programar remesas o revisar conceptos de la app.',
    };
  }

  return {
    content:
      'Gracias por tu mensaje. En esta demo puedo ayudarte con inversiones en Tropykus, remesas programadas y consultas generales sobre Rootstock. ¿Querés que arranquemos con un objetivo concreto?',
  };
}

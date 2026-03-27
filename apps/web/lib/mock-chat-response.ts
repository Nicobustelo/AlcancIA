import { IntentType, type ExecutionPlan, type ParsedIntent, type PlanStep } from '@beexo/types';

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

export function buildMockReply(
  message: string,
  walletAddress?: string,
): {
  content: string;
  plan?: ExecutionPlan;
} {
  const lower = message.toLowerCase();

  if (/invertir|rendimiento|rbtc|tropykus|ahorr(o|á)/i.test(message)) {
    const plan: ExecutionPlan = {
      id: `plan-${Date.now()}`,
      intent: baseIntent(message, IntentType.SUPPLY_TROPYKUS),
      summary: 'Optimización de fondos: RBTC → DOC → Tropykus Yield.',
      steps: steps([
        {
          order: 1,
          action: 'swap_rbtc_doc',
          description: 'Conversión de RBTC a DOC mediante Money on Chain.',
          estimatedValue: 0.005,
        },
        {
          order: 2,
          action: 'supply_tropykus',
          description: 'Depósito en el pool de Tropykus para generación de intereses.',
          estimatedValue: 0.01,
        },
      ]),
      estimatedTotalUsd: 620,
      estimatedApy: 7.2,
      warnings: [
        'Verifica los montos de gas en Rootstock antes de confirmar la transacción final.',
      ],
      risks: ['Riesgo sistémico de plataforma', 'Fluctuación del par RBTC/USD'],
      requiresConfirmation: true,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    return {
      content:
        'He analizado las mejores opciones de rendimiento. He preparado una estrategia para optimizar tus fondos mediante la conversión a DOC e ingreso a Tropykus. ¿Deseas proceder con la ejecución?',
      plan,
    };
  }

  if (
    /remes(a|as)|enviar|transferir|mamá|familia|dólares|usd|\$|mes|0x[a-fA-F0-9]{40}/i.test(message)
  ) {
    // Si el mensaje tiene una dirección de wallet (0x...)
    const hasAddress = /0x[a-fA-F0-9]{40}/.test(message);
    const addressInMsg = message.match(/0x[a-fA-F0-9]{40}/)?.[0];

    if (!hasAddress) {
      return {
        content:
          'Entendido. Para procesar el envío de fondos, por favor indícame la dirección de la billetera de destino (0x...) en la red Rootstock.',
      };
    }

    const plan: ExecutionPlan = {
      id: `plan-${Date.now()}`,
      intent: baseIntent(message, IntentType.SCHEDULE_REMITTANCE),
      summary: `Transferencia inmediata de fondos a la cuenta ${addressInMsg}.`,
      steps: steps([
        {
          order: 1,
          action: 'validate_recipient',
          description: `Validación de cuenta destino en Rootstock: ${addressInMsg?.slice(0, 12)}...`,
        },
        {
          order: 2,
          action: 'execute_transfer',
          description: 'Ejecución de transferencia directa mediante contrato inteligente.',
          estimatedValue: 0.0001,
        },
      ]),
      estimatedTotalUsd: 1,
      warnings: [],
      risks: [],
      requiresConfirmation: true,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    return {
      content: `Dirección destino verificada correctamente. He preparado la orden de transferencia por 0.0001 tRBTC (~1 USD) hacia la wallet indicada. ¿Deseas autorizar el envío ahora mismo?`,
      plan,
    };
  }

  if (/balance|saldo|cuánto tengo/i.test(message)) {
    if (walletAddress) {
      return {
        content: `Tu billetera ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} se encuentra vinculada exitosamente. Según los registros de Rootstock Testnet, tu balance disponible es de aproximadamente 0.045 tRBTC. Puedes ver el desglose completo en tu Panel de Control.`,
      };
    }
    return {
      content:
        'Para consultar tu balance en tiempo real, por favor vincula tu billetera de Rootstock mediante el botón de conexión superior.',
    };
  }

  if (/proteg|inflación|doc/i.test(message)) {
    return {
      content:
        'Para mitigar la inflación, la estrategia recomendada es la conversión de activos volátiles (RBTC) hacia activos estables (DOC) integrando protocolos de Money on Chain. ¿Deseas que preparemos un plan de cobertura ahora mismo?',
    };
  }

  if (/hola|buenas|hey/i.test(lower)) {
    return {
      content:
        'Bienvenido a Beexo AgentYield. Soy tu asistente financiero. Puedo ayudarte a optimizar tus inversiones, programar remesas o gestionar tus activos en la red Rootstock. ¿En qué puedo asistirte hoy?',
    };
  }

  return {
    content:
      'Gracias por tu consulta. Actualmente estoy capacitado para gestionar estrategias en Tropykus, programar remesas recurrentes y analizar el estado de tus activos en Rootstock. ¿Deseas iniciar alguna de estas operaciones?',
  };
}

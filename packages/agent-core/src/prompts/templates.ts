import { agentConfig } from '../config';

/** Encabezado sugerido al presentar un plan */
export const planHeader = (objective: string) =>
  `📋 **Plan propuesto**\n\n**Objetivo:** ${objective}\n`;

/** Bloque de confirmación explícita */
export const confirmationRequest =
  '¿Confirmás este plan? Respondé con un **sí** claro para continuar con la ejecución (simulada o real según el entorno).';

/** Mensaje cuando el APY está por debajo del umbral */
export const apyLowWarning = (apy: number) =>
  `⚠️ El APY estimado de Tropykus (${apy.toFixed(2)}%) es menor al ${agentConfig.minApyWarningThreshold}% que consideramos referencia. Te recomendamos evaluar si conviene en tu caso.`;

/** Balance insuficiente */
export const insufficientBalance = (neededUsd: number, availableUsd: number) =>
  `No alcanza el saldo: necesitás alrededor de **USD ${neededUsd.toFixed(2)}** y tenés **USD ${availableUsd.toFixed(2)}** equivalentes. Podés ajustar el monto o depositar antes.`;

/** Error on-chain genérico */
export const onChainErrorSimple = (detail?: string) =>
  `Hubo un inconveniente al procesar la operación en la red. ${
    detail ? `En términos simples: ${detail}` : 'Probá de nuevo en unos minutos; si persiste, contactá soporte.'
  }`;

/** Diferencia estimación vs ejecución */
export const estimationVsExecution =
  'Los montos son **estimaciones** hasta que la transacción se confirme en Rootstock; el resultado final puede variar levemente por comisiones y precio.';

/** Integración simulada */
export const simulatedIntegrationNote =
  'En este entorno parte de las integraciones pueden estar **simuladas** para la demo; te lo indico cuando corresponda.';

/** Resumen de montos en USD y moneda local */
export const formatDualCurrency = (
  amountUsd: number,
  amountLocal: number,
  localCode: string = agentConfig.defaultLocalCurrency,
) =>
  `**USD ${amountUsd.toFixed(2)}** (aprox. **${localCode} ${amountLocal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}**)`;

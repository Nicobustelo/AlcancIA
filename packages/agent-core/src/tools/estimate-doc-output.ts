import { tool } from '@langchain/core/tools';
import { createPriceOracle } from '@beexo/blockchain';
import { EstimateDocOutputInput } from '../schemas';
import { parseRbtcHumanAmount } from './utils';

export const estimateDocOutputTool = tool(
  async (input) => {
    const rbtc = parseRbtcHumanAmount(input.rbtcAmount);
    const oracle = createPriceOracle();
    const { price: btcPrice, isMock } = await oracle.getBtcUsdPrice();
    const estimatedDocUsd = rbtc * btcPrice;
    return JSON.stringify({
      rbtcAmount: input.rbtcAmount.trim(),
      rbtcParsed: rbtc,
      estimatedDoc: estimatedDocUsd,
      btcPrice,
      isMock,
      note: 'Estimación aproximada: RBTC × precio BTC/USD ≈ DOC en términos de dólares digitales (1 DOC ≈ 1 USD).',
    });
  },
  {
    name: 'estimate_doc_output',
    description:
      'Estima cuántos DOC (dólares digitales en cadena) podrías obtener al convertir una cantidad de RBTC, usando el precio BTC/USD vigente.',
    schema: EstimateDocOutputInput,
  },
);

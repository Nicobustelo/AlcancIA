import { tool } from '@langchain/core/tools';
import { createPriceOracle } from '@beexo/blockchain';
import { GetRbtcPriceInput } from '../schemas';

export const getRbtcPriceTool = tool(
  async () => {
    const oracle = createPriceOracle();
    const quote = await oracle.getBtcUsdPrice();
    return JSON.stringify({
      price: quote.price,
      isMock: quote.isMock,
      currencyPair: 'BTC/USD',
    });
  },
  {
    name: 'get_rbtc_price',
    description:
      'Obtiene el precio spot de BTC en USD (Rootstock RBTC sigue a BTC). Usa oráculo real o simulado según configuración del proyecto.',
    schema: GetRbtcPriceInput,
  },
);

import type { providers } from "ethers";
import { ethers } from "ethers";
import type { TokenInfo } from "@uniswap/token-lists";
import { AlphaRouter, SwapType } from "@uniswap/smart-order-router";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";

export class UniswapRouter {
  router: AlphaRouter;

  constructor(provider: providers.JsonRpcProvider) {
    this.router = new AlphaRouter({ chainId: 1, provider: provider });
  }

  async getPrice(token0Info: TokenInfo, token1Info: TokenInfo) {
    const token0 = new Token(1, token0Info.address, token0Info.decimals);
    const token1 = new Token(1, token1Info.address, token1Info.decimals);

    const currencyAmount = CurrencyAmount.fromRawAmount(
      token0,
      ethers.utils.parseUnits("1", token0Info.decimals).toString()
    );

    let route;

    route = await this.router.route(
      currencyAmount,
      token1,
      TradeType.EXACT_INPUT,
      {
        type: SwapType.UNIVERSAL_ROUTER,
        slippageTolerance: new Percent(5, 100),
      }
    );

    return route?.quote.toExact();
  }
}

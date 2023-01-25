import DataLoader from "dataloader";
import { db } from "./db.server";
import { provider } from "./provider.server";
import { tokenList, isStableCoin } from "./tokenList.server";
import { UniswapRouter } from "./uniswap.server";

const uniRouter = new UniswapRouter(provider);

async function tokenPrice(tokenID: string): Promise<number | null> {
  if (isStableCoin(tokenID)) {
    return 1;
  }

  const token0Info = tokenList.get(tokenID)?.tokenInfo;
  const token1Info = tokenList.get("usdc")?.tokenInfo;

  if (token0Info && token1Info) {
    try {
      const price = await uniRouter.getPrice(token0Info, token1Info);
      console.log("found price for ", tokenID, price);
      const num = Number(price);
      return isNaN(num) ? 0 : num;
    } catch (_error) {
      console.log("can not get price for ", tokenID);
      return null;
    }
  }
  return 0;
}

async function fetchTokensPrices(
  tokenIDS: readonly string[]
): Promise<(number | null)[]> {
  return await Promise.all(tokenIDS.map(tokenPrice));
}

const erc20tokenPriceLoader = new DataLoader(fetchTokensPrices, {
  cacheMap: db,
});

export function loadTokenPrice(tokenID: string): Promise<number | null> {
  const ID = tokenID === "eth" ? "weth" : tokenID;
  const price = erc20tokenPriceLoader.load(ID);
  return price;
}

export function loadTokensPrices(
  tokenIDS: string[]
): Promise<(number | null)[]> {
  return Promise.all(tokenIDS.map(loadTokenPrice));
}

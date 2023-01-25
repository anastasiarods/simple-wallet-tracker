import type { TokenInfo } from "@uniswap/token-lists";
import { tokenInfoToID } from "./tokenList.server";
import { initTokenList, tokenList } from "./tokenList.server";
import { provider } from "./provider.server";
import { loadTokensPrices } from "./prices.server";

export interface Asset {
  tokenID: string;
  tokenInfo?: TokenInfo;
  price: number;
  balance: number;
}

function tokensBalances(
  address: string
): Promise<{ tokenID: string; balance: number }[]> {
  const values = Array.from(tokenList.values());

  return Promise.all(
    values.map(async (token) => ({
      tokenID: tokenInfoToID(token.tokenInfo),
      balance: await token.balanceOf(address),
    }))
  );
}

export async function addressAssets(address: string): Promise<Asset[]> {
  try {
    await initTokenList();
    const balances = (await tokensBalances(address)).filter(
      (balance) => balance.balance > 0
    );
    const tokenIDSToLoad = balances.map((balance) => balance.tokenID);
    const prices = await loadTokensPrices(tokenIDSToLoad);

    const assets: Asset[] = [];

    for (const i in balances) {
      assets.push({
        tokenID: balances[i].tokenID,
        balance: balances[i].balance,
        tokenInfo: tokenList.get(balances[i].tokenID)?.tokenInfo,
        price: prices[i] || 0,
      });
    }

    return assets;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function ensName(address: string): Promise<String | null> {
  return await provider.lookupAddress(address);
}

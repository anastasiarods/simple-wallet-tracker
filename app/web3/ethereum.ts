import { ethers } from "ethers";
import type { TokenInfo } from "@uniswap/token-lists";
import { ETH_TOKEN_INFO, tokenInfoToID } from "./tokenList";
import { initTokenMap, ERC20_TOKEN_MAP } from "./tokenList";
import { provider } from "./provider";
import { loadTokenPrice, loadTokensPrices } from "./prices";

export async function ethBalance(address: string): Promise<number> {
  const balance = await provider.getBalance(address);
  const formatted = ethers.utils.formatUnits(balance, 18);
  return Number(formatted);
}

export async function erc20TokenBalance(
  address: string,
  tokenID: string
): Promise<number> {
  const token = ERC20_TOKEN_MAP.get(tokenID);
  if (token) {
    const num = Number(await token.balanceOf(address));
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

export interface Asset {
  tokenID: string;
  tokenInfo?: TokenInfo;
  price: number;
  balance: number;
}

function tokensBalances(
  address: string
): Promise<{ tokenID: string; balance: number }[]> {
  const values = Array.from(ERC20_TOKEN_MAP.values());

  return Promise.all(
    values.map(async (token) => ({
      tokenID: tokenInfoToID(token.tokenInfo),
      balance: await token.balanceOf(address),
    }))
  );
}

export async function addressAssets(address: string): Promise<Asset[]> {
  await initTokenMap(provider);
  const balances = (await tokensBalances(address)).filter(
    (balance) => balance.balance > 0
  );
  const tokenIDSToLoad = balances.map((balance) => balance.tokenID);
  const prices = await loadTokensPrices(tokenIDSToLoad);

  const eth = await ethBalance(address);
  const ethPrice = await loadTokenPrice("weth");

  const assets: Asset[] = [
    {
      tokenID: "eth",
      price: ethPrice,
      balance: eth,
      tokenInfo: ETH_TOKEN_INFO,
    },
  ];

  for (const i in balances) {
    assets.push({
      tokenID: balances[i].tokenID,
      balance: balances[i].balance,
      tokenInfo: ERC20_TOKEN_MAP.get(balances[i].tokenID)?.tokenInfo,
      price: prices[i],
    });
  }

  return assets;
}

export async function ensName(address: string): Promise<String | null> {
  return await provider.lookupAddress(address);
}

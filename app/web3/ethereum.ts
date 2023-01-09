import { ethers } from "ethers";
import type { TokenInfo } from "@uniswap/token-lists";
import { ETH_RPC_NODE_URL } from "~/constants";
import type { ERC20Token } from "./tokenList";
import {
  initTokenMap,
  ERC20_TOKEN_MAP,
  ETH_TOKEN_INFO,
  isStableCoin,
} from "./tokenList";
import { UniswapRouter } from "~/web3/uniswap";

export const provider = new ethers.providers.JsonRpcProvider(ETH_RPC_NODE_URL);
export const uniRouter = new UniswapRouter(provider);

export async function ethBalance(address: string) {
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

export async function erc20TokenPrice(tokenID: string): Promise<number> {
  if (isStableCoin(tokenID)) {
    return 1;
  }

  const token0Info = ERC20_TOKEN_MAP.get(tokenID)?.tokenInfo;
  const token1Info = ERC20_TOKEN_MAP.get("usdc")?.tokenInfo;

  if (token0Info && token1Info) {
    const price = await uniRouter.getPrice(token0Info, token1Info);
    const num = Number(price);
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

async function addressAssetData(
  tokenID: string,
  token: ERC20Token,
  address: string
): Promise<Asset | undefined> {
  const balance = await token.balanceOf(address);
  if (balance > 0.0000001) {
    const price = await erc20TokenPrice(tokenID);
    return { tokenID, balance, price, tokenInfo: token.tokenInfo };
  }
}

export async function addressAssets(address: string): Promise<Asset[]> {
  await initTokenMap(provider);

  const fetchEth = async () => {
    const balance = await ethBalance(address);
    const ethPrice = await erc20TokenPrice("weth");
    return {
      tokenID: "eth",
      balance: balance,
      price: ethPrice,
      tokenInfo: ETH_TOKEN_INFO,
    };
  };

  let fetchTokens: Promise<Asset | undefined>[] = [];

  ERC20_TOKEN_MAP.forEach(async (token: ERC20Token, tokenID: string) => {
    if (fetchTokens.length < 50) {
      fetchTokens.push(addressAssetData(tokenID, token, address));
    }
  });

  const assets = await Promise.all([fetchEth(), ...fetchTokens]);

  return assets.filter((asset): asset is Asset => !!asset);
}

export async function ensName(address: string) {
  return await provider.lookupAddress(address);
}

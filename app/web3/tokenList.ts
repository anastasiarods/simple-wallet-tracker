import type { TokenList, TokenInfo } from "@uniswap/token-lists";
import { STABLECOINS, TOKEN_LIST_LINK } from "~/constants";
import type { Contract, providers } from "ethers";
import { ethers } from "ethers";

export const ETH_TOKEN_INFO: TokenInfo = {
  chainId: 1,
  decimals: 18,
  symbol: "ETH",
  name: "Ethereum",
  address: "",
  logoURI:
    "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png?1595348880",
};

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint)",
  "function decimals() view returns (uint)",
];

export class ERC20Token {
  contract: Contract;
  tokenInfo: TokenInfo;

  constructor(tokenInfo: TokenInfo, provider: providers.JsonRpcProvider) {
    this.tokenInfo = tokenInfo;
    this.contract = new ethers.Contract(tokenInfo.address, ERC20_ABI, provider);
  }

  async balanceOf(address: string) {
    const balance = await this.contract.balanceOf(address);
    const formatted = ethers.utils.formatUnits(
      balance,
      this.tokenInfo.decimals
    );

    return Number(formatted);
  }
}

export type TokenMap = {
  [symbol: string]: ERC20Token;
};

export const ERC20_TOKEN_MAP = new Map<string, ERC20Token>();

export async function fetchTokenList(): Promise<TokenList> {
  const response = (await fetch(TOKEN_LIST_LINK).then((response) =>
    response.json()
  )) as TokenList;
  return response;
}

export async function initTokenMap(provider: providers.JsonRpcProvider) {
  if (ERC20_TOKEN_MAP.size === 0) {
    const tokenList = await fetchTokenList();
    tokenList.tokens
      .filter((token) => token.chainId === 1)
      .map((tokenInfo) => {
        ERC20_TOKEN_MAP.set(
          tokenInfoToID(tokenInfo),
          new ERC20Token(tokenInfo, provider)
        );
        return tokenInfo;
      });
  }
}

export function tokenInfoToID(token: TokenInfo): string {
  return token.symbol.toLowerCase();
}

export function isStableCoin(tokenID: string): Boolean {
  return STABLECOINS.includes(tokenID);
}

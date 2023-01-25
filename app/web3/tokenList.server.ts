import type { TokenList, TokenInfo } from "@uniswap/token-lists";
import { STABLECOINS, TOKEN_LIST_LINK } from "~/constants";
import type { Contract } from "ethers";
import { provider } from "./provider.server";
import { ethers } from "ethers";

let tokenList: Map<string, Token>;

declare global {
  var __tokenList: Map<string, Token>;
}

if (process.env.NODE_ENV === "production") {
  tokenList = new Map();
} else {
  if (!global.__tokenList) {
    global.__tokenList = new Map();
  }
  tokenList = global.__tokenList;
}

export { tokenList };

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

class Token {
  contract?: Contract;
  tokenInfo: TokenInfo;

  constructor(tokenInfo: TokenInfo) {
    this.tokenInfo = tokenInfo;
    if (tokenInfo.address) {
      this.contract = new ethers.Contract(
        tokenInfo.address,
        ERC20_ABI,
        provider
      );
    }
  }

  async balanceOf(address: string) {
    if (this.tokenInfo.symbol === "ETH") {
      const balance = await provider.getBalance(address);
      const formatted = ethers.utils.formatUnits(balance, 18);
      return Number(formatted);
    }
    if (this.contract) {
      const balance = await this.contract.balanceOf(address);
      const formatted = ethers.utils.formatUnits(
        balance,
        this.tokenInfo.decimals
      );
      return Number(formatted);
    }

    return 0;
  }
}

async function fetchTokenList(): Promise<TokenList> {
  const response = (await fetch(TOKEN_LIST_LINK).then((response) =>
    response.json()
  )) as TokenList;
  return response;
}

export async function initTokenList() {
  if (tokenList.size === 0) {
    tokenList.set(tokenInfoToID(ETH_TOKEN_INFO), new Token(ETH_TOKEN_INFO));

    const resp = await fetchTokenList();
    for (const token of resp.tokens) {
      if (token.chainId === 1) {
        tokenList.set(tokenInfoToID(token), new Token(token));
      }
    }
  }
}

export function tokenInfoToID(token: TokenInfo): string {
  return token.symbol.toLowerCase();
}

export function isStableCoin(tokenID: string): Boolean {
  return STABLECOINS.includes(tokenID);
}

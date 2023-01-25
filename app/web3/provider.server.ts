import { ETH_RPC_NODE_URL } from "~/constants";
import { ethers } from "ethers";

export const provider = new ethers.providers.JsonRpcProvider(ETH_RPC_NODE_URL);

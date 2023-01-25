import type { Asset } from "~/web3/ethereum.server";

export function totalValue(assets: Asset[]) {
  return assets.reduce(
    (sum, current) => sum + current.price * current.balance,
    0
  );
}

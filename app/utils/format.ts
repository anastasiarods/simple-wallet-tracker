import { PRECISION } from "~/constants";

export function currencyFormat(num: string | number) {
  if (typeof num === "number") {
    return num.toFixed(PRECISION).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }
  return Number.parseFloat(num)
    .toFixed(PRECISION)
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

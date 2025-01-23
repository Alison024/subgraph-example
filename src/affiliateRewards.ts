import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { getRanksLengh, getRank, Rank } from "./ranks";
import { log } from "@graphprotocol/graph-ts";
export const usdDecimals = new BigInt(1000000);
export const tokenDecimals = new BigInt(1 * 10 ** 18);
export class Percentage {
  percentage: BigDecimal;
  rate: BigDecimal;
  constructor(percentage: BigDecimal, rate: BigDecimal) {
    this.percentage = percentage;
    this.rate = rate;
  }
}
export class AffiliateResult {
  usdt: BigDecimal;
  cpx: BigDecimal;
  constructor(usdt: BigDecimal, cpx: BigDecimal) {
    this.usdt = usdt;
    this.cpx = cpx;
  }
  getResString(): string {
    return `usdt = ${this.usdt.toString()}; cpx = ${this.cpx.toString()}`;
  }
}
export function calculateReferralRewards(
  usdcAmount: BigInt,
  cpxAmount: BigInt
): AffiliateResult {
  //   let usdDecimals = new BigInt(1000000);
  //   let tokenDecimals = new BigInt(1 * 10 ** 18);
  const zeroBd = BigDecimal.fromString("0");
  const twoBd = BigDecimal.fromString("2");
  const usdcAmountBi: BigDecimal = new BigDecimal(usdcAmount.div(usdDecimals));
  const cpxAmountBi: BigDecimal = new BigDecimal(cpxAmount.div(tokenDecimals));
  let total: BigDecimal = new BigDecimal(usdcAmount.div(usdDecimals));
  let usdRewards: BigDecimal = BigDecimal.fromString("0");
  let percentages: Percentage[] = [];
  log.info(`getRanksLengh: {}`, [getRanksLengh().toString()]);
  for (let i = getRanksLengh() - 1; i >= 0; i++) {
    if (total == zeroBd) break;
    const rank: Rank | null = getRank(i);
    if (!rank) break;
    log.info(`getRank: data {}, index {}`, [rank.getResString(), i.toString()]);
    // Calculate the maximum amount that can be attributed to this rank
    let bracketMax: BigDecimal;
    // same as const bracketMax = Math.min(rank.max - rank.min + 1, total);
    if (rank.max == zeroBd) {
      bracketMax = total;
    } else {
      const delta = rank.max.minus(rank.min);
      if (delta < total) {
        bracketMax = delta;
      } else {
        bracketMax = total;
      }
    }
    // Compute commission based on the rank's rate
    const commission: BigDecimal = bracketMax.times(rank.rate.div(twoBd)); // = bracketMax * (rate / 2)
    usdRewards = usdRewards.plus(commission);

    // Track the percentage of the total contribution for this rank
    percentages.push(
      new Percentage(bracketMax.div(usdcAmountBi), rank.rate.div(twoBd))
    );
    // Deduct the processed amount from the remaining total
    total = total.minus(bracketMax);
  }
  let cpxRewards: BigDecimal = BigDecimal.fromString("0");
  for (let i = 0; i < percentages.length; i++) {
    cpxRewards = cpxRewards.plus(
      cpxAmountBi.times(percentages[i].percentage.times(percentages[i].rate))
    );
  }
  return new AffiliateResult(usdRewards, cpxRewards);
}

import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { AffiliateResult, getRanks, Percentage, Rank } from "./ranks";
export const usdDecimals = new BigInt(1000000);
export const tokenDecimals = new BigInt(1 * 10 ** 18);
export function calculateReferralRewards(
  usdcAmount: BigInt,
  cpxAmount: BigInt
): AffiliateResult {
  const ranks: Rank[] = getRanks().reverse();
  //   let usdDecimals = new BigInt(1000000);
  //   let tokenDecimals = new BigInt(1 * 10 ** 18);
  const zeroBd = BigDecimal.fromString("0");
  const twoBd = BigDecimal.fromString("2");
  const usdcAmountBi: BigDecimal = new BigDecimal(usdcAmount.div(usdDecimals));
  const cpxAmountBi: BigDecimal = new BigDecimal(cpxAmount.div(tokenDecimals));
  let total: BigDecimal = new BigDecimal(usdcAmount.div(usdDecimals));
  let usdRewards: BigDecimal = BigDecimal.fromString("0");
  let percentages: Percentage[] = [];
  for (let i = 0; i < ranks.length; i++) {
    if (total == zeroBd) break;
    const rank = ranks[i];
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

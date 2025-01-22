import { BigDecimal } from "@graphprotocol/graph-ts";

export class Rank {
  min: BigDecimal;
  max: BigDecimal;
  rate: BigDecimal;
  constructor(min: string, max: string, rate: string) {
    this.min = BigDecimal.fromString(min);
    this.max = BigDecimal.fromString(max);
    this.rate = BigDecimal.fromString(rate);
  }
}
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
}

export let ranks: Rank[] = [];
// rank 1, zero means Infinity
ranks.push(new Rank("650000", "0", "0.3"));
// rank 2
ranks.push(new Rank("490000", "650000", "0.26"));
// rank 3
ranks.push(new Rank("350000", "490000", "0.24"));
// rank 4
ranks.push(new Rank("250000", "350000", "0.22"));
// rank 5
ranks.push(new Rank("175000", "250000", "0.2"));
// rank 6
ranks.push(new Rank("115000", "175000", "0.18"));
// rank 7
ranks.push(new Rank("75000", "115000", "0.16"));
// rank 8
ranks.push(new Rank("45000", "75000", "0.14"));
// rank 9
ranks.push(new Rank("24000", "45000", "0.12"));
// rank 10
ranks.push(new Rank("0", "24000", "0.1"));

export function getRanks(): Rank[] {
  return ranks;
}

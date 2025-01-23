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
  getResString(): string {
    return `min = ${this.min.toString()}; max = ${this.max.toString()}; rate = ${this.rate.toString()}`;
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

export function getRanksLengh(): i32 {
  return ranks.length;
}

export function getRank(index: i32): Rank | null {
  if (index < ranks.length) {
    return ranks[index];
  } else {
    return null;
  }
}

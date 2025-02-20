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

export let ranks: Rank[] = [];
// rank 1, zero means Infinity
ranks.push(new Rank("650000", "0", "300"));
// rank 2
ranks.push(new Rank("490000", "650000", "260"));
// rank 3
ranks.push(new Rank("350000", "490000", "240"));
// rank 4
ranks.push(new Rank("250000", "350000", "220"));
// rank 5
ranks.push(new Rank("175000", "250000", "200"));
// rank 6
ranks.push(new Rank("115000", "175000", "180"));
// rank 7
ranks.push(new Rank("75000", "115000", "160"));
// rank 8
ranks.push(new Rank("45000", "75000", "140"));
// rank 9
ranks.push(new Rank("24000", "45000", "120"));
// rank 10
ranks.push(new Rank("0", "24000", "100"));

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

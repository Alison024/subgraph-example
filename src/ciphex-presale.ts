import {
  Address,
  bigDecimal,
  BigDecimal,
  BigInt,
  log,
} from "@graphprotocol/graph-ts";
import {
  Bought as BoughtEvent,
  Initialized as InitializedEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PresaleStarted as PresaleStartedEvent,
  StatusUpdated as StatusUpdatedEvent,
} from "../generated/CiphexPresale/CiphexPresale";
import {
  Bought,
  Initialized,
  OwnershipTransferStarted,
  OwnershipTransferred,
  PresaleStarted,
  ReferralContribution,
  StatusUpdated,
  TotalAffiliateRewards,
  TotalContributions,
  UserContribution,
} from "../generated/schema";
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
export function handleBought(event: BoughtEvent): void {
  const usdDecimals = new BigInt(1000000);
  const tokenDecimals = new BigInt(1 * 10 ** 18);
  const ranks: Rank[] = new Array<Rank>();
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
  // handling Bought
  let entity = new Bought(event.transaction.hash.toHex());
  entity.recipient = event.params.recipient;
  entity.referral = event.params.referral;
  entity.token = event.params.token;
  entity.tokenAmount = event.params.tokenAmount;
  entity.ciphexAmount = event.params.ciphexAmount;
  entity.ethPrice = event.params.ethPrice;
  entity.tokenPrice = event.params.tokenPrice;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  let zeroAddress = Address.fromString(
    "0x0000000000000000000000000000000000000000"
  );
  let usd: BigInt;
  if (event.params.token.equals(zeroAddress)) {
    usd = event.params.tokenAmount
      .times(event.params.ethPrice)
      .div(BigInt.fromString("1000000000000000000"));
    entity.usdContribution = usd;
  } else {
    usd = event.params.tokenAmount;
    entity.usdContribution = event.params.tokenAmount;
  }
  entity.save();

  // handling UserContribution
  const userId = event.params.recipient;
  let user = UserContribution.load(userId);
  if (!user) {
    user = new UserContribution(userId);
    user.totalUsdContribution = BigInt.fromI32(0);
    user.totalCiphexContribution = BigInt.fromI32(0);
  }
  user.totalUsdContribution = user.totalUsdContribution.plus(usd);
  user.totalCiphexContribution = user.totalCiphexContribution.plus(
    entity.ciphexAmount
  );
  user.save();

  log.info("Before referral check", []);
  // handling ReferralContribution
  if (event.params.referral.notEqual(zeroAddress)) {
    const referralId = event.params.referral;
    let referral = ReferralContribution.load(referralId);
    if (!referral) {
      referral = new ReferralContribution(referralId);
      referral.totalUsdContribution = BigInt.fromI32(0);
      referral.totalCiphexContribution = BigInt.fromI32(0);
      referral.totalUsdRewards = BigInt.fromI32(0);
      referral.totalCiphexRewards = BigInt.fromI32(0);
    }
    referral.totalUsdContribution = referral.totalUsdContribution.plus(usd);
    referral.totalCiphexContribution = referral.totalCiphexContribution.plus(
      entity.ciphexAmount
    );

    log.info("Before calculateReferralRewards", []);
    // handling Referral rewards
    const zeroBd = BigDecimal.fromString("0");
    const twoBd = BigDecimal.fromString("2");
    const usdcAmountBi: BigDecimal = new BigDecimal(
      referral.totalUsdContribution.div(usdDecimals)
    );
    const cpxAmountBi: BigDecimal = new BigDecimal(
      referral.totalCiphexContribution.div(tokenDecimals)
    );
    let total: BigDecimal = new BigDecimal(
      referral.totalUsdContribution.div(usdDecimals)
    );
    let usdRewards: BigDecimal = BigDecimal.fromString("0");
    let percentages: Percentage[] = [];
    let ranksLength = ranks.length;
    for (let i = ranksLength - 1; i >= 0; i--) {
      if (total == zeroBd) break;
      const rank: Rank | null = ranks[i];
      if (!rank) break;
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
    let rewRes: AffiliateResult = new AffiliateResult(usdRewards, cpxRewards);
    log.info("After calculateReferralRewards", []);
    let usdRewDelta: BigInt = BigInt.fromString(
      rewRes.usdt.truncate(0).toString()
    )
      .times(usdDecimals)
      .minus(referral.totalUsdRewards);
    let cpxRewDelta: BigInt = BigInt.fromString(
      rewRes.cpx.truncate(0).toString()
    )
      .times(tokenDecimals)
      .minus(referral.totalCiphexRewards);
    log.info("After converting res from BigDecimal to BigInt", []);
    referral.totalUsdRewards = BigInt.fromString(
      rewRes.usdt.truncate(0).toString()
    );
    referral.totalCiphexRewards = BigInt.fromString(
      rewRes.cpx.truncate(0).toString()
    );
    log.info("After updating total rewards", []);
    let totalAffiliateRewards = new TotalAffiliateRewards(zeroAddress);
    if (!totalAffiliateRewards) {
      totalAffiliateRewards = new TotalAffiliateRewards(zeroAddress);
      totalAffiliateRewards.totalUsdRewards = BigInt.fromI32(0);
      totalAffiliateRewards.totalCiphexRewards = BigInt.fromI32(0);
    }
    totalAffiliateRewards.totalUsdRewards =
      totalAffiliateRewards.totalUsdRewards.plus(usdRewDelta);
    totalAffiliateRewards.totalCiphexRewards =
      totalAffiliateRewards.totalCiphexRewards.plus(cpxRewDelta);
    referral.save();
    totalAffiliateRewards.save();
  }

  // handling TotalContributions
  let totalContributions = TotalContributions.load(zeroAddress);
  if (!totalContributions) {
    totalContributions = new TotalContributions(zeroAddress);
    totalContributions.totalUsdContribution = BigInt.fromI32(0);
    totalContributions.totalCiphexContribution = BigInt.fromI32(0);
  }
  totalContributions.totalUsdContribution =
    totalContributions.totalUsdContribution.plus(usd);
  totalContributions.totalCiphexContribution =
    totalContributions.totalCiphexContribution.plus(entity.ciphexAmount);
  totalContributions.save();
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.version = event.params.version;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleOwnershipTransferStarted(
  event: OwnershipTransferStartedEvent
): void {
  let entity = new OwnershipTransferStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handlePresaleStarted(event: PresaleStartedEvent): void {
  let entity = new PresaleStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.start = event.params.start;
  entity.end = event.params.end;
  entity.ciphexSupply = event.params.ciphexSupply;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleStatusUpdated(event: StatusUpdatedEvent): void {
  let entity = new StatusUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.token = event.params.token;
  entity.status = event.params.status;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

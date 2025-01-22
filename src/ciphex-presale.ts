import {
  Address,
  bigDecimal,
  BigDecimal,
  BigInt,
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
import { AffiliateResult, Percentage, Rank, getRanks } from "./ranks";
import {
  calculateReferralRewards,
  tokenDecimals,
  usdDecimals,
} from "./affiliateRewards";

export function handleBought(event: BoughtEvent): void {
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
    // handling Referral rewards
    let rewRes: AffiliateResult = calculateReferralRewards(
      referral.totalUsdContribution,
      referral.totalCiphexContribution
    );

    let usdRewDelta: BigInt = BigInt.fromString(rewRes.usdt.toString())
      .times(usdDecimals)
      .minus(referral.totalUsdRewards);
    let cpxRewDelta: BigInt = BigInt.fromString(rewRes.cpx.toString())
      .times(tokenDecimals)
      .minus(referral.totalCiphexRewards);

    referral.totalUsdRewards = BigInt.fromString(rewRes.usdt.toString());
    referral.totalCiphexRewards = BigInt.fromString(rewRes.cpx.toString());
    let totalAffiliateRewards = new TotalAffiliateRewards(zeroAddress);
    if (!totalAffiliateRewards) {
      totalAffiliateRewards = new TotalAffiliateRewards(referralId);
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

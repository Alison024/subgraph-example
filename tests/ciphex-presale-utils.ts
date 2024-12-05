import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Bought,
  Initialized,
  OwnershipTransferStarted,
  OwnershipTransferred,
  PresaleStarted,
  StatusUpdated
} from "../generated/CiphexPresale/CiphexPresale"

export function createBoughtEvent(
  recipient: Address,
  referral: Address,
  token: Address,
  tokenAmount: BigInt,
  ciphexAmount: BigInt,
  ethPrice: BigInt,
  tokenPrice: BigInt
): Bought {
  let boughtEvent = changetype<Bought>(newMockEvent())

  boughtEvent.parameters = new Array()

  boughtEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  boughtEvent.parameters.push(
    new ethereum.EventParam("referral", ethereum.Value.fromAddress(referral))
  )
  boughtEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  boughtEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAmount",
      ethereum.Value.fromUnsignedBigInt(tokenAmount)
    )
  )
  boughtEvent.parameters.push(
    new ethereum.EventParam(
      "ciphexAmount",
      ethereum.Value.fromUnsignedBigInt(ciphexAmount)
    )
  )
  boughtEvent.parameters.push(
    new ethereum.EventParam(
      "ethPrice",
      ethereum.Value.fromUnsignedBigInt(ethPrice)
    )
  )
  boughtEvent.parameters.push(
    new ethereum.EventParam(
      "tokenPrice",
      ethereum.Value.fromUnsignedBigInt(tokenPrice)
    )
  )

  return boughtEvent
}

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createOwnershipTransferStartedEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferStarted {
  let ownershipTransferStartedEvent = changetype<OwnershipTransferStarted>(
    newMockEvent()
  )

  ownershipTransferStartedEvent.parameters = new Array()

  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferStartedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPresaleStartedEvent(
  start: BigInt,
  end: BigInt,
  ciphexSupply: BigInt
): PresaleStarted {
  let presaleStartedEvent = changetype<PresaleStarted>(newMockEvent())

  presaleStartedEvent.parameters = new Array()

  presaleStartedEvent.parameters.push(
    new ethereum.EventParam("start", ethereum.Value.fromUnsignedBigInt(start))
  )
  presaleStartedEvent.parameters.push(
    new ethereum.EventParam("end", ethereum.Value.fromUnsignedBigInt(end))
  )
  presaleStartedEvent.parameters.push(
    new ethereum.EventParam(
      "ciphexSupply",
      ethereum.Value.fromUnsignedBigInt(ciphexSupply)
    )
  )

  return presaleStartedEvent
}

export function createStatusUpdatedEvent(
  token: Address,
  status: boolean
): StatusUpdated {
  let statusUpdatedEvent = changetype<StatusUpdated>(newMockEvent())

  statusUpdatedEvent.parameters = new Array()

  statusUpdatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  statusUpdatedEvent.parameters.push(
    new ethereum.EventParam("status", ethereum.Value.fromBoolean(status))
  )

  return statusUpdatedEvent
}

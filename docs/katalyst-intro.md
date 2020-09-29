---
id: Katalyst-Intro
title: Katalyst - What's New
---
[//]: # (tagline)
## What's New with Katalyst?

We give a brief summary on the technical changes regarding the Katalyst upgrade below.

## Backwards Compatibility

The Katalyst upgrade is **backwards-compatible** with the previous network proxy contract. Existing implementations of `getExpectedRate()`, `trade()`, `tradeWithHint()`, etc. should not be affected by this upgrade, and should work normally.

### Old Proxy

We recommend using / migrating to the new proxy contract `0x9AAb3f75489902f3a48495025729a0AF77d4b11e` if possible.

Nevertheless, the old mainnet network proxy contract `0x818E6FECD516Ecc3849DAf6845e3EC868087B755` will work as per normal. Transactions to the current network proxy will work without any behavior change with the exception that the `PERM` hint (signaling the filtering of permissionless reserves in a trade) will be ignored and no filtering actions will take place.

### New Proxy

The new proxy contract retains the same function names for fetching rates and executing trades, although we **recommend using the new APIs**. This means that if one were to simply switch the network proxy address without changing any existing code, there should be no noticeable behaviour change.


## Update: Fee Model

The fee model has been updated. In addition to the network fee, we introduce a platform fee for affiliates.

### Network Fee

Previously, reserves would need to pay the network 0.25% of the trades they facilitate as payment for their participation in the network. With Katalyst, this is no longer the case. We outline the changes below:

* The network fee has been **reduced from 0.25% to 0.20%** at launch. The KyberDAO will get to vote and determine this amount thereafter.
* The network fee is now charged from the takers as part of the trade, and is collected in ETH.
* It is split into 3 proportions, as determined by the KyberDAO:
  * Burn - Converted into KNC and burnt, thus retaining the deflationary model as before.
  * Rewards - Distributed as rewards to stakers who stake in the KyberDAO.
  * Rebates - Given as incentives to some reserves for their market making services, so that they are able to quote tighter spreads, provide substantial liquidity, drive more volume, etc.
* Reserves no longer have to pay fees, and as such, need not aintain and top-up a KNC wallet for the purpose of paying network fees.
* Fees are kept in the new KyberFeeHandler smart contract, which will then distribute the fees according to the percentages set for Burning, Rewards, and Rebates.

### Platform Fees

Affiliates are now able to charge custom platform fees. This is also collected in ETH. Read more about platform fees [here](integrations-platformfees.md).

## Removed: Permissionless / Permissioned Reserves

Previously, we separated the reserves into 2 categories: permissioned and permissionless. The `hint` parameter was used to only allow trading against permissioned reserves. This hint is no longer valid. However, if the “PERM” hint is still passed, it is ignored and the trade executes as per normal. This is to ensure backwards compatibility with existing contracts that still use this hint.

## Removed: WhiteList Contract

The WhiteList smart contract is no longer used. As such, all functions related to user caps or being able to filter out addresses is no longer available.

## Deprecated: FeeBurner Contract

The FeeBurner smart contract is deprecated and replaced by the KyberFeeHandler contract. As such, existing functions supported by the FeeBurner, such as the burning of KNC, the distribution of fees to the fee sharing partners, or the setting of the KNC rate on the FeeBurner will no longer work.

## New: Reserve IDs

Instead of reserve addresses, we utilise reserve IDs for identification of reserves. Read more about reserve IDs [here](reserves-resIDs.md).

## New: Reserve Routing

Prior to Katalyst, when Kyber handles a trade, it searches through all relevant reserves supporting the token in the trade for the best rate offered for the full amount of the trade. 

In Katalyst, routing trades to specific reserves is now possible, through the `hint` parameter. Refer to the [relevant integration guides](integrations-intro.md) on reserve routing.

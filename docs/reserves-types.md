---
id: Reserves-Types
title: Reserve Types
---
[//]: # (tagline)
## Introduction
There are currently 2 different reserve types that liquidity providers can choose for deployment and operate, namely, the Fed Price Reserve and the Automated Price Reserve. The Orderbook Reserve is temporarily disabled as we will update it to be compatible with the Katalyst upgrade.

There are also other reserve types that serve various functions to the ecosystem.

## Fed Price Reserve (FPR)
A Fed Price Reserve utilises an off-chain component (e.g. a script running on a server) that pulls price
feeds and calculates conversion rates. These rates are sent via on-chain transactions and stored in a pricing smart contract. A separate smart contract storing reserve funds will refer to the pricing smart contract for the expected token conversion rate.

It is complex to setup and maintain, and requires Ether for making the periodic price updates on-chain.

## Automated Price Reserve (APR)
This reserve type relies on a predefined algorithm written in a smart contract to automatically provide rates for the token being served liquidity for. The initial rate is set based on the initial liquidity provided, and only adjusts after each executed trade.

The ease of maintenance and low development cost of this reserve comes at the expense of high financial liquidity requirements. You can read more about the APR in our [blog post](https://blog.kyber.network/introducing-the-automated-price-reserve-77d41ed1aa70).

## Orderbook Reserve (OR)
As its name suggests, this fully on-chain reserve type allows anyone to provide liquidity to the ecosystem for any token of their choice through the placement of limit orders. It is also the first reserve type that can be listed permissionlessly, where no action is required from Kyber (such as the network administrator or operators).

Deployment and operation of this reserve type has been temporarily halted, as we update it to be compatible with the Katalyst upgrade.

## Bridge Reserves
Bridge reserves pull liquidity from 3rd party sources that are shared by other DApps. Examples of this reserve type are OasisDEX and Uniswap.

## Utility Reserves
These reserves simply mints/burns tokens without any capital risk at any points, such as the WETH reserve. Kyber never intends to charge a fee on top of trades through these reserves, nor include their trade volume in reports or trackers.

## Custom Reserves
These reserves are generic and do not fall in the other categories. It it open to any innovative ways for liquidity provision to the network. For example, it may be a reserve that uses the price of other tokens to trade, such as the Promo Token (PT) reserve (a reserve that pegs PT price to DAI).

## Reserve Type Comparison
![Reserve Type](/uploads/reservetype.png "Reserve Type")

## Setup Your Reserve
- To learn more about the Fed Price Reserve, [click here](reserves-fedpricereserve.md).
- To learn more about the Automated Price Reserve, [click here](reserves-automatedpricereserve.md).

---
id: Reserves-FedPriceReserve
title: Fed Price Reserve
---
[//]: # (tagline)
## Objective

In this guide, we will learn how to configure and deploy a Fed Price Reserve either locally via ganache or to the Ropsten testnet.

## Introduction

A Fed Price Reserve consists of two main components: an on-chain component of your reserve smart contracts and an off-chain component (normally, an automated system) that manages your on-chain component. The two components are depicted in the diagram below.

![Kyber Reserve Components](/uploads/kyberreservecomponents.png "Kyber Reserve Components")

The on-chain component has smart contracts that store your tokens, provide conversion rates, and swap your tokens with users. The off-chain component hosts your [trading strategy](kyberpro-tradingstrategy.md) that calculate and feed conversion rates and rebalance your reserve of tokens.

## Points to Note

A reserve manager's primary purpose is to keep funds safe. This however is a difficult task since inventory and prices are on-chain. On-chain issues such as gas prices and network congestion can delay pricing rate updates in the contracts.

With this in mind, the reserve was designed with various parameters to help secure your funds.

- Valid duration gives a time limit to the last price update, when the duration is over trades are stopped until the next price update.
- Max imbalance values limit inventory changes since the last price update. Once again, if the imbalance threshold is exceeded for a specific token, trades are blocked until the next price update.
- Step functions enable “automatic” price updates. When some token price has a clear trend, automatic price changes could act as a degenerated order book. This way, during periods the reserve manager doesn’t control the price (between updates) steps simulate actual liquidity in an order book market.
- Limited list of destination withdrawal addresses will prevent the operator account (hot wallet) from withdrawing funds to any destination address (if this account is compromised).

## How to set up your own reserve

### Local testnet deployment

You may refer to [this section](reserves-ganache.md) on how to deploy and test the reserve locally using [Truffle's Ganache](https://truffleframework.com/ganache).

### Public testnet deployment
 [REFER to tutorials on kyberpro section](kyberpro-walkthrough1.md)
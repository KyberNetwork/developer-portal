---
id: KyberPro-FAQs
title: FAQ's
---
[//]: # (tagline)

### Frequently Asked Questions

### 1. Which blockchain can KyberPRO be used on?

At the moment, KyberPRO is suited for use on only Ethereum.

### 2. What is the difference between off-chain and on-chain market making?

The key difference between them is that on-chain MM requires sending pricing updates onto the blockchain.

### 3. How frequently should prices be updated? 

This is up to you, the market maker, to decide. The main trade-off to be made is frequency over the cost of sending the pricing update txs.

### 4. What should be done in a high gas volatility situation?

In cases of extreme network congestion, it might be better to disable the reserve and halt price updates until the congestion clears.

### 5. How do we check the number of trades facilitated by your reserve?

You may visit tracker.kyber.network once the reserve is authorized and running. For deeper insights, use DuneAnalytics or listen to the `TradeExecute` event emitted by the reserve.

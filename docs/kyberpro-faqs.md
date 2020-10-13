---
id: KyberPro-FAQs
title: FAQ's
---
[//]: # (tagline)

### Frequently Asked Questions

## Which blockchain should KyberPRO be used on?

Only and only on ETHEREUM.

## What is the difference between off-chain and on-chain market making?

On-chain market making is providing liquidity on-chain, which means that the token price quoting, order matching, and trade settlement all happens directly on the blockchain itself.

## How frequently do we set prices? 

It depends on how volatile the token prices are and your pricing strategy.

## What should be done in a high gas volatility situation?

One way of mitigating risk would be to stop quoting after a certain threshold and start quoting after the situation is back to normal.

## How to check the number of trades facilitated by your reserve?

Kyber reserve's emit TradeExecute event after executing a trade, you can listen to the event on reserve address to get the history.

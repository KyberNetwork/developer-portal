---
id: KyberPro-primer
title: Market Making primer
---
[//]: # (tagline)

# Kyber: Professional OnChain Market Making Primer

## On-Chain Market Making:

All Kyber Network liquidity related operations happen on chain. From the price quoting till the instant settlement. This means that the market makers have to publish their prices on-chain, having the Ethereum chain reaction times.

Ethereum currently has an average block time of about 13 seconds, but the block times vary between a few seconds and up to a minute sometimes. A transaction with a high enough gas price will be mined in N+1 blocks where N is the next to be mined block, but the time it will take for that action to be done cannot be accurately known since block times vary. 

This means that if the market maker wants to update a price, the time that his update reaches the block-chain cannot be precisely calculated.


## Kyber Network Matching:

Kyber Network uses an RFQ model where the taker requests how many units of source tokens they want in exchange for a destination token. 

The network iterates through all the reserves (liquidity sources) for that taker specified quantity and returns the rate from the reserve which has the best rates. Takers can filter in/out reserves in their query. Reserves are either professionals that run their own reserve (FPR), or automated reserves for providing liquidity. 

 Currently all trading pairs on Kyber Network use ETH as quote currency. When there is a tokenA to tokenB trade there are two trades,  tokenA > ETH and ETH > tokenB under the hood. 


## Kyber FPR Reserve:

Kyber FPR is the reserve that is addressed to professional market makers, with many key[ design advantages](https://blog.kyber.network/kyber-fed-price-reserve-fpr-on-chain-market-making-for-professionals-7fea29ceac6c).  It has several differentiations to make on-chain marketing effective and powerful. Can emulate an orderbook effect without committing the inventory, and also has several safety features.


1. **Different pricing logic:** Reserve sets a baseline price and then a function  can be applied to that price that alters depending on the absolute ([setQtyStepFunction](https://developer.kyber.network/docs/API_ABI-ConversionRates/#setqtystepfunction)) or net traded ([setImbalanceStepFunction](https://developer.kyber.network/docs/API_ABI-ConversionRates/#setimbalancestepfunction)) amount. This can emulate an orderbook style pricing while keeping gas utilization for pricing very low. \

2. **Efficient inventory usage:** Tokens can reside in a wallet and can be used only when needed for a match. Inventory is not committed like when submitting a limit order. After the price is set and a taker wants to trade, available inventory is checked. \

3. **Safety features**: Price can be checked against a sanity price ([SanityRatesInterface](https://developer.kyber.network/docs/API_ABI-SanityRatesInterface/#interface-sanityratesinterface)) and blocked if off the configured limits. Pricing can be changed according to quantity ([setQtyStepFunction](https://developer.kyber.network/docs/API_ABI-ConversionRates/#setqtystepfunction)) of the trade or according to the net change on token ([setImbalanceStepFunction](https://developer.kyber.network/docs/API_ABI-ConversionRates/#setimbalancestepfunction))  that this trade will bring. A TTL field can be configured to ensure prices will expire ([setValidRateDurationInBlocks](https://developer.kyber.network/docs/API_ABI-ConversionRates/#setvalidratedurationinblocks)) if for any reason the reserve will not be able to push new prices on-chain. Limits of the per-block ([maxPerBlockImbalance](https://developer.kyber.network/docs/Reserves-FedPriceReserve/#adding-tokens)) or between-updates ([maxTotalImbalance](https://developer.kyber.network/docs/Reserves-FedPriceReserve/#adding-tokens)) net amount of each token to be traded can be set. \

4. **Gas optimizations**: Reserves can publish price updates for many tokens in a single tx and gas optimizations make sure that those updates cost as little as possible.

 


### Trading On-Chain: Pros And Cons

One could argue that Ethereum on-chain trading is more beneficial for takers. Any arb strategy has at least two legs and in the off-chain world you are never sure that you can get both legs without some price deterioration. 

On-chain a smart contract that checks for that condition can make the trade and because of the sequential processing of Ethereum, if the check for a profitable arb fails, no trades will be opened. Also many fast traders will look for a spike in price on a centralized exchange that hasn't been reflected on-chain and will try to grab the lagging on-chain rate. 

 On the other side, there are many Dapps that many times prioritize execution over price and provide a constant stream of trades that can be very beneficial to the makers. This can offset many of the issues with the on-chain pricing latency.

Our own FPR reserve was slightly more than 35 bps in ETH profit per volume traded for the year 2019. The percentage numbers are similar but the volumes are higher a bit before the end of the first half of 2020

Because bringing liquidity on-chain has a cost, the profit margins are much higher on chain, and lesser volumes can bring enough profitability to sustain making a business decision to invest in becoming a Kyber FPR reserve.

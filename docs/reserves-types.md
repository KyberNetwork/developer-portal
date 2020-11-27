---
id: Reserves-Types
title: Existing Reserve Types
---
[//]: # (tagline)
## Overview

There are currently 2 different reserve types that liquidity providers can choose for deployment and operate, namely, the Fed Price Reserve and the Automated Price Reserve. There are also other reserve types that serve various functions to the ecosystem. 

*The Orderbook Reserve is temporarily disabled as we will update it to be compatible with the Katalyst upgrade.*

## Fed Price Reserve (FPR)
A Fed Price Reserve mainly utilized by professional market makers willing to provide liquidity on kyber for a wide number of tokens. Our  FPR’s are highly capital efficient, provide control over pricing strategies and risk exposure, and a range of safety mechanisms. It utilises an off-chain component (e.g. a script running on a server) that pulls price feeds and calculates conversion rates requires making periodic price updates on-chain.  

## Automated Price Reserve (APR)
An APR helps token teams to provide liquidity for dedicated tokens.This reserve type relies on a predefined algorithm written in a smart contract to automatically provide rates for the token. The initial rate is set based on the initial inventory in the reserve, and only adjusts after each executed trade. 

This type of reserve is easy to maintain and involves low deployment cost, however will require high initial inventory lock up.You can read more about the APR in our [blog post](https://blog.kyber.network/introducing-the-automated-price-reserve-77d41ed1aa70).

## Orderbook Reserve (OR)
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

---
id: KyberPro-ReserveId&Rebate
title: Reserve ID and Rebates
---
[//]: # (tagline)

## Reserve ID

Instead of Ethereum addresses, reserves are now identified using reserve IDs. Each reserve ID is 32 bytes long. With the new Reserve Routing feature for takers, and as reserves may upgrade their contracts over time (and thus have changing reserve addresses), we utilise reserve IDs for a more stable identity.

#### If you have a preferred reserve ID , let the kyber team know when they add your reserve to the network.


## Reserve Rebates

The motivation for reserve rebates is to reward selected reserves based on their performance (i.e. amount of trade volume they facilitate). This incentivizes reserves to provide better liquidity and tighter spreads, thereby driving greater volume, value, and network fees.

* Whenever a reserve is added to the network, the rebate wallet must also be specified as well. In the event you want to update your rebate wallet, notify the kyber team to do so.

* You will have to manually claim the fees by calling the `claimReserveRebate` method of the [KyberFeeHandler](https://ropsten.etherscan.io/address/0xe57B2c3b4E44730805358131a6Fc244C57178Da7) contract(s)
An example on how to view and claim are illustrated over our [Developer portal](https://developer.kyber.network/docs/Reserves-Rebates/)
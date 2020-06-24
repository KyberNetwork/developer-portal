---
id: Reserves-Ids
title: Reserve IDs
---
[//]: # (tagline)

## What are reserve IDs?
Instead of Ethereum addresses, reserves are now identified using reserve IDs. Each reserve ID is 32 bytes long.<br>
*Example: 0xaa4b4e4320415052000000000000000000000000000000000000000000000000*

## Why are reserve IDs used instead of addresses?
Reserve addresses can change in the event of reserve upgrades or reserve migrations. As an example, if Uniswap does an upgrade, then the Uniswap Bridge Reserve must be upgraded as well, and thus, a new address for the Uniswap Bridge Reserve is used.

With the new Reserve Routing feature for takers, and as reserves may upgrade their contracts over time (and thus have changing reserve addresses), we utilise reserve IDs for a more stable identity.



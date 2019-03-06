---
id: Reserves-Types
title: Reserve Types
---
## Introduction
There are many reserve types that one can choose from. This developer portal will cover 3 reserve types, namely, the Fed Price Reserve, the Automated Price Reserve and the Orderbook Reserve.

We first give a description of each reserve type, followed by a table of comparison to outline the similarities and differences between them.

## Reserve Type Description
### Fed Price Reserve (FPR)
A Fed Price Reserve utilises an off-chain component (Eg. a script running on a server) that pulls price
feeds and calculates conversion rates. These rates are sent via on-chain transactions and stored in a pricing smart contract. A separate smart contract storing reserve funds will refer to the pricing smart contract for the expected token conversion rate.

It is complex to setup and maintain, and requires Ether for making the periodic price updates on-chain.

### Automated Price Reserve (APR)
This reserve type relies on a predefined algorithm written in a smart contract to automatically provide rates for the token being served liquidity for. The initial rate is set based on the initial liquidity provided, and only adjusts after each executed trade.

The ease of maintenance and low development cost of this reserve comes at the expense of high financial liquidity requirements.

### Orderbook Reserve (OR)
As its name suggests, this fully on-chain reserve type allows anyone to provide liquidity to the ecosystem for any token of their choice through the placement of limit orders. It is also the first reserve type that can be listed permissionlessly, where no action is required from Kyber (such as the network administrator or operators).

## Reserve Type Comparison
![Reserve Type](/uploads/reservetype.png "Reserve Type")

## Permissionless vs Permissioned
A reserve can be added to the network and have their tokens listed either by a network operator (Eg. someone from the Kyber team), or automatically by a smart contract (Eg. the PermissionlessOrderbookReserveLister contract). The former involves KYC and legal processes while the latter does not.

In order to comply with regulatory requirements, services using the Kyber protocol implementation may choose to only use permissioned reserves, such as KyberSwap. The table below highlights what services are supported for both permissioned and permissionless reserves.

| Area of Comparison | Permissioned | Permissionless |
| ------------------ |:---------------------:|:---------------------:|
| KYC requirement | Yes | No |
| RESTful API | Yes | Yes |
| KyberWidget | Yes | No |
| Parties integrated through their own smart contracts | Yes | Yes by default |

## Setup Your Reserve
- To learn more about the Fed Price Reserve, [click here](reserves-fedpricereserve.md).
- To learn more about the Automated Price Reserve, [click here](reserves-automatedpricereserve.md).
- To learn more about the Orderbook Reserve, [click here](reserves-orderbookreserve.md).

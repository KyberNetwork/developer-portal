---
id: ArchitectureOverview
title: Smart Contract Architecture
---
## Introduction

The two main components in the Kyber protocol are `KyberNetwork.sol` and `KyberReserve.sol`, which together implements Kyber Network and the reserve(s). However, additional auxiliary contracts are required to create upgradeable components that might be frequently updated, and also because solidity contract size is limited to 25Kb.

## High-level Overview

Kyber Network’s smart contracts allow users to send one type of token (e.g. GNT) and receive a different token in return (e.g. ETH) according to the conversion rates set by the reserve(s). The entire process happens in a single transaction so at no point does the contract hold users' funds. A conversion between ETH and GNT is depicted in the diagram below:

![ETH to GNT](/uploads/high-level-1.png "ETH to GNT")

The conversion is possible thanks to reserve contracts that hold inventories of tokens and provide conversion rates to Kyber Network. The inventory of every reserve, along with its price feed, is managed by a reserve manager, namely, a person or an off-chain automated system that queries market prices and buys/sells inventory from the open market.

The users do not need to pay any additional fees other than the standard Ethereum transaction gas fees. The platform fees are paid for by the reserve that executes the exchange and these fees are subsequently burnt. Note that some fees might be paid to the project that directed the user to the Kyber protocol as part of our [fee sharing program](guide-feesharing.md).

## Detailed Exchange Flow

When a trade is executed, the `KyberNetwork.sol` contract queries rates from all the reserves offering the required token (i.e., calls `KyberReserve.sol`). From the conversion rate, the token amount of the exchange is estimated.

The `KyberNetwork.sol` contract transfers user's funds to the reserve with the best rate, receives the destination token from the reserve and sends it to the destination address. After the exchange, the contract burns the platform fees and transfers some of the fees to the affiliated wallet. The exchange flow is depicted in the diagram below:

![Exchange Flow](/uploads/high-level-2.png "Exchange Flow")

## Reserve Flow

The reserve’s role is to execute exchanges and provide rates for `KyberNetwork.sol`. The reserve contract has no direct interaction with the end users but rather, with the reserve operator who manages the token inventory and feeds exchange rates every few minutes.

The exchange process, from `KyberReserve.sol`'s point of view is depicted in the figure below:

![Reserve Flow](/uploads/high-level-3.png "Reserve Flow")

## Stack

Starting from the client and ending in the Ethereum blockchain, we can visualize the entire stack as seen in the figure below:

![Stack](/uploads/high-level-4.png "Stack")

## Permissions

Every contract in the Kyber protocol has three permission groups:

### 1. Admin
The admin account is unique (usually cold wallet) and handles infrequent, manual operations like listing new tokens in the exchange. All sensitive operations (e.g. fund related) are limited to the Admin address.

### 2. Operators
The operator account is a hot wallet and is used for frequent updates like setting reserve rates and withdrawing funds from the reserve to certain destinations (e.g. when selling excess tokens in the open market).

### 3. Alerters
The alerter account is also a hot wallet and is used to alert the admin of inconsistencies in the system (e.g., strange conversion rates). In such cases, the reserve operation is halted and can be resumed only by the admin account.

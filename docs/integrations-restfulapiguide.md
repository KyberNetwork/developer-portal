---
id: Integrations-RESTfulAPIGuide
title: RESTful API
---
## Introduction
This guide will walk you through on how you can interact with our protocol implementation using our RESTful APIs. The most common group of users that can benefit from this guide are developers who have minimal smart contract experience, traders and wallets.

## Overview
In this guide, we will cover 2 scenarios. The first scenario covers obtaining token information and historical price data, and the second covers a token to token swap.

## Things to note
1) The `/buy_rate` and `/sell_rate` endpoints are currently restricted to ETH <-> ERC20 token. If you want to get the rates for a conversion between token A and token B, you need to run both APIs; the first to sell token A to ETH and the second to buy token B with ETH.
2) When converting from Token to ETH/Token, the user is required to call the `/enabled_data` endpoint **first** to give an allowance to the smart contract executing the `trade` function i.e. the `KyberNetworkProxy.sol` contract.

## Providing Price




## Filtering Out Permissionless Reserves
By default, the RESTful APIs only interact with the official reserves. Most of these endpoints support a `only_official_reserve` parameter


reserves that were listed permissionlessly are also included when performing `getExpectedRate()` and `trade()`. Depending on the jurisdiction where your platform is operating in, you may be required to exclude these reserves. To filter them out, use the `tradeWithHint()` function. Refer to [this section](references-kybernetworkproxy.md#hint) for more information.

## Fee Sharing Program
Wallets have the opportunity to join our *Fee Sharing Program*, which allows fee sharing on each swap that originates from your wallet. Learn more about the program [here](guide-feesharing.md)!

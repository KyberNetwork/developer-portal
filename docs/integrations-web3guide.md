---
id: Integrations-Web3Guide
title: Web3
---
## Introduction
This guide will walk you through on how you can interact with our protocol implementation using the [Web3](https://github.com/ethereum/web3.js/) Javascript package. The most common group of users that can benefit from this guide are Wallet providers or Vendors who can create their own UI.

## Overview
In this guide, we will be going through how you can interact with our smart contracts using Web3 to get conversion rates and perform a token swap. The guide assumes that you are a




vendor trying to sell a product to a customer for 0.3 ETH. The customer will be paying in KNC tokens.

## Things to note
1) If your version of Web3 is 1.0.0-beta.37 and below, the full code example will not work for you due to breaking changes that were introduced in version [1.0.0-beta.38](https://github.com/ethereum/web3.js/releases/tag/v1.0.0-beta.38).
2) We will make use of the [ERC20 Interface](https://github.com/KyberNetwork/smart-contracts/blob/developV2/contracts/ERC20Interface.sol) and [KyberNetworkProxy](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberNetworkProxy.sol) smart contracts
3) The main functions that we will be calling are `getExpectedRate()` and `trade() ` of the `KyberNetworkProxy.sol` contract.
4) When converting from Token to ETH/Token, the user is required to call the `approve` function **first** to give an allowance to the smart contract executing the `trade` function i.e. the `KyberNetworkProxy.sol` contract.
5) To prevent user front running, the contract limits the gas price trade transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.

```js
let maxGasPrice = await KyberNetworkProxyContract.methods.maxGasPrice().call()
```

## Using Web3 to Interact
### Import the relevant packages
We will
```
// Importing the relevant packages
const Web3 = require("web3");
const Tx = require("ethereumjs-tx");
```
### Connect to an Ethereum node
### Define constants
### Define auxiliary functions to support the main functions
### Define a function to approve allowance
### Define a function to get rates
### Define a function to perform the trade
### Define a main function
### Full code example



## Filtering Out Permissionless Reserves
By default, reserves that were listed permissionlessly are also included when performing `getExpectedRate()` and `trade()`. Depending on the jurisdiction where your platform is operating in, you may be required to exclude these reserves. To filter them out, use the `tradeWithHint()` function. Refer to [this section](references-kybernetworkproxy.md#hint) for more information.

## Fee Sharing Program
Wallets have the opportunity to join our *Fee Sharing Program*, which allows fee sharing on each swap that originates from your wallet. Learn more about the program [here](guide-feesharing.md)!

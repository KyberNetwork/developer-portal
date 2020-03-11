---
id: Integrations-Web3Guide
title: Web3
---
[//]: # (tagline)
## Introduction

This guide will walk you through on how you can interact with our protocol implementation using the [Web3](https://github.com/ethereum/web3.js/) Javascript package. The most common group of users that can benefit from this guide are wallets or vendors who want to use their own UI.

## Risk Mitigation

There are some risks when utilising Kyber. To safeguard users, we kindly ask that you refer to the [Slippage Rates Protection](integrations-slippagerateprotection.md) and [Price Feed Security](integrations-pricefeedsecurity.md) sections on what these risks are, and how to mitigate them.

## Overview

In this guide, we will using Web3 to get conversion rates and cover 3 scenarios: ETH -> token swap, token -> ETH, and token -> token swaps. The guide assumes that you are a wallet provider and a user would like to swap tokens within your wallet.

## Things to note

1. We will make use of the [ERC20 Interface](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/ERC20Interface.sol) and [KyberNetworkProxy](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberNetworkProxy.sol) smart contracts
2. The main functions to incorporate into your smart contract(s) are [`getExpectedRate()`](api_abi-kybernetworkproxy.md#getexpectedrate) and [`trade()`](api_abi-kybernetworkproxy.md#trade) of `KyberNetworkProxy.sol`.
3. When converting from Token to ETH/Token, the user is required to call the `approve` function **first** to give an allowance to the smart contract executing the `trade` function i.e. the `KyberNetworkProxy.sol` contract.
4. To prevent front running, the contract limits the gas price trade transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

let maxGasPrice = await KyberNetworkProxyContract.methods.maxGasPrice().call();
```

## Scenario 1: Ether to Token Swap

Let us assume that we would like to swap 1 Ether for ZIL tokens.

### Import the relevant packages

We will be using the `web3` package for interacting with the Ethereum blockchain. The `ethereumjs-tx` library is used to sign and serialize a raw transaction to be broadcasted. The `bn.js` library is used to define BigNumber variables. The `node-fetch` library is used to make HTTP requests to the endpoint.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Importing the relevant packages
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const BN = require("bn.js");
const fetch = require('node-fetch');
```

### Connect to an Ethereum node

In this example, we will connect to Infura's Ropsten node as our web3 provider. You will need a project ID for this. Learn more [in this article](https://blog.infura.io/infura-dashboard-transition-update-c670945a922a).

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Connecting to ropsten infura node
const NETWORK = "ropsten"
const PROJECT_ID = "ENTER_PROJECT_ID" //Replace this with your own Project ID
const WS_PROVIDER = `wss://${NETWORK}.infura.io/ws/v3/${PROJECT_ID}`
const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_PROVIDER));
```

### Define constant variables

Next, we will define the constants that we will be using for this scenario.

#### Define token information

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Token Details
const SRC_TOKEN = "ETH";
const DST_TOKEN = "ZIL";
const SRC_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const DST_TOKEN_ADDRESS = "0xaD78AFbbE48bA7B670fbC54c65708cbc17450167";
const SRC_DECIMALS = 18;
const DST_DECIMALS = 12;
const MAX_ALLOWANCE = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
```

#### Define contract ABIs and addresses

```js
// KyberNetworkProxy Contract ABI
const KYBER_NETWORK_PROXY_ABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"},{"name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToEther","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetworkContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapEtherToToken","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdminQuickly","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"},{"name":"token","type":"address"}],"name":"getUserCapInTokenWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_kyberNetworkContract","type":"address"}],"name":"setKyberNetworkContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"field","type":"bytes32"}],"name":"info","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"}],"name":"trade","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"trader","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"actualSrcAmount","type":"uint256"},{"indexed":false,"name":"actualDestAmount","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newNetworkContract","type":"address"},{"indexed":false,"name":"oldNetworkContract","type":"address"}],"name":"KyberNetworkSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}];

// Kyber Network Proxy Contract Address
const KYBER_NETWORK_PROXY_ADDRESS = "0x818e6fecd516ecc3849daf6845e3ec868087b755";
```

#### Define trade details

Since we are swapping 1 Ether, `SRC_QTY = 1`. We also convert this amount to Ether wei.

```js
// Trade Details
const SRC_QTY = "1";
const SRC_QTY_WEI = (SRC_QTY * 10 ** SRC_DECIMALS).toString();
```

#### Define user details

Replace the `ENTER_USER_PRIVATE_KEY` with a private key (without the `0x` prefix), and `REF_ADDRESS` with a wallet address that is registered with the fee sharing program. Find out more about the fee sharing program [here](#fee-sharing-program).

```js
// User Details
const PRIVATE_KEY = Buffer.from("ENTER_USER_PRIVATE_KEY", "hex"); //exclude 0x prefix
const USER_ADDRESS = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY.toString("hex")
).address;

// Wallet Address for Fee Sharing Program
//If none, set to 0x0000000000000000000000000000000000000000 (null address)
const REF_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E";
//const REF_ADDRESS = "0x0000000000000000000000000000000000000000"
```

### Get existing instance of `KyberNetworkProxy` contract
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Get the KyberNetworkContract instances
const KYBER_NETWORK_PROXY_CONTRACT = new web3.eth.Contract(
  KYBER_NETWORK_PROXY_ABI,
  KYBER_NETWORK_PROXY_ADDRESS
);
```

### Define function to broadcast a transaction
Note that we check that the gas price to be used does not exceed the maximum gas price enforced by the Kyber contract.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Function to broadcast transactions
async function broadcastTx(from, to, txData, value, gasLimit) {
  let txCount = await web3.eth.getTransactionCount(USER_ADDRESS);
  //Method 1: Use a constant
  let gasPrice = new BN(5).mul(new BN(10).pow(new BN(9))); ; //5 Gwei
  //Method 2: Use web3 gasPrice
  //let gasPrice = await web3.eth.gasPrice;
  //Method 3: Use KNP Proxy maxGasPrice
  //let gasPrice = await KYBER_NETWORK_PROXY_CONTRACT.maxGasPrice().call();

  let maxGasPrice = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .maxGasPrice()
    .call();
  //If gasPrice exceeds maxGasPrice, set it to max.
  if (gasPrice >= maxGasPrice) gasPrice = maxGasPrice;

  let rawTx = {
    from: from,
    to: to,
    data: txData,
    value: web3.utils.toHex(value),
    gasLimit: web3.utils.toHex(gasLimit),
    gasPrice: web3.utils.toHex(gasPrice),
    nonce: txCount
  };

  let tx = new Tx(rawTx, { chain: NETWORK, hardfork: 'petersburg' });;

  tx.sign(PRIVATE_KEY);
  const serializedTx = tx.serialize();
  txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
  .catch(error => console.log(error));

  // Log the tx receipt
  console.log(txReceipt);
  return;
}
```

### Define core functions

There are 2 core functions to define:
1. A function to obtain the expected conversion rate between ETH and ZIL
2. A function to perform the trade

#### Define a function to obtain conversion rates

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Function to obtain conversion rate between src token and dst token
async function getRates(SRC_TOKEN_ADDRESS,DST_TOKEN_ADDRESS,SRC_QTY_WEI) {
  return await KYBER_NETWORK_PROXY_CONTRACT.methods
    .getExpectedRate(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI)
    .call();
}
```

#### Define a function to perform the trade

This is the core function that will be used to perform the actual token swap. It makes use of the `broadcastTx` function defined in the previous section to broadcast the trade transaction.

**Note: Since we are swapping from Ether, we pass srcQtyWei into the `value` input of the broadcastTx function. When swapping from tokens, this input should be zero.**

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Function to convert src token to dst token
async function trade(
  srcTokenAddress,
  srcQtyWei,
  dstTokenAddress,
  dstAddress,
  maxDstAmount,
  minConversionRate,
  walletId
) {
  console.log(`Converting ${SRC_TOKEN} to ${DST_TOKEN}`);
  let txData = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .trade(
      srcTokenAddress,
      srcQtyWei,
      dstTokenAddress,
      dstAddress,
      maxDstAmount,
      minConversionRate,
      walletId
    )
    .encodeABI();
  let gasLimit = await getGasLimit(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY);
  await broadcastTx(
    USER_ADDRESS,
    KYBER_NETWORK_PROXY_ADDRESS,
    txData,
    srcQtyWei, //Ether value to be included in the tx
    gasLimit //gasLimit
  );
}

// Function to get gas limit for trading
async function getGasLimit(source, dest, amount) {
  let gasLimitRequest = await fetch(`https://${NETWORK == "mainnet" ? "" : NETWORK + "-"}api.kyber.network/gas_limit?source=${source}&dest=${dest}&amount=${amount}`);
  let gasLimit = await gasLimitRequest.json();
  return gasLimit.data;
}
```

### Define main function
The main function will be used to get the conversion rates, then perform the trade.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

async function main() {
  // Obtain slippage rate
  let results = await getRates(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI);

  //Convert ETH to ZIL
  await trade(
    SRC_TOKEN_ADDRESS,
    SRC_QTY_WEI,
    DST_TOKEN_ADDRESS,
    USER_ADDRESS,
    MAX_ALLOWANCE,
    results.slippageRate,
    REF_ADDRESS
  );
  // Quit the program
  process.exit(0);
}
```

### Full code example
Before running this code example, the following fields need to be modified:
1. Change `ENTER_PROJECT_ID` to your Infura Project ID.
2. Change `ENTER_USER_PRIVATE_KEY` to the private key (without `0x` prefix) of the Ethereum wallet holding Ether

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Importing the relevant packages
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const BN = require("bn.js");
const fetch = require('node-fetch');

// Connecting to ropsten infura node
const NETWORK = "ropsten"
const PROJECT_ID = "ENTER_PROJECT_ID" //Replace this with your own Project ID
const WS_PROVIDER = `wss://${NETWORK}.infura.io/ws/v3/${PROJECT_ID}`
const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_PROVIDER));

// Token Details
const SRC_TOKEN = "ETH";
const DST_TOKEN = "ZIL";
const SRC_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const DST_TOKEN_ADDRESS = "0xaD78AFbbE48bA7B670fbC54c65708cbc17450167";
const SRC_DECIMALS = 18;
const DST_DECIMALS = 12;
const MAX_ALLOWANCE = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

// KyberNetworkProxy Contract ABI
const KYBER_NETWORK_PROXY_ABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"},{"name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToEther","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetworkContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapEtherToToken","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdminQuickly","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"},{"name":"token","type":"address"}],"name":"getUserCapInTokenWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_kyberNetworkContract","type":"address"}],"name":"setKyberNetworkContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"field","type":"bytes32"}],"name":"info","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"}],"name":"trade","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"trader","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"actualSrcAmount","type":"uint256"},{"indexed":false,"name":"actualDestAmount","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newNetworkContract","type":"address"},{"indexed":false,"name":"oldNetworkContract","type":"address"}],"name":"KyberNetworkSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}];

// Kyber Network Proxy Contract Address
const KYBER_NETWORK_PROXY_ADDRESS = "0x818e6fecd516ecc3849daf6845e3ec868087b755";

// Trade Details
const SRC_QTY = "1";
const SRC_QTY_WEI = (SRC_QTY * 10 ** SRC_DECIMALS).toString();

// User Details
const PRIVATE_KEY = Buffer.from("ENTER_USER_PRIVATE_KEY", "hex"); //exclude 0x prefix
const USER_ADDRESS = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY.toString("hex")
).address;

// Wallet Address for Fee Sharing Program
//If none, set to 0x0000000000000000000000000000000000000000 (null address)
const REF_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E";
//const REF_ADDRESS = "0x0000000000000000000000000000000000000000"

// Get the KyberNetworkContract instances
const KYBER_NETWORK_PROXY_CONTRACT = new web3.eth.Contract(
  KYBER_NETWORK_PROXY_ABI,
  KYBER_NETWORK_PROXY_ADDRESS
);

async function main() {
  // Obtain slippage rate
  let results = await getRates(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI);

  //Convert ETH to ZIL
  await trade(
    SRC_TOKEN_ADDRESS,
    SRC_QTY_WEI,
    DST_TOKEN_ADDRESS,
    USER_ADDRESS,
    MAX_ALLOWANCE,
    results.slippageRate,
    REF_ADDRESS
  );
  // Quit the program
  process.exit(0);
}

// Function to obtain conversion rate between src token and dst token
async function getRates(SRC_TOKEN_ADDRESS,DST_TOKEN_ADDRESS,SRC_QTY_WEI) {
  return await KYBER_NETWORK_PROXY_CONTRACT.methods
    .getExpectedRate(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI)
    .call();
}

// Function to convert src token to dst token
async function trade(
  srcTokenAddress,
  srcQtyWei,
  dstTokenAddress,
  dstAddress,
  maxDstAmount,
  minConversionRate,
  walletId
) {
  console.log(`Converting ${SRC_TOKEN} to ${DST_TOKEN}`);
  let txData = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .trade(
      srcTokenAddress,
      srcQtyWei,
      dstTokenAddress,
      dstAddress,
      maxDstAmount,
      minConversionRate,
      walletId
    )
    .encodeABI();
  let gasLimit = await getGasLimit(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY);
  await broadcastTx(
    USER_ADDRESS,
    KYBER_NETWORK_PROXY_ADDRESS,
    txData,
    srcQtyWei, //Ether value to be included in the tx
    gasLimit //gasLimit
  );
}

// Function to get gas limit for trading
async function getGasLimit(source, dest, amount) {
  let gasLimitRequest = await fetch(`https://${NETWORK == "mainnet" ? "" : NETWORK + "-"}api.kyber.network/gas_limit?source=${source}&dest=${dest}&amount=${amount}`);
  let gasLimit = await gasLimitRequest.json();
  return gasLimit.data;
}

// Function to broadcast transactions
async function broadcastTx(from, to, txData, value, gasLimit) {
  let txCount = await web3.eth.getTransactionCount(USER_ADDRESS);
  //Method 1: Use a constant
  let gasPrice = new BN(5).mul(new BN(10).pow(new BN(9))); //5 Gwei
  //Method 2: Use web3 gasPrice
  //let gasPrice = await web3.eth.gasPrice;
  //Method 3: Use KNP Proxy maxGasPrice
  //let gasPrice = await KYBER_NETWORK_PROXY_CONTRACT.maxGasPrice().call();

  let maxGasPrice = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .maxGasPrice()
    .call();
  //If gasPrice exceeds maxGasPrice, set it to max.
  if (gasPrice >= maxGasPrice) gasPrice = maxGasPrice;

  let rawTx = {
    from: from,
    to: to,
    data: txData,
    value: web3.utils.toHex(value),
    gasLimit: web3.utils.toHex(gasLimit),
    gasPrice: web3.utils.toHex(gasPrice),
    nonce: txCount
  };

  let tx = new Tx(rawTx, { chain: NETWORK, hardfork: 'petersburg' });;

  tx.sign(PRIVATE_KEY);
  const serializedTx = tx.serialize();
  txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
  .catch(error => console.log(error));

  // Log the tx receipt
  console.log(txReceipt);
  return;
}

main();
```

## Scenario 2: Token to Ether Swap

Let us assume that we would like to swap 100 KNC tokens for Ether. You may obtain some ropsten KNC at https://ropsten.kyber.network.

### Import the relevant packages

We will be using the `web3` package for interacting with the Ethereum blockchain. The `ethereumjs-tx` library is used to sign and serialize a raw transaction to be broadcasted. The `bn.js` library is used to define BigNumber variables. The `node-fetch` library is used to make HTTP requests to the endpoint.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Importing the relevant packages
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const BN = require("bn.js");
const fetch = require('node-fetch');
```

### Connect to an Ethereum node

In this example, we will connect to Infura's Ropsten node as our web3 provider. You will need a project ID for this. Learn more [in this article](https://blog.infura.io/infura-dashboard-transition-update-c670945a922a).

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Connecting to ropsten infura node
const NETWORK = "ropsten"
const PROJECT_ID = "ENTER_PROJECT_ID" //Replace this with your own Project ID
const WS_PROVIDER = `wss://${NETWORK}.infura.io/ws/v3/${PROJECT_ID}`
const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_PROVIDER));
```

### Define constant variables

Next, we will define the constants that we will be using for this scenario.

#### Define token information
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Token Details
const SRC_TOKEN = "KNC";
const DST_TOKEN = "ETH";
const SRC_TOKEN_ADDRESS = "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6";
const DST_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const SRC_DECIMALS = 18;
const DST_DECIMALS = 18;
const MAX_ALLOWANCE = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
```

#### Define contract ABIs and addresses
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const ERC20_ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"supply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"digits","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
const KYBER_NETWORK_PROXY_ABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"},{"name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToEther","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetworkContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapEtherToToken","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdminQuickly","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"},{"name":"token","type":"address"}],"name":"getUserCapInTokenWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_kyberNetworkContract","type":"address"}],"name":"setKyberNetworkContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"field","type":"bytes32"}],"name":"info","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"}],"name":"trade","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"trader","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"actualSrcAmount","type":"uint256"},{"indexed":false,"name":"actualDestAmount","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newNetworkContract","type":"address"},{"indexed":false,"name":"oldNetworkContract","type":"address"}],"name":"KyberNetworkSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}];

// Kyber Network Proxy Contract Address
const KYBER_NETWORK_PROXY_ADDRESS = "0x818e6fecd516ecc3849daf6845e3ec868087b755";
```

#### Define trade details
Since we are swapping from 100 KNC tokens, `SRC_QTY = 100`. We also convert this amount to the source's token decimals.
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const SRC_QTY = "100";
const SRC_QTY_WEI = (SRC_QTY * 10 ** SRC_DECIMALS).toString();
```

#### Define user details
Replace the `ENTER_USER_PRIVATE_KEY` with a private key (without the `0x` prefix), and `REF_ADDRESS` with a wallet address that is registered with the fee sharing program. Find out more about the fee sharing program [here](#fee-sharing-program).

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.
// User Details
const PRIVATE_KEY = Buffer.from("ENTER_USER_PRIVATE_KEY", "hex"); //exclude 0x prefix
const USER_ADDRESS = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY.toString("hex")
).address;

// Wallet Address for Fee Sharing Program
//If none, set to 0x0000000000000000000000000000000000000000 (null address)
const REF_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E";
//const REF_ADDRESS = "0x0000000000000000000000000000000000000000"
```

#### Get existing instance of the relevant contracts

We obtain instances of the `KyberNetworkProxy` source token contracts.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.
// Get the contract instances
const KYBER_NETWORK_PROXY_CONTRACT = new web3.eth.Contract(
  KYBER_NETWORK_PROXY_ABI,
  KYBER_NETWORK_PROXY_ADDRESS
);
const SRC_TOKEN_CONTRACT = new web3.eth.Contract(ERC20_ABI, SRC_TOKEN_ADDRESS);
```

### Define function to broadcast a transaction
Note that we check that the gas price to be used does not exceed the maximum gas price enforced by the Kyber contract.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Function to broadcast transactions
async function broadcastTx(from, to, txData, value, gasLimit) {
  let txCount = await web3.eth.getTransactionCount(USER_ADDRESS);
  //Method 1: Use a constant
  let gasPrice = new BN(5).mul(new BN(10).pow(new BN(9))); //5 Gwei
  //Method 2: Use web3 gasPrice
  //let gasPrice = await web3.eth.gasPrice;
  //Method 3: Use KNP Proxy maxGasPrice
  //let gasPrice = await KYBER_NETWORK_PROXY_CONTRACT.maxGasPrice().call();

  let maxGasPrice = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .maxGasPrice()
    .call();
  //If gasPrice exceeds maxGasPrice, set it to max.
  if (gasPrice >= maxGasPrice) gasPrice = maxGasPrice;

  let rawTx = {
    from: from,
    to: to,
    data: txData,
    value: web3.utils.toHex(value),
    gasLimit: web3.utils.toHex(gasLimit),
    gasPrice: web3.utils.toHex(gasPrice),
    nonce: txCount
  };

  let tx = new Tx(rawTx, { chain: NETWORK, hardfork: 'petersburg' });;

  tx.sign(PRIVATE_KEY);
  const serializedTx = tx.serialize();
  txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
  .catch(error => console.log(error));

  // Log the tx receipt
  console.log(txReceipt);
  return;
}
```

### Define a function to approve allowance
Since we are swapping from an ERC20 token, we will need a function to give the KyberNetworkProxy contract sufficient allowance to manage the user's funds.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Function to approve the KyberNetworkProxy contract to spend src token on the user's behalf
async function approveContract(allowance) {
  console.log("Approving KNP contract to manage my KNC");
  let txData = await SRC_TOKEN_CONTRACT.methods
    .approve(KYBER_NETWORK_PROXY_ADDRESS, allowance)
    .encodeABI();

  await broadcastTx(
    USER_ADDRESS,
    SRC_TOKEN_ADDRESS,
    txData,
    0, //Ether value to be sent should be zero
    "200000" //gasLimit
  );
}
```

### Define core functions

There are 2 core functions to define:
1. A function to obtain the expected conversion rate between ETH and ZIL
2. A function to perform the trade

#### Define a function to obtain conversion rates

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Function to obtain conversion rate between src token and dst token
async function getRates(SRC_TOKEN_ADDRESS,DST_TOKEN_ADDRESS,SRC_QTY_WEI) {
  return await KYBER_NETWORK_PROXY_CONTRACT.methods
    .getExpectedRate(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI)
    .call();
}
```

#### Define a function to perform the trade

This is the core function that will be used to perform the actual token swap. It makes use of the `broadcastTx` function defined in the previous section to broadcast the trade transaction.

**Note: Since we are swapping from tokens, we pass zero into the `value` input of the broadcastTx function.**

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Function to convert src token to dst token
async function trade(
  srcTokenAddress,
  srcQtyWei,
  dstTokenAddress,
  dstAddress,
  maxDstAmount,
  minConversionRate,
  walletId
) {
  console.log(`Converting ${SRC_TOKEN} to ${DST_TOKEN}`);
  let txData = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .trade(
      srcTokenAddress,
      srcQtyWei,
      dstTokenAddress,
      dstAddress,
      maxDstAmount,
      minConversionRate,
      walletId
    )
    .encodeABI();
  let gasLimit = await getGasLimit(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY);
  await broadcastTx(
    USER_ADDRESS,
    KYBER_NETWORK_PROXY_ADDRESS,
    txData,
    0, //Ether value to be included in the tx
    gasLimit //gasLimit
  );
}

// Function to get gas limit for trading
async function getGasLimit(source, dest, amount) {
  let gasLimitRequest = await fetch(`https://${NETWORK == "mainnet" ? "" : NETWORK + "-"}api.kyber.network/gas_limit?source=${source}&dest=${dest}&amount=${amount}`);
  let gasLimit = await gasLimitRequest.json();
  return gasLimit.data;
}
```

### Define main function

The main function will be used to get the conversion rates, check that there is sufficient allowance, then perform the trade.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

async function main() {
  // Calculate slippage rate
  let results = await getRates(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI);

  // Check KyberNetworkProxy contract allowance
  let contractAllowance = await SRC_TOKEN_CONTRACT.methods
    .allowance(USER_ADDRESS, KYBER_NETWORK_PROXY_ADDRESS)
    .call();

  // If insufficient allowance, approve else convert KNC to ETH.
  if (SRC_QTY_WEI <= contractAllowance) {
    await trade(
      SRC_TOKEN_ADDRESS,
      SRC_QTY_WEI,
      DST_TOKEN_ADDRESS,
      USER_ADDRESS,
      MAX_ALLOWANCE,
      results.slippageRate,
      REF_ADDRESS
    );
  } else {
    await approveContract(MAX_ALLOWANCE);
    await trade(
      SRC_TOKEN_ADDRESS,
      SRC_QTY_WEI,
      DST_TOKEN_ADDRESS,
      USER_ADDRESS,
      MAX_ALLOWANCE,
      results.slippageRate,
      REF_ADDRESS
    );
  }
  // Quit the program
  process.exit(0);
}
```

### Full code example
Before running this code example, the following fields need to be modified:
1. Change `ENTER_PROJECT_ID` to your Infura Project ID.
2. Change `ENTER_USER_PRIVATE_KEY` to the private key (without `0x` prefix) of the Ethereum wallet holding KNC tokens

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Importing the relevant packages
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const BN = require("bn.js");
const fetch = require('node-fetch');

// Connecting to ropsten infura node
const NETWORK = "ropsten"
const PROJECT_ID = "ENTER_PROJECT_ID" //Replace this with your own Project ID
const WS_PROVIDER = `wss://${NETWORK}.infura.io/ws/v3/${PROJECT_ID}`
const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_PROVIDER));

// Token Details
const SRC_TOKEN = "KNC";
const DST_TOKEN = "ETH";
const SRC_TOKEN_ADDRESS = "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6";
const DST_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const SRC_DECIMALS = 18;
const DST_DECIMALS = 18;
const MAX_ALLOWANCE = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

//Contract ABIs and addresses
const ERC20_ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"supply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"digits","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
const KYBER_NETWORK_PROXY_ABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"},{"name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToEther","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetworkContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapEtherToToken","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdminQuickly","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"},{"name":"token","type":"address"}],"name":"getUserCapInTokenWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_kyberNetworkContract","type":"address"}],"name":"setKyberNetworkContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"field","type":"bytes32"}],"name":"info","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"}],"name":"trade","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"trader","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"actualSrcAmount","type":"uint256"},{"indexed":false,"name":"actualDestAmount","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newNetworkContract","type":"address"},{"indexed":false,"name":"oldNetworkContract","type":"address"}],"name":"KyberNetworkSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}];

// Kyber Network Proxy Contract Address
const KYBER_NETWORK_PROXY_ADDRESS = "0x818e6fecd516ecc3849daf6845e3ec868087b755";

// Trade Details
const SRC_QTY = "100";
const SRC_QTY_WEI = (SRC_QTY * 10 ** SRC_DECIMALS).toString();

// User Details
const PRIVATE_KEY = Buffer.from("ENTER_USER_PRIVATE_KEY", "hex"); //exclude 0x prefix
const USER_ADDRESS = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY.toString("hex")
).address;

// Wallet Address for Fee Sharing Program
//If none, set to 0x0000000000000000000000000000000000000000 (null address)
const REF_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E";
//const REF_ADDRESS = "0x0000000000000000000000000000000000000000"

// Get the contract instances
const KYBER_NETWORK_PROXY_CONTRACT = new web3.eth.Contract(
  KYBER_NETWORK_PROXY_ABI,
  KYBER_NETWORK_PROXY_ADDRESS
);
const SRC_TOKEN_CONTRACT = new web3.eth.Contract(ERC20_ABI, SRC_TOKEN_ADDRESS);

async function main() {
  // Calculate slippage rate
  let results = await getRates(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI);

  // Check KyberNetworkProxy contract allowance
  let contractAllowance = await SRC_TOKEN_CONTRACT.methods
    .allowance(USER_ADDRESS, KYBER_NETWORK_PROXY_ADDRESS)
    .call();

  // If insufficient allowance, approve else convert KNC to ETH.
  if (SRC_QTY_WEI <= contractAllowance) {
    await trade(
      SRC_TOKEN_ADDRESS,
      SRC_QTY_WEI,
      DST_TOKEN_ADDRESS,
      USER_ADDRESS,
      MAX_ALLOWANCE,
      results.slippageRate,
      REF_ADDRESS
    );
  } else {
    await approveContract(MAX_ALLOWANCE);
    await trade(
      SRC_TOKEN_ADDRESS,
      SRC_QTY_WEI,
      DST_TOKEN_ADDRESS,
      USER_ADDRESS,
      MAX_ALLOWANCE,
      results.slippageRate,
      REF_ADDRESS
    );
  }
  // Quit the program
  process.exit(0);
}

// Function to obtain conversion rate between src token and dst token
async function getRates(SRC_TOKEN_ADDRESS,DST_TOKEN_ADDRESS,SRC_QTY_WEI) {
  return await KYBER_NETWORK_PROXY_CONTRACT.methods
    .getExpectedRate(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI)
    .call();
}

// Function to convert src token to dst token
async function trade(
  srcTokenAddress,
  srcQtyWei,
  dstTokenAddress,
  dstAddress,
  maxDstAmount,
  minConversionRate,
  walletId
) {
  console.log(`Converting ${SRC_TOKEN} to ${DST_TOKEN}`);
  let txData = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .trade(
      srcTokenAddress,
      srcQtyWei,
      dstTokenAddress,
      dstAddress,
      maxDstAmount,
      minConversionRate,
      walletId
    )
    .encodeABI();
  let gasLimit = await getGasLimit(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY);
  await broadcastTx(
    USER_ADDRESS,
    KYBER_NETWORK_PROXY_ADDRESS,
    txData,
    0, //Ether value to be included in the tx
    gasLimit //gasLimit
  );
}

// Function to get gas limit for trading
async function getGasLimit(source, dest, amount) {
  let gasLimitRequest = await fetch(`https://${NETWORK == "mainnet" ? "" : NETWORK + "-"}api.kyber.network/gas_limit?source=${source}&dest=${dest}&amount=${amount}`);
  let gasLimit = await gasLimitRequest.json();
  return gasLimit.data;
}

// Function to broadcast transactions
async function broadcastTx(from, to, txData, value, gasLimit) {
  let txCount = await web3.eth.getTransactionCount(USER_ADDRESS);
  //Method 1: Use a constant
  let gasPrice = new BN(5).mul(new BN(10).pow(new BN(9))); //5 Gwei
  //Method 2: Use web3 gasPrice
  //let gasPrice = await web3.eth.gasPrice;
  //Method 3: Use KNP Proxy maxGasPrice
  //let gasPrice = await KYBER_NETWORK_PROXY_CONTRACT.maxGasPrice().call();

  let maxGasPrice = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .maxGasPrice()
    .call();
  //If gasPrice exceeds maxGasPrice, set it to max.
  if (gasPrice >= maxGasPrice) gasPrice = maxGasPrice;

  let rawTx = {
    from: from,
    to: to,
    data: txData,
    value: web3.utils.toHex(value),
    gasLimit: web3.utils.toHex(gasLimit),
    gasPrice: web3.utils.toHex(gasPrice),
    nonce: txCount
  };

  let tx = new Tx(rawTx, { chain: NETWORK, hardfork: 'petersburg' });;

  tx.sign(PRIVATE_KEY);
  const serializedTx = tx.serialize();
  txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
  .catch(error => console.log(error));

  // Log the tx receipt
  console.log(txReceipt);
  return;
}

// Function to approve KNP contract
async function approveContract(allowance) {
  console.log("Approving KNP contract to manage my KNC");
  let txData = await SRC_TOKEN_CONTRACT.methods
    .approve(KYBER_NETWORK_PROXY_ADDRESS, allowance)
    .encodeABI();

  await broadcastTx(
    USER_ADDRESS,
    SRC_TOKEN_ADDRESS,
    txData,
    0, //Ether value to be sent should be zero
    "200000" //gasLimit
  );
}

main();
```


## Scenario 3: Token to Token Swap

Let us assume that we would like to swap 100 KNC tokens for ZIL tokens. You may obtain some ropsten KNC at https://ropsten.kyber.network.

### Import the relevant packages

We will be using the `web3` package for interacting with the Ethereum blockchain. The `ethereumjs-tx` library is used to sign and serialize a raw transaction to be broadcasted. The `bn.js` library is used to define BigNumber variables. The `node-fetch` library is used to make HTTP requests to the endpoint.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Importing the relevant packages
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const BN = require("bn.js");
const fetch = require('node-fetch');
```

### Connect to an Ethereum node

In this example, we will connect to Infura's Ropsten node as our web3 provider. You will need a project ID for this. Learn more [in this article](https://blog.infura.io/infura-dashboard-transition-update-c670945a922a).

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Connecting to ropsten infura node
const NETWORK = "ropsten"
const PROJECT_ID = "ENTER_PROJECT_ID" //Replace this with your own Project ID
const WS_PROVIDER = `wss://${NETWORK}.infura.io/ws/v3/${PROJECT_ID}`
const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_PROVIDER));
```

### Define constant variables

Next, we will define the constants that we will be using for this scenario.

#### Define token information
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Token Details
const SRC_TOKEN = "KNC";
const DST_TOKEN = "ZIL";
const SRC_TOKEN_ADDRESS = "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6";
const DST_TOKEN_ADDRESS = "0xaD78AFbbE48bA7B670fbC54c65708cbc17450167";
const SRC_DECIMALS = 18;
const DST_DECIMALS = 12;
const MAX_ALLOWANCE = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
```

#### Define contract ABIs and addresses
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const ERC20_ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"supply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"digits","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
const KYBER_NETWORK_PROXY_ABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"},{"name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToEther","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetworkContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapEtherToToken","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdminQuickly","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"},{"name":"token","type":"address"}],"name":"getUserCapInTokenWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_kyberNetworkContract","type":"address"}],"name":"setKyberNetworkContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"field","type":"bytes32"}],"name":"info","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"}],"name":"trade","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"trader","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"actualSrcAmount","type":"uint256"},{"indexed":false,"name":"actualDestAmount","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newNetworkContract","type":"address"},{"indexed":false,"name":"oldNetworkContract","type":"address"}],"name":"KyberNetworkSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}];

// Kyber Network Proxy Contract Address
const KYBER_NETWORK_PROXY_ADDRESS = "0x818e6fecd516ecc3849daf6845e3ec868087b755";
```

#### Define trade details
Since we are swapping from 100 KNC tokens, `SRC_QTY = 100`. We also convert this amount to the source's token decimals.
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const SRC_QTY = "100";
const SRC_QTY_WEI = (SRC_QTY * 10 ** SRC_DECIMALS).toString();
```

#### Define user details
Replace the `ENTER_USER_PRIVATE_KEY` with a private key (without the `0x` prefix), and `REF_ADDRESS` with a wallet address that is registered with the fee sharing program. Find out more about the fee sharing program [here](#fee-sharing-program).

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.
// User Details
const PRIVATE_KEY = Buffer.from("ENTER_USER_PRIVATE_KEY", "hex"); //exclude 0x prefix
const USER_ADDRESS = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY.toString("hex")
).address;

// Wallet Address for Fee Sharing Program
//If none, set to 0x0000000000000000000000000000000000000000 (null address)
const REF_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E";
//const REF_ADDRESS = "0x0000000000000000000000000000000000000000"
```

#### Get existing instance of the relevant contracts

We obtain instances of the `KyberNetworkProxy` source token contracts.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.
// Get the contract instances
const KYBER_NETWORK_PROXY_CONTRACT = new web3.eth.Contract(
  KYBER_NETWORK_PROXY_ABI,
  KYBER_NETWORK_PROXY_ADDRESS
);
const SRC_TOKEN_CONTRACT = new web3.eth.Contract(ERC20_ABI, SRC_TOKEN_ADDRESS);
```

### Define function to broadcast a transaction
Note that we check that the gas price to be used does not exceed the maximum gas price enforced by the Kyber contract.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Function to broadcast transactions
async function broadcastTx(from, to, txData, value, gasLimit) {
  let txCount = await web3.eth.getTransactionCount(USER_ADDRESS);
  //Method 1: Use a constant
  let gasPrice = new BN(5).mul(new BN(10).pow(new BN(9))); //5 Gwei
  //Method 2: Use web3 gasPrice
  //let gasPrice = await web3.eth.gasPrice;
  //Method 3: Use KNP Proxy maxGasPrice
  //let gasPrice = await KYBER_NETWORK_PROXY_CONTRACT.maxGasPrice().call();

  let maxGasPrice = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .maxGasPrice()
    .call();
  //If gasPrice exceeds maxGasPrice, set it to max.
  if (gasPrice >= maxGasPrice) gasPrice = maxGasPrice;

  let rawTx = {
    from: from,
    to: to,
    data: txData,
    value: web3.utils.toHex(value),
    gasLimit: web3.utils.toHex(gasLimit),
    gasPrice: web3.utils.toHex(gasPrice),
    nonce: txCount
  };

  let tx = new Tx(rawTx, { chain: NETWORK, hardfork: 'petersburg' });;

  tx.sign(PRIVATE_KEY);
  const serializedTx = tx.serialize();
  txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
  .catch(error => console.log(error));

  // Log the tx receipt
  console.log(txReceipt);
  return;
}
```

### Define a function to approve allowance
Since we are swapping from an ERC20 token, we will need a function to give the KyberNetworkProxy contract sufficient allowance to manage the user's funds.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Function to approve the KyberNetworkProxy contract to spend src token on the user's behalf
async function approveContract(allowance) {
  console.log("Approving KNP contract to manage my KNC");
  let txData = await SRC_TOKEN_CONTRACT.methods
    .approve(KYBER_NETWORK_PROXY_ADDRESS, allowance)
    .encodeABI();

  await broadcastTx(
    USER_ADDRESS,
    SRC_TOKEN_ADDRESS,
    txData,
    0, //Ether value to be sent should be zero
    "200000" //gasLimit
  );
}
```

### Define core functions

There are 2 core functions to define:
1. A function to obtain the expected conversion rate between ETH and ZIL
2. A function to perform the trade

#### Define a function to obtain conversion rates

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Function to obtain conversion rate between src token and dst token
async function getRates(SRC_TOKEN_ADDRESS,DST_TOKEN_ADDRESS,SRC_QTY_WEI) {
  return await KYBER_NETWORK_PROXY_CONTRACT.methods
    .getExpectedRate(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI)
    .call();
}
```

#### Define a function to perform the trade

This is the core function that will be used to perform the actual token swap. It makes use of the `broadcastTx` function defined in the previous section to broadcast the trade transaction.

**Note: Since we are swapping from tokens, we pass zero into the `value` input of the broadcastTx function.**

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Function to convert src token to dst token
async function trade(
  srcTokenAddress,
  srcQtyWei,
  dstTokenAddress,
  dstAddress,
  maxDstAmount,
  minConversionRate,
  walletId
) {
  console.log(`Converting ${SRC_TOKEN} to ${DST_TOKEN}`);
  let txData = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .trade(
      srcTokenAddress,
      srcQtyWei,
      dstTokenAddress,
      dstAddress,
      maxDstAmount,
      minConversionRate,
      walletId
    )
    .encodeABI();
  let gasLimit = await getGasLimit(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY);
  await broadcastTx(
    USER_ADDRESS,
    KYBER_NETWORK_PROXY_ADDRESS,
    txData,
    0, //Ether value to be included in the tx
    gasLimit //gasLimit
  );
}

// Function to get gas limit for trading
async function getGasLimit(source, dest, amount) {
  let gasLimitRequest = await fetch(`https://${NETWORK == "mainnet" ? "" : NETWORK + "-"}api.kyber.network/gas_limit?source=${source}&dest=${dest}&amount=${amount}`);
  let gasLimit = await gasLimitRequest.json();
  return gasLimit.data;
}
```

### Define main function

The main function will be used to get the conversion rates, check that there is sufficient allowance, then perform the trade.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

async function main() {
  // Calculate slippage rate
  let results = await getRates(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI);

  // Check KyberNetworkProxy contract allowance
  let contractAllowance = await SRC_TOKEN_CONTRACT.methods
    .allowance(USER_ADDRESS, KYBER_NETWORK_PROXY_ADDRESS)
    .call();

  // If insufficient allowance, approve else convert KNC to ETH.
  if (SRC_QTY_WEI <= contractAllowance) {
    await trade(
      SRC_TOKEN_ADDRESS,
      SRC_QTY_WEI,
      DST_TOKEN_ADDRESS,
      USER_ADDRESS,
      MAX_ALLOWANCE,
      results.slippageRate,
      REF_ADDRESS
    );
  } else {
    await approveContract(MAX_ALLOWANCE);
    await trade(
      SRC_TOKEN_ADDRESS,
      SRC_QTY_WEI,
      DST_TOKEN_ADDRESS,
      USER_ADDRESS,
      MAX_ALLOWANCE,
      results.slippageRate,
      REF_ADDRESS
    );
  }
  // Quit the program
  process.exit(0);
}
```

### Full code example
Before running this code example, the following fields need to be modified:
1. Change `ENTER_PROJECT_ID` to your Infura Project ID.
2. Change `ENTER_USER_PRIVATE_KEY` to the private key (without `0x` prefix) of the Ethereum wallet holding KNC tokens.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Importing the relevant packages
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const BN = require("bn.js");
const fetch = require('node-fetch');

// Connecting to ropsten infura node
const NETWORK = "ropsten"
const PROJECT_ID = "ENTER_PROJECT_ID" //Replace this with your own Project ID
const WS_PROVIDER = `wss://${NETWORK}.infura.io/ws/v3/${PROJECT_ID}`
const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_PROVIDER));

// Token Details
const SRC_TOKEN = "KNC";
const DST_TOKEN = "ZIL";
const SRC_TOKEN_ADDRESS = "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6";
const DST_TOKEN_ADDRESS = "0xaD78AFbbE48bA7B670fbC54c65708cbc17450167";
const SRC_DECIMALS = 18;
const DST_DECIMALS = 12;
const MAX_ALLOWANCE = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

//Contract ABIs and addresses
const ERC20_ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"supply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"digits","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
const KYBER_NETWORK_PROXY_ABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"},{"name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToEther","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetworkContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapEtherToToken","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdminQuickly","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"},{"name":"token","type":"address"}],"name":"getUserCapInTokenWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_kyberNetworkContract","type":"address"}],"name":"setKyberNetworkContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"field","type":"bytes32"}],"name":"info","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"}],"name":"trade","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"trader","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"actualSrcAmount","type":"uint256"},{"indexed":false,"name":"actualDestAmount","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newNetworkContract","type":"address"},{"indexed":false,"name":"oldNetworkContract","type":"address"}],"name":"KyberNetworkSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}];

// Kyber Network Proxy Contract Address
const KYBER_NETWORK_PROXY_ADDRESS = "0x818e6fecd516ecc3849daf6845e3ec868087b755";

// Trade Details
const SRC_QTY = "100";
const SRC_QTY_WEI = (SRC_QTY * 10 ** SRC_DECIMALS).toString();

// User Details
const PRIVATE_KEY = Buffer.from("ENTER_USER_PRIVATE_KEY", "hex"); //exclude 0x prefix
const USER_ADDRESS = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY.toString("hex")
).address;

// Wallet Address for Fee Sharing Program
//If none, set to 0x0000000000000000000000000000000000000000 (null address)
const REF_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E";
//const REF_ADDRESS = "0x0000000000000000000000000000000000000000"

// Get the contract instances
const KYBER_NETWORK_PROXY_CONTRACT = new web3.eth.Contract(
  KYBER_NETWORK_PROXY_ABI,
  KYBER_NETWORK_PROXY_ADDRESS
);
const SRC_TOKEN_CONTRACT = new web3.eth.Contract(ERC20_ABI, SRC_TOKEN_ADDRESS);

async function main() {
  // Calculate slippage rate
  let results = await getRates(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI);

  // Check KyberNetworkProxy contract allowance
  let contractAllowance = await SRC_TOKEN_CONTRACT.methods
    .allowance(USER_ADDRESS, KYBER_NETWORK_PROXY_ADDRESS)
    .call();

  // If insufficient allowance, approve else convert KNC to ETH.
  if (SRC_QTY_WEI <= contractAllowance) {
    await trade(
      SRC_TOKEN_ADDRESS,
      SRC_QTY_WEI,
      DST_TOKEN_ADDRESS,
      USER_ADDRESS,
      MAX_ALLOWANCE,
      results.slippageRate,
      REF_ADDRESS
    );
  } else {
    await approveContract(MAX_ALLOWANCE);
    await trade(
      SRC_TOKEN_ADDRESS,
      SRC_QTY_WEI,
      DST_TOKEN_ADDRESS,
      USER_ADDRESS,
      MAX_ALLOWANCE,
      results.slippageRate,
      REF_ADDRESS
    );
  }
  // Quit the program
  process.exit(0);
}

// Function to obtain conversion rate between src token and dst token
async function getRates(SRC_TOKEN_ADDRESS,DST_TOKEN_ADDRESS,SRC_QTY_WEI) {
  return await KYBER_NETWORK_PROXY_CONTRACT.methods
    .getExpectedRate(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI)
    .call();
}

// Function to convert src token to dst token
async function trade(
  srcTokenAddress,
  srcQtyWei,
  dstTokenAddress,
  dstAddress,
  maxDstAmount,
  minConversionRate,
  walletId
) {
  console.log(`Converting ${SRC_TOKEN} to ${DST_TOKEN}`);
  let txData = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .trade(
      srcTokenAddress,
      srcQtyWei,
      dstTokenAddress,
      dstAddress,
      maxDstAmount,
      minConversionRate,
      walletId
    )
    .encodeABI();
  let gasLimit = await getGasLimit(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY);
  await broadcastTx(
    USER_ADDRESS,
    KYBER_NETWORK_PROXY_ADDRESS,
    txData,
    0, //Ether value to be included in the tx
    gasLimit //gasLimit
  );
}

// Function to get gas limit for trading
async function getGasLimit(source, dest, amount) {
  let gasLimitRequest = await fetch(`https://${NETWORK == "mainnet" ? "" : NETWORK + "-"}api.kyber.network/gas_limit?source=${source}&dest=${dest}&amount=${amount}`);
  let gasLimit = await gasLimitRequest.json();
  return gasLimit.data;
}

// Function to broadcast transactions
async function broadcastTx(from, to, txData, value, gasLimit) {
  let txCount = await web3.eth.getTransactionCount(USER_ADDRESS);
  //Method 1: Use a constant
  let gasPrice = new BN(5).mul(new BN(10).pow(new BN(9))); //5 Gwei
  //Method 2: Use web3 gasPrice
  //let gasPrice = await web3.eth.gasPrice;
  //Method 3: Use KNP Proxy maxGasPrice
  //let gasPrice = await KYBER_NETWORK_PROXY_CONTRACT.maxGasPrice().call();

  let maxGasPrice = await KYBER_NETWORK_PROXY_CONTRACT.methods
    .maxGasPrice()
    .call();
  //If gasPrice exceeds maxGasPrice, set it to max.
  if (gasPrice >= maxGasPrice) gasPrice = maxGasPrice;

  let rawTx = {
    from: from,
    to: to,
    data: txData,
    value: web3.utils.toHex(value),
    gasLimit: web3.utils.toHex(gasLimit),
    gasPrice: web3.utils.toHex(gasPrice),
    nonce: txCount
  };

  let tx = new Tx(rawTx, { chain: NETWORK, hardfork: 'petersburg' });;

  tx.sign(PRIVATE_KEY);
  const serializedTx = tx.serialize();
  txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
  .catch(error => console.log(error));

  // Log the tx receipt
  console.log(txReceipt);
  return;
}

// Function to approve KNP contract
async function approveContract(allowance) {
  console.log("Approving KNP contract to manage my KNC");
  let txData = await SRC_TOKEN_CONTRACT.methods
    .approve(KYBER_NETWORK_PROXY_ADDRESS, allowance)
    .encodeABI();

  await broadcastTx(
    USER_ADDRESS,
    SRC_TOKEN_ADDRESS,
    txData,
    0, //Ether value to be sent should be zero
    "200000" //gasLimit
  );
}

main();
```

## Filtering Out Permissionless Reserves

By default, reserves that were listed permissionlessly are also included when performing `getExpectedRate()` and `trade()`. Depending on the jurisdiction where your platform is operating in, you may be required to exclude these reserves. To filter them out, use the `tradeWithHint()` function. Refer to [this section](api_abi-kybernetworkproxy.md#hint) for more information.

## Fee Sharing Program

You have the opportunity to join our _Fee Sharing Program_, which allows fee sharing on each swap that originates from your platform. Learn more about the program [here](integrations-feesharing.md)!

---
id: Integrations-RESTfulAPIGuide
title: RESTful API
---
[//]: # (tagline)
## Introduction

This guide will walk you through on how you can interact with our protocol implementation using our RESTful APIs. The most common group of users that can benefit from this guide are developers who have minimal smart contract experience, traders and wallets.

## Risk Mitigation

There are some risks when utilising Kyber. To safeguard users, we kindly ask that you refer to the [Slippage Rates Protection](integrations-slippagerateprotection.md) and [Price Feed Security](integrations-pricefeedsecurity.md) sections on what these risks are, and how to mitigate them.

## Overview

We break this guide into 3 sections:
1. [Trading Tokens](#trading-tokens) - This section will show the steps taken to execute a KNC -> DAI trade on Ropsten, as well as incorporating platform fees. The steps for performing token -> ether and ether -> token conversions are the same.
2. [Reserve Routing](#reserve-routing) - This advanced section covers the reserve routing feature to include / exclude reserves, or to split trades amongst multiple reserves.
3. [Token Info & Price Data](#obtaining-token-and-market-info) - This section covers how one can obtain token information and historical price data.

## Things to note

1. If the source token is not ETH (ie. an ERC20 token), the user is **first required** to call the [`/enabled_data`](api_abi-restfulapi.md) endpoint to give an allowance to the smart contract executing the trade.
2. Refer to the [API overview](api_abi-restfulapioverview.md#network-url) for the test and mainnet network URLs to use.
3. To prevent front running, the contract limits the gas price trade transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

let maxGasPrice = await KyberNetworkProxyContract.maxGasPrice();
```

## Trading Tokens

Suppose we want to convert 100 KNC to DAI tokens on Ropsten, which is a token to token conversion. In addition, we want to charge a platform fee of 0.25%. Note that ETH is used as the base pair i.e. KNC -> ETH -> DAI.

The code example will also work for token -> ether and ether -> token conversions, by using `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee` as the token address for ETH.

### Import Relevant Packages

* We use `ethers` for connecting to the Ethereum blockchain
* The `node-fetch` module is used for making API queries

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Importing the relevant packages
const ethers = require('ethers');
const fetch = require('node-fetch');
```

### Connect to an Ethereum Node

`ethers` provides a very simple method `getDefaultProvider` to easily connect to the Ethereum blockchain. While not necessary, it is recommended to provide an API key for the various providers offered (Eg. Alchemy, Infura and Etherscan).

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Connecting to a provider
const NETWORK = "ropsten"
const PROJECT_ID = "INFURA_PROJECT_ID" // Replace this with your own Project ID
const provider = new ethers.getDefaultProvider(NETWORK, {'infura': PROJECT_ID});
```

### Define Constants

Next, we will define the constants that we will be using for this guide. This includes the following:
- `NETWORK_URL`: Kyber's API Base URL
- `PRIVATE_KEY`: The private key which we will be sending transactions from
- `PLATFORM_WALLET`: The wallet address for which we can get commission fees from. Read more about platform fees [here](integrations-platformfees.md)
- `PLATFORM_FEE`: Platform fee amount to be charged, in basis points. Read more about platform fees [here](integrations-platformfees.md)
- `SRC_TOKEN_ADDRESS`: Ropsten KNC address
- `DEST_TOKEN_ADDRESS`: Ropsten DAI address
- `SRC_QTY`: 100 KNC tokens
- `GAS_PRICE`: The gas price to use (affects the tx speed)

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Base URL for API queries
// Refer to API/ABI >> RESTFul API Overview >> Network URL section
const NETWORK_URL = `https://${NETWORK == "main" ? "" : NETWORK + "-"}api.kyber.network`;

// User Details
const PRIVATE_KEY = "PRIVATE_KEY"; // Eg. 0x40ddbce3c7df9ab8d507d6b4af3861d224711b35299470ab7a217f780fe696cd
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const USER_ADDRESS = wallet.address;

// Wallet Address for platform fees
const PLATFORM_WALLET = "PLATFORM_WALLET"; // Eg. 0x483C5100C3E544Aef546f72dF4022c8934a6945E
const PLATFORM_FEE = 25; // 0.25%

// Token Addresses
const SRC_TOKEN_ADDRESS = "0x7b2810576aa1cce68f2b118cef1f36467c648f92"; // Ropsten KNC token address
const DEST_TOKEN_ADDRESS = "0xaD6D458402F60fD3Bd25163575031ACDce07538D"; // Ropsten DAI token address

// Src Token Quantity
const SRC_QTY = 100; // 100 KNC tokens to swap from

// Gas amount affecting speed of tx
const GAS_PRICE = "medium";
```

### Check Token Support

We first have to check if the traded tokens are supported on Kyber. We make use of the `/currencies` endpoint, which returns basic information about all tokens supported on Kyber. Details about possible path parameters and output fields can be [found here](api_abi-restfulapi.md#currencies).

It is recommended to use the token contract address as the identifier instead of the token symbol, as multiple tokens may share the same symbol.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

async function isTokenSupported(tokenAddress) {
  let tokensBasicInfoRequest = await fetch(`${NETWORK_URL}/currencies`);
  let tokensBasicInfo = await tokensBasicInfoRequest.json();
  let tokenSupported = tokensBasicInfo.data.some(token => {
    return caseInsensitiveEquals(tokenAddress, token.id)
  });
  if (!tokenSupported) {
    console.log('Token is not supported');
  }
  return tokenSupported;
}

function caseInsensitiveEquals(a, b) {
  return typeof a === 'string' && typeof b === 'string' ?
    a.localeCompare(b, undefined, {
      sensitivity: 'accent'
    }) === 0 :
    a === b;
}
```

### Check Source Token Approval

We use the `/users/<user_address>/currencies` endpoint to check whether the proxy contract has been approved for selling source tokens on behalf of the user. This endpoints returns a JSON of enabled statuses of ERC20 tokens for the given walletAddress. Details about the path parameters and output fields can be [found here](api_abi-restfulapi.md#users-user-address-currencies).

If the source token is not enabled for trading, querying the `users/<user_address>/currencies/<currency_id>/enable_data` endpoint returns a transaction payload needed to be signed and broadcasted by the user to enable the KyberNetwork contract to trade source tokens on his behalf. Details about the path parameters and output fields can be [found here](api_abi-restfulapi.md#users-user-address-currencies-currency-id-enable-data).

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

async function checkAndApproveTokenForTrade(tokenAddress, userAddress, gasPrice) {
  let enabledStatusesRequest = await fetch(`${NETWORK_URL}/users/${userAddress}/currencies`);      
  let enabledStatuses = await enabledStatusesRequest.json();
  let txsRequired = 0;
  for (let token of enabledStatuses.data) {
    if (caseInsensitiveEquals(tokenAddress, token.id)) {
      txsRequired = token.txs_required;
      break;
    }
  }
  switch (txsRequired) {
    case 1:
      console.log("Approving to max amount");
      // No allowance so approve to maximum amount (2^255)
      await enableTokenTransfer(tokenAddress, userAddress, gasPrice);
      break;
    case 2:
      // Allowance has been given but is insufficient.
      // Have to approve to 0 first to avoid this issue https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
      // Approve to 0
      console.log("Approving to 0");
      await enableTokenTransfer(tokenAddress, userAddress, gasPrice);
      // Approve to maximum amount (2^255)
      console.log("Approving to max amount");
      await enableTokenTransfer(tokenAddress, userAddress, gasPrice);
      break;
    default:
      // Shouldn't need to do anything else in other scenarios.
      break;
  }
}

async function enableTokenTransfer(tokenAddress, userAddress, gasPrice) {
  let enableTokenDetailsRequest = await fetch(
    `${NETWORK_URL}/users/${userAddress}/currencies/${tokenAddress}/enable_data?gas_price=${gasPrice}`
    );
  let enableTokenDetails = await enableTokenDetailsRequest.json();
  await wallet.sendTransaction(enableTokenDetails.data);
}
```

### Get Destination Token Amount Receivable

Create a function to get an approximate of the destination token amount for the specified amount of source token. We will use the `/quote_amount` endpoint in this function. Details about the path parameters and output fields can be [found here](api_abi-restfulapi.md#quote_amount).

**Note:** 
- The rates via the API are cached, so the `/quote_amount` **does not support reserve routing and platform fees**. Those have to be accounted for separately.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

async function getQuoteAmount(srcToken, destToken, srcQty) {
  const BPS = 10000;
  // account for platform fees: subtracted from srcQty
  let srcQtyAfterPlatformFee = srcQty * (BPS - PLATFORM_FEE) / BPS;
  let quoteAmountRequest = await fetch(
    `${NETWORK_URL}/quote_amount?base=${srcToken}&quote=${destToken}&base_amount=${srcQtyAfterPlatformFee}&type=sell`
    );
  let quoteAmount = await quoteAmountRequest.json();
  return quoteAmount.data;
}
```

### Trade Execution

We now have all the required information to peform the trade transaction. Querying the `/trade_data` endpoint will return the transaction payload to be signed and broadcasted by the user to make the conversion. Details about the path parameters and output fields can be [found here](api_abi-restfulapi.md#trade_data).

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

async function executeTrade(userAddress, srcToken, destToken, srcQty, minDstQty, gasPrice, platformWallet, platformFee) {
  let tradeDetailsRequest = await fetch(
    `${NETWORK_URL}/trade_data?user_address=${userAddress}&src_id=${srcToken}` + 
    `&dst_id=${destToken}&src_qty=${srcQty}&min_dst_qty=${minDstQty}` + 
    `&gas_price=${gasPrice}&wallet_id=${platformWallet}&wallet_fee=${platformFee}`
    );

  let tradeDetails = await tradeDetailsRequest.json();
  await wallet.sendTransaction(tradeDetails.data[0]);
}
```

### Tying Everything Together

The main function will combine the different functions together to obtain the conversion rate, check that conditions are met for the trade, and execute the trade.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

async function main() {
  // Step 1: If either token is not supported, quit
  if (!await isTokenSupported(SRC_TOKEN_ADDRESS) || !await isTokenSupported(DEST_TOKEN_ADDRESS)) {
    // Quit the program
    process.exit(0);
  }

  // Step 2: Check if KNC token is enabled. If not, enable.
  await checkAndApproveTokenForTrade(SRC_TOKEN_ADDRESS, USER_ADDRESS, GAS_PRICE)

  // Step 3: Get expected DAI qty from selling 100 KNC tokens
  let minDstQty = await getQuoteAmount(SRC_TOKEN_ADDRESS, DEST_TOKEN_ADDRESS, SRC_QTY);

  // Step 4: Perform the KNC -> DAI trade
  await executeTrade(USER_ADDRESS, SRC_TOKEN_ADDRESS, DEST_TOKEN_ADDRESS, SRC_QTY, minDstQty, GAS_PRICE, PLATFORM_WALLET, PLATFORM_FEE);

  // Quit the program
  process.exit(0);
}
```

### Full Code Example
Before running this code example, the following fields need to be modified:
1. Change `INFURA_PROJECT_ID` to your Infura Project ID.
2. Change `PRIVATE_KEY` to the private key (with `0x` prefix) of the Ethereum wallet holding Ether.
3. Change `PLATFORM_WALLET` to a wallet address for platform fees.

```js
const ethers = require('ethers');
const fetch = require('node-fetch');

// Connecting to a provider
const NETWORK = "ropsten"
const PROJECT_ID = "INFURA_PROJECT_ID" // Replace this with your own Project ID
const provider = new ethers.getDefaultProvider(NETWORK, {'infura': PROJECT_ID});

// Base URL for API queries
// Refer to API/ABI >> RESTFul API Overview >> Network URL section
const NETWORK_URL = `https://${NETWORK == "main" ? "" : NETWORK + "-"}api.kyber.network`;

// User Details
const PRIVATE_KEY = "PRIVATE_KEY"; // Eg. 0x40ddbce3c7df9ab8d507d6b4af3861d224711b35299470ab7a217f780fe696cd
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const USER_ADDRESS = wallet.address;

// Wallet Address for platform fees
const PLATFORM_WALLET = "PLATFORM_WALLET"; // Eg. 0x483C5100C3E544Aef546f72dF4022c8934a6945E
const PLATFORM_FEE = 25; // 0.25%

// Token Addresses: Use 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee for ETH
const SRC_TOKEN_ADDRESS = "0x7b2810576aa1cce68f2b118cef1f36467c648f92"; // Ropsten KNC token address
const DEST_TOKEN_ADDRESS = "0xaD6D458402F60fD3Bd25163575031ACDce07538D"; // Ropsten DAI token address

// Src Token Quantity
const SRC_QTY = 100; // 100 KNC tokens to swap from

// Gas amount affecting speed of tx
const GAS_PRICE = "medium";

async function main() {
  // Step 1: If either token is not supported, quit
  if (!await isTokenSupported(SRC_TOKEN_ADDRESS) || !await isTokenSupported(DEST_TOKEN_ADDRESS)) {
    // Quit the program
    process.exit(0);
  }

  // Step 2: Check if KNC token is enabled. If not, enable.
  await checkAndApproveTokenForTrade(SRC_TOKEN_ADDRESS, USER_ADDRESS, GAS_PRICE)

  // Step 3: Get expected DAI qty from selling 100 KNC tokens
  let minDstQty = await getQuoteAmount(SRC_TOKEN_ADDRESS, DEST_TOKEN_ADDRESS, SRC_QTY);

  // Step 4: Perform the KNC -> DAI trade
  await executeTrade(USER_ADDRESS, SRC_TOKEN_ADDRESS, DEST_TOKEN_ADDRESS, SRC_QTY, minDstQty, GAS_PRICE, PLATFORM_WALLET, PLATFORM_FEE);

  // Quit the program
  process.exit(0);
}

async function isTokenSupported(tokenAddress) {
  let tokensBasicInfoRequest = await fetch(`${NETWORK_URL}/currencies`);
  let tokensBasicInfo = await tokensBasicInfoRequest.json();
  let tokenSupported = tokensBasicInfo.data.some(token => {
    return caseInsensitiveEquals(tokenAddress, token.id)
  });
  if (!tokenSupported) {
    console.log('Token is not supported');
  }
  return tokenSupported;
}

function caseInsensitiveEquals(a, b) {
  return typeof a === 'string' && typeof b === 'string' ?
    a.localeCompare(b, undefined, {
      sensitivity: 'accent'
    }) === 0 :
    a === b;
}

async function checkAndApproveTokenForTrade(tokenAddress, userAddress, gasPrice) {
  let enabledStatusesRequest = await fetch(`${NETWORK_URL}/users/${userAddress}/currencies`);      
  let enabledStatuses = await enabledStatusesRequest.json();
  let txsRequired = 0;
  for (let token of enabledStatuses.data) {
    if (caseInsensitiveEquals(tokenAddress, token.id)) {
      txsRequired = token.txs_required;
      break;
    }
  }
  switch (txsRequired) {
    case 1:
      console.log("Approving to max amount");
      // No allowance so approve to maximum amount (2^255)
      await enableTokenTransfer(tokenAddress, userAddress, gasPrice);
      break;
    case 2:
      // Allowance has been given but is insufficient.
      // Have to approve to 0 first to avoid this issue https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
      // Approve to 0
      console.log("Approving to 0");
      await enableTokenTransfer(tokenAddress, userAddress, gasPrice);
      // Approve to maximum amount (2^255)
      console.log("Approving to max amount");
      await enableTokenTransfer(tokenAddress, userAddress, gasPrice);
      break;
    default:
      // Shouldn't need to do anything else in other scenarios.
      break;
  }
}

async function enableTokenTransfer(tokenAddress, userAddress, gasPrice) {
  let enableTokenDetailsRequest = await fetch(
    `${NETWORK_URL}/users/${userAddress}/currencies/${tokenAddress}/enable_data?gas_price=${gasPrice}`
    );
  let enableTokenDetails = await enableTokenDetailsRequest.json();
  await wallet.sendTransaction(enableTokenDetails.data);
}

async function getQuoteAmount(srcToken, destToken, srcQty) {
  const BPS = 10000;
  // account for platform fees: subtracted from srcQty
  let srcQtyAfterPlatformFee = srcQty * (BPS - PLATFORM_FEE) / BPS;
  let quoteAmountRequest = await fetch(
    `${NETWORK_URL}/quote_amount?base=${srcToken}&quote=${destToken}&base_amount=${srcQtyAfterPlatformFee}&type=sell`
    );
  let quoteAmount = await quoteAmountRequest.json();
  return quoteAmount.data;
}

async function executeTrade(userAddress, srcToken, destToken, srcQty, minDstQty, gasPrice, platformWallet, platformFee) {
  let tradeDetailsRequest = await fetch(
    `${NETWORK_URL}/trade_data?user_address=${userAddress}&src_id=${srcToken}` + 
    `&dst_id=${destToken}&src_qty=${srcQty}&min_dst_qty=${minDstQty}` + 
    `&gas_price=${gasPrice}&wallet_id=${platformWallet}&wallet_fee=${platformFee}`
    );

  let tradeDetails = await tradeDetailsRequest.json();
  await wallet.sendTransaction(tradeDetails.data[0]);
}

main();
```

## Reserve Routing

### Overview

In previous network versions, the `hint` parameter was used to filter permissionless reserves. With Katalyst, we utilise this parameter for routing trades to specific reserves.

There are 4 optional routing rules:
1.  **`BestOfAll`** - This is the default routing rule when no hint is provided, and is the classic reserve matching algorithm used by the Kyber smart contracts since the beginning.
2.  **`MaskIn` (Whitelist)** - Specify a list of reserves to be *included* and perform the `BestOfAll` routing on them
3.  **`MaskOut` (Blacklist)** - Specify a list of reserves to be *excluded* and perform the `BestOfAll` routing on the remaining reserves
4.  **`Split`** - Specify a list of reserves and their respective percentages of the total `srcQty` that will be routed to each reserve.

For token -> token trades, you can specify a routing rule for each half. For example, a `MaskIn` route can be used for the token -> ether side, while a `Split` route can be used for the ether -> token side.

### Fetching Reserve Information

Query the `/reserves` endpoint to get a list of supporting reserves for a trade. Details about the path parameters and output fields can be [found here](api_abi-restfulapi.md#reserves).

The `id` return parameter will be useful for building hints.

#### Examples

Get reserves information for a WBTC -> ETH trade.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const fetch = require('node-fetch');
const NETWORK_URL = 'ropsten-api.kyber.network';

async function fetchReservesInformation() {
  let token = '0x3dff0dce5fc4b367ec91d31de3837cf3840c8284'; // Ropsten WBTC address
  let type = 'sell'; // token -> ether

  let reserveInfoRequest = await fetch(`${NETWORK_URL}/reserves?token=${token}&type=${type}`);
  let reserveInfo = (await reserveInfoRequest.json()).data;
}

await fetchReservesInformation();
```

Get reserves information for a ETH -> KNC trade.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const fetch = require('node-fetch');
const NETWORK_URL = 'ropsten-api.kyber.network';

async function fetchReservesInformation() {
  let token = '0x7b2810576aa1cce68f2b118cef1f36467c648f92'; // Ropsten KNC address
  let type = 'buy'; // ether -> token

  let reserveInfoRequest = await fetch(`${NETWORK_URL}/reserves?token=${token}&type=${type}`);
  let reserveInfo = (await reserveInfoRequest.json()).data;
}

await fetchReservesInformation();
```

### Building Hints

Querying the `/hint` endpoint will return data needed for the `hint` input parameter for the `/trade_data` endpoint. Details about the path parameters and output fields can be [found here](api_abi-restfulapi.md#hint).

#### Examples

Build a KNC -> ETH `MaskIn` hint selecting the first reserve.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const fetch = require('node-fetch');
const NETWORK_URL = 'ropsten-api.kyber.network';

async function buildHint() {
  // Fetch reserves for KNC -> ETH trade, select the first reserve
  let srcToken = '0x7b2810576aa1cce68f2b118cef1f36467c648f92'; // Ropsten KNC address
  let type = 'sell'; // token -> ether
  let reserveInfoRequest = await fetch(`${NETWORK_URL}/reserves?token=${srcToken}&type=${type}`);
  let reserveInfo = await reserveInfoRequest.json();
  // Choose first reserve
  let reserveId = reserveInfo.data[0].id;

  // Other /hint endpoint parameters
  type = 't2e'; // token -> ether
  let tradeType = 'maskin';

  let hintRequest = await fetch(`${NETWORK_URL}/hint?type=${type}&token_src=${srcToken}&trade_type=${tradeType}&reserve_id=${reserveId}`);
  let hint = (await hintRequest.json()).data;
}

await buildHint();
```

Build a ETH -> WBTC `MaskOut` hint excluding the first reserve.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const fetch = require('node-fetch');
const NETWORK_URL = 'ropsten-api.kyber.network';

async function buildHint() {
  // Fetch reserves for ETH -> WBTC trade, select the first reserve
  let destToken = '0x3dff0dce5fc4b367ec91d31de3837cf3840c8284'; // Ropsten WBTC address
  let type = 'buy'; // ether -> token
  let reserveInfoRequest = await fetch(`${NETWORK_URL}/reserves?token=${destToken}&type=${type}`);
  let reserveInfo = await reserveInfoRequest.json();
  // Choose first reserve to be excluded
  let reserveId = reserveInfo.data[0].id;

  // Other /hint endpoint parameters
  type = 'e2t'; // ether -> token
  let tradeType = 'maskout';

  let hintRequest = await fetch(`${NETWORK_URL}/hint?type=${type}&token_dest=${destToken}&trade_type=${tradeType}&reserve_id=${reserveId}`);
  let hint = (await hintRequest.json()).data;
}

await buildHint();
```

Build a KNC -> WBTC hint with the following routes:
- KNC -> ETH: `Split` trade among 2 reserves:
  - 1st reserve trades 70%, 2nd reserves trades 30%
- ETH -> WBTC: `BestOfAll` trade

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const fetch = require('node-fetch');
const NETWORK_URL = 'ropsten-api.kyber.network';

async function buildHint() {
  // Fetch reserves for KNC -> ETH trade, select 2 reserves
  let srcToken = '0x7b2810576aa1cce68f2b118cef1f36467c648f92'; // Ropsten KNC address
  let type = 'sell'; // token -> ether
  let reserveInfoRequest = await fetch(`${NETWORK_URL}/reserves?token=${srcToken}&type=${type}`);
  let reserveInfo = await reserveInfoRequest.json();
  let firstReserve = reserveInfo.data[0].id;
  let secondReserve = reserveInfo.data[1].id;

  // Other /hint endpoint parameters
  type = 't2t'; // token -> token
  let firstTradeType = 'split';
  let secondTradeType = 'bestofall';
  let destToken = '0x3dff0dce5fc4b367ec91d31de3837cf3840c8284'; // Ropsten WBTC address
  let firstSplit = '7000';
  let secondSplit = '3000';

  let hintRequest = await fetch(`${NETWORK_URL}/hint?type=${type}&trade_type=${firstTradeType}&token_src=${srcToken}&reserve_id=${firstReserve},${secondReserve}&split_value=${firstSplit},${secondSplit}&trade_type=${secondTradeType}&token_dest=${destToken}`);
  let hint = (await hintRequest.json()).data;
}

await buildHint();
```

### Using Hints

Pass in the built hint into the `/trade_data` endpoint.

#### Example

Get the parameters needed for a 100 KNC -> DAI trade with `MaskIn` reserve routing for KNC -> ETH.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const fetch = require('node-fetch');
const NETWORK_URL = 'ropsten-api.kyber.network';

async function getTradeParams() {
  // Building hint
  let type = 't2e';
  let srcToken = "0x7b2810576aa1cce68f2b118cef1f36467c648f92"; // Ropsten KNC token address
  let tradeType = 'maskin';
  let reserveId = '0xff00004b79626572000000000000000000000000000000000000000000000000';

  let hintRequest = await fetch(`${NETWORK_URL}/hint?type=${type}&token_src=${srcToken}&trade_type=${tradeType}&reserve_id=${reserveId}`);
  let hint = (await hintRequest.json()).data;
  

  // Trade Parameters
  let userAddress = '0x483C5100C3E544Aef546f72dF4022c8934a6945E';
  let destToken = "0xaD6D458402F60fD3Bd25163575031ACDce07538D"; // Ropsten DAI token address
  let srcQty = 100;
  let minDstQty = 1;
  let gasPrice = 'medium';
  let platformWallet = '0x483C5100C3E544Aef546f72dF4022c8934a6945E';
  let platformFee = 25; // 0.25%

  let tradeDetailsRequest = await fetch(
      `${NETWORK_URL}/trade_data?user_address=${userAddress}&src_id=${srcToken}` + 
      `&dst_id=${destToken}&src_qty=${srcQty}&min_dst_qty=${minDstQty}` + 
      `&gas_price=${gasPrice}&wallet_id=${platformWallet}&wallet_fee=${platformFee}` + 
      `&hint=${hint}`
      );
  
  let tradeDetails = (await tradeDetailsRequest.json()).data;
}
```

## Obtaining Token and Market Info
### Basic Token Information

The `/currencies` endpoint returns basic information about all tokens supported on Kyber. Details about possible path parameters and output fields can be [found here](api_abi-restfulapi.md#currencies).

#### Example

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const fetch = require('node-fetch');

async function getSupportedTokens() {
  let tokensBasicInfoRequest = await fetch('https://api.kyber.network/currencies');
  let tokensBasicInfo = await tokensBasicInfoRequest.json();
  console.log(tokensBasicInfo);
  return tokensBasicInfo;
}

await getSupportedTokens()
```

#### Output
```json
{  
	"error":false,
	"data":[  
		{  
			"symbol": "OMG",
			"name": "OmiseGO",
			"address": "0x4bfba4a8f28755cb2061c413459ee562c6b9c51b",
			"decimals": 18,
			"id": "0x4bfba4a8f28755cb2061c413459ee562c6b9c51b",
			"reserves_src": [
				"0xEB52Ce516a8d054A574905BDc3D4a176D3a2d51a",
				"0x3EaFE85fBEd7FD20a3b34C4857147aD385685066"
			],
			"reserves_dest": [
				"0xEB52Ce516a8d054A574905BDc3D4a176D3a2d51a",
				"0x3EaFE85fBEd7FD20a3b34C4857147aD385685066"
			]
		},
		{  
			"name":"Ethereum",
			"decimals":18,
			"address":"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
			"symbol":"ETH",
			"id":"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    },
  …
  ]
}
```

### Token Price & Volume Information

The `/market` endpoint returns price and volume information on token to ETH pairs supported on Kyber. Details about possible path parameters and output fields can be [found here](api_abi-restfulapi.md#market).

#### Example

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const fetch = require('node-fetch');

async function getMarketInformation() {
  let marketInfoRequest = await fetch('https://api.kyber.network/market');
  let marketInfo = await marketInfoRequest.json();
  console.log(tokensBasicInfo);
  return marketInfo;
}

await getMarketInformation()
```

#### Output
```json
{
  "error": false,
  "data": [
    {
      "timestamp": 1536806619250,
      "pair": "KNC_ETH",
      "quote_symbol": "KNC",
      "base_symbol": "ETH",
      "past_24h_high": 0.001937984496124031,
      "past_24h_low": 0.001857617770187944,
      "usd_24h_volume": 5566.2079180166,
      "eth_24h_volume": 31.8094685833,
      "token_24h_volume": 16865.433010686364,
      "current_bid": 0.001867351485999998,
      "current_ask": 0.0018868074209224932,
      "last_traded": 0.0018868074209224932
    },
    {
      "timestamp": 1536806619251,
      "pair": "OMG_ETH",
      "quote_symbol": "OMG",
      "base_symbol": "ETH",
      "past_24h_high": 0.018518518518518517,
      "past_24h_low": 0.017266283397471997,
      "usd_24h_volume": 13871.8906588085,
      "eth_24h_volume": 78.4248866967,
      "token_24h_volume": 4381.367829085394,
      "current_bid": 0.017379117142599983,
      "current_ask": 0.0175141743763495,
      "last_traded": 0.01777996566748282
    }
  ]
}
```

### Token/ETH and Token/USD Price Information

The `/change24h` endpoint returns current token to ETH and USD rates and price percentage changes against the previous day. Details about possible path parameters and output fields can be [found here](api_abi-restfulapi.md#change24h).

#### Example

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const fetch = require('node-fetch');

async function getPast24HoursTokenInformation() {
  let past24HoursTokenInfoRequest = await fetch('https://api.kyber.network/change24h')
  let past24HoursTokenInfo = await past24HoursTokenInfoRequest.json();
  console.log(past24HoursTokenInfo);
  return past24HoursTokenInfo;
}

await getPast24HoursTokenInformation()
```

#### Output
```json
{
  "ETH_KNC": {
    "timestamp": 1548065183567,
    "token_name": "Kyber Network",
    "token_symbol": "KNC",
    "token_decimal": 18,
    "token_address": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
    "rate_eth_now": 0.001144689345999999,
    "change_eth_24h": -2.7115507894449724,
    "change_usd_24h": 13.883783963625097,
    "rate_usd_now": 0.1443257387379925
  },
  "ETH_OMG": {
    "timestamp": 1548065183567,
    "token_name": "OmiseGO",
    "token_symbol": "OMG",
    "token_decimal": 18,
    "token_address": "0xd26114cd6ee289accf82350c8d8487fedb8a0c07",
    "rate_eth_now": 0.0105194607632,
    "change_eth_24h": -2.0145305819746198,
    "change_usd_24h": -10.129,
    "rate_usd_now": 0.8
  },
  ...
}
```

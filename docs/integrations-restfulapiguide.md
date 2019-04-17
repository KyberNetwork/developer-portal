---
id: Integrations-RESTfulAPIGuide
title: RESTful API
---
## DISCLAIMER
**All code snippets in this guide have not been audited and should not be used in production. If so, it is done at your own risk.**

## Introduction
This guide will walk you through on how you can interact with our protocol implementation using our RESTful APIs. The most common group of users that can benefit from this guide are developers who have minimal smart contract experience, traders and wallets.

## Overview
In this guide, we will be going through 2 scenarios. The first scenario covers how to perform a token to token swap using the RESTful apis and the second is about how one can obtain token information and historical price data.

## Things to note
1) The `/buy_rate` and `/sell_rate` endpoints are currently restricted to ETH <-> ERC20 token. If you want to get the rates for a conversion between token A and token B, you need to use both APIs. Refer to [this section](#get-approximate-dai-token-amount-receivable) on how to do so.
2) When converting from Token to ETH/Token, the user is required to call the `/enabled_data` endpoint **first** to give an allowance to the smart contract executing the `trade` function i.e. the `KyberNetworkProxy.sol` contract.
3) Refer to the [API overview](api_abi-restfulapioverview.md#network-url) for the test and mainnet network URLs to use.

## Scenario 1: Token to Token Swap
Suppose we want to convert 100 BAT to DAI tokens, which is a token to token conversion. Note that ETH is used as the base pair i.e. BAT -> ETH -> DAI.

### Import relevant packages
* We use `web3` for broadcasting transactions to the blockchain
* The `ethereumjs-tx` library is used to sign and serialize a raw transaction to be broadcasted
* The `node-fetch` module is used for making API queries

```js
// Importing the relevant packages
const Web3 = require("web3");
const Tx = require("ethereumjs-tx");
const fetch = require('node-fetch');
```

### Connect to an Ethereum node
In this example, we will connect to Infura's ropsten node.

```js
// Connecting to ropsten infura node
const WS_PROVIDER = "wss://ropsten.infura.io/ws";
const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_PROVIDER));
```

### Define constants
Next, we will define the constants that we will be using for this guide.
```js
//Base URL for API queries
//Refer to API/ABI >> RESTFul API Overview >> Network URL section
const NETWORK_URL = "https://ropsten-api.kyber.network";

//User Details
const PRIVATE_KEY = Buffer.from("ENTER_USER_PRIVATE_KEY", "hex");
const USER_ADDRESS = web3.eth.accounts.privateKeyToAccount("0x" + PRIVATE_KEY.toString('hex')).address; // Remove the 0x prefix

// Wallet Address for Fee Sharing Program
const REF_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E";

//Token Addresses
const BAT_TOKEN_ADDRESS = "0xDb0040451F373949A4Be60dcd7b6B8D6E42658B6".toLowerCase(); //Ropsten BAT token address
const DAI_TOKEN_ADDRESS = "0xaD6D458402F60fD3Bd25163575031ACDce07538D".toLowerCase(); //Ropsten DAI token address

//Token Quantity
const BAT_QTY = 100; //100 BAT tokens to swap from

//Gas amount affecting speed of tx
const GAS_PRICE = "medium";
```

### Define function for broadcasting transactions
We will refactor the broadcast transaction functionality into its own function.
```js
async function broadcastTx(rawTx) {
    // Extract raw tx details, create a new Tx
    let tx = new Tx(rawTx);
    // Sign the transaction
    tx.sign(PRIVATE_KEY);
    // Serialize the transaction (RLP Encoding)
    const serializedTx = tx.serialize();
    // Broadcast the tx
    txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).catch(error => console.log(error));
    // Log the tx receipt
    console.log(txReceipt);
}
```

### Check if BAT and DAI tokens are supported
Create a function to check whether a token is supported on Kyber. We make use of the `/currencies` endpoint, which returns basic information about all tokens supported on Kyber. Details about possible path parameters and output fields can be [found here](api_abi-restfulapi.md#currencies).

It is recommended to use the token contract address as the identifier instead of the token symbol, as multiple tokens may share the same symbol.

```js
async function isTokenSupported(tokenAddress) {
  let tokensBasicInfoRequest = await fetch(NETWORK_URL + '/currencies');
  let tokensBasicInfo = await tokensBasicInfoRequest.json();
  let tokenSupported = tokensBasicInfo.data.some(token => {return tokenAddress == token.id});
  if (!tokenSupported) {
    console.log('Token is not supported');
  }
  return tokenSupported;
}
```

### Check if BAT token is approved for use
We use the `/users/<user_address>/currencies` endpoint to check whether the KyberNetwork contract has been approved for selling BAT tokens on behalf of the user. This endpoints returns a JSON of enabled statuses of ERC20 tokens for the given walletAddress. Details about the path parameters and output fields can be [found here](api_abi-restfulapi.md#users-user-address-currencies).

```js
async function isTokenEnabledForUser(tokenAddress,walletAddress) {
  let enabledStatusesRequest = await fetch(NETWORK_URL + '/users/' + walletAddress + '/currencies');
  let enabledStatuses = await enabledStatusesRequest.json();
  for (var i=0; i < enabledStatuses.data.length; i++) {
    token = enabledStatuses.data[i];
    if (token.id == tokenAddress) {
      return token.enabled;
    }
  }
}
```

### Enable BAT token for transfer
If the BAT token is not enabled for trading, querying the `users/<user_address>/currencies/<currency_id>/enable_data?gas_price=<gas_price>` endpoint returns a transaction payload needed to be signed and broadcasted by the user to enable the KyberNetwork contract to trade BAT tokens on his behalf. Details about the path parameters and output fields can be [found here](api_abi-restfulapi.md#users-user-address-currencies-currency-id-enable-data).

```js
async function enableTokenTransfer(tokenAddress,walletAddress,gasPrice) {
  let enableTokenDetailsRequest = await fetch(NETWORK_URL + '/users/' + walletAddress + '/currencies/' + tokenAddress + '/enable_data?gas_price=' + gasPrice);
  let enableTokenDetails = await enableTokenDetailsRequest.json();
  let rawTx = enableTokenDetails.data;

  await broadcastTx(rawTx);
}
```

### Get approximate DAI token amount receivable
For token to token conversions, a base token is used (Eg. ETH). We first query the `/sell_rate?id=<id>&qty=<qty>` endpoint, which returns the expected ETH amount receivable for a specific token. Details about the path parameters and output fields can be [found here](api_abi-restfulapi.md#sell-rate).

We next use the `buy_rate?id=<id>&qty=<qty>` endpoint, but this returns the ETH amount required to purchase a requested amount of tokens (`? ETH -> X tokens`), not the amount of tokens receivable for a requested ETH amount (`X ETH -> ? tokens`).  Details about the path parameters and output fields can be [found here](api_abi-restfulapi.md#buy-rate).

As such, we perform the following steps:
1. Query the `sell_rate` endpoint for expected ETH amount receivable from 100 BAT tokens (`100 BAT -> ? ETH`)
2. Query the `buy_rate` endpoint for an approximate buy rate for 1 DAI token (`? ETH -> 1 DAI`)
3. Use the approximated buy rate to calculate how much DAI tokens we expect to receive
4. Account for slippage in rates

#### Example
1. Querying the `sell_rate` endpoint for 100 BAT tokens yields `100 BAT -> 0.1 ETH`
2. Querying the `buy_rate` endpoint for 1 DAI token yields `0.01 ETH -> 1 DAI`
3. So `100 BAT -> 0.1 ETH -> 10 DAI`
3. Assuming a 3% slippage rate, we expect to receive a minimum of `0.97*10 = 9.7 DAI`

```js
async function getSellQty(tokenAddress, qty) {
  let sellQtyRequest = await fetch(NETWORK_URL + '/sell_rate?id=' + tokenAddress + '&qty=' + qty);
  let sellQty = await sellQtyRequest.json();
  sellQty = sellQty.data[0].dst_qty[0];
  return sellQty;
}

async function getApproximateBuyQty(tokenAddress) {
  const QTY = 1; //Quantity used for the approximation
  let approximateBuyRateRequest = await fetch(NETWORK_URL + '/buy_rate?id=' + tokenAddress + '&qty=' + QTY);
  let approximateBuyQty = await approximateBuyRateRequest.json();
  approximateBuyQty = approximateBuyQty.data[0].src_qty[0];
  return approximateBuyQty;
}

//sellQty = output from getSellQty function
//buyQty = output from getApproximateBuyQty function
//srcQty = token qty amount to swap from (100 BAT tokens in scenario)
async function getApproximateReceivableTokens(sellQty,buyQty,srcQty) {
  let expectedAmountWithoutSlippage = buyQty / sellQty * srcQty;
  let expectedAmountWithSlippage = 0.97 * expectedAmountWithoutSlippage;
  return expectedAmountWithSlippage;
}
```

### Convert BAT to DAI
We now have all the required information to peform the trade transaction. Querying `https://api.kyber.network/trade_data?user_address=<user_address>&src_id=<src_id>&dst_id=<dst_id>&src_qty=<src_qty>&min_dst_qty=<min_dst_qty>&gas_price=<gas_price>&wallet_id=<wallet_id>` will return the transaction payload to be signed and broadcasted by the user to make the conversion. Details about the path parameters and output fields can be [found here](api_abi-restfulapi.md#trade-data).

```js
async function executeTrade(walletAddress,srcToken,dstToken,srcQty,minDstQty,gasPrice,refAddress) {
  let tradeDetailsRequest = await fetch(NETWORK_URL + '/trade_data?user_address=' + walletAddress + '&src_id=' + srcToken + '&dst_id=' + dstToken + '&src_qty=' + srcQty + '&min_dst_qty=' + minDstQty + '&gas_price=' + gasPrice + '&wallet_id=' + refAddress);
  let tradeDetails = await tradeDetailsRequest.json();
  let rawTx = tradeDetails.data[0];

  await broadcastTx(rawTx);
}
```

### Define Main function
The main function will combine the different functions together to obtain the conversion rate, check that conditions are met for the trade, and execute the trade.

```js
async function main() {
  //Step 1: If either token is not supported, quit
  if (! await isTokenSupported(BAT_TOKEN_ADDRESS) || ! await isTokenSupported(DAI_TOKEN_ADDRESS)) {
    // Quit the program
    process.exit(0);
  }

  //Step 2: Check if BAT token is enabled
  if(! await isTokenEnabledForUser(BAT_TOKEN_ADDRESS,USER_ADDRESS)) {
    //Step 3: Approve BAT token for trade
    await enableTokenTransfer(BAT_TOKEN_ADDRESS,USER_ADDRESS,GAS_PRICE);
  }

  //Step 4: Get expected ETH qty from selling 100 BAT tokens
  let sellQty = await getSellQty(BAT_TOKEN_ADDRESS,BAT_QTY);

  //Step 5: Get approximate DAI tokens receivable, set it to be minDstQty
  let buyQty = await getApproximateBuyQty(DAI_TOKEN_ADDRESS);
  let minDstQty = await getApproximateReceivableTokens(sellQty,buyQty,BAT_QTY);

  //Step 6: Perform the BAT -> DAI trade
  await executeTrade(USER_ADDRESS,BAT_TOKEN_ADDRESS,DAI_TOKEN_ADDRESS,BAT_QTY,minDstQty,GAS_PRICE,REF_ADDRESS);

  // Quit the program
  process.exit(0);
}
```

### Full code example
**Note: The following code is not audited and should not be used in production. If so, it is done at your own risk.**

Before running this code example, change `ENTER_USER_PRIVATE_KEY` to the private key (without `0x` prefix) of the Ethereum wallet holding the Ropsten BAT tokens.
```js
// Importing the relevant packages
const Web3 = require("web3");
const Tx = require("ethereumjs-tx");
const fetch = require('node-fetch');

// Connecting to ropsten infura node
const WS_PROVIDER = "wss://ropsten.infura.io/ws";
const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_PROVIDER));

//Base URL for API queries
//Refer to API/ABI >> RESTFul API Overview >> Network URL section
const NETWORK_URL = "https://ropsten-api.kyber.network";

//User Details
const PRIVATE_KEY = Buffer.from("ENTER_USER_PRIVATE_KEY", "hex"); // Remove the 0x prefix
const USER_ADDRESS = web3.eth.accounts.privateKeyToAccount("0x" + PRIVATE_KEY.toString('hex')).address;

// Wallet Address for Fee Sharing Program
const REF_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E";

//Token Addresses
const BAT_TOKEN_ADDRESS = "0xDb0040451F373949A4Be60dcd7b6B8D6E42658B6".toLowerCase(); //Ropsten BAT token address
const DAI_TOKEN_ADDRESS = "0xaD6D458402F60fD3Bd25163575031ACDce07538D".toLowerCase(); //Ropsten DAI token address

//Token Quantity
const BAT_QTY = 100; //100 BAT tokens to swap from

//Gas amount affecting speed of tx
const GAS_PRICE = "medium";

async function main() {
  //Step 1: If either token is not supported, quit
  if (! await isTokenSupported(BAT_TOKEN_ADDRESS) || ! await isTokenSupported(DAI_TOKEN_ADDRESS)) {
    // Quit the program
    process.exit(0);
  }

  //Step 2: Check if BAT token is enabled
  if(! await isTokenEnabledForUser(BAT_TOKEN_ADDRESS,USER_ADDRESS)) {
    //Step 3: Approve BAT token for trade
    await enableTokenTransfer(BAT_TOKEN_ADDRESS,USER_ADDRESS,GAS_PRICE);
  }

  //Step 4: Get expected ETH qty from selling 100 BAT tokens
  let sellQty = await getSellQty(BAT_TOKEN_ADDRESS,BAT_QTY);

  //Step 5: Get approximate DAI tokens receivable, set it to be minDstQty
  let buyQty = await getApproximateBuyQty(DAI_TOKEN_ADDRESS);
  let minDstQty = await getApproximateReceivableTokens(sellQty,buyQty,BAT_QTY);

  //Step 6: Perform the BAT -> DAI trade
  await executeTrade(USER_ADDRESS,BAT_TOKEN_ADDRESS,DAI_TOKEN_ADDRESS,BAT_QTY,minDstQty,GAS_PRICE,REF_ADDRESS);

  // Quit the program
  process.exit(0);
}

async function isTokenSupported(tokenAddress) {
  let tokensBasicInfoRequest = await fetch(NETWORK_URL + '/currencies');
  let tokensBasicInfo = await tokensBasicInfoRequest.json();
	let tokenSupported = tokensBasicInfo.data.some(token => {return tokenAddress == token.id});
	if (!tokenSupported) {
		console.log('Token is not supported');
	}
	return tokenSupported;
}

async function isTokenEnabledForUser(tokenAddress,walletAddress) {
  let enabledStatusesRequest = await fetch(NETWORK_URL + '/users/' + walletAddress + '/currencies');
  let enabledStatuses = await enabledStatusesRequest.json();
  for (var i=0; i < enabledStatuses.data.length; i++) {
    token = enabledStatuses.data[i];
    if (token.id == tokenAddress) {
      return token.enabled;
    }
  }
}

async function enableTokenTransfer(tokenAddress,walletAddress,gasPrice) {
  let enableTokenDetailsRequest = await fetch(NETWORK_URL + '/users/' + walletAddress + '/currencies/' + tokenAddress + '/enable_data?gas_price=' + gasPrice);
  let enableTokenDetails = await enableTokenDetailsRequest.json();
  let rawTx = enableTokenDetails.data;

  await broadcastTx(rawTx);
}

async function broadcastTx(rawTx) {
    // Extract raw tx details, create a new Tx
    let tx = new Tx(rawTx);
    // Sign the transaction
    tx.sign(PRIVATE_KEY);
    // Serialize the transaction (RLP Encoding)
    const serializedTx = tx.serialize();
    // Broadcast the tx
    txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).catch(error => console.log(error));
    // Log the tx receipt
    console.log(txReceipt);
}

async function getSellQty(tokenAddress, qty) {
  let sellQtyRequest = await fetch(NETWORK_URL + '/sell_rate?id=' + tokenAddress + '&qty=' + qty);
  let sellQty = await sellQtyRequest.json();
  sellQty = sellQty.data[0].dst_qty[0];
  return sellQty;
}

async function getApproximateBuyQty(tokenAddress) {
  const QTY = 1; //Quantity used for the approximation
  let approximateBuyRateRequest = await fetch(NETWORK_URL + '/buy_rate?id=' + tokenAddress + '&qty=' + QTY);
  let approximateBuyQty = await approximateBuyRateRequest.json();
  approximateBuyQty = approximateBuyQty.data[0].src_qty[0];
  return approximateBuyQty;
}

//sellQty = output from getSellQty function
//buyQty = output from getApproximateBuyQty function
//srcQty = token qty amount to swap from (100 BAT tokens in scenario)
async function getApproximateReceivableTokens(sellQty,buyQty,srcQty) {
  let expectedAmountWithoutSlippage = buyQty / sellQty * srcQty;
  let expectedAmountWithSlippage = 0.97 * expectedAmountWithoutSlippage;
  return expectedAmountWithSlippage;
}

async function executeTrade(walletAddress,srcToken,dstToken,srcQty,minDstQty,gasPrice,refAddress) {
  let tradeDetailsRequest = await fetch(NETWORK_URL + '/trade_data?user_address=' + walletAddress + '&src_id=' + srcToken + '&dst_id=' + dstToken + '&src_qty=' + srcQty + '&min_dst_qty=' + minDstQty + '&gas_price=' + gasPrice + '&wallet_id=' + refAddress);
  let tradeDetails = await tradeDetailsRequest.json();
  let rawTx = tradeDetails.data[0];

  await broadcastTx(rawTx);
}

main();
```

## Scenario 2: Obtaining Token and Market Info
### Basic Token Information
The `/currencies` endpoint returns basic information about all tokens supported on Kyber. Details about possible path parameters and output fields can be [found here](api_abi-restfulapi.md#currencies).

#### Code Example
```js
const fetch = require('node-fetch')

async function getSupportedTokens() {
  let tokensBasicInfoRequest = await fetch('https://api.kyber.network/currencies')
  let tokensBasicInfo = await tokensBasicInfoRequest.json()
  console.log(tokensBasicInfo)
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

#### Code Example
```js
const fetch = require('node-fetch')

async function getMarketInformation() {
  let marketInfoRequest = await fetch('https://api.kyber.network/market')
  let marketInfo = await marketInfoRequest.json()
  return marketInfo
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

#### Code Example
```js
const fetch = require('node-fetch')

async function getPast24HoursTokenInformation() {
  let past24HoursTokenInfoRequest = await fetch('https://api.kyber.network/change24h')
  let past24HoursTokenInfo = await past24HoursTokenInfoRequest.json()
  return past24HoursTokenInfo
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

## Inclusion of Permissionless Reserves
By default, the RESTful APIs only interact with reserves that were added in a **permissioned** manner. Most of these endpoints support a `only_official_reserve` parameter for the inclusion of permissionless reserves. You may find more information about the difference between permissioned and permissionless reserves [in this section](reserves-types.md#permissionless-vs-permissioned).

## Safeguarding Users From Slippage Rates
The token conversion rate varies with different source token quantities. It is important to highlight the slippage in rates to the user when dealing with large token amounts. We provide some methods how this can be done below.

### Method 1: Revert the transaction if the slippage rate exceeds a defined percentage
1. Call `/buy_rate` or `sell_rate` for 1 ETH equivalent worth of `srcToken`.
2. Call `/buy_rate` or `sell_rate` for actual `srcToken` amount.
3. If the obtained rates differ by a defined percentage (either in the smart contract, or as a user input), revert the transaction.

### Method 2: Display rate slippage in the user interface
![Showing Slippage Rate](/uploads/showing-slippage-rate.jpeg "Showing SlippageRate")
An example of how this could be done is shown above. How the rate slippage is calculated is as follows:
1. Call `/buy_rate` or `sell_rate` for 1 ETH equivalent worth of `srcToken`.
2. Call `/buy_rate` or `sell_rate` for actual `srcToken` amount.
3. Calculate the rate difference and display it **prominently** in the user interface.

### Method 3: Pulling rates from other exchanges
One could make use of feeds provided from other exchanges to see if the rate obtained from Kyber is within acceptable bounds.

## Fee Sharing Program
You have the opportunity to join our *Fee Sharing Program*, which allows fee sharing on each swap that originates from your platform. Learn more about the program [here](integrations-feesharing.md)!

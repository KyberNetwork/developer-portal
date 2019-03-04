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

## Scenario 1: Obtaining Token and Market Info
### Basic Token Information
Querying the [`/currencies`](references-restfulapi.md#currencies) endpoint returns basic token information supported by Kyber.

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
```js
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
Querying the [`/market`](references-restfulapi.md#market) endpoint returns price and volume information on token to ETH pairs.

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
```js
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
Querying the [`/change24h`](references-restfulapi.md#change24h) endpoint returns the current token to ETH and USD rates and price percentage changes against the previous day.

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
```js
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

## Scenario 2: Token to Token Swap


## Filtering Out Permissionless Reserves
By default, the RESTful APIs only interact with the official reserves. Most of these endpoints support a `only_official_reserve` parameter


reserves that were listed permissionlessly are also included when performing `getExpectedRate()` and `trade()`. Depending on the jurisdiction where your platform is operating in, you may be required to exclude these reserves. To filter them out, use the `tradeWithHint()` function. Refer to [this section](references-kybernetworkproxy.md#hint) for more information.

## Fee Sharing Program
Wallets have the opportunity to join our *Fee Sharing Program*, which allows fee sharing on each swap that originates from your wallet. Learn more about the program [here](guide-feesharing.md)!

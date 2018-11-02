---
id: TradingAPIGuide
title: Using the Trading API
---
## Overview
Our trading API allows you to programmatically interact with the Kyber Network contract without in depth understanding of smart contracts. **The API currently only supports trades between the ETH and ERC20 tokens.**
## Scenario 1: Alice wants to buy some KNC tokens with ETH. 
### Step 1a - Check to see if KNC token is supported by getting a list of tokens supported on Kyber Network
Querying ``https://api.kyber.network/trading/getList`` will return a JSON of tokens supported on Kyber Network.</br>

#### Response Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | name | Name of the asset in its native chain. |
| 2 | decimals | Decimals that will be used to round-off the srcQty or dstQty of the asset in other requests. |
| 3 | address | The address of the asset in its native chain. |
| 4 | symbol | The symbol of the asset in its native chain. |
| 5 | id | A unique ID used by Kyber Network to identify between different symbols. |

#### Code Example
```js
const fetch = require('node-fetch')

async function getSupportedTokens() {
	let request = await fetch('https://api.kyber.network/trading/getList')
	let tokensBasicInfo = await request.json()
	return tokensBasicInfo
}

await getSupportedTokens()
```

#### Output 
```json
{
  "error": false,
  "data": [
    {
      "name": "Ethereum",
      "decimals": 18,
      "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "symbol": "ETH",
      "id": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    },
    {
      "name": "Kyber Network",
      "decimals": 18,
      "address": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
      "symbol": "KNC",
      "id": "0xdd974d5c2e2928dea5f71b9825b8b646686bd200"
    },
	… (other tokens' information)
  ]
}
```
### Step 1b - Getting the latest buy conversion rates for KNC in ETH 
Querying ``https://api.kyber.network/trading/get_ethrate_buy?id=<id>&qty=<qty>`` will return a JSON of the latest buy rate (in ETH) for the specified token.</br>

#### Argument Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | id | The `id` of the asset you want to buy using ETH. |
| 2 | qty | A floating point number which will be rounded off to the decimals of the asset specified. The quantity is the amount of units of the asset you want to buy. |

#### Response Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | src_id | The `id` of the source asset. It should be ETH for this endpoint. |
| 2 | dst_id | The `id` of the destination asset of the pair you want to get rates for. `id` should match one of the request input parameters specified in `id`. |
| 3 | src_qty | Array of floating point numbers which will be rounded off to the decimals of the `id` of ETH. |
| 4 | dst_qty | Array of floating point numbers which will be rounded off to the decimals of the `id` of the destination asset. They should match the request input parameter specified in `qty`. |

#### Code Example
```js
const fetch = require('node-fetch')

async function getBuyRates(id, qty) {
	let request = await fetch('https://api.kyber.network/trading/get_ethrate_buy?id=' + id + '&qty=' + qty)
	let buyRates = await request.json()
	return buyRates
}

await getBuyRates('0xdd974D5C2e2928deA5F71b9825b8b646686BD200', '300')
```

#### Output
```json
{
  "error": false,
  "data": [
    {
      "src_id": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "dst_id": "0xdd974D5C2e2928deA5F71b9825b8b646686BD200",
      "src_qty": [
        0.5671077504725898
      ],
      "dst_qty": [
        300
      ]
    }
  ]
}
```

### Step 1c - Making the conversion between the supported ERC20 token and ETH 
Querying ``https://api.kyber.network/trading/trade?user_address=<user_address>&src_id=<src_id>&dst_id=<dst_id>&src_qty=<src_qty>&min_dst_qty=<min_dst_qty>&gas_price=<gas_price>`` will return a JSON of the transaction details needed for a user to create and sign a new transaction to make the conversion between the specified pair.</br>

#### Argument Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | user_address | The ETH address that will be executing the swap. |
| 2 | src_id | The `id` of the source asset of the pair you want to trade. |
| 3 | dst_id | The `id` of the destination asset of the pair you want to trade. |
| 4 | src_qty | A floating point number representing the source amount in the conversion which will be rounded off to the decimals of the `id` of the source asset. |
| 5 | min_dst_qty | A floating point number representing the source amount in the conversion which will be rounded off to the decimals of the `id` of the destination asset. It is the minimum destination asset amount that is acceptable to the user. A guideline would be to set it at 3% less the destination quantity in `getPair`, which indicates a 3% slippage. |
| 6 | gas_price | One of the following 3: `low`, `medium`, `high`. Priority will be set according to the level defined. |

#### Response Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | from | The ETH address that executed the swap. Must match the `user_address` request input parameter. |
| 2 | to | The contract address of the KyberNetwork smart contract. Verify that it should always be the address resolved from `kybernetwork.eth` ENS. |
| 3 | data | Transaction data. This data needs to be signed and broadcasted to the blockchain. After the transaction has been mined, you can check the status with `/info/getAccount`. |
| 4 | value | This will be equal to 0 in hex (0x0) if users trade from token to token or token to ETH (when `src_id` is the source asset of the token, not ETH). This will not be equal to 0 in hex (0x0) if users trade from ETH to token (when `src_id` is the source asset of ETH, not a token) |
| 5 | gasPrice | Calculated ETHGasStation price according to the user's request. If you need to specify a price value, change this wei hex value. |
| 6 | nonce | The nonce of the account. If multiple conversions are requested at the same time, each request will have the same nonce as the API will return the nonce of the account's last mined transaction. |
| 7 | gasLimit | The gas limit required for the transaction. This value should not be altered unless for specific reasons. |

#### Code Example
```js
const fetch = require('node-fetch')

async function getTradeDetails(user_address, src_id, dst_id, src_qty, min_dst_qty, gas_price) {
	let request = await fetch('https://api.kyber.network/trading/trade?user_address=' + user_address + '&src_id=' + src_id + '&dst_id=' + dst_id + '&src_qty=' + src_qty + '&min_dst_qty=' + min_dst_qty + '&gas_price=' + gas_price)
	let tradeDetails = await request.json()
	return tradeDetails
}

await getTradeDetails('0x8fa07f46353a2b17e92645592a94a0fc1ceb783f', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', '0xdd974D5C2e2928deA5F71b9825b8b646686BD200', '300', '0.6', 'medium')
```

#### Output
```json
{
  "from": "0x8fa07f46353a2b17e92645592a94a0fc1ceb783f",
  "to": "0x818e6fecd516ecc3849daf6845e3ec868087b755",
  "data": "0xcb3c28c7000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000000000000000000000000000000044364c5bb0000000000000000000000000000dd974d5c2e2928dea5f71b9825b8b646686bd2000000000000000000000000008fa07f46353a2b17e92645592a94a0fc1ceb783f800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b1ae4d6e2ef5000000000000000000000000000000000000000000000000000000000000000000000",
  "value": "0x44364c5bb0000",
  "gasPrice": "0x39eda2b80",
  "nonce": "0x3f1",
  "gasLimit": "0x43d81"
}
```

## Scenario 2: Bob wants to sell some DAI tokens for ETH.
### Step 2a - Checking to see if DAI token is supported by getting a list of tokens supported on Kyber Network
Same as [step 1a](#step-1a-check-to-see-if-knc-token-is-supported-by-getting-a-list-of-tokens-supported-on-kyber-network). 

### Step 2b - Getting enabled status information of ERC20 tokens in bob's Ethereum wallet.
Querying ``https://api.kyber.network/trading/getInfo?user_address=<user_address>`` will return a JSON of enabled statuses of ERC20 tokens in the given address.</br>

#### Argument Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | user_address | The ETH address to get information from. |

#### Response Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | id | A unique ID used by Kyber Network to identify between different symbols |
| 2 | enabled | Whether the user address has approved Kyber Network to spend the asset on their behalf. Applicable only to ERC20 tokens. See ‘allowance’ on the ERC20 standard. |
| 3 | txs_required | Number of transactions required until the ID is `enabled` for trading. When enabled is True, `txs_required` is 0. When `enabled` is False, majority of the time `tx_required` is 1 |

#### Code Example
```js
const fetch = require('node-fetch')

async function getEnabledStatuses(user_address) {
	let request = await fetch('https://api.kyber.network/trading/getInfo?user_address=' + user_address)
	let enabledStatuses = await request.json()
	return enabledStatuses
}

await getEnabledStatuses('0x8fA07F46353A2B17E92645592a94a0Fc1CEb783F')
```

#### Output
```json
{
  "error":false,
  "data":[
    {
      "id":"0xbf2179859fc6d5bee9bf9158632dc51678a4100e",
      "enabled":true,
      "txs_required":0
    },
    {  
      "id":"0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
      "enabled":false,
      "txs_required":1
    },
	… (other tokens' information)
  ]
}
```

### Step 2c - Enable a token to be transferred by the KyberNetwork contract 
Querying ``https://api.kyber.network/trading/enableCurrency?user_address=<user_address>&id=<id>&gas_price=<gas_price>`` will return a JSON of transaction details needed for a user to create and sign a new transaction to approve the KyberNetwork contract to spend tokens on the user's behalf.</br>

#### Argument Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | user_address | The ETH address to get information from. |
| 2 | id | The unique ID of the destination asset. |
| 3 | gas_price | One of the following 3: `low`, `medium`, `high`. Priority will be set according to the level defined. |

#### Response Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | from | The ETH address of the user. Must match the `user_address` request parameter. |
| 2 | to | The contract address of the token you want to enable trading in Kyber Network. Always verify this for security reasons. |
| 3 | data | Transaction data. This data needs to be signed and broadcasted to the blockchain. After the transaction has been mined, you can check the status with `/info/getAccount`. |
| 4 | value | Should always be equal to 0 for this operation. Always verify that the value is 0 for security reasons. |
| 5 | gasPrice | Calculated ETHGasStation price according to the user's request. If you need to specify a price value, change this wei hex value. |
| 6 | nonce | The nonce of the account. If multiple conversions are requested at the same time, each request will have the same nonce as the API will return the nonce of the account's last mined transaction. |
| 7 | gasLimit | The gas limit required for the transaction. This value should not be altered unless for specific reasons. |

#### Code Example
```js
const fetch = require('node-fetch')

async function getEnableTokenDetails(user_address, id, gas_price) {
	let request = await fetch('https://api.kyber.network/trading/enableCurrency?user_address=' + user_address + '&id=' + id + '&gas_price' + gas_price)
	let enableTokenDetails = await request.json()
	return enabletokenDetails
}

await getEnableTokenDetails('0x8fA07F46353A2B17E92645592a94a0Fc1CEb783F', '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359', 'medium')
```

#### Output
```json
{
  "from": "0x8fA07F46353A2B17E92645592a94a0Fc1CEb783F",
  "to": "0xdd974D5C2e2928deA5F71b9825b8b646686BD200",
  "data": "0x095ea7b3000000000000000000000000818e6fecd516ecc3849daf6845e3ec868087b7558000000000000000000000000000000000000000000000000000000000000000",
  "value": "0x0",
  "gasPrice": "0x6",
  "nonce": "0x3de",
  "gasLimit": "0x186a0"
}
```

### Step 2d - Getting the latest sell rates for a supported token in ETH 
Querying ``https://api.kyber.network/trading/get_ethrate_sell?id=<id>&qty=<qty>`` will return a JSON of the latest sell rate for the specified token.</br>

#### Argument Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | id | The `id` of the assets you want to sell using ETH. |
| 2 | qty | A floating point number which will be rounded off to the decimals of the asset specified. The quantity is the amount of units of the asset you want to sell. |

#### Response Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | src_id | The `id` of the source asset of the pair you want to get rates for. `id` should match the request input parameters specified in `id`. |
| 2 | dst_id | The `id` of the destination asset. It should be ETH for this endpoint. |
| 3 | src_qty | Array of floating point numbers which will be rounded off to the decimals of the `id` of the source asset. They should match the request input parameter specified in `qty`. |
| 4 | dst_qty | Array of floating point numbers which will be rounded off to the decimals of the `id` of ETH. |

#### Code Example
```js
const fetch = require('node-fetch')

async function getSellRates(id, qty) {
	let request = await fetch('https://api.kyber.network/trading/get_ethrate_sell?id=' + id + '&qty=' + qty)
	let sellRates = await request.json()
	return sellRates
}

await getSellRates('0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359', '100')
```

#### Output
```json
{
  "error": false,
  "data": [
    {
      "src_id": "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
      "dst_id": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "src_qty": [
        100
      ],
      "dst_qty": [
        0.5070763172999999
      ]
    }
  ]
}
```

### Step 2e - Making the conversion between the supported ERC20 token and ETH
Similar to [step 1c](#step-1c-making-the-conversion-between-the-supported-erc20-token-and-eth).

#### Code Example
```js
const fetch = require('node-fetch')

async function getTradeDetails(user_address, src_id, dst_id, src_qty, min_dst_qty, gas_price) {
	let request = await fetch('https://api.kyber.network/trading/trade?user_address=' + user_address + '&src_id=' + src_id + '&dst_id=' + dst_id + '&src_qty=' + src_qty + '&min_dst_qty=' + min_dst_qty + '&gas_price=' + gas_price)
	let tradeDetails = await request.json()
	return tradeDetails
}

await getTradeDetails('0x8fa07f46353a2b17e92645592a94a0fc1ceb783f', '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', '100', '0.52', 'medium')
```

## Scenario 3: Charlie wants to get more info about ZIL/ETH trading pair on Kyber Network.
### Step 3a - Check to see if ZIL token is supported by getting a list of tokens supported on Kyber Network
Same as [step 1a](#step-1a-check-to-see-if-knc-token-is-supported-by-getting-a-list-of-tokens-supported-on-kyber-network).

### Step 3b - Retrieving in depth information about ZIL/ETH trading pair.
Querying https://api.kyber.network/trading/prices will return a JSON of in depth information of all tokens supported on Kyber Network.</br>

#### Response Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | timestamp | Server timestamp in UTC. |
| 2 | quote_symbol | Symbol of the quote asset of the pair. |
| 3 | base_symbol | Symbol of the base asset of the pair. |
| 4 | past_24h_high | Highest ASK price for the last 24 hours of the pair. |
| 5 | past_24h_low | Highest BID price for the last 24 hours of the pair. |
| 6 | usd_24h_volume | Volume for the last 24 hours in USD. |
| 7 | eth_24h_volume | Volume for the last 24 hours in ETH. |
| 8 | token_24h_volume | Volume for the last 24 hours in tokens. |
| 9 | current_bid | Current (considering some X minute delay) BID price. |
| 10 | current_ask | Current (considering some X minute delay) ASK price. |
| 11 | last_traded | Pair name consisting of the quote and base asset symbols. |
| 12 | pair | Pair name consisting of the quote and base asset symbols. |

#### Code Example
```js
const fetch = require('node-fetch')

async function getAllPrices() {
	let request = await fetch('https://api.kyber.network/trading/prices')
	let tokensDetailedInfo = await request.json()
	return tokensDetailedInfo
}

await getAllPrices()
```

#### Output
```json
{
  "error": false,
  "data": [
    {
      "timestamp": 1536806619250,
      "quote_symbol": "KNC",
      "base_symbol": "ETH",
      "past_24h_high": 0.001937984496124031,
      "past_24h_low": 0.001857617770187944,
      "usd_24h_volume": 5566.2079180166,
      "eth_24h_volume": 31.8094685833,
      "token_24h_volume": 16865.433010686364,
      "current_bid": 0.001867351485999998,
      "current_ask": 0.0018868074209224932,
      "last_traded": 0.0018868074209224932,4h
      "pair": "KNC_ETH"
    },
    {
      "timestamp": 1536806619251,
      "quote_symbol": "OMG",
      "base_symbol": "ETH",
      "past_24h_high": 0.018518518518518517,
      "past_24h_low": 0.017266283397471997,
      "usd_24h_volume": 13871.8906588085,
      "eth_24h_volume": 78.4248866967,
      "token_24h_volume": 4381.367829085394,
      "current_bid": 0.017379117142599983,
      "current_ask": 0.0175141743763495,
      "last_traded": 0.01777996566748282,
      "pair": "OMG_ETH"
    },
	… (other tokens' information)
  ]
}
```

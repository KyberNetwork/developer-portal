---
id: TradingAPIGuide
title: Using the Trading API
---
## Overview
Our trading API allows you to programmatically interact with the Kyber Network contract without in depth understanding of smart contracts. **The API currently only supports ETH <-> ERC20 token trades.**
## Scenario 1: Perform ETH -> KNC (ERC20 token) conversion
### Step 1a - Check if KNC token is supported
Querying ``https://api.kyber.network/currencies`` will return a JSON of tokens supported on Kyber Network. Details about the `currencies` endpoint can be found in the `Trading` section of [reference](api-trading.md#currencies). </br>

<!---Response Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | name | Name of the asset in its native chain. |
| 2 | decimals | Decimals that will be used to round-off the srcQty or dstQty of the asset in other requests. |
| 3 | address | The address of the asset in its native chain. |
| 4 | symbol | The symbol of the asset in its native chain. |
| 5 | id | A unique ID used by Kyber Network to identify between different symbols. |-->

#### Code Example
```js
const fetch = require('node-fetch')

async function getSupportedTokens() {
	let tokensBasicInfoRequest = await fetch('https://api.kyber.network/currencies')
	let tokensBasicInfo = await tokensBasicInfoRequest.json()
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
### Step 1b - Get KNC/ETH buy rates
Querying ``https://api.kyber.network/buy_rate?id=<id>&qty=<qty>`` will return a JSON of the latest buy rate (in ETH) for the specified token. Details about the `buy_rate` endpoint can be found in the `Trading` section of [reference](api-trading.md#buy-rate).</br>

<!--#### Argument Description
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
| 4 | dst_qty | Array of floating point numbers which will be rounded off to the decimals of the `id` of the destination asset. They should match the request input parameter specified in `qty`. |-->

#### Code Example
```js
const fetch = require('node-fetch')

async function getBuyRates(id, qty) {
	let ratesRequest = await fetch('https://api.kyber.network/buy_rate?id=' + id + '&qty=' + qty)
	let rates = await ratesRequest.json()
	return rates
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
      ]ETH -> KNC (ERC20 token)
    }
  ]
}
```

### Step 1c - Convert ETH to KNC
Querying ``https://api.kyber.network/trade_data?user_address=<user_address>&src_id=<src_id>&dst_id=<dst_id>&src_qty=<src_qty>&min_dst_qty=<min_dst_qty>&gas_price=<gas_price>&wallet_id=<wallet_id>`` will return a JSON of the transaction details needed for a user to create and sign a new transaction to make the conversion between the specified pair. Details about the `trade_data` endpoint can be found in the `Trading` section of [reference](api-trading.md#trade-data). </br>

<!--#### Argument Description
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
| 7 | gasLimit | The gas limit required for the transaction. This value should not be altered unless for specific reasons. |-->

#### Code Example
```js
const fetch = require('node-fetch')

async function getTradeDetails(user_address, src_id, dst_id, src_qty, min_dst_qty, gas_price, wallet_id) {
	let tradeDetailsRequest = await fetch('https://api.kyber.network/trade_data?user_address=' + user_address + '&src_id=' + src_id + '&dst_id=' + dst_id + '&src_qty=' + src_qty + '&min_dst_qty=' + min_dst_qty + '&gas_price=' + gas_price + '&wallet_id=' + wallet_id)
	let tradeDetails = await tradeDetailsRequest.json()
	return tradeDetails
}

await getTradeDetails('0x8fa07f46353a2b17e92645592a94a0fc1ceb783f', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', '0xdd974D5C2e2928deA5F71b9825b8b646686BD200', '0.6', '300', 'medium', '0x0859A7958E254234FdC1d200b941fFdfCAb02fC1')
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

### Full Code Example
```js
// Import web3 for broadcasting transactions
var Web3 = require('web3');
// Import node-fetch to query the trading API
var fetch = require('node-fetch');
// import ethereumjs-tx to sign and serialise transactions
var Tx = require('ethereumjs-tx');

// Connect to Infura's ropsten node
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"));

// Representation of ETH as an address on Ropsten
const ETH_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
// KNC contract address on Ropsten
const KNC_TOKEN_ADDRESS = '0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6';
const ETH_DECIMALS = 18;
const KNC_DECIMALS = 18;
// How many KNC you want to buy
const QTY = 300;
// Gas price of the transaction
const GAS_PRICE = 'medium';
// Your Ethereum wallet address
const USER_ACCOUNT = 'ENTER_USER_ADDRESS_HERE';
// Your private key
const PRIVATE_KEY = Buffer.from('ENTER_PRIVATE_KEY_HERE', 'hex');
// Commission Address
const WALLET_ID = 'ENTER_COMMISSION_ADDRESS_HERE';

async function main() {

	/*
	#################################
	### CHECK IF KNC IS SUPPORTED ###
	#################################
	*/

	// Querying the API /currencies endpoint
	let tokenInfoRequest = await fetch('https://ropsten-api.kyber.network/currencies');
	// Parsing the output
	let tokens = await tokenInfoRequest.json();
	// Checking to see if KNC is supported
	let supported = tokens.data.some(token => {return 'KNC' == token.symbol});
	// If not supported, return.
	if(!supported) {
		console.log('Token is not supported');
		return
	}

	/*
	####################################
	### GET ETH/KNC CONVERSION RATES ###
	####################################
	*/

	// Querying the API /buy_rate endpoint
	let ratesRequest = await fetch('https://ropsten-api.kyber.network/buy_rate?id=' + KNC_TOKEN_ADDRESS + '&qty=' + QTY);
	// Parsing the output
	let rates = await ratesRequest.json();
	// Getting the source quantity
	let srcQty = rates.data[0].src_qty;

	/*
	#######################
	### TRADE EXECUTION ###
	#######################
	*/

	// Querying the API /trade_data endpoint
	let tradeDetailsRequest = await fetch('https://ropsten-api.kyber.network/trade_data?user_address=' + USER_ACCOUNT + '&src_id=' + ETH_TOKEN_ADDRESS + '&dst_id=' + KNC_TOKEN_ADDRESS + '&src_qty=' + srcQty + '&min_dst_qty=' + QTY*0.97 + '&gas_price=' + GAS_PRICE + '&wallet_id=' + WALLET_ID);
	// Parsing the output
	let tradeDetails = await tradeDetailsRequest.json();
	// Extract the raw transaction details
	let rawTx = tradeDetails.data[0];
	// Create a new transaction
	let tx = new Tx(rawTx);
	// Signing the transaction
	tx.sign(PRIVATE_KEY);
	// Serialise the transaction (RLP encoding)
	let serializedTx = tx.serialize();
	// Broadcasting the transaction
	txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).catch(error => console.log(error));
	// Log the transaction receipt
	console.log(txReceipt);
}

main()
```

## Scenario 2: Perform DAI (ERC20 token) -> ETH conversion
### Step 2a - Check if DAI token is supported
Same as [step 1a](#step-1a-check-if-knc-token-is-supported).

### Step 2b - Get token enabled status of wallet.
Querying ``https://api.kyber.network/users/<user_address>/currencies`` will return a JSON of enabled statuses of ERC20 tokens in the given address. Details about the `users/<user_address>/currencies` endpoint can be found in the `Trading` section of [reference](api-trading.md#users-user-address-currencies).</br>

<!--#### Argument Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | user_address | The ETH address to get information from. |
#### Response Description
| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | id | A unique ID used by Kyber Network to identify between different symbols |
| 2 | enabled | Whether the user address has approved Kyber Network to spend the asset on their behalf. Applicable only to ERC20 tokens. See ‘allowance’ on the ERC20 standard. |
| 3 | txs_required | Number of transactions required until the ID is `enabled` for trading. When enabled is True, `txs_required` is 0. When `enabled` is False, majority of the time `tx_required` is 1 |-->

#### Code Example
```js
const fetch = require('node-fetch')

async function getEnabledStatuses(user_address) {
	let enabledStatusesRequest = await fetch('https://api.kyber.network/users/' + user_address + '/currencies')
	let enabledStatuses = await enabledStatusesRequest.json()
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

### Step 2c - Enable DAI for transfer
Querying ``https://api.kyber.network/users/<user_address>/currencies/<currency_id>/enable_data?gas_price=<gas_price>`` will return a JSON of transaction details needed for a user to create and sign a new transaction to approve the KyberNetwork contract to spend tokens on the user's behalf. Details about the `users/<user_address>/currencies/<currency_id>/enable_data?gas_price=<gas_price>` endpoint can be found in the `Trading` section of [reference](api-trading.md#users-user-address-currencies-currency-id-enable-data).</br>

<!--#### Argument Description
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
| 7 | gasLimit | The gas limit required for the transaction. This value should not be altered unless for specific reasons. |-->

#### Code Example
```js
const fetch = require('node-fetch')

async function getEnableTokenDetails(user_address, id, gas_price) {
	let enableTokenDetailsRequest = await fetch('https://api.kyber.network/users/' + user_address + '/currencies/' + id + '/enable_data?gas_price=' + gas_price)
	let enableTokenDetails = await enableTokenDetailsRequest.json()
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

### Step 2d - Get DAI/ETH sell rates
Querying ``https://api.kyber.network/sell_rate?id=<id>&qty=<qty>`` will return a JSON of the latest sell rate for the specified token. Details about the `sell_rate` endpoint can be found in the `Trading` section of [reference](api-trading.md#sell-rate).</br>

<!--#### Argument Description
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
| 4 | dst_qty | Array of floating point numbers which will be rounded off to the decimals of the `id` of ETH. |-->

#### Code Example
```js
const fetch = require('node-fetch')

async function getSellRates(id, qty) {
	let ratesRequest = await fetch('https://api.kyber.network/sell_rate?id=' + id + '&qty=' + qty)
	let rates = await ratesRequest.json()
	return rates
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

### Step 2e - Convert DAI to ETH
Similar to [step 1c](#step-1c-convert-eth-to-knc).

#### Code Example
```js
const fetch = require('node-fetch')

async function getTradeDetails(user_address, src_id, dst_id, src_qty, min_dst_qty, gas_price, wallet_id) {
	let tradeDetailsRequest = await fetch('https://api.kyber.network/trade_data?user_address=' + user_address + '&src_id=' + src_id + '&dst_id=' + dst_id + '&src_qty=' + src_qty + '&min_dst_qty=' + min_dst_qty + '&gas_price=' + gas_price + '&wallet_id=' + wallet_id)
	let tradeDetails = await tradeDetailsRequest.json()
	return tradeDetails
}

await getTradeDetails('0x8fa07f46353a2b17e92645592a94a0fc1ceb783f', '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', '100', '0.52', 'medium', '0x0859A7958E254234FdC1d200b941fFdfCAb02fC1')
```

### Full Code Example
```js
// Import web3 for broadcasting transactions
var Web3 = require('web3');
// Import node-fetch to query the trading API
var fetch = require('node-fetch');
// import ethereumjs-tx to sign and serialise transactions
var Tx = require('ethereumjs-tx');

// Connect to Infura's ropsten node
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"));

// Representation of ETH as an address on Ropsten
const ETH_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
// DAI contract address on Ropsten
const DAI_TOKEN_ADDRESS = '0xaD6D458402F60fD3Bd25163575031ACDce07538D';
const ETH_DECIMALS = 18;
const DAI_DECIMALS = 18;
// How many DAI you want to sell
const QTY = 100;
// Gas price of the transaction
const GAS_PRICE = 'medium';
// Your Ethereum wallet address
const USER_ACCOUNT = 'ENTER_USER_ADDRESS_HERE';
// Your private key
const PRIVATE_KEY = Buffer.from('ENTER_PRIVATE_KEY_HERE', 'hex');
// Commission Address
const WALLET_ID = 'ENTER_COMMISSION_ADDRESS_HERE';

async function main() {

	/*
	#################################
	### CHECK IF DAI IS SUPPORTED ###
	#################################
	*/

	// Querying the API /currencies endpoint
	let tokenInfoRequest = await fetch('https://ropsten-api.kyber.network/currencies');
	// Parsing the output
	let tokens = await tokenInfoRequest.json();
	// Checking to see if DAI is supported
	let supported = tokens.data.some(token => {return 'DAI' == token.symbol});
	// If not supported, return.
	if(!supported) {
		console.log('Token is not supported');
		return
	}

	/*
	####################################
	### GET ENABLED STATUS OF WALLET ###
	####################################
	*/

	// Querying the API /users/<user_address>/currencies endpoint
	let enabledStatusesRequest = await fetch('https://ropsten-api.kyber.network/users/' + USER_ACCOUNT + '/currencies')
    // Parsing the output
    let enabledStatuses = await enabledStatusesRequest.json()
    // Checking to see if DAI is enabled
    let enabled = enabledStatuses.data.some(token => {if(token.id == 'DAI_TOKEN_ADDRESS') {return token.enabled}})

    /*
	####################################
	### ENABLE WALLET IF NOT ENABLED ###
	####################################
	*/

	if(!enabled) {
		// Querying the API /users/<user_address>/currencies/<currency_id>/enable_data?gas_price=<gas_price> endpoint
		let enableTokenDetailsRequest = await fetch('https://ropsten-api.kyber.network/users/' + USER_ACCOUNT + '/currencies/' + DAI_TOKEN_ADDRESS + '/enable_data?gas_price=' + GAS_PRICE)
    	// Parsing the output
    	let enableTokenDetails = await enableTokenDetailsRequest.json()
    	// Extract the raw transaction details
    	let rawTx = enableTokenDetails.data
    	// Create a new transaction
	    let tx = new Tx(rawTx)
	    // Signing the transaction
	    tx.sign(PRIVATE_KEY)
	    // Serialise the transaction (RLP encoding)
	    let serializedTx = tx.serialize()
	    // Broadcasting the transaction
	    txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).catch(error => console.log(error))
	    // Log the transaction receipt
	    console.log(txReceipt)
	}
	/*
	####################################
	### GET DAI/ETH CONVERSION RATES ###
	####################################
	*/

	// Querying the API /sell_rate endpoint
	let ratesRequest = await fetch('https://ropsten-api.kyber.network/sell_rate?id=' + DAI_TOKEN_ADDRESS + '&qty=' + QTY)
	// Parsing the output
	let rates = await ratesRequest.json()
	// Getting the source quantity
	let dstQty = rates.data[0].dst_qty

	/*
	#######################
	### TRADE EXECUTION ###
	#######################
	*/

	// Querying the API /trade_data endpoint
	tradeDetailsRequest = await fetch('https://ropsten-api.kyber.network/trade_data?user_address=' + USER_ACCOUNT + '&src_id=' + DAI_TOKEN_ADDRESS + '&dst_id=' + ETH_TOKEN_ADDRESS + '&src_qty=' + QTY + '&min_dst_qty=' + dstQty*0.97 + '&gas_price=' + GAS_PRICE + '&wallet_id=' + WALLET_ID)
    // Parsing the output
    let tradeDetails = await tradeDetailsRequest.json()
    // Extract the raw transaction details
    rawTx = tradeDetails.data[0]
    // Create a new transaction
    tx = new Tx(rawTx)
    // Signing the transaction
    tx.sign(PRIVATE_KEY)
    // Serialise the transaction (RLP encoding)
    serializedTx = tx.serialize()
    // Broadcasting the transaction
    txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).catch(error => console.log(error))
    // Log the transaction receipt
    console.log(txReceipt)
}

main()
```

## Scenario 3: Get ZIL/ETH trading pair info
### Step 3a - Check if ZIL token is supported
Same as [step 1a](#step-1a-check-if-knc-token-is-supported).

### Step 3b - Retrieve information about ZIL/ETH pair.
Querying ``https://api.kyber.network/market`` will return a JSON of in depth information of all tokens supported on Kyber Network.</br>

<!--#### Response Description
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
| 12 | pair | Pair name consisting of the quote and base asset symbols. |-->

#### Code Example
```js
const fetch = require('node-fetch')

async function getAllPrices() {
	let tokensDetailedInfoRequest = await fetch('https://api.kyber.network/market')
	let tokensDetailedInfo = await tokensDetailedInfoRequest.json()
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

### Full Code Example
```js
// Import node-fetch to query the trading API
var fetch = require('node-fetch')

async function main() {

	/*
	#################################
	### CHECK IF KNC IS SUPPORTED ###
	#################################
	*/

	// Querying the API /currencies endpoint
	let tokenInfoRequest = await fetch('https://ropsten-api.kyber.network/currencies');
	// Parsing the output
	let tokens = await tokenInfoRequest.json();
	// Checking to see if KNC is supported
	let supported = tokens.data.some(token => {return 'KNC' == token.symbol});
	// If not supported, return.
	if(!supported) {
		console.log('Token is not supported');
		return
	}

	/*
	#################################
	### GET ZIL/ETH DETAILED INFO ###
	#################################
	*/

	// Querying the API /market endpoint
	let tokensDetailedInfoRequest = await fetch('https://api.kyber.network/market')
	// Parsing the output
    let tokensDetailedInfo = await tokensDetailedInfoRequest.json()
    // Getting detailed info about the ZIL/ETH trading pair
    tokensDetailedInfo.data.some(token => {if(token.quote_symbol == "ZIL"){console.log(token)}})
}

main()
```
## Things to note
### Signing web3 transactions
This guide assumes that the user has basic understanding of Web3 and how to create and broadcast transactions. If you require more assistance on this, please visit the [Web3 documentation](https://web3js.readthedocs.io/en/1.0/getting-started.html).

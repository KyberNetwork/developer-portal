---
id: Integrations-TrackerAPIGuide
title: Tracker API
---

Our tracker allows you to track information from all trading pairs available on Kyber Network, such as the current conversion rate of a token.

## Obtaining all supported tokens
Mainnet: https://api.kyber.network/currencies<br>
Ropsten: https://ropsten-api.kyber.network/currencies<br>
Rinkeby: https://rinkeby-api.kyber.network/currencies

Visiting any of the links above will return a JSON of all tokens supported on Kyber Network as illustrated below.

```json
[
	{
		"symbol":"ZIL",
		"name":"Zilliqa",
		"address":"0x05f4a42e251f2d52b8ed15e9fedaacfcef1fad27",
		"decimals":12,
		"id": "0x05f4a42e251f2d52b8ed15e9fedaacfcef1fad27",
		"reserves_src": ["0x63825c174ab367968EC60f061753D3bbD36A0D8F"],
		"reserves_dest": ["0x63825c174ab367968EC60f061753D3bbD36A0D8F"]
	},
	… (other tokens' information)
]
```

### Field Description

| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | `symbol` | Symbol of the token |
| 2 | `name` | Name of the token |
| 3 | `address` | Token contract address |
| 4 | `decimals` | 	Number of decimals of the token |
| 5 | `id` | Typically the token contract address, to differentiate tokens with the same symbol |
| 6 | `reserves_src` | Reserve contract addresses supporting Token to Ether trades |
| 7 | `reserves_dest` | Reserve contract addresses supporting Ether to Token trades |

**Note:** Ether does not have the `reserves_src` and `reserves_dest` fields

### Code Example
```js
const fetch = require('node-fetch')

async function main() {
	let request = await fetch('https://tracker.kyber.network/api/tokens/supported')
	let tokensInformation = await request.json()
	console.log(tokensInformation[0])
}

main()
```
</br>

## Price and Volume Information

You can visit https://tracker.kyber.network/api/tokens/pairs, which will return a JSON of tokens' price and volume information on Kyber Network as illustrated below. Notice the list will contain only token to ETH pairs, but all token to token pairs are also supported.

```json
{
	"ETH_OMG":
		{
			"symbol": "OMG",
			"name": "OmiseGO",
			"contractAddress": "0xd26114cd6ee289accf82350c8d8487fedb8a0c07",
			"decimals": 18,
			"currentPrice": 0.0225310175897248,
			"lastPrice": 0.0221079406797047,
			"lastTimestamp": 1522654595,
			"baseVolume": 6.9014983,
			"quoteVolume": 319.9424158830901
		},
	… (other token pairs)
}
```

### Field Description

| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | Pair name (ETH_OMG) | Pair name. In the example above, ETH is called “base token” and OMG “quote token”. <br>
| 2 | symbol, name | Symbol and name of the quote token.  <br>
| 3 | contractAddress | Contract address of the quote token.  <br>
| 4 | decimals | 	Number of decimals of the quote token.  <br>
| 5 | currentPrice | Current conversion rate between the pair.  <br>
| 6 | lastPrice | Conversion rate of the last transaction between the pair.  <br>
| 7 | lastTimestamp | Timestamp of the last transaction between the pair (Unix timestamp format).  <br>
| 8 | baseVolume | 24h volume of trades between the pair, in base token (i.e. ETH).  <br>
| 9 | quoteVolume | 24h volume of trades between the pair, in quote token (i.e. OMG). <br>

### Code Example
```js
const fetch = require('node-fetch')

async function main() {
	let request = await fetch('https://tracker.kyber.network/api/tokens/pairs')
	let tokensInformation = await request.json()
	let ETH_KNC_INFO = tokensInformation['ETH_KNC']
	console.log(ETH_KNC_INFO)
}

main()
```
---
id: TrackerAPIGuide
title: Track Price and Volume
---

Our tracker allows you to track information from trading pairs available on Kyber Network, such as the current conversion rate of a token.

### Get a list of convertible pairs

To get a list of convertible paris, you can visit https://tracker.kyber.network/api/tokens/pairs, which will return a JSON document of all supported pairs on Kyber Network with details like below.

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

### Field description

| # | Field Name | Description |
| ---------- | ---------- | ---------- |
| 1 | Pair name (ETH_OMG) | Pair name. In the example above, ETH is called “base token” and OMG “quote token”. <br>
| 2 | symbol, name | Symbol and name of the quote token.  <br>
| 3 | contractAddress | Contract address of the quote token.  <br>
| 4 | decimals | 	Number of decimals of the quote token.  <br>
| 5 | currentPrice | Current conversion rate between the pair on Kyber Network, as displayed on https://kyber.network/.  <br>
| 6 | lastPrice | Conversion rate of the last transaction between the pair on Kyber Network.  <br>
| 7 | lastTimestamp | Timestamp of the last transaction between the pair on Kyber Network (Unix timestamp format).  <br>
| 8 | baseVolume | 24h volume of trades between the pair, in base token (i.e. ETH).  <br>
| 9 | quoteVolume | 24h volume of trades between the pair, in quote token (i.e. OMG). <br>

### Code example
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
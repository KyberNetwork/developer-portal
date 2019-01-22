---
id: Reserves-SanityRates
title: Sanity Rates
---
## Sanity Rates
![Sanityrates](/uploads/sanityrates.png "Sanityrates")

The sanity module protects reserves from (1) bugs in the conversion rate logic or from (2) hacks into the conversion rate system. If there are large inconsistencies between the sanity rates and the actual rates, then trades involving your reserve will be disabled. The functions below are from [`SanityRates.sol`](api-sanityrates.md).

* An admin sets `reasonableDiff` by calling `setReasonableDiff()`
* An operator sets the `sanityRate` of a token by calling `setSanityRates()`

To take the advantage of sanity rates, you will need to have a simple logic to decide on what rate is considered unreasonable at a given point of time. You should also run this logic on a server that is different from the one that sets your reserve's base conversion rate because you don't want them to get compromised at the same time if a hack happens.

### Case Study

Assume you have a reserve that supports ETH<>KNC conversion pair. Suppose the admin sets the reasonable difference to be 10%.
```js
let result = await sanityRatesContract.setReasonableDiff(
	["0xdd974D5C2e2928deA5F71b9825b8b646686BD200"], //ERC20[] srcs: [KNC token]
	[1000] //uint[] diff: 10% = 1000 bps
	).send(
		{
		from: adminAddress,
		},
		(err, res) => {
			console.log(`Err: ${err}`);
			console.log(`Res: ${res}`);
		}
	)
```

The operator sets the sanity rate to be 1 KNC = 0.01 ETH (or equivalently, 1 ETH = 100 KNC)
```js
let result = await sanityRatesContract.setSanityRates(
	["0xdd974D5C2e2928deA5F71b9825b8b646686BD200"], //ERC20[] srcs: [KNC token]
	[10000000000000000] //uint[] rates: 0.01 ETH = 10000000000000000 wei
	).send(
		{
		from: operatorAddress,
		},
		(err, res) => {
			console.log(`Err: ${err}`);
			console.log(`Res: ${res}`);
		}
	)
```

If the conversion rate of ETH to KNC queried from your reserve is above your assumed reasonable rate of 110 (`110 = 100 * (100%+10%)`), say 111, then your reserve will return a conversion rate of 0. As a result, either a different reserve will be used (assuming there exists other reserves who also supports that conversion pair), or the transaction will be reverted if you are the only reserve for this conversion pair.

Please note that given the same condition as above, if the conversion rate is below 90, for example, a rate of 80, your reserve will continue to process the conversion as the rate is favorable to your reserve. It is the user's responsibility to set their minimum acceptable rate.

The above explanation can be summarised in the figure below.

![Sanityratesexplanationlabels](/uploads/sanityratesexplanationlabels.jpg "Sanityratesexplanationlabels")

The numbers on the figure correspond to the examples below.

| Example No. | Sanity Rate | Reasonable Difference | Proposed Conversion Rate | Result |
| ---------- | ---------- | ---------- | ---------- | ---------- |
| 1          | 100 (1 ETH = 100 KNC) | 10% | 106 | Your reserve **will** process the conversion as `106 < 110`. <br>
| 2          | 100 (1 ETH = 100 KNC) | 10% | 115 | Your reserve **will not** process the conversion as `115 >= 110` <br>
| 3          | 100 (1 ETH = 100 KNC) | 10% | 95 | Your reserve **will** process the conversion as `95 < 110`. <br>
| 4          | 100 (1 ETH = 100 KNC) | 10% | 88 | Your reserve **will** process the conversion as `88 < 110`. <br>

## Whitelist Categories & Limits
| Category No. | Name | Trading Cap (SGD) |
| -------------- | ------- | -------------------- |
| - | Default | 5000 |
| 1 | Users | 5000 |
| 3 | Email | 5000 |
| 4 | KYC | 10,000 |
| 7 | Partner | 500,000 |
| 9 | Testers | 5000 |
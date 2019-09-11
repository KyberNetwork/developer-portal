---
id: Integrations-PriceFeedSecurity
title: Price Feed Security
---
[//]: # (tagline)
## Using Kyber as an on-chain price feed
While using Kyber as an on-chain feed for token prices is viable, note that it is susceptible to price manipulation by malicious parties.

Generally, any price feed should
- be averaged over time
- have checks to verify that the buy / sell spread is small, and that there is no arbitrage at the time of query

We recommend that adequate measures are in place to verify the rate obtained on Kyber. We outline some of these methods below.

### Check for arbitrage and the buy / sell spread
1. Query for both buy and sell rates.
2. Check that the spread between the buy / sell rate is within an acceptable range.
3. Should there be arbitrage, there is a small possibility that a party is manipulating the price feed. We recommend that the transaction be reverted in these cases.

#### Algorithm
Our suggested algorithm is as follows:
1. Get expected rate of 1 ETH equivalent worth of source tokens to the destination token
2. Use the expected rate of (1) to calculate the expected destinations token receivable
3. Get expected rate of the no. of destination tokens obtained in (2) to the source token
4. Use the expected rate of (3) to calculate the number of source tokens receivable
	- If the resulting source token amount is greater than the initial source amount, arbitrage opportunity exists.
	- Otherwise, the smaller the reuslting source token amount, the higher the spread.

```
// DISCLAIMER: The code snippet is just an example and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// querySrcAmount = 100 * 10 ** srcDecimals (Recommend to be 1 ETH worth of tokens, in its token decimals)
// reasonableBps = a reasonable spread amount in basis points (bps)
// returns true if spread is reasonable, false if arbitrage exists, or spread is too large
function checkArbitrageAndSpread(
	uint querySrcAmount,
	ERC20 srcToken,
	ERC20 destToken,
	uint reasonableBps
) returns (bool) {
	uint buyRate;
	uint sellRate;
	//Step 1: Get expected rate of 1 ETH equivalent worth of source tokens to the destination token
	(buyRate, ) = kyberProxy.getExpectedRate(srcToken, destToken, querySrcAmount);
	//Step 2: Use the expected rate to calculate the expected destinations token receivable
	uint queryDestAmount = calcDstQty(querySrcAmount, srcToken.decimals(), destToken.decimals(), buyRate);
	//Step 3: Get expected rate dest token to the source token
	(sellRate, ) = kyberProxy.getExpectedRate(destToken, srcToken, queryDestAmount);
	//Step 4: Use the expected rate to calculate the number of source tokens receivable
	uint resultingSrcAmount = calcDstQty(queryDestAmount, destToken.decimals(), srcToken.decimals(), sellRate);
	//Step 5: Check arbitrage and spread amounts
	if (resultingSrcAmount > querySrcAmount) {
		//arbitrage opportunity exists, handle by reverting tx or return a flag
		return false;
	} else {
		//1 bps = 0.1%
		uint spreadInBps = (querySrcAmount - resultingSrcAmount) * 10000 / querySrcAmount;
		return (spreadInBps < reasonableBps);
	}
}
```
Note: The `calcDstQty` function used below

##### Example
- `srcToken`: USDC (6 decimals)
- `destToken`: WBTC (8 decimals)
- `querySrcAmount` = `180 * 10 ** 6` (180 USDC in its token decimals)

1. A `buyRate` of `98426111111111` is obtained
2. Expected dest amount is `1771669`, or roughly `0.0177` WBTC tokens.
3. A `sellRate` of `10151860703099732512111` is obtained
4. Expected source amount is `179857368`, or roughly `179.86` USDC tokens.

This means that if we swap 180 USDC to WBTC and back, we will obtain roughly 179.86 USDC in return. The `resultingSrcAmount > querySrcAmount` condition thus checks for arbitrage.

5. We now check the spread between the buy and sell rate.
```
spreadInBps
	= (querySrcAmount - resultingSrcAmount) * 10000 / querySrcAmount
	~= 7
```
This means that there is a 0.07% spread. For token to token swaps, we expect spreads to be higher, as ETH is used as the quote currency.

### Use multiple price feeds
Consider using other price feeds in tandem with Kyber, if such on-chain sources are available. For example, use Maker's medianizer to obtain ETH/USD rates.

### Use actual source quantity
The token conversion rate returned by Kyber varies with different source token quantities. If applicable, use the actual source quantity when calling the `getExpectedRate` function.

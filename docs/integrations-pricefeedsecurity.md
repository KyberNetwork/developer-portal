---
id: Integrations-PriceFeedSecurity
title: Price Feed Security
---
[//]: # (tagline)
## Using Kyber as an on-chain price feed
While using Kyber as an on-chain feed for token prices is viable, note that it is susceptible to price manipulation by malicious parties.

Generally, any price feed can be considered to be secure if
- it is averaged over time
- checks are enforced to verify the buy / sell spread is small, and that there is no arbitrage at the time of query

We recommend that adequate measures are in place to verify the rate obtained on Kyber. We outline some of these methods below.

### Check for arbitrage and the buy / sell spread
1. Query for both buy and sell rates.
2. Check that the spread between the buy / sell rate is within an acceptable range.
3. Should there be arbitrage, there is a small possibility that a party is manipulating the price feed. We recommend that the transaction be reverted in these cases.

#### Algorithm
Our suggested algorithm is as follows:
1. Get expected rate of 1 source token to the destination token
2. Get expected rate of 1 destination token to the source token
3. Convert the 1 source token to destination, then back to source.
	- If resulting value exceeds 1, arbitrage opportunity exists.
	- Else, the smaller the value, the higher the spread.

```
// DISCLAIMER: The code snippet is just an example and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// querySrcAmount = 1 * 10 ** srcDecimals
// queryDestAmount = 1 * 10 ** destDecimals
// reasonableBps = a reasonable spread amount in basis points (bps)
// returns true if spread is reasonable, false if arbitrage exists, or spread is too large
function checkArbitrageAndSpread(
	uint querySrcAmount,
	uint queryDestAmount,
	ERC20 srcToken,
	ERC20 destToken,
	uint reasonableBps
) returns (bool) {
	uint buyRate;
	uint sellRate;
	(buyRate, ) = kyberProxy.getExpectedRate(srcToken, destToken, querySrcAmount);
	(sellRate, ) = kyberProxy.getExpectedRate(destToken, srcToken, queryDestAmount);
	uint resultingSrcAmount = (querySrcAmount * buyRate * sellRate) / 10 ** 36;
	if (int(resultingSrcAmount) - int(querySrcAmount) > 0) {
		//arbitrage opportunity exists, handle by reverting tx or return a flag
		return false;
	} else {
		//1 bps = 0.1%
		uint spreadInBps = (querySrcAmount - resultingSrcAmount) * 10000 / querySrcAmount;
		return (spreadInBps < reasonableBps);
	}
}
```

##### Example
- WBTC has 8 decimals
- USDC has 6 decimals
- `querySrcAmount` = `1 * 10 ** 8`
- `queryDestAmount` = `1 * 10 ** 6`

1. `buyRate = 10486869671000000000000` --> 1 WBTC ~= 10486 USDC
2. `sellRate = 93750000000000` --> 1 USDC ~= 0.00009375 WBTC
3. Over here, we're exchanging 1 WBTC -> X USDC -> Y WBTC, where `Y = resultingSrcAmount`.
```
resultingSrcAmount
	= (querySrcAmount * buyRate * sellRate) / 10 ** 36
	~= 98314403
```
This means that if we swap 1 WBTC to USDC and back, we will obtain roughly 0.98 WBTC in return. The line `(int(resultingSrcAmount) - int(querySrcAmount) > 0)` thus checks for arbitrage.
4. We now check the spread between the buy and sell rate.
```
spreadInBps
	= (querySrcAmount - resultingSrcAmount) * 10000 / querySrcAmount
	~= 168
```
This means that there is a 1.68% spread. For token to token swaps, we expect spreads to be higher, as ETH is used as the quote currency.

### Use multiple price feeds
Consider using other price feeds in tandem with Kyber, if such on-chain sources are available. For example, use Maker's medianizer to obtain ETH/USD rates.

### Use actual source quantity
The token conversion rate returned by Kyber varies with different source token quantities. If applicable, use the actual source quantity when calling the `getExpectedRate` function.

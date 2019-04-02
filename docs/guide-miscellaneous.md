---
id: MiscellaneousGuide
title: Miscellaneous
---
## Trading Strategy
A reserve manager will need to develop their own strategies to decide on token-to-token conversion rates and reserve size. This strategy could be executed by a person and/or a machine and could change over time.

In general, a reserve operator will have to constantly decide on these aspects:
* Target portfolio — how much tokens of each type to hold
* Re-balancing technique — how to strive to target portfolio structure after trades are executed.
* Pricing technique — how to estimate the true market price of pairs of tokens.

### Target Portfolio

The target portfolio is the distribution of the holdings of the exchange operator. For example, if an exchange only trades ETH, GNT, and DGD, a possible target portfolio is 70% ETH, 22% GNT and 8% DGD. Alternatively, the portfolio can be also be represented with numbers of tokens of each kind, for example: 10,000 ETH, 200,000 GNT, and 128,000 DGD.

Two main considerations should be taken into account when deciding on target portfolio:

* Subjective expectations on token value: if the operator predicts that current GNT token value is expected to rise (relatively to other tokens), then he should increase the relative weight of GNT in his target portfolio. A textbook strategy is to set target portfolio to the relative market cap of each of the tokens. I.e., if DGD market cap is 5% of the combined market cap of ETH, GNT, and DGD, then 5% of the target portfolio will be DGD.

* Expected trading volume: exchange should hold enough tokens to support daily trade volume for each token. A possible strategy is to hold only the minimal amount of tokens that are needed for daily trading, and hold the rest in Ether or other more stable currencies (crypto or fiat).

The target portfolio could change over time according to operator preferences and personal experience. On the other hand, the actual portfolio, namely, the actual holdings of the exchange, are constantly changing after every trade. The role of the re-balancing component, which we will come to in the following section, is to make the actual portfolio as close as possible to the target portfolio.

### Re-balancing

Once a target portfolio T is fixed, the re-balancing component role is to buy and sell tokens, from and to other brokerage-firms (e.g., exchanges like Poloniex or Kraken) until the actual holdings are close enough to T. Three classical re-balancing strategies are:

* Auto-instant: a re-balance is made after every buy/sell operation. For example, if a user bought 500 GNT tokens from the exchange at the price of 1 ETH, the exchange operator will immediately use the 1 ETH to buy 500 GNT from other exchanges. By doing so, the exposure of the operator to price fluctuations is minimized, and this method is suitable for operators that wish to base their earnings mostly on buy/sell spreads.

* Time-spacing: a target of H hours is set for full re-balance. Small partial re-balances are done at every M minutes. This technique exposes the operator to more risk, but on average allows the exchange operator to buy and sell tokens from the market at better rates.

* Price-spacing: the portfolio re-balancing is done only when operator witnesses significant moves in token prices. For example, a re-balance operation for GNT is done only if GNT price goes up (or down) by 5% in comparison to its price in the last re-balance operation. This strategy is good if a reserve operator wants to perform the re-balancing act only when the prices are more favorable to its holdings. However, the downside is that the reserve could be over depleted/inflated if the market does not move in the owner’s favor.

For all re-balancing strategies, the best-priced exchanges will be exhausted first, for all available liquidity, to ensure operator get the best price.

### Pricing

A reserve operator always aims to offer true market prices for buy and sell trades, up to some small spread in buy/sell rates. Indeed a lower rate would cause him loses in every trade, while a higher rate would make users to prefer other exchanges.

At Kyber Network we do not believe that market price can be determined by a fixed formula. Instead, a (human) operator should decide on an automated policy for determining prices and update his policy over time according to observed performances and behaviors of token pairs. Below we survey the two most basic techniques for determining market price:

* Quote-price: the operator scan all market prices offered by brokerage-firms and base its price as the average (or median) of all prices. A simple average (or median) is commonly used in FOREX by non-financial savvy operators. However, in the crypto world, where liquidity is much lower, an exchange that offers low liquidity could dramatically disrupt prices.

* Liquidity-weighted-quote-price: To overcome bias from low liquidity exchanges, one could use the more accurate method of liquidity-weighted-price. Here, a weighted average of the price is taken, where the weight of an exchange corresponds to its liquidity. For example, if in exchange A the ETH/GNT rate is 600 with 1000 tokens up for sale, and in exchange B the rate is 700 with 2000 tokens for sale, then the liquidity-weighted-price is 666.667.

When the market price has been decided, the operator determines the buy/sell spread. The spread is dynamic and could vary over time, and should take into account these considerations:

* Kyber Network maximal spread — To stay competitive, Kyber Network will dictate spread upper bounds for exchange operators.

* Liquidity of token — For competitiveness purposes, liquid tokens will have lower spread, while illiquid tokens will have a higher spread.

* Target portfolio — If the re-balancing algorithm aims to increase the holdings of the token, then a lower spread is set for sell orders. Conversely, if the quantity is to be reduced, then the lower spread is set for buy orders.

-----

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

## Verifying Reserve Fees
To verify the reserve fee percentage that will be charged for every trade, kindly perform the following steps:

### Step 1: Read the FeeBurner contract in Etherscan
Obtain the [FeeBurner contract address here](guide-mainnetenv.md#feeburner). You may then view this address in Etherscan.

### Step 2: Query the `reserveFeesInBps` variable
Key in your reserve's contract address in the input field for the `reserveFeesInBps` variable. The query should return the fees in basis points (bps). As an example, an output of `25` means that your reserve is charged 0.25% of the trade value (in KNC tokens) for every trade processed via your reserve.

## Whitelist Categories & Limits
| Category No. | Name | Trading Cap (SGD) |
| -------------- | ------- | -------------------- |
| - | Default | 5000 |
| 1 | Users | 5000 |
| 3 | Email | 5000 |
| 4 | KYC | 10,000 |
| 7 | Partner | 500,000 |
| 9 | Testers | 5000 |

## Web3 Injection
### Adding web3
You may add `web3` to your project using 1 of the following methods:
* npm: `npm install web3`
* bower: `bower install web3`
* meteor: `meteor add ethereum:web3`
* vanilla: link the `dist./web3.min.js`

### Requesting for web3 instance
Metamask and other dapp browsers will no longer automatically inject an Ethereum provider or a Web3 instance at a website's page load time.  As a result, one has to asynchronously request a provider. Find out more [in this article](https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8). The code below shows how you may go about doing so:
```
window.addEventListener('load', () => {
    // If web3 is not injected (modern browsers)...
    if (typeof web3 === 'undefined') {
        // Listen for provider injection
        window.addEventListener('message', ({ data }) => {
            if (data && data.type && data.type === 'ETHEREUM_PROVIDER_SUCCESS') {
                // Use injected provider, start dapp...
                web3 = new Web3(ethereum);
            }
        });
        // Request provider
        window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST' }, '*');
    }
    // If web3 is injected (legacy browsers)...
    else {
        // Use injected provider, start dapp
        web3 = new Web3(web3.currentProvider);
    }
});
```

For convenience, a Web3 instance *can* be injected by passing a web3 flag when requesting a provider:
```
//Request web3 provider
window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST', web3: true }, '*');
```
There is no guarantee about what version of web3 will be injected in response to this request, so it should only be used for convenience in development and debugging.

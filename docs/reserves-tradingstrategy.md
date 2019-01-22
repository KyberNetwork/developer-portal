---
id: Reserves-TradingStrategy
title: Trading Strategy
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
---
id: Integrations-SlippageRateProtection
title: Slippage Rates Protection
---
[//]: # (tagline)
## Safeguarding Users From Slippage Rates
The token conversion rate varies with different source token quantities. It is important to highlight the slippage in rates to the user when dealing with large token amounts. We list some methods on how this can be done below.

### Method 1: Reject the transaction if the slippage rate exceeds a defined percentage

1. Call `getExpectedRate` for 1 ETH equivalent worth of `srcToken`.
2. Call `getExpectedRate` for actual `srcToken` amount.
3. If the obtained rates differ by a defined percentage (either in the smart contract, or as a user input), reject the transaction.

### Method 2: Display rate slippage in the user interface

![Showing Slippage Rate](/uploads/showing-slippage-rate.jpeg "Showing SlippageRate")
An example of how this could be done is shown above. How the rate slippage is calculated is as follows:

1. Call `getExpectedRate` for 1 ETH equivalent worth of `srcToken`.
2. Call `getExpectedRate` for actual `srcToken` amount.
3. Calculate the rate difference and display it **prominently** in the user interface.

## Slippage rates when using `maxDestAmount`
In the case where `maxDestAmount` is being used, beware of slippage rates when `maxDestAmount` is significantly lower than `srcQty`.  We give an example below.

1. Users wants to swap for a `maxDestAmount` of 3000 DAI, but specifies a `srcQty` of 300 ETH.
2. Kyber will search the best rate for the `srcQty` of 200 ETH, but the rate might be significantly worse than rates for lower `srcQty`. For example, the user gets a rate of 1 ETH = 100 DAI, while he could have gotten a better rate of 1 ETH = 200 DAI if he specified a lower `srcQty`.
3. Kyber will use the rate to calculate the amount necessary for 2900 DAI, and refund the rest of the unused ETH back to the user. In the case mentioned above, 30 ETH will be used, and the remaining 270 ETH returned to him. He could have instead needed just half that amount (15 ETH) had he specified a lower `srcQty` instead.

In summary, if `srcQty` is significantly larger than `maxDestAmount`, the user could potentially be forced to trade with significantly worse rates.

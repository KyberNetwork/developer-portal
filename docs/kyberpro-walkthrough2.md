---
id: KyberPro-Walkthrough2
title: Walkthrough 2
---
[//]: # (tagline)

# Controlling Rates

In walkthrough 1, we have already deployed a reserve to testnet, added a token pair (KTT/ETH), set initial rates, and listed the token to Kyber Network. 

In addition to the initial rates, Kyber FPR provides powerful and efficient methods to market make onchain by having different pricing logics,safety measures like sanity rate check, step quantity and imbalance functions, and  gas efficient methods for controlling rates for multiple tokens in a single tx.

In this walkthrough, we will help you understand how to mirror the orderbook style of pricing using the FPR by using the QtyStepFunction. Also, we will assume that the initial base rate of the KTT token is equivalent to 0.0042ETH or 1 USD i.e., 1 ETH = 240KTT. 

### Before You Begin

1. Should have completed the [walkthrough 1](kyberpro-walkthrough1.md)
2. Listed the reserve to the Kyber network
3. Added the tokens as a trading pair on testnet

**If you have not completed the above, please do so and contact us in case of any questions.**

The source code for this walkthrough is at [link](https://github.com/KyberNetwork/kyber-pro/tree/master/tutorials/scripts).

## 1. Quantity Step Functions: Orderbook Simulation 

A user that buys/sells a big number of tokens will have a different impact on the portfolio compared to another user that buys/sells a small number of tokens. The purpose of steps, therefore, is to have the contract automatically alter the price depending on the buy/sell quantities(`QtyStepfunction`) of a user, similar to that of an orderbook.

`QtyStepFunction` basically allows you to set buy and sell rates for different quantities. Buy and sell steps are used to change ASK & BID prices respectively. In a traditional orderbook, prices get more expensive as you move up the orderbook, likewise for our reserves, we can make buying/selling large quantities of tokens expensive by BPS points.

For example, given the following configuration:
```js
//x - is the quantity of token in wei
// y - is the impact on conversion rate in basis points (bps)

steps = {
  "buy":[
      {"x": convertToTWei(100), "y": 0},
      {"x": convertToTWei(200), "y": -30}
  ],
  "sell":[
     {"x": convertToTWei(100), "y": 0},
     {"x": convertToTWei(200), "y": -30}
  ]
};
```
The conversion rate for each step value in ‘x’ will be worse by corresponding  ‘y’ value in the array. 


| Buy/Sell quantity | Actual conversion rate | Explanation                                                                                                                                                                         |
| ----------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Buy 10 KTT        | 240 `240*(1+0%)`       | 10 is in the range of 0 to 100, which is the **first** buy step in the `xBuy`, so the impact on the base rate is 0% according to the **first** number in the `yBuy`.            |
| Buy 110 KTT       | 239.28 `240*(1-0.3%)`    | 110 is in the range of 100 and above, which is the **second** buy step in the `xBuy`, so the impact on the base rate is -0.3% according to the **second** number in the `yBuy`.    |
| Sell 10 KTT       | 0.0042 `0.0042*(1+0%)`     | 10 is in the range of 0 to 100, which is the **first** sell step in the `xSell`, so the impact on the base rate is 0% according to the **first** number in the `ySell`.         |
| Sell 110 KTT      | 0.004187 `0.0042*(1-0.3%)` | 110 is in the range of 100 and above, which is the **second** sell step in the `xSell`, so the impact on the the base rate is -0.3% according to the **second** number in the `ySell`. |

```js
// full code in kyber-pro/scripts/6.setQtyStep.js
//stepFuncData, convertToTwei are functions in utils.js

var stepsData = stepFuncData(steps);
(async () => {
 
  //setQtyStepFunction is a only operator function
  console.log("setting quantity step func's");
  await reserveManager.setQtyStepFunction(operator.address, KTTokenAddress, stepData.buy, stepData.sell);
  console.log("done");
})();
```

## 2. Testing Your Rates

Once we set `QtyStepFunction`, when querying for rates via smart contracts or through Kyberswap ropsten, the rates for different buy/sell quantities will differ.

We encourage you to buy and sell in different quantities to understand the impact of trades on your inventory and conversion rates returned.

Sample snapshots of how rates vary with different buy/sell rates are illustrated here:
![Buy illustration](/uploads/buy.png "Buy")
![Sell Illustration](/uploads/sell.png "Sell" )

## 3. Changing the default token parameters 

In walkthrough 1, we set the params to a few default values when adding KTT token to the reserve. ideally, these are set while adding a token unless you want to change the amount of liquidity offered for a particular token.

 Now, let us understand and determine the parameters:
`minimalRecordResolution`: Per trade imbalance values are recorded and stored in the contract, parameter exists as a check to prevent overflow while squeezing data. Recommendation would be the token wei equivalent of 0.001 - 0.01ETH
`maxPerBlockImbalance`:  limit on amount of net absolute (+/-) change for a token in an ethereum block.
`maxTotalImbalance:` Maximum amount of net token change that happens between 2 price updates. Should be >=maxPerBlockImbalance

In this case, we will set the maximum change in the token inventory per block to be 250 KTT and the net(buy/sell) token change that can happen between consecutive price updates to be 550 KTT.  

```js
// full code in kyber-pro/scripts/7.updateTokenContolInfo.js

const tokenInfo = new FPR.TokenControlInfo(
                       convertToTwei(0.001),
                       convertToTwei(250),
                       convertToTwei(550));

(async () => {
console.log(‘Adding Token Details’);
await reserveManager.updateTokenControlInfo(account.address, tokenAddress, tokenInfo); })();
```
## Changing Valid Block Duration

* Since, all actions are on-chain, there is a check on the number of blocks these rates are valid. After the set number of blocks the price needs to be updated again else conversion rate returned from the reserve is zero, and trades will fail. This is a safety mechanism in order to prevent reserves from attacks. The default while deploying the reserve is around 10 blocks. This can be changed to any number you deem appropriate. You could interact directly with the conversionRatesContract to do so. Code snippet @scripts/setValidDuration.js

* One thing that needs to be paid attention to is the Block duration. If you have setBaseRate for the token in the walkthrough 1, we’d recommend you set baseRate again, for this example again as rates would have expired. Optimization of these operations will be covered in the coming walkthroughs .

## In The Next Walkthrough 
Walkthrough 3: Optimizing inventory, additional features to support more tokens, gas optimization and inventory management will be covered in the next walkthrough.

## Production:
We hope that the steps included in Walkthrough 1 and walkthrough 2 , made you feel confident enough to deploy contracts on production. These steps should suffice a production ready reserve.  

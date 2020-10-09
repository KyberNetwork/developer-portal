---
id: KyberPro-Walkthrough3
title: Walkthrough 3
---
[//]: # (tagline)

# Optimization

This walkthrough briefs the dynamic functionalities of the Kyber FPR such as compact data, imbalacestep functions and sanity rates. These are effective and efficient ways to have competitive pricing, optimize gas utilization and to safeguard reserves from attacks. 


Outlined here are details on how to add multiple tokens to the reserve, set imbalance step functions and details on sanity rates.

To proceed further on this doc, please make sure you have completed walkthrough 1 and 2 and most likely are on staging environment. Steps before getting started on this.


Complete basic testing on ropsten testnet. - covered in walkthrough [1](kyberpro-walkthrough1.md) and [2](kyberpro-walkthrough2.md)
On [staging](kyberpro-mainnetstaging.md) environment 
* Deploy contracts
* Set permission group
* Add token
* set base rate and qtyStepfunction
* Get the reserve listed



Until now we have added a single token pair(KTT/ETH) to the reserve, set rates, set quantity step functions and tested trades. Lets now leverage the advantage of FPRs being able to support a wide range of tokens profitable and feasible.

## 1. Add multiple tokens to the reserve.

As discussed in the previous docs, determine the token control parameters for each of the tokens you would like to market make and invoke addToken() function.

[source code](https://github.com/KyberNetwork/kyber-pro/tree/master/tutorials/scripts)
*Example:* let’s add DAI token to the reserve.
```js
const reserveManager = new FPR.Reserve(web3, addresses)
//ropsten network
const DAITokenAddress = "0xaD6D458402F60fD3Bd25163575031ACDce07538D"
const tokenInfo = new FPR.TokenControlInfo(
                       convertToTwei(0.001),
                       convertToTwei(250),
                       convertToTwei(550));

(async () => {
   console.log('Adding token')
 await manageReserve.addToken(account.address, DAITokenAddress, tokenInfo)
   })();
```
*NOTE:* `when you add a new token to the reserve you will have to let the kyber team know so that we list the token pair in the network as well.`


## 2. Set rates for multiple tokens.

FPR provides a mechanism that feeds the price for tokens in batches, allowing operators to update their price for all tokens with a single transaction. This quoting mechanism allows for price changes to be pushed frequently for a large number of tokens, enabling MMs to always maintain current prices on-chain.

On the contract level, to avoid frequent expensive updates of base rates, compact data enables modification to a group of tokens in one on chain storage operation. Each compact data array is squeezed into one bytes32 parameter and holds modifiers for buy / sell prices of 14 tokens. If your reserve supports more than 1-2 tokens,it is best to update token rates using the setCompactData function. However, while using the sdk setting rates for multiple tokens is much easier.
Suppose, we want to change rates for both the tokens KTT and DAI listed on the reserve now, pass in the new buy/sell rates to the setRate function, the SDK performs the tedious tasks of setting compact rate under the hood.

*Example:*
 ```js
const KTTrate =  new FPR.RateSetting (KTTokenAddress, convertToTWei(237), convertToTWei(0.0040));
const DAIrate =  new FPR.RateSetting (DAITokenAddress, convertToTWei(100), convertToTWei(0.0018));


(async () => {
  //rate updates apply from current block
  const blockNumber = await web3.eth.getBlockNumber();
  console.log("Setting base buy/sell rates");
  await reserveManager.setRate(operator.address, [KTTrate, DAIrate] , blockNumber);
})();
 ```

## 3. Imbalance Functions: 

Imbalance step function allows different conversion rates based on the net traded token amount between price update operations. The motivation for imbalance step functions is to prevent imbalances in your inventory, in between price updates.
Example:
If Alice buys 100 KTT, Bob 50 KTT, and Carol buys 10 KTT, then the net traded amount is -60 KTT. When the net traded amount reaches a certain level, the conversion rate returned will be lower by 0.3%. If the net traded amount is -100 KTT, then the conversion rate returned is 0.6%, and so on, depending on the levels defined.

In this case, selling KTT becomes cheaper and buying KTT becomes expensive by basis points.
```js
imbalance = {
  "buy":[
      {"x": convertToTWei(10), "y": 0}, // the price wouldn’t change for every +10 imbalance
      {"x": convertToTWei(50), "y": -30}// the price will lower by 0.3% for imbalance above 50 KTTtokens 
  ],
  "sell":[
     {"x": convertToTWei(0), "y": 0},
     {"x": convertToTWei(-10), "y": -30} // price will be lower by 0.3% for imbalances below 10KTTtokens
  ]
};
```
`Where:`
`X - is the net imbalanced token quantity in wei`
`Y - is the impact on conversion rate in basis points (bps)`

Similar to step functions, the rate will get worse due to the non-positive Y-value set in each step.
```js
// full code in fpr-sdk-reference/scipts/setImbalanceStep.js
var imbalanceData = stepFuncData(imbalance);
(async () => {
  //setImbalanceStepFunction is a only operator function
  console.log("setting imbalance step func's");
  await reserveManager.setImbalanceStepFunction(operator.address, KTTokenAddress, imbalanceData.buy, imbalanceData.sell);
  console.log("done");
})();
```

The step BPS values should always be non-positive (<=0) in this case, because the smart contract reduces the output amount by the Y-value set in each step.


## 4. Sanity rates contract


The sanity rate contract acts as a safeguard for reserves from bugs in the conversion rate logic or from any hacks into the conversion rate system. If there are large inconsistencies between the sanity rates and the actual rates, then trades involving the reserve will be disabled.

When we initially deployed the reserve and conversion rates smart contracts, sanity rates wasn't deployed, as this is an additional and optional feature to safeguard pricing.
Let’s first deploy a sanity rates contract and link that to the reserve smart contract.
```js
//snippet

(async ()=>{

   const res = await deployer.deploySanityRates(account.address);
   addresses.sanityRates = res;
   console.log(addresses);
   fs.writeFileSync("addresses.json", JSON.stringify(add));
   console.log('Linking Contracts');
   await reserveManager.setContracts(account.address, KNAddress, addresses.conversionRates,addresses.sanityRates);
   console.log("Done!");
})();
```
For sanity rates, you will need to have a simple logic to decide on what rate is considered unreasonable at a given point of time. 

*For example*, reserve supports ETH<>KTT conversion pair. Suppose the admin sets the reasonable difference to be `10% which will be 1000bps`, and the operator sets the sanity rate to be `1 KTT = 0.0042 ETH (or equivalently, 1 ETH = 240 KTT)`.
If the conversion rate of ETH to KTT queried from your reserve is above your assumed reasonable rate of `264 (264 = 240 * (100%+10%))`, say `265`, then your reserve will return a conversion rate of `0`. As a result, either a different reserve will be used (assuming there exists other reserves which support the pair), or the transaction will be reverted.
Likely, if the conversion rate is below `216`, for example, a rate of `210`, your reserve will continue to process the conversion as the rate is favorable to your reserve. It is the user's responsibility to set their minimum acceptable rate.

```js
//script to set reasonableDiff and sanityRate
(async () => {
//setSanityRates - admin func'
   console.log("Setting sanity rates");
   await reserveManager.setSanityRates(operator.address, [KTTokenAddress,DAITokenAddress],[convertToTWei(0.0040),convertToTWei(0.0018)]);
//setReasonableDiff - admin func'
   console.log("Setting Reasonable Difference ");
//both the tokens set to a diff of 10%
   await reserveManager.setReasonableDiff(admin.address, [KTTokenAddress,DAITokenAddress], [1000, 1000]);
})();

```

This is it for setting up and maintaining the FPR on kyber. For detailed explanation and suggestions on operational and infrastructure details check [this](kyberpro-infra.md)


##### Appendix for Multiple tokens

As mentioned, to save on gas costs, we recommend using the `setCompactData` function instead of `setBaseRates`. The inputs of `setCompactData` are the last 4 inputs of `setBaseRates`, namely: `bytes14[] buy`, `bytes14[] sell`, `uint blockNumber` and `uint[] indices`.

##### `uint[] indices`

![Multipletokensfig 1](/uploads/multipletokensfig-1.jpg "Multipletokensfig 1")
Each index allows you to modify up to 14 tokens at once. The token index number is determined by the order which they were added. Intuitively, an earlier token would have a smaller index, ie. the earliest token would be token 0, the next would be token 1, etc.

##### `bytes14[] buy / sell`

For simplicity, assume that we want to modify the base buy rates. The logic for modifying base sell rates is the same.

- Suppose the reserve supports 3 tokens: DAI, BAT and DGX.
- We want to make the following modifications to their base buy rates: 1. +2.5% (+25 pts) to DAI_BASE_BUY_RATE 2. +1% (+10 pts) to BAT_BASE_BUY_RATE 3. -3% (-30 pts) to DGX_BASE_BUY_RATE

**Note:**

1. One pt here means a **0.1% change**, as compared to basis points used in step functions where 1 basis point = 0.01%.
2. The range which compact data can handle is from -12.8% to 12.7%.

This gives us the buy array `[25,10,-30]`. Encoding this to hex yields `[0x190ae2]
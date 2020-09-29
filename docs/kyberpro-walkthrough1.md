---
id: KyberPro-Walkthrough1
title: Walkthrough 1
---
[//]: # (tagline)

# Setting Up Kyber Fed Price Reserve On Testnet With A Token Pair

This walkthrough will help you use the [FPR SDK](https://github.com/KyberNetwork/fpr-sdk.js) create a working reserve with trading pairs on testnet. For the purpose of this walkthrough, we will be setting a KTT/ETH pair. The KTT token is a custom token deployed on testnet for accessibility and convenience. 

Steps here includes:

  1. [Deployment Of The Reserve To Testnet](#1-deployment-of-the-reserve-to-testnet)
  2. [Add a KyberTestToken/ETH Pair](#2-add-a-kybertesttokeneth-pair)
  3. [Setting Permissions Group](#3-setting-permissions-group)
  4. [Setting Base Rates And Step Functions For Token](#4-setting-base-rates-and-step-functions-for-token)
  5. [See Your Quote For This Pair On Testnet](#5-see-your-quote-for-this-pair-on-testnet)
  6. [Trade KTT for ETH](#6-trade-ktt-for-eth)

The source code for this walkthrough is at [link](https://github.com/KyberNetwork/fpr-js-reference/scripts). 


## Requirements

To get started, create an ETH testnet account using [MetaMask](https://metamask.io/), and an account/project on [infura.io](https://infura.io/) to connect to the blockchain. For testnet ETH you can farm them from the [faucet](https://faucet.metamask.io/). 

Once you have an ETH account and an infura url, save the following as environment variables. 

*   `TESTNET_ADMIN_PRIVATE_KEY: Private key of the admin account`
*   `TESTNET_NODE_URL: Infura or Alchemy node URL `

Next, create and initialize a node directory and install Kyber FPR SDK.

```
npm init
npm install --save kyber-fpr-sdk 
npm install web3
```

All through this walkthrough, use the same address and do not switch accounts. 

## 1. Deployment Of The Reserve To Testnet

There are 2 smart contracts that are required. The Reserve smart contract - which manages reserve operations, and the Conversion rates contract - which manages the price settings. 

To deploy, run a script which deploys the reserve and the conversion smart contracts. The script in the GitHub repo will save the deployed contract addresses to a json file for further reference.

Note: **The account used to deploy the script in step 1, will hold the ADMIN rights for both contracts**. Be sure to have the appropriate operational security before deploying to mainnet.

```js
// full code in fpr-sdk-reference/deploy.js

const provider = new Web3.providers.HttpProvider(process.env.ROPSTEN_NODE_URL)

const web3 = new Web3(provider)
const account = web3.eth.accounts.privateKeyToAccount(process.env.TESTNET_ADMIN_PRIVATE_KEY)
const KNAddress= '0x920B322D4B8BAB34fb6233646F5c87F87e79952b';
const deployer = new FPR.Deployer(web3)
deployer.web3.eth.accounts.wallet.add(account)

(async ()=>{
    const addresses = await deployer.deploy(account.address, KNAddress);
   console.log(`Reserve Contract: ${addresses.reserveContract}`)
   console.log(`Conversion Contract + ${addresses.conversionRateContract}`)
  })();
```

## 2. Add a KyberTestToken/ETH Pair 

Now that we have the Reserve and conversionRates contracts on the testnet, we will now let the conversionrates contract know that it has to manage KTT, which would be to simply addToken.

So, in order for us to interact with the reserve and the conversion rates contracts, lets create a JS instance of the contracts and invoke addToken method with some default parameters, using the admin account. 

These default parameters determine the limits for per-block or between updates the net amount of each token can be traded. For now just use these params and we will review these parameters later on in the walkthrough. 


```js
// addToken.js

const reserveManager = new FPR.Reserve(web3, addresses)
Const KTTokenAddress = "0xc376079608C0F17FE06b9e950872666f9c3C3DA4"

const tokenInfo = new FPR.TokenControlInfo(100000000000000,440000000000000000000n,920000000000000000000n)

(async () => {
   console.log('Adding token')
 await manageReserve.addToken(account.address, KTTokenAddress, tokenInfo)
   })();
```


This will display the token indices, since this is our first pair the index will be 0. Now u have successfully set up your first trading pair.


## 3. Setting Permissions Group 
In the current smart contract architecture there are 3 permission groups for each contract - Admin, Operator and Alerter, with each group having a separate set of duties. 

It’s recommended to have only one admin address, operator and alerter can be multiple accounts. 

*   **Admin Account**: The admin account is unique and handles infrequent, manual operations like listing new tokens in the exchange, adding or removing operator/s and alerter/s. All sensitive operations (e.g. fund related) are limited to the admin address. 
*   **Operator Account:** Mostly a hot wallet and is used for frequent updates like setting reserve rates, monitoring and controlling prices. And a few other operations approved by the admin
*   **Alerter Account:** Only an alerter can disbale trade of the reserve.

Set up a new account on metamask and add the private key to the environment variables:

*   `TEST_OPERATOR_PRIVATE_KEY:"Private key of the operator account"`

As this is on testnet, you may add the admin address as the operator account as well, **ideally you should be using a different hot wallet for this action in the mainnet**.  

After that, give the operator permission for the conversionRates contract.

```js
// addOperator.js

const CRContract = new FPR.ConversionRatesContract(web3, addresses.conversionRates)

CRContract.addOperator(account.address, account.address)
      .then( result => {
    console.log(result)
    })
```

## 4. Setting Base Rates And Step Functions For Token

Now we will have to set a base rate per token. The setBaseRate function in the conversionRates contract sets the basic buy and sell rate per token. In this example, we will offer to buy ETH for X KTT, and sell ETH for Y KTT. 

We will get the current block number and set initial rate, this would mean that the Base rate set is valid from that particular block. Additionally we will be initializing the step functions to 0 , details and setting values will be explained in the next walkthrough.


```js
// setRates.js

(async () => {
   const blockNumber = await web3.eth.getBlockNumber();
  
   console.log("Setting base buy/sell rates")
   await reserveManager.setRate(operator.address, [rate] , blockNumber);
   console.log("done");
})();
```

## 5. See Your Quote For This Pair On Testnet 

Once you have completed step 4, you could call getBuyRates() and getSellRates() of the conversion rates contract and see the buy/sell rates for the token.


```js
// checkRates.js

  reserveManager.getBuyRates(KTTokenAddress,1).
     then(Brates => {console.log("Buy Rates"+Brates)})

    reserveManager.getSellRates(KTTokenAddress,1).
      then(srates => {console.log("Sell Rates"+srates)})
```

## 6. Trade KTT for ETH

To test out a quote/Trade where you buy KTT, you will need to do the following….

- Tell Kyber to enable the reserve and transfer KTT over to the test account
- Deposit testETH and tokens into the reserve smart contract - equivalent amounts should work fine.
- You should be able to see the quote and buy/sell it on the Kyberswap testnet instance!

**To Test Trades:**
 Go to [kyberSwap](https://ropsten.kyber.network/swap/eth-knc) , link your metamask account to the website by clicking on the metamask options. You can swap KTT with various other tokens available on ropsten kyberswap, Transfer tokens to any other wallet as well.

## Next Steps

That’s it for the walkthrough, hope that’s simple enough! In the coming [walkthroughs](/tutorials/guides/tutorial-walkthrough1.md), we will demonstrate advanced features for controling your quotes and optimize your on-chain market making. 


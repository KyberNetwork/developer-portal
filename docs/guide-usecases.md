---
id: UseCases
title: Use Cases
---
## Vendors
### Why use Kyber
Kyber Network’s instant token-to-token swap allows businesses to empower their users with greater flexibility and variety. Our platform enables customers and businesses to pay and receive payments in their token of choice – all with just a single transaction. With Kyber, you can now expand your scope of business to token users of all kinds.

The below diagram indicates how Kyber can provide better experience for your users.
![Kybervendors](/uploads/kybervendors.jpg "Kybervendors")

Projects such as Gifto and Request Network will be taking advantages of Kyber’s technology to allow payments in a wide range of tokens and currencies.

Vendors have the opportunity to join our Affiliate Program, which allows fee sharing on each payment that originates from your payment gateway. You can visit [here](http://ec2-18-191-247-252.us-east-2.compute.amazonaws.com:1337/docs/UseCases#affiliate-program-will-move-this-to-a-new-section-called-others) to learn more about the program.

### Introduction

Suppose you are an online merchant with an e-commerce website. You'd like to have these 2 properties:
1. Display product prices in the preferred token choice of your customers
2. Accept any form of payment, but receive only ETH.

The main contract you will be interacting with is `KyberNetwork.sol`. 
To achieve the first property, you will want to call the `getExpectedRate` method. 
To achieve the second, you will want to execute the `trade` method.

The code snippet below should provide a rough idea of how to go about interacting with the smart contract. We will dive deeper into certain sections and explain the input parameters needed for the `getExpectedRate` and `trade` methods.

For simplicity, let us assume that the consumer's token of choice is KNC. In other words, you want your product prices to be displayed in KNC. The consumer will pay in KNC tokens, but this payment is converted to ETH.

It is recommended the code sequence below to understand how everything works, then adapt it based on your needs.

### Full code snippet

```javascript
var Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"))
var utils = web3.utils

const ERC20ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"supply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"digits","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]
const kyberNetworkABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"reserve","type":"address"},{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"add","type":"bool"}],"name":"listPairForReserve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"bytes32"}],"name":"perReserveListedPairs","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"negligibleRateDiff","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeBurnerContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"expectedRateContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"whiteListContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_enable","type":"bool"}],"name":"setEnable","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"isReserve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"reserves","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"reserve","type":"address"},{"name":"add","type":"bool"}],"name":"addReserve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_whiteList","type":"address"},{"name":"_expectedRate","type":"address"},{"name":"_feeBurner","type":"address"},{"name":"_maxGasPrice","type":"uint256"},{"name":"_negligibleRateDiff","type":"uint256"}],"name":"setParams","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"findBestRate","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"}],"name":"trade","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getNumReserves","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"EtherReceival","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"actualSrcAmount","type":"uint256"},{"indexed":false,"name":"actualDestAmount","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reserve","type":"address"},{"indexed":false,"name":"add","type":"bool"}],"name":"AddReserveToNetwork","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reserve","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"add","type":"bool"}],"name":"ListReservePairs","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}]

var kyberNetworkContract = null
var KYBER_NETWORK_ADDRESS = null
const KYBERNETWORK_TESTNET_CONTRACT_ADDRESS = "0xD19559B3121c1b071481d8813d5dBcDC5869e2e8" //Ropsten address. Change this for other testnets
const ETH_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
const KNC_TOKEN_ADDRESS = "0xdd974d5c2e2928dea5f71b9825b8b646686bd200"
const ETH_DECIMALS = 18
const KNC_DECIMALS = 18

const VENDOR_WALLET_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E"
const PRODUCT_ETH_PRICE = '0.3'
const PRODUCT_ETH_WEI_PRICE = utils.toWei(PRODUCT_ETH_PRICE)

async function main() {
	KYBER_NETWORK_ADDRESS = await getKyberNetworkAddress()
	kyberNetworkContract = new web3.eth.Contract(kyberNetworkABI, KYBER_NETWORK_ADDRESS)
	/* 
	#############################################
	### OBTAINING & DISPLAYING RATES TO USER ####
	#############################################
	*/
	let result = await kyberNetworkContract.methods.getExpectedRate(
		ETH_TOKEN_ADDRESS, //ERC20 src
		KNC_TOKEN_ADDRESS,  //ERC20 dest
		PRODUCT_ETH_WEI_PRICE //uint srcQty
		).call()
	
	let expectedRate = result.expectedRate
	let slippageRate = result.slippageRate
	console.log("Expected Rate: " + expectedRate)
	console.log("Slippage Rate: " + slippageRate)

	//Convert expected rate and / or slippage rate to KNC for user to view
	let productDestTokenWeiPrice = calcDestTokenWeiPrice(Number(PRODUCT_ETH_PRICE), expectedRate)
	let productDestTokenPrice = formatPrice(productDestTokenWeiPrice,KNC_DECIMALS)
	console.log("Product price: " + productDestTokenPrice + " KNC")

	/* 
	########################
	### TRADE EXECUTION ####
	########################
	*/
	
	//User can pay in KNC (src), but we receive payment in ETH (dest)
	//First, user must approve KyberNetwork contract to trade src tokens
	srcTokenContract = new web3.eth.Contract(ERC20ABI, KNC_TOKEN_ADDRESS)
	transactionData = srcTokenContract.methods.approve(KYBER_NETWORK_ADDRESS,productDestTokenWeiPrice).encodeABI()
	txHash = await web3.eth.sendTransaction({
        from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
        to: srcTokenContract,
        data: transactionData,  
        })

	transactionData = KyberNetworkContract.methods.trade(
		KNC_TOKEN_ADDRESS, //ERC20 srcToken
		productDestTokenWeiPrice, //uint srcAmount
		ETH_TOKEN_ADDRESS, //ERC20 destToken
		VENDOR_WALLET_ADDRESS, //address destAddress
		PRODUCT_ETH_WEI_PRICE, //uint maxDestAmount
		slippageRate, //uint minConversionRate
		0 //uint walletId
		).encodeABI()

	txHash = await web3.eth.sendTransaction({
        from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
        to: KYBER_NETWORK_ADDRESS, 
        data: transactionData
        })
}	

async function getKyberNetworkAddress() {
	var providers = require('ethers').providers
	var provider = providers.getDefaultProvider()
	var address = await provider.resolveName("kybernetwork.eth").catch(error => console.log(error))
	if (!address) {
		address = KYBERNETWORK_TESTNET_CONTRACT_ADDRESS
	}
	return address
}

function calcDestTokenWeiPrice(productSrcPrice,expectedRate) {
	return productSrcPrice * expectedRate
}

function formatPrice(tokenWeiPrice,decimals) {
	return tokenWeiPrice / 10 ** decimals
}

main()
```

Let us start by taking a look at the first line of the `main()` function.

### Resolving ENS address of KyberNetwork
`KYBER_NETWORK_ADDRESS = await getKyberNetworkAddress()`

[ENS is a decentralised service that allows users to replace long hexadecimal addresses with human readable names](https://ens.domains/). `kybernetwork.eth` resolves to the [deployed mainnet contract](https://etherscan.io/address/kybernetwork.eth) of `KyberNetwork.sol`. Hence, the function `getKyberNetworkAddress` obtains the hexadecimal address from `kybernetwork.eth` on the mainnet. If the web3 provider is a test net node (Eg. ropsten or kovan), then the function returns `KYBERNETWORK_TESNET_CONTRACT_ADDRESS`, which is set as the deployed contract on **Ropsten**.


### `getExpectedRate`
Let us first look at the input parameters.

| Parameter           | Type    | Description                                   |
| ------------------- |:-------:|:------------------------------------:|
| `src`     | ERC20 | source ERC20 token contract address |
| `dest`    | ERC20 | destination ERC20 token contract address |
| `srcQty`  | uint | wei amount of source ERC20 token |
**Returns:**\
The expected exchange rate and slippage rate

Since ETH is not an ERC20 token, we use `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee` as a proxy address for it. Also, note that what is returned is the exchange rate, not the **expected exchange amount**, even though `srcQty` is an input parameter. The reason for having `srcQty` as input parameter is that different amounts yield different exchange rates.

Suppose that the product you are selling has a price of `0.3 ETH`. Hence, we set `const PRODUCT_ETH_PRICE = '0.3'`. We convert this to wei amount (`1 ETH = 10 ** 18 wei`) to obtain `PRODUCT_ETH_WEI_PRICE`.

```
let result = await kyberNetworkContract.methods.getExpectedRate(
		ETH_TOKEN_ADDRESS, //ERC20 src
		KNC_TOKEN_ADDRESS,  //ERC20 dest
		PRODUCT_ETH_WEI_PRICE //uint srcQty
		).call()
```

Let's see what the exchange rate is, by logging it into the console.
![Getexpectedrateoutput](/uploads/getexpectedrateoutput.jpg "Getexpectedrateoutput")

What this means is that the expected rate is `1 ETH = 521306200627597087211 KNC wei`. The slippage rate is the worst rate one can get during trade execution. Hence it is typically used as a gauge for the `trade` function.

We calculate the expected amount of KNC tokens the consumer would have to pay with this exchange rate.
```
	let productDestTokenWeiPrice = calcDestTokenWeiPrice(Number(PRODUCT_ETH_PRICE), expectedRate)
	let productDestTokenPrice = formatPrice(productDestTokenWeiPrice,KNC_DECIMALS)
	console.log("Product price: " + productDestTokenPrice + " KNC")
```
Thus, the product price is `156.0759170363836 KNC`. 

### `trade`
Now that the consumer knows that he has to pay roughly `156.076 KNC` for the product, how does he go about doing it, yet allowing you to receive ETH? Through the `trade` function, of course!
Let us first look at the input parameters.

| Parameter           | Type    | Description                                   |
| ------------------- |:-------:|:--------------------------------------------------------------------:|
| `src`               | ERC20   | source ERC20 token contract address                                  |
| `srcAmount`         | uint    | wei amount of source ERC20 token                                     |
| `dest`              | ERC20   | destination ERC20 token contract address                             |
| `destAddress`       | address | recipient address for destination ERC20 token                        |
| `maxDestAmount`     | uint    | limit on the amount of destination tokens                            |
| `minConversionRate` | uint    | minimum conversion rate;  trade is canceled if actual rate is lower |
| `walletId`          | address | wallet address to send part of the fees to                           |
**Returns:**\
Amount of actual destination tokens

* `maxDestAmount` specifies the maximum amount of ERC20 tokens / ETH (in wei) to be exchanged to. Any excess funds would be refunded to the user. In this scenario, since we want to receive exactly `0.3 ETH`, it would be useful to set it to `PRODUCT_ETH_WEI_PRICE`.
* As its name suggests, `minConversionRate` is the minimum exchange rate that one can set. If the actual exchange rate is lower than this amount, the trade does not go through.
* If you are part of our [affiliate program](guide-others.md#affiliate-program),  `walletId` is the wallet address to receive part of the fees. 

#### Converting from ERC20 to ETH
**This process involves 2 steps.**
1. The user has to call the `approve()` function of the ERC20 token contract to allow the `KyberNetwork.sol` contract to execute the trade. The code snippet below shows an example of how to do so.
```
	srcTokenContract = new web3.eth.Contract(ERC20ABI, KNC_TOKEN_ADDRESS)
	transactionData = srcTokenContract.methods.approve(KYBER_NETWORK_ADDRESS,productDestTokenWeiPrice).encodeABI()
	txHash = await web3.eth.sendTransaction({
        from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
        to: srcTokenContract,
        data: transactionData,  
        })
```

Note that `USER_ACCOUNT` would be the consumer's wallet address. 

2. It is only after this transaction is mined that we can call the `trade()` function.

```
transactionData = KyberNetworkContract.methods.trade(
		KNC_TOKEN_ADDRESS, //ERC20 srcToken
		productDestTokenWeiPrice, //uint srcAmount
		ETH_TOKEN_ADDRESS, //ERC20 destToken
		VENDOR_WALLET_ADDRESS, //address destAddress
		PRODUCT_ETH_WEI_PRICE, //uint maxDestAmount
		slippageRate, //uint minConversionRate
		0 //uint walletId
		).encodeABI()
```

* We set `srcAmount` to be `productDestTokenWeiPrice` which we derived previously from `getExpectedRate()`
* `VENDOR_WALLET_ADDRESS` would be the wallet address to receive the traded ETH (ie. the payment for the product)
* We set `minConversionRate` to be the `slippageRate` obtained from `getExpectedRate()`. It is up to you as a vendor to decide what you would want the minimum conversion rate, by considering exchange rates from other sources (Eg. Binance, CoinMarketCap)

We can get the user to sign and submit the transaction using the code snippet below.
```
	txHash = await web3.eth.sendTransaction({
        from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
        to: KYBER_NETWORK_ADDRESS, 
        data: transactionData
        })
```

#### Converting from ETH to ERC20
Let us assume that we would like to receive KNC and the consumer wants to pay in ETH. 
```
transactionData = KyberNetworkContract.methods.trade(
		ETH_TOKEN_ADDRESS, //ERC20 srcToken
		PRODUCT_ETH_WEI_PRICE, //uint srcAmount
		KNC_TOKEN_ADDRESS, //ERC20 destToken
		VENDOR_WALLET_ADDRESS, //address destAddress
		productDestTokenWeiPrice, //uint maxDestAmount
		someExchangeRate, //uint minConversionRate
		0 //uint walletId
		).encodeABI()
```

We just have to specify another field `value` when sending the transaction.

```
	txHash = await web3.eth.sendTransaction({
        from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
        to: KYBER_NETWORK_ADDRESS, 
        data: transactionData,
				value: PRODUCT_ETH_WEI_PRICE, //ADDITIONAL FIELD HERE
        })
```

### What to change if Metamask injected Web3 is used
**Important note:** The web3 version used in the code snippet is `1.0.x`. The web3 version injected by Metamask is `0.2x.x`. The syntax for both versions are significantly different, so simply copying and pasting the code will not work if you use Metamask's injected web3 version. Thankfully, only minor modifications are needed to make the code compatible. The points below highlight what parts need to be changed.
* `web3.eth.Contract(kyberNetworkABI, KYBER_NETWORK_ADDRESS)` becomes `web3.eth.contract(kyberNetworkABI).at(KYBER_NETWORK_ADDRESS)`
* No `web3.utils` available, but the only function we need is `toWei`. Delete the line `var utils = web3.utils` and replace `utils.toWei(PRODUCT_ETH_PRICE)` to `web3.toWei(PRODUCT_ETH_PRICE)`
* For constant methods, replace `contract.methods.myMethod`  with `contract.myMethod`, and remove any `.call()`. For example, `kyberNetworkContract.methods.getExpectedRate(params).call()` is just `kyberNetworkContract.getExpectedRate(params)`
* Replace `contract.methods.myMethod(params).encodeABI()` with `contract.myMethod.getData(params)`. For example, `transactionData = srcTokenContract.methods.approve(KYBER_NETWORK_ADDRESS,productDestTokenWeiPrice).encodeABI()` becomes `srcTokenContract.approve.getData(KYBER_NETWORK_ADDRESS,productDestTokenWeiPrice)`

## DApps


### Integration with Kyber
```
Same as vendors
```

## Wallets
Kyber Network gives your wallet the power to do more. By integrating with Kyber Network, it allows users to freely transact and convert without leaving your app. Fee sharing is applicable on each trade that originates from your wallet.

The below diagram shows how Kyber Network can streamline the token conversion swap process for your users.
![Kyberwallets](/uploads/kyberwallets.jpg "Kyberwallets")
Popular wallets like MyEtherWallet, imToken and TrustWallet are already using Kyber Network to empower their users.

Wallets have the opportunity to join our Affiliate Program, which allows fee sharing on each swap that originates from your wallet. You can visit [here](http://ec2-18-191-247-252.us-east-2.compute.amazonaws.com:1337/docs/Others#affiliate-program) to learn more about the program.

### How to integrate with Kyber
```javascript
code example here
```

## Reserves
Reserves represent decentralized liquidity powered by the community. It comprises of dedicated liquidity providers that are connected to diverse stakeholders in the ecosystem. Entities with large, idle digital assets such as large token holders, fund managers and token teams can easily become reserves, rebalance their portfolio and provide liquidity and value for the entire ecosystem.

A reserve consists of two main components: one on-chain component of your reserve smart contracts and one off-chain component of an automated system that manage your on-chain component. The two components are depicted in the diagram below.
![Kyberreservecomponents](/uploads/kyberreservecomponents.jpg "Kyberreservecomponents")
The on-chain component has smart contracts that store your tokens, provide conversion rates, and swap your tokens with users. The off-chain component hosts your [trading strategy](http://ec2-18-191-247-252.us-east-2.compute.amazonaws.com:1337/docs/UseCases#trading-strategy-will-move-this-to-a-new-section-called-others) that calculate and feed conversion rates and rebalance your reserve of tokens.

Here, we will walk you through an example to set up a reserve on Ropsten testnet.

### Before you begin
Check that you have the following:
1. [node.js](https://nodejs.org/en/download/)
2. [web3 v1.0.0](https://www.npmjs.com/package/web3)
3. An ETH account which can be created on [MEW](https://www.myetherwallet.com/), [MyCrypto](https://mycrypto.com/), or [MetaMask](https://metamask.io/). 
4. Ropsten ETH. You may get some from the [MetaMask faucet](https://faucet.metamask.io/) or [Ropsten faucet](http://faucet.ropsten.be:3001/).

### Step 1: Adding tokens
Create a  local directory and clone the `deployment-tutorial` branch of our [smart contracts repo](https://github.com/KyberNetwork/smart-contracts) on GitHub.

```
git clone -b deployment_tutorial https://github.com/KyberNetwork/smart-contracts.git
```

After you have a local copy, go to `web3deployment` directory and open `ropsten.json`, where you will find a list of currently supported tokens on Kyber Network.

```json
{
  "tokens": {
    "OMG": {
      "symbol": "OMG",
      "name": "OmiseGO",
      "decimals": 18,
      "address": "0x4BFBa4a8F28755Cb2061c413459EE562c6B9c51b",
      "minimalRecordResolution": "100000000000000",
      "maxPerBlockImbalance": "439794468212403470336",
      "maxTotalImbalance": "922362414038872621056",
      "rate": "0.01824780",
      "internal use": true,
      "listed": true
    },
    ...
  }
}
```

As we are creating a reserve of KNC tokens, we will copy the `symbol`, `decimals`, and `address` information of KNC from `ropsten.json` to `ropsten_reserve_input.json`. The fields `minimalRecordResolution`, `maxPerBlockImbalance` and `maxTotalImbalance` are input fields for you as a reserve manager to decide on. These 3 fields are explained below.

| Input field | Explanation | Example |
| ------------- | ------------- | ------------- |
| `minimalRecordResolution`  | The minimum denominator in token wei that can be changed. <br> It could indicate a token value of ~$0.0001 (or whatever amount you are comfortable with).  | Assume 1 OMG = $1.<br>$0.0001 = 0.0001 OMG<br>Now OMG has 18 decimals, so `0.0001*(10**18) = 100000000000000` |
| `maxPerBlockImbalance`  | The maximum wei amount of net absolute (+/-) change for a token in an ethereum block. Should be larger than the maximum allowed tradeable token amount for a whitelisted user. | `439794468212403470336 / (10 ** 18) = 439.79 OMG` Suppose we have 2 users Alice and Bob. Alice tries to buy 200 OMG and Bob tries to buy 300 OMG. Assuming both transactions are included in the same block and Alice's transaction gets processed first, Bob's transaction will **fail** because the resulting net change of -500 OMG would exceed the limit of 439.79 OMG. However, if Bob decides to sell instead of buy, then the net change becomes +100 OMG, which means an additional 539.79 OMG can be bought, or 339.79 OMG sold. |
| `maxTotalImbalance`  | Has to be `>= maxPerBlockImbalance`. Represents the amount in wei for the net token change that happens between 2 price updates. This number is reset everytime `setBaseRate()` is called in `ConversionRates.sol`.  This acts as a safeguard measure to prevent reserve depletion from unexpected events between price updates. | `922362414038872621056 / (10 ** 18) = 922.36 OMG` |


```json
{
  "tokens": {
    "KNC": {
      "name": "KyberNetwork",
      "decimals": 18,
      "address": "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6",
      "minimalRecordResolution" : "100000000000000",
      "maxPerBlockImbalance" : "3475912029567568052224",
      "maxTotalImbalance" : "5709185508564730380288"
    }
  },
	...
}
```

Now, let's take a look at the `exchanges` dictionary in `ropsten_reserve_input.json`. Fill in your ETH and KNC withdraw addresses for the purposes of rebalancing your reserve. Note that the `binance` string is just a convention. Also note that **all tokens you wish to support should have withdraw addresses**.

```json
  "exchanges": {
		"binance" : {
			"ETH" : "0x1234567890ABCDEF1234567890ABCDEF1111111",
			"KNC" : "0x1234567890ABCDEF1234567890ABCDEF1111111"
		}
  },
```

Then, in the `permission` dictionary, you will fill in the addresses for admin, operator, and alerter. We recommend that you use different addresses for each of the 3 roles. It is possible to have multiple operators and alerters, but there can only be 1 admin.

```json
"permission" : {
	"KyberReserve" : {
		"admin" : "0x1234567890ABCDEF1234567890ABCDEF1111111",
		"operator" : ["0x9876543210FDECBA9876543210FDECBA2222222"],
		"alerter" : ["0x1234567890ABCDEF9876543210FDECBA3333333"]
	},
	"ConversionRates" : {
		"admin" : "0x1234567890ABCDEF1234567890ABCDEF1111111",
		"operator" : ["0x9876543210FDECBA9876543210FDECBA2222222","0x1234567890ABCDEF9876543210FDECBA3333333"],
		"alerter" : ["0x1234567890ABCDEF9876543210FDECBA4444444,0x1234567890ABCDEF1234567890ABCDEF5555555"]
	}
},
```

* `admin`: The admin account is unique (usually cold wallet) and handles infrequent, manual operations like listing new tokens in the exchange.
* `operator`: The operator account is a hot wallet and is used for frequent updates like setting reserve rates and withdrawing funds from the reserve to certain destinations (e.g. when selling excess tokens in the open market).
* `alerter`: The alerter account is also a hot wallet and is used to alert the admin of inconsistencies in the system (e.g., strange conversion rates). In such cases, the reserve operation is halted and can be resumed only by the admin account.

The `valid duration block` parameter is the time in blocks (Ethereum processes ~4 blocks per minute) that your conversation rate will expire since the last price update. You may leave it as 60, or change it.

```json
  "valid duration block" : 60,
```

### Step 2: Deploying contracts

Run the command below in your terminal to install all required dependencies. Ensure that you are in the `/web3deployment` directory.

```
npm install
```

Then run the command

```
node reserveDeployer.js --config-path ropsten_reserve_input.json --gas-price-gwei 30 ----rpc-url https://ropsten.infura.io --print-private-key true --network-address "0x85ecDf8803c35a271a87ad918B5927E5cA6a56D2"
```
* `--gas-price-gwei`: The gas price in gwei
* `--rpc-url`: The URL of your geth, parity or infura node. Here we use infura's node, `https://ropsten.infura.io`.
* `--print-private-key`: The script generates a random and one-time ETH account that will send transactions. The `true` value reveals the private key of this generated account to you (you may want to set it to `false` when deploying onto the mainnet).
* `--network-address`: Kyber’s network contract address (the address above is Ropsten testnet address).

You should see something similar to the image below while the script is running.

![Waitforbalance](/uploads/waitforbalance.jpg "Waitforbalance")

The generated ETH account is waiting for some ETH to be deposited so that it can send transactions. Send around 0.3 ETH to the address. The console will eventually show

![Ethsent](/uploads/ethsent.jpg "Ethsent")

* `reserve` shows the address of your deployed `KyberReserve.sol` contract.
* `pricing` shows the address of your deployed `ConversionRates.sol` contract.
* `network` should be the same as that of `--network-address`

Congratulations, you have successfully deployed contracts on the Ropsten testnet!


### Step 3: Set conversion rates for your reserve

Now, as your reserve contracts are deployed on the Ropsten testnet, you should be able to find them on [Etherscan](https://ropsten.etherscan.io/). As a reserve manager, you will need to interact with `KyberReserve.sol` and `ConversionRates.sol`, both of which have been deployed in step 1. In other words, you have to call the functions of these 2 contracts. For example, to update the conversion rate of your tokens, you have to call the `setBaseRate` function of `ConversionRates.sol`. There is another **optional** but recommended contract `SanityRates.sol` that you can deploy and interact with.

* `KyberReserve.sol`: The contract has no direct interaction with the end users (the only interaction with them is via the network platform). Its main interaction is with the reserve operator who manages the token inventory and feeds conversion rates to Kyber Network's contract.
* `ConversionRates.sol`: Provides logic to maintain simple on-chain adjustment to the prices and an optimized cheap (w.r.t gas consumption) interface to enter rate feeds.
* `SanityRates.sol`: Provides sanity rate feeds. If there are large inconsistencies between the sanity rates and the actual rates, then trades involving your reserve will be disabled. The sanity module protects both parties from bugs in the conversion rate logic or from hacks into the conversion rate system.

One key responsibility of your automated system is to continually set the base rate based on your strategy, ie. there should be frequent automated calls made to the `setBaseRate` and / or `setCompactData` function of the your `ConversionRates.sol` contract using your operator account.

If you plan to support many tokens, calling the `setBaseRate` function becomes very expensive. `setCompactData` is a cheaper way to update all of your token prices, assuming that the token base prices need not be changed.

#### How to programmatically call `setBaseRate` / `setCompactData`

First, we shall explain the input parameters of the function.

| Input field | Explanation | Examples |
| ------------- | ------------- | ------------- |
| `ERC20[] tokens`  | Array of token contract addresses you will be supporting  | `["0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6"]` <br> `["0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6","0xa577731515303F0C0D00E236041855A5C4F114dC"]` |
| `uint[] baseBuy`  | Array of token buy rates in wei amount | Suppose we want to set `1 ETH = 500 KNC`.<br>So `500 * (10 ** 18) = 500000000000000000000` |
| `uint[] baseSell`  | Array of token sell rates in wei amount | Suppose we want to set `1 KNC = 0.00182 ETH`<br>So `0.00182 * (10 ** 18) = 1820000000000000`|
| `bytes14[] buy` | Compact data representation of basis points (bps) with respect to `baseBuy` rates | `[0]`<br>`[0x19302f]` |
| `bytes14[] sell` | Compact data representation of basis points (bps) with respect to `baseSell` rates | `[0]`<br>`[0xa1503d]` |
| `uint blockNumber` | Most recent ETH block number (can be obtained on Etherscan) | `3480805` |
| `uint[] indices` | Index of array to apply the compact data bps rates on | `[0]` |

#### 1-2 tokens

If you plan to support just 1 or 2 tokens, set `baseBuy`, `baseSell` and `indices` to `[0]`. The code below is an example of how to call the `setBaseRate` function. If you plan to use it, kindly take note of the following:
1. Replace the `CONVERSION_RATES_CONTRACT_ADDRESS` with your own contract address.
2. Replace the `PRIVATE_KEY` with the private key of an account you own. It is recommended to generate a new account for security reasons. Do not include the `0x` prefix.
3. Calculate desired buy and sell rates for your token(s) and set it to `BUY_RATE` and `SELL_RATE`

```javascript
//REPLACE WITH YOUR ConversionRates.sol CONTRACT ADDRESS
const CONVERSION_RATES_CONTRACT_ADDRESS = "0xe56d6a9e5bc2228a0c7456c6827def6d3d473f27" 
const KNC_TOKEN_CONTRACT_ADDRESS = "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6"
var Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"))


const PRIVATE_KEY = "YOUR_PRIVATE_KEY" //Eg. "5fba6c1ccf757875f65dca7098318be8d76dc4d7a40ded4deb14ff4e0a1bd083"

const ConversionRatesABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"reserve","type":"address"}],"name":"setReserveAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"}],"name":"disableTokenTrade","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"validRateDurationInBlocks","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"tokens","type":"address[]"},{"name":"baseBuy","type":"uint256[]"},{"name":"baseSell","type":"uint256[]"},{"name":"buy","type":"bytes14[]"},{"name":"sell","type":"bytes14[]"},{"name":"blockNumber","type":"uint256"},{"name":"indices","type":"uint256[]"}],"name":"setBaseRate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"}],"name":"enableTokenTrade","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getListedTokens","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"numTokensInCurrentCompactData","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"command","type":"uint256"},{"name":"param","type":"uint256"}],"name":"getStepFunctionData","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"buy","type":"bytes14[]"},{"name":"sell","type":"bytes14[]"},{"name":"blockNumber","type":"uint256"},{"name":"indices","type":"uint256[]"}],"name":"setCompactData","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"duration","type":"uint256"}],"name":"setValidRateDurationInBlocks","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"}],"name":"getTokenBasicData","outputs":[{"name":"","type":"bool"},{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"}],"name":"getRateUpdateBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"xBuy","type":"int256[]"},{"name":"yBuy","type":"int256[]"},{"name":"xSell","type":"int256[]"},{"name":"ySell","type":"int256[]"}],"name":"setQtyStepFunction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"reserveContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"tokenImbalanceData","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"currentBlockNumber","type":"uint256"},{"name":"buy","type":"bool"},{"name":"qty","type":"uint256"}],"name":"getRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"xBuy","type":"int256[]"},{"name":"yBuy","type":"int256[]"},{"name":"xSell","type":"int256[]"},{"name":"ySell","type":"int256[]"}],"name":"setImbalanceStepFunction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"minimalRecordResolution","type":"uint256"},{"name":"maxPerBlockImbalance","type":"uint256"},{"name":"maxTotalImbalance","type":"uint256"}],"name":"setTokenControlInfo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"buyAmount","type":"int256"},{"name":"rateUpdateBlock","type":"uint256"},{"name":"currentBlock","type":"uint256"}],"name":"recordImbalance","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"buy","type":"bool"}],"name":"getBasicRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"}],"name":"addToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"}],"name":"getCompactData","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"bytes1"},{"name":"","type":"bytes1"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"}],"name":"getTokenControlInfo","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}]


var ConversionRatesContract = web3.eth.contract(ConversionRatesABI)
var ConversionRatesContractInstance = ConversionRatesContract.at(CONVERSION_RATES_CONTRACT_ADDRESS)

/*
Do some calculations, add some spread to obtain some desired buy / sell rates for your token(s)
Example values below are from the table above
*/
BUY_RATE = [500000000000000000000] //Eg. [100000000000000000000, 200000000000000000000]
SELL_RATE = [1820000000000000] //Eg. [1800000000000000, 1900000000000000]

var txData = ConversionRatesContractInstance.setBaseRate(
	[KNC_TOKEN_CONTRACT_ADDRESS], //ERC20[] tokens
	BUY_RATE, //uint[] baseBuy
	SELL_RATE, //uint[] baseSell
	[0], //bytes14[] buy
	[0], //bytes14[] sell
	3487647, //most recent ropsten ETH block number as time of writing
	[0] //uint[] indices
	).encodeABI()

var signedTx = web3.eth.accounts.signTransaction(
    {
        data: txData,
        to: CONVERSION_RATES_CONTRACT_ADDRESS,
        gas: '2000000', //gasLimit
    },
    '0x' + PRIVATE_KEY
);

web3.eth.sendSignedTransaction(signedTx).on('receipt', console.log);
```

#### Multiple tokens
Setting base rates for multiple tokens in 1 transaction requires deeper technical knowledge. Hence, this section will be covered in an advanced guide (coming soon!)

#### Other functions

Using a flat rate is perhaps not sufficient. A user that buys/sells a big number of tokens will have a different impact on your portfolio compared to another user that buys / sells a small number of tokens. The purpose of steps, therefore, is to have the contract alter the price depending on the buy / sell quantities of a user, and the net traded amount between price update operations.

##### Different buy / sell quantities
Operators can call `setQtyStepFunction()` of `ConversionRates.sol` to allow different conversion rates for different buy / sell quantities.

```javascript
function setQtyStepFunction(
        ERC20 token,
        int[] xBuy,
        int[] yBuy,
        int[] xSell,
        int[] ySell
    )
```
| Input field | Explanation | Example |
| ------------- | ------------- | ------------- |
| `ERC20 token`  |  Token contract address | `0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6` |
| `int[] xBuy`  | Buy steps in wei | `[100000000000000000000,200000000000000000000,300000000000000000000,5000000000000000000000]` |
| `int[] yBuy`  | Impact on conversion rate in basis points (bps). `1 bps = 0.01%`<br>Eg. `-30 = -0.3%`  |  `[0,-30,-60,-80]`<br>**Values should be `<=0`**  |
| `int[] xSell`  | Sell steps in wei | `[-3000000000000000000000,-200000000000000000000,-100000000000000000000,0]` |
| `int[] ySell`  | Impact on conversion rate in basis points (bps). `1 bps = 0.01%`<br>Eg. `-30 = -0.3%`  | `[-70,-50,-25,0]`<br>**Values should be `<=0`** |

* Buy steps (`xBuy`) are used to change ASK prices, sell steps (`xSell`) are used to change BID prices
* `yBuy` and `ySell` numbers should always be non-positive (`<=0`) because the smart contract **reduces** the output amount by the Y-value set in each step.

Given the above example parameters, assume the base buy rate is 100 (1 ETH = 100 KNC) and sell rate is 0.01 (1 KNC = 0.01 ETH), different buy and sell quantities will result in different conversion rates as below:

| Buy/Sell quantity | Actual conversion rate | Explanation |
| ------------- | ------------- | ------------- |
| Buy 10 KNC  |  100 `100*(1+0%)` | 10 is in the range of 0 to 100, which is the **first** buy step in the `xBuy`, so the impact on the the base rate is 0% according to the **first** number in the `yBuy`. |
| Buy 110 KNC  | 99.7 `100*(1-0.3%)` | 110 is in the range of 100 to 200, which is the **second** buy step in the `xBuy`, so the impact on the the base rate is 0% according to the **second** number in the `yBuy`.  |
| Buy 210 KNC  | 99.4 `100*(1-0.6%)` |  10 is in the range of 200 to 300, which is the **third** buy step in the `xBuy`, so the impact on the the base rate is 0% according to the **third** number in the `yBuy`.   |
| Buy 1,000 KNC  | 99.2 `100*(1-0.8%)` | 10 is in the range of 500 and above, which is the **last** buy step in the `xBuy`, so the impact on the the base rate is 0% according to the **last** number in the `yBuy`.  |

##### Net traded amount
They can also call `setImbalanceStepFunction()` of `ConversionRates.sol` to allow different conversion rates based on the net traded token amount between price update operations. For example, if Alice buys 100 KNC, Bob sells 50 KNC and Carol buys 10 KNC, then the net traded amount is -60 KNC.

```javascript
function setImbalanceStepFunction(
        ERC20 token,
        int[] xBuy,
        int[] yBuy,
        int[] xSell,
        int[] ySell
    )
```
| Input field | Explanation | Example |
| ------------- | ------------- | ------------- |
| `ERC20 token`  |  Token contract address | `0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6` |
| `int[] xBuy`  | Buy steps in wei  | `[100000000000000000000,200000000000000000000,300000000000000000000,5000000000000000000000]`|
| `int[] yBuy`  | Impact on conversion rate in basis points (bps). `1 bps = 0.01%`<br>Eg. `-30 = -0.3%` |  `[0,-30,-60,-80]`<br>**Values should be `<=0`** |
| `int[] xSell`  | Sell steps in wei | `[-300000000000000000000,-200000000000000000000,-100000000000000000000,0]`|
| `int[] ySell`  | Impact on conversion rate in basis points (bps). `1 bps = 0.01%`<br>Eg. `-30 = -0.3%` | `[-70,-50,-25,0]`<br>**Values should be `<=0`** |

* Buy steps (`xBuy`) are used to change ASK prices, sell steps (`xSell`) are used to change BID prices
* `yBuy` and `ySell` numbers should always be non-positive (`<=0`) because the smart contract **reduces** the output amount by the Y-value set in each step.

#### Additional safeguards
In the case of unforeseen adverse circumstances (Eg. a hack in your automated system or operator accounts), whereby your conversion rate is compromised to be very unfavorable, you may set up additional safeguards in place to protect your reserve.

##### Sanity Rates
Operators can set a sanity rate by calling `setSanityRates` and `setReasonableDiff` from `SanityRates.sol` to allow automatic swap disabling if rate inconsistencies exceed a certain percentage between two rate updates. You can visit here to learn more about sanity rates.

##### Alerters
As mentioned previously, the role of alerters is to look out for unexpected / malicious behaviour of the reserve and halt operations. They can do so by calling `disableTokenTrade()` in the `ConversionRates.sol`. Thereafter, only the admin account is able to resume operations by calling `enableTokenTrade()` in the same contract.

### Step 4: Deposit tokens to and withdraw tokens from your reserve

A reserve can’t operate without tokens. A a reserve that supports ETH-KNC swap pair will need to hold both ETH and KNC so that users can sell and buy KNC from your reserve.

Filling up your reserve is easy. You can transfer tokens to your reserve contract from any address.

However, only authorized accounts have the right to withdraw tokens from the reserve. `admin` can call `withdrawEther` and `withdrawToken` of `KyberReserve.sol` to withdraw tokens to any address. `operator` can only withdraw tokens to whitelisted addresses by calling `withdraw`. `admin` can add withdraw/whitelisted address by calling `approveWithdrawAddress` of `KyberReserve.sol`.


### Step 5: Get your reserve authorized and running

If you have completed above steps, you can let any network operator know so that they can approve your reserve and every specific pair you are allowed to list. Kyber Network is currently the only network operator.

Once you get approved, you can test your reserve on [KyberSwap](ropsten.kyber.network) Ropsten site! Please note that if there are other reserves listing same swap pair as you, your swap may not get matched with your reserve, because only the reserve that offer best rate will be matched. We can disable other reserves on the testnet to make sure you will swap with your reserve.



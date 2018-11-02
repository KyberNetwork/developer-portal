---
id: VendorsGuide
title: Vendors Integration Guide
---
## Introduction
`getExpectedRate()` and `trade()` of [`KyberNetworkProxy.sol`](api-kybernetworkproxy.md) are the functions you would want to interact with using web3. In addition, you may refer to the [Track Price and Volume](guide-trackerapi.md) section to get the list of compatible token pairs and price information.

## Obtaining listed token pair(s) rates
For a simple way to obtain the conversion rates of token pairs, call the [token pair API](guide-trackerapi.md#price-and-volume-information). You would want to use either the `currentPrice` or `lastPrice` to convert your product prices to the preferred token choice of your consumer.

### `getExpectedRate`
Call this function to obtain the freshest conversion rate of a single token pair. 

| Parameter           | Type    | Description                                   |
| ------------------- |:-------:|:------------------------------------:|
| `src`     | ERC20 | source ERC20 token contract address |
| `dest`    | ERC20 | destination ERC20 token contract address |
| `srcQty`  | uint | wei amount of source ERC20 token |
**Returns:**\
The expected exchange rate and slippage rate. Note that these returned values are in **18 decimals** regardless of the destination token's decimals

```js
let result = await kyberNetworkProxyContract.methods.getExpectedRate(
	ETH_TOKEN_ADDRESS, //ERC20 src
	KNC_TOKEN_ADDRESS,  //ERC20 dest
	PRODUCT_ETH_WEI_PRICE //uint srcQty
	).call()
```

## `trade`
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

#### `srcAmount` | `maxDestAmount`
These amounts should be in the source and destination token decimals respectively. For example, if the user wants to swap from / to 10 POWR, which has 6 decimals, it would be `10 * (10 ** 6) = 10000000`

**Note:**<br>`maxDestAmount` should **not** be `0`. Set it to an arbitarily large amount if you want all source tokens to be converted.

#### `minConversionRate`
This rate is independent of the source and destination token decimals. To calculate this rate, take `yourRate * 10**18`. For example, even though ZIL has 12 token decimals, if we want the minimum conversion rate to be `1 ZIL = 0.00017 ETH`, then `minConversionRate = 0.00017 * (10 ** 18)`.

#### `walletId`
If you are part of our [fee sharing program](guide-feesharing.md),  this will be your registered wallet address. Set it as `0` if you are not a participant.

### Maximum Gas Price
To prevent user front running, the contract limits the gas price trade transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.

```js
let maxGasPrice = await KyberNetworkProxyContract.methods.maxGasPrice().call()
```

### Converting from ERC20
**This process involves 2-3 steps.**
1. **(Optional Step)** We first check the allowance the user might have given to `KyberNetworkProxy.sol` for trading. If the allowance is more than the requested trade amount, we can proceed to step 3.
```js
srcTokenContract = new web3.eth.Contract(ERC20ABI, SRC_TOKEN_ADDRESS)
allowanceAmount = srcTokenContract.methods.allowance(USER_ADDRESS,KYBER_NETWORK_PROXY_ADDRESS).call()
if (srcTokenWeiAmount <= allowanceAmount) {
	//proceed to step 3
} else {
	//proceed to step 2
}
```

2. The user has to call the `approve()` function of the ERC20 token contract to allow the `KyberNetworkProxy.sol` contract to execute the trade.
```js
srcTokenContract = new web3.eth.Contract(ERC20ABI, SRC_TOKEN_ADDRESS)
transactionData = srcTokenContract.methods.approve(KYBER_NETWORK_PROXY_ADDRESS,srcTokenWeiPrice).encodeABI()
	
txReceipt = await web3.eth.sendTransaction({
	from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
	to: srcTokenContract,
	data: transactionData
})
```

3. We then execute the `trade()` function. We recommend to wait for the `approve()` transaction (if it's called) to be mined first.
```js
transactionData = KyberNetworkProxyContract.methods.trade(
		SRC_TOKEN_ADDRESS, //ERC20 srcToken
		srcTokenWeiAmount, //uint srcAmount
		DEST_TOKEN_ADDRESS, //ERC20 destToken
		VENDOR_WALLET_ADDRESS, //address destAddress
		maximumDestTokenWeiAmount, //uint maxDestAmount
		minConversionWeiRate, //uint minConversionRate
		0 //uint walletId
		).encodeABI()
		
txReceipt = await web3.eth.sendTransaction({
	from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
	to: KYBER_NETWORK_PROXY_ADDRESS, 
	data: transactionData
 })
```

### Converting from ETH
We just have to specify the `value` field when sending the transaction.

```js
transactionData = KyberNetworkProxyContract.methods.trade(
	ETH_TOKEN_ADDRESS, //ERC20 srcToken
	ethTokenWeiAmount, //uint srcAmount
	DEST_TOKEN_ADDRESS, //ERC20 destToken
	VENDOR_WALLET_ADDRESS, //address destAddress
	maximumDestTokenWeiAmount, //uint maxDestAmount
	minConversionWeiRate, //uint minConversionRate
	0 //uint walletId
	).encodeABI()
		
txReceipt = await web3.eth.sendTransaction({
	from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
	to: KYBER_NETWORK_PROXY_ADDRESS, 
	data: transactionData,
	value: ethTokenWeiAmount, //ADDITIONAL FIELD HERE
})
```

## Code Example
```js
var ethers = require('ethers')
var Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"))
var utils = web3.utils

const ERC20ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"supply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"digits","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]
const kyberNetworkProxyABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"},{"name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToEther","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetworkContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapEtherToToken","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdminQuickly","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"},{"name":"token","type":"address"}],"name":"getUserCapInTokenWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_kyberNetworkContract","type":"address"}],"name":"setKyberNetworkContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"field","type":"bytes32"}],"name":"info","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"}],"name":"trade","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"trader","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"actualSrcAmount","type":"uint256"},{"indexed":false,"name":"actualDestAmount","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newNetworkContract","type":"address"},{"indexed":false,"name":"oldNetworkContract","type":"address"}],"name":"KyberNetworkSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}]

var kyberNetworkProxyContract = null

var KYBER_NETWORK_PROXY_ADDRESS = null
const KYBER_NETWORK_ADDRESS = "0x91a502C678605fbCe581eae053319747482276b9"
const KYBER_NETWORK_ROPSTEN_CONTRACT_ADDRESS = "0x818e6fecd516ecc3849daf6845e3ec868087b755"
const ETH_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
const KNC_TOKEN_ADDRESS = "0xdd974d5c2e2928dea5f71b9825b8b646686bd200"
const ETH_DECIMALS = 18
const KNC_DECIMALS = 18

const VENDOR_WALLET_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E"
const PRODUCT_ETH_PRICE = '0.3'
const PRODUCT_ETH_WEI_PRICE = utils.toWei(PRODUCT_ETH_PRICE)

async function main() {
	KYBER_NETWORK_PROXY_ADDRESS = await getKyberNetworkProxyAddress()
	kyberNetworkProxyContract = new web3.eth.Contract(kyberNetworkProxyABI, KYBER_NETWORK_PROXY_ADDRESS)

	/* 
	######################################################
	### OBTAINING & DISPLAYING SINGLE TOKEN PAIR RATE ####
	######################################################
	*/
	let result = await kyberNetworkProxyContract.methods.getExpectedRate(
		ETH_TOKEN_ADDRESS, 
		KNC_TOKEN_ADDRESS, 
		PRODUCT_ETH_WEI_PRICE
		).call()
	
	let expectedRate = result.expectedRate
	let slippageRate = result.slippageRate
	console.log("Expected Rate: " + expectedRate)
	console.log("Slippage Rate: " + slippageRate)

	//Convert expected rate and / or slippage rate to KNC for user to view
	userTokenWeiPrice = convertToUserTokenWeiPrice(Number(PRODUCT_ETH_PRICE), expectedRate)
	userTokenPrice = convertToTokenPrice(userTokenWeiPrice,KNC_DECIMALS)
	console.log("Product price: " + userTokenPrice + " KNC")

	/* 
	########################
	### TRADE EXECUTION ####
	########################
	*/
	
	//User can pay in KNC (src), but we receive payment in ETH (dest)
	//First, user must approve KyberNetwork contract to trade src tokens
	srcTokenContract = new web3.eth.Contract(ERC20ABI, KNC_TOKEN_ADDRESS)
	transactionData = srcTokenContract.methods.approve(KYBER_NETWORK_PROXY_ADDRESS,userTokenWeiPrice).encodeABI()
	txReceipt = await web3.eth.sendTransaction({
        from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
        to: srcTokenContract,
        data: transactionData,  
        }).catch(error => console.log(error))

	transactionData = KyberNetworkProxyContract.methods.trade(
		KNC_TOKEN_ADDRESS, //ERC20 srcToken
		userTokenWeiPrice, //uint srcAmount
		ETH_TOKEN_ADDRESS, //ERC20 destToken
		VENDOR_WALLET_ADDRESS, //address destAddress
		0, //uint maxDestAmount
		slippageRate, //uint minConversionRate
		0 //uint walletId
		).encodeABI()

	txReceipt = await web3.eth.sendTransaction({
        from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
        to: KYBER_NETWORK_PROXY_ADDRESS, 
        data: transactionData, 
        }).catch(error => console.log(error))
}	

async function getKyberNetworkProxyAddress() {
	var providers = ethers.providers
	var provider = providers.getDefaultProvider()
	var address = await provider.resolveName("kybernetwork.eth").catch(error => console.log(error))
	if (!address) {
		address = KYBER_NETWORK_ROPSTEN_CONTRACT_ADDRESS
	}
	return address
}

function convertToUserTokenWeiPrice(productSrcPrice,expectedRate) {
	return productSrcPrice * expectedRate
}

function convertToTokenPrice(userTokenWeiPrice,destDecimals) {
	return userTokenWeiPrice / 10 ** destDecimals
}

main()
```

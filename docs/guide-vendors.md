---
id: VendorsGuide
title: Vendors Integration Guide
---
## Introduction
`getExpectedRate()` and `trade()` of [`KyberNetwork.sol`](KyberNetwork) and `getExpectedRates()` of [`Wrapper.sol`](Wrapper) are the functions you would want to interact with using web3. In addition, you may refer to the [Track Price and Volume](TrackerAPIGuide) section to get the list of compatible token pairs and price information.

## Obtaining listed token pair(s) rates
For a simple way to obtain the conversion rates of token pairs, call the [token pair API](TrackerAPIGuide#get-list-of-convertible-pairs). You would want to use either the `currentPrice` or `lastPrice` to convert your product prices to the preferred token choice of your consumer.

### `getExpectedRate`
Call this function to obtain the freshest conversion rate of a single token pair

| Parameter           | Type    | Description                                   |
| ------------------- |:-------:|:------------------------------------:|
| `src`     | ERC20 | source ERC20 token contract address |
| `dest`    | ERC20 | destination ERC20 token contract address |
| `srcQty`  | uint | wei amount of source ERC20 token |
**Returns:**\
The expected exchange rate and slippage rate

```js
let result = await kyberNetworkContract.methods.getExpectedRate(
	ETH_TOKEN_ADDRESS, //ERC20 src
	KNC_TOKEN_ADDRESS,  //ERC20 dest
	PRODUCT_ETH_WEI_PRICE //uint srcQty
	).call()
```

### `getExpectedRates`
Call this function to obtain the freshest conversion rate of multiple token pairs
​
| Parameter           | Type    | Description                                   |
| ------------------- |:-------:|:------------------------------------:|
| `network` | address | `KyberNetwork.sol` [contract address](NetworksAppendix#kybernetwork) |
| `srcs`     | address[] | array of source ERC20 token contract address |
| `dests`    | address[] | array of destination ERC20 token contract address |
| `qty`  | uint256[] | array of wei amount of source ERC20 tokens |
**Returns:**\
The expected exchange rates and slippage rates
​
```js
let result = await kyberWrapperContract.methods.getExpectedRates(
	KYBERNETWORK_CONTRACT_ADDRESS, //address network
	[ETH_TOKEN_ADDRESS,OMG_TOKEN_ADDRESS], //address[] src
	[KNC_TOKEN_ADDRESS,ETH_TOKEN_ADDRESS],  //address[] dest
	[ETH_WEI_QTY,OMG_WEI_QTY] //uint256[] qty
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

### Converting from ERC20
**This process involves 2 steps.**

1. The user has to call the `approve()` function of the ERC20 token contract to allow the `KyberNetwork.sol` contract to execute the trade.
```js
srcTokenContract = new web3.eth.Contract(ERC20ABI, KNC_TOKEN_ADDRESS)
transactionData = srcTokenContract.methods.approve(KYBER_NETWORK_ADDRESS,srcTokenWeiPrice).encodeABI()
	
txReceipt = await web3.eth.sendTransaction({
	from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
	to: srcTokenContract,
	data: transactionData,  
})
```

2. It is only after this transaction is mined that we can execute the `trade()` function.
```js
transactionData = KyberNetworkContract.methods.trade(
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
    to: KYBER_NETWORK_ADDRESS, 
    data: transactionData
 })
```

### Converting from ETH
We just have to specify the `value` field when sending the transaction.

```js
transactionData = KyberNetworkContract.methods.trade(
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
	to: KYBER_NETWORK_ADDRESS, 
	data: transactionData,
	value: ethTokenWeiAmount, //ADDITIONAL FIELD HERE
})
```

## Code Example
```js
var ethers = require('ethers')
var Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"))
var utils = web3.utils

const ERC20ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"supply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"digits","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]
const kyberNetworkABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"reserve","type":"address"},{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"add","type":"bool"}],"name":"listPairForReserve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"bytes32"}],"name":"perReserveListedPairs","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"negligibleRateDiff","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeBurnerContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"expectedRateContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"whiteListContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_enable","type":"bool"}],"name":"setEnable","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"isReserve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"reserves","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"reserve","type":"address"},{"name":"add","type":"bool"}],"name":"addReserve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_whiteList","type":"address"},{"name":"_expectedRate","type":"address"},{"name":"_feeBurner","type":"address"},{"name":"_maxGasPrice","type":"uint256"},{"name":"_negligibleRateDiff","type":"uint256"}],"name":"setParams","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"findBestRate","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"}],"name":"trade","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getNumReserves","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"EtherReceival","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"actualSrcAmount","type":"uint256"},{"indexed":false,"name":"actualDestAmount","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reserve","type":"address"},{"indexed":false,"name":"add","type":"bool"}],"name":"AddReserveToNetwork","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reserve","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"add","type":"bool"}],"name":"ListReservePairs","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}]
const kyberWrapperABI = [{"constant":true,"inputs":[{"name":"reserve","type":"address"},{"name":"tokens","type":"address[]"}],"name":"getBalances","outputs":[{"name": "","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"bytes14"},{"name":"byteInd","type":"uint256"}],"name":"getByteFromBytes14","outputs":[{"name":"","type":"bytes1"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"network","type":"address"},{"name":"srcs","type":"address[]"},{"name":"dests","type":"address[]"},{"name":"qty","type":"uint256[]"}],"name":"getExpectedRates","outputs":[{"name":"","type":"uint256[]"},{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant": true,"inputs":[{"name":"x","type":"bytes14"},{"name":"byteInd","type":"uint256"}],"name":"getInt8FromByte","outputs":[{"name":"","type":"int8"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"reserve","type":"address"},{"name":"srcs","type":"address[]"},{"name":"dests","type":"address[]"}],"name":"getReserveRate","outputs":[{"name":"","type":"uint256[]"},{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"ratesContract","type":"address"},{"name":"tokenList","type":"address[]"}],"name":"getTokenIndicies","outputs":[{"name":"","type":"uint256[]"},{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"ratesContract","type":"address"},{"name": "tokenList","type":"address[]"}],"name":"getTokenRates","outputs":[{"name":"","type":"uint256[]"},{"name":"","type":"uint256[]"},{"name":"","type":"int8[]"},{"name":"","type":"int8[]"},{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"}]

var kyberNetworkContract = null
var kyberWrapperContract = null

var KYBER_NETWORK_ADDRESS = null
const KYBER_WRAPPER_ADDRESS = "0x6172afc8c00c46e0d07ce3af203828198194620a"
const KYBERNETWORK_ROPSTEN_CONTRACT_ADDRESS = "0xD19559B3121c1b071481d8813d5dBcDC5869e2e8"
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
	kyberWrapperContract = new web3.eth.Contract(kyberWrapperABI, KYBER_WRAPPER_ADDRESS)

	/* 
	######################################################
	### OBTAINING & DISPLAYING SINGLE TOKEN PAIR RATE ####
	######################################################
	*/
	let result = await kyberNetworkContract.methods.getExpectedRate(
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
	############################################
	### OBTAINING MULTIPLE TOKEN PAIR RATES ####
	############################################
	*/
	let result = await kyberWrapperContract.methods.getExpectedRates(
		KYBER_NETWORK_ADDRESS,
		[ETH_TOKEN_ADDRESS,OMG_TOKEN_ADDRESS],
		[KNC_TOKEN_ADDRESS,ETH_TOKEN_ADDRESS],
		[ETH_WEI_QTY,OMG_WEI_QTY]
		).call()

	let expectedRates = result[0]
	let slippageRates = result[1]
	console.log(expectedRates)
	console.log(slippageRates)

	/* 
	########################
	### TRADE EXECUTION ####
	########################
	*/
	
	//User can pay in KNC (src), but we receive payment in ETH (dest)
	//First, user must approve KyberNetwork contract to trade src tokens
	srcTokenContract = new web3.eth.Contract(ERC20ABI, KNC_TOKEN_ADDRESS)
	transactionData = srcTokenContract.methods.approve(KYBER_NETWORK_ADDRESS,userTokenWeiPrice).encodeABI()
	txReceipt = await web3.eth.sendTransaction({
        from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
        to: srcTokenContract,
        data: transactionData,  
        }).catch(error => console.log(error))

	transactionData = KyberNetworkContract.methods.trade(
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
        to: KYBER_NETWORK_ADDRESS, 
        data: transactionData, 
        }).catch(error => console.log(error))
}	

async function getKyberNetworkAddress() {
	var providers = ethers.providers
	var provider = providers.getDefaultProvider()
	var address = await provider.resolveName("kybernetwork.eth").catch(error => console.log(error))
	if (!address) {
		address = KYBERNETWORK_ROPSTEN_CONTRACT_ADDRESS
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

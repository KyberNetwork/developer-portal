---
id: WalletsGuide
title: Wallets Integration Guide
---
## Introduction
Suppose you would like to implement the token swap feature for your wallet. The functions you want to interact with are `getExpectedRates()` of [`Wrapper.sol`](Wrapper) and the `trade()` function of [`KyberNetwork.sol`](KyberNetwork). In addition, you may want to:
1. Query the user's maximum tradeable amount
2. Check the maximum gas price allowed for trade transactions
3. Query the network state
4. Obtain the contract address of `KyberNetwork.sol` from `kybernetwork.eth`

## Obtaining all listed token pair rates
Call the [token pair API](TrackerAPIGuide#get-list-of-convertible-pairs) to obtain information about all listed token pairs which you may want to display to your users, such as `baseVolume`, `quoteVolume`, `currentPrice` and `lastPrice`. 

From the list of token pairs, if you'd like to have the latest conversion rates, consider calling the `getExpectedRates()` function of [`Wrapper.sol`](Wrapper)

### `getExpectedRates`
Call this function to obtain the freshest conversion rates.
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

## Making the `trade` transaction
### `trade`
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
srcTokenContract = new web3.eth.Contract(ERC20ABI, SRC_TOKEN_ADDRESS)
transactionData = srcTokenContract.methods.approve(KYBER_NETWORK_ADDRESS,srcTokenWeiPrice).encodeABI()

txReceipt = await web3.eth.sendTransaction({
	from: USER_WALLET_ACCOUNT, //obtained from your wallet application
	to: srcTokenContract,
	data: transactionData  
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
	from: USER_WALLET_ACCOUNT, //obtained from your wallet application
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
	from: USER_WALLET_ACCOUNT, //obtained from your wallet application
	to: KYBER_NETWORK_ADDRESS, 
	data: transactionData,
	value: ethTokenWeiAmount, //ADDITIONAL FIELD HERE
})
```

You may refer to [this code example](CodesAppendix#broadcasting-transactions) of how to sign and send a transaction to the Ethereum network.

## User Eligibility
Different users have different maximal trade amount they can use. For example, users who did full KYC with Kyber have higher trading amounts. To check the user cap, call the [`getUserCapInWei`](KyberNetwork#getusercapinwei) of `KyberNetwork.sol`.

```js
let result = await KyberNetworkContract.methods.getUserCapInWei(
	USER_ADDRESS
	).call()

let userCapInWei = result[0]
```

## Maximum Gas Price
To prevent user front running, the contract limits the gas price transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.

```js
let maxGasPrice = await KyberNetworkContract.methods.maxGasPrice().call()
```

## Network State
In extreme cases, or when the smart contracts are being upgraded, the network might be disabled by the network admin and all trades are disabled. To check the status of the network, check the public variable `enabled`.

```js
let networkEnabled = await KyberNetworkContract.methods.enabled().call()
```

## Obtaining `KyberNetwork.sol` address from `kybernetwork.eth`
The code snippet shows one way to resolve ENS names (in this context, `kybernetwork.eth`) using [ether.js](https://github.com/ethers-io/ethers.js/)
```js
var ethers = require('ethers')
var providers = ethers.providers
var provider = providers.getDefaultProvider()
var kyberNetworkContractAddress = await provider.resolveName("kybernetwork.eth").catch(error => console.log(error))
console.log(kyberNetworkContractAddress)
```
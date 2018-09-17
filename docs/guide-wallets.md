---
id: WalletsGuide
title: Wallets Integration Guide
---
## Introduction
Suppose you would like to implement the token swap feature for your wallet. The functions you want to interact with are `getExpectedRate()` and the `trade()` function of [`KyberNetworkProxy.sol`](api-kybernetworkproxy.md). In addition, you may want to:
1. Query the user's maximum tradeable amount
2. Check the maximum gas price allowed for trade transactions
3. Query the network state
4. Obtain the contract address of `KyberNetworkProxy.sol` from `kybernetwork.eth`

## Obtaining all listed token pair rates
Call the [token pair API](guide-trackerapi.md#price-and-volume-information) to obtain information about all listed token pairs which you may want to display to your users, such as `baseVolume`, `quoteVolume`, `currentPrice` and `lastPrice`. 

From the list of token pairs, if you'd like to have the latest conversion rates, consider calling the `getExpectedRate()` function of [`KyberNetworkProxy.sol`](api-kybernetworkproxy.md)

### `getExpectedRate`
Call this function to obtain the freshest conversion rate of a single token pair

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
	ETH_WEI_PRICE //uint srcQty
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

#### `srcAmount` | `maxDestAmount`
These amounts should be in the source and destination token decimals respectively. For example, if the user wants to swap from / to 10 POWR, which has 6 decimals, it would be `10 * (10 ** 6) = 10000000`

**Note:**<br>`maxDestAmount` should **not** be `0`. Set it to an arbitarily large amount if you want all source tokens to be converted.

#### `minConversionRate`
This rate is independent of the source and destination token decimals. To calculate this rate, take `yourRate * 10**18`. For example, even though ZIL has 12 token decimals, if we want the minimum conversion rate to be `1 ZIL = 0.00017 ETH`, then `minConversionRate = 0.00017 * (10 ** 18)`.

#### `walletId`
If you are part of our [fee sharing program](guide-feesharing.md),  this will be your registered wallet address. Set it as `0` if you are not a participant.

### Converting from ERC20
**This process involves 2-3 steps.**

1. **(Optional Step)** We first check the allowance the user might have given to `KybernetworkProxy.sol` for trading. If the allowance is more than the requested trade amount, we can proceed to step 3.
```js
srcTokenContract = new web3.eth.Contract(ERC20ABI, SRC_TOKEN_ADDRESS)
allowanceAmount = srcTokenContract.methods.allowance(USER_WALLET_ADDRESS,KYBER_NETWORK_PROXY_ADDRESS).call()
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
	from: USER_WALLET_ADDRESS, //obtained from your wallet application
	to: srcTokenContract,
	data: transactionData,  
})
```

3. We then execute the `trade()` function. We recommend to wait for the `approve()` transaction (if it's called) to be mined first.
```js
transactionData = KyberNetworkProxyContract.methods.trade(
	SRC_TOKEN_ADDRESS, //ERC20 srcToken
	srcTokenWeiAmount, //uint srcAmount
	DEST_TOKEN_ADDRESS, //ERC20 destToken
	USER_WALLET_ADDRESS, //address destAddress
	maximumDestTokenWeiAmount, //uint maxDestAmount
	minConversionWeiRate, //uint minConversionRate
	0 //uint walletId
	).encodeABI()
		
txReceipt = await web3.eth.sendTransaction({
	from: USER_WALLET_ADDRESS, //obtained from your wallet application
	to: KYBER_NETWORK_ADDRESS, 
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
	from: USER_WALLET_ADDRESS, //obtained from your wallet application
	to: KYBER_NETWORK_ADDRESS, 
	data: transactionData,
	value: ethTokenWeiAmount, //ADDITIONAL FIELD HERE
})
```

You may refer to [this code example](appendix-codes.md#broadcasting-transactions) of how to sign and send a transaction to the Ethereum network.

## Maximum Gas Price
To prevent user front running, the contract limits the gas price transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.

```js
let maxGasPrice = await KyberNetworkProxyContract.methods.maxGasPrice().call()
```

## Network State
In extreme cases, or when the smart contracts are being upgraded, the network might be disabled by the network admin and all trades are disabled. To check the status of the network, check the public variable `enabled`.

```js
let networkEnabled = await KyberNetworkProxyContract.methods.enabled().call()
```

## Obtaining `KyberNetworkProxy.sol` address from `kybernetwork.eth`
The code snippet shows one way to resolve ENS names (in this context, `kybernetwork.eth`) using [ether.js](https://github.com/ethers-io/ethers.js/)
```js
var ethers = require('ethers')
var providers = ethers.providers
var provider = providers.getDefaultProvider()
var kyberNetworkProxyContractAddress = await provider.resolveName("kybernetwork.eth").catch(error => console.log(error))
console.log(kyberNetworkProxyContractAddress)
```

 ## Web3 Injection
Your wallet application should come packaged with web3. If it's not, here's how you can go about it:

### Adding web3
This can be done using 1 of the following methods:
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
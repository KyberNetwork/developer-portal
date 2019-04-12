---
id: DappsGuide
title: DApps Integration Guide
---

## Introduction

We will make use of the [ERC20 Interface](https://github.com/KyberNetwork/smart-contracts/blob/developV2/contracts/ERC20Interface.sol) and [KyberNetworkProxy](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberNetworkProxy.sol) smart contracts.

`getExpectedRate()`, `swapTokenToToken()`, `swapEtherToToken()` and `swapTokenToEther()` and `trade()` of `KyberNetworkProxy.sol` are the functions you would want to incorporate into your DApp's smart contract(s).

## Scenario

Consider 2 scenarios where you want to allow your users to convert between any ERC20 tokens that are supported by the Kyber Protocol

1. Loose token conversion: Convert from token A to token B without concern for the amount of tokens you will receive
2. Exact token conversion: Convert to an exact amount of token B, and return all excess change in token A

We will make use of the [ERC20 Interface](https://github.com/KyberNetwork/smart-contracts/blob/developV2/contracts/ERC20Interface.sol) and [KyberNetworkProxy](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberNetworkProxy.sol) smart contracts. You would want to incorporate the `getExpectedRate()`, `swapTokenToToken()`, `swapEtherToToken()`, `swapTokenToEther()` and `trade()` functions of `KyberNetworkProxy.sol` into your DApp's smart contract(s).

### Scenario 1: Loose Token Conversion

#### `swapTokenToToken`

[**A note about swapping from ERC20 tokens**](#conversion-from-erc20-tokens)

```
//@param _kyberNetworkProxy kyberNetworkProxy contract address
//@param srcToken source token contract address
//@param srcQty in token wei
//@param destToken destination token contract address
//@param destAddress address to send swapped tokens to
function swapTokenToToken (KyberNetworkProxyInterface _kyberNetworkProxy, ERC20 srcToken, uint srcQty, ERC20 destToken, address destAddress) public {

	uint minRate;

	//getExpectedRate returns expected rate and slippage rate
	//we use the slippage rate as the minRate
	(, minRate) = _kyberNetworkProxy.getExpectedRate(srcToken, destToken, srcQty);

	// Check that the token transferFrom has succeeded
	require(srcToken.transferFrom(msg.sender, this, srcQty));

	// Mitigate ERC20 Approve front-running attack, by initially setting
	// allowance to 0
	require(srcToken.approve(_kyberNetworkProxy, 0));

	// Approve tokens so network can take them during the swap
	srcToken.approve(address(_kyberNetworkProxy), srcQty);
	uint destAmount = _kyberNetworkProxy.swapTokenToToken(srcToken, srcQty, destToken, minRate);

	// Send received tokens to destination address
	require(destToken.transfer(destAddress, destAmount));
	}
```

#### `swapEtherToToken`

```
//@dev assumed to be receiving ether wei
//@param _kyberNetworkProxy kyberNetworkProxy contract address
//@param token destination token contract address
//@param destAddress address to send swapped tokens to
function swapEtherToToken (KyberNetworkProxyInterface _kyberNetworkProxy, ERC20 token, address destAddress) public payable {

	uint minRate;
	(, minRate) = _kyberNetworkProxy.getExpectedRate(ETH_TOKEN_ADDRESS, token, msg.value);

	//will send back tokens to this contract's address
	uint destAmount = _kyberNetworkProxy.swapEtherToToken.value(msg.value)(token, minRate);

	//send received tokens to destination address
	require(token.transfer(destAddress, destAmount));
	}
```

#### `swapTokenToEther`

[**A note about swapping from ERC20 tokens**](#conversion-from-erc20-tokens)

```
//@param _kyberNetworkProxy kyberNetworkProxy contract address
//@param token source token contract address
//@param tokenQty token wei amount
//@param destAddress address to send swapped ETH to
function swapTokenToEther (KyberNetworkProxyInterface _kyberNetworkProxy, ERC20 token, uint tokenQty, address destAddress) public {

	uint minRate;
	(, minRate) = _kyberNetworkProxy.getExpectedRate(token, ETH_TOKEN_ADDRESS, tokenQty);

	// Check that the token transferFrom has succeeded
	require(token.transferFrom(msg.sender, this, tokenQty));

	// Mitigate ERC20 Approve front-running attack, by initially setting
	// allowance to 0
	require(srcToken.approve(_kyberNetworkProxy, 0));

	// Approve tokens so network can take them during the swap
	token.approve(address(_kyberNetworkProxy), tokenQty);
	uint destAmount = _kyberNetworkProxy.swapTokenToEther(token, tokenQty, minRate);

	// Send received ethers to destination address
	require(destAddress.transfer(destAmount));
	}
```

### Scenario 2: Precise Token Conversion

#### `swapTokenToTokenWithChange`

[**A note about swapping from ERC20 tokens**](#conversion-from-erc20-tokens)

```
//@param _kyberNetworkProxy kyberNetworkProxy contract address
//@param srcToken source token contract address
//@param srcQty in token wei
//@param destToken destination token contract address
//@param destAddress address to send swapped tokens to
//@param maxDestQty max number of tokens in swap outcome. will be sent to destAddress
//@param minRate minimum conversion rate for the swap
function swapTokenToTokenWithChange (
	KyberNetworkProxyInterface _kyberNetworkProxy,
	ERC20 srcToken,
	uint srcQty,
	ERC20 destToken,
	address destAddress,
	uint maxDestQty,
	uint minRate
)
	public
{
	uint beforeTransferBalance = srcToken.balanceOf(this);

	// Check that the token transferFrom has succeeded
	require(srcToken.transferFrom(msg.sender, this, srcQty));

	// Mitigate ERC20 Approve front-running attack, by initially setting
	// allowance to 0
	require(srcToken.approve(_kyberNetworkProxy, 0));

	// Approve tokens so network can take them during the swap
	srcToken.approve(address(_kyberNetworkProxy), srcQty);

	_kyberNetworkProxy.trade(srcToken, srcQty, destToken, destAddress, maxDestQty, minRate, 0);
	uint change = srcToken.balanceOf(this) - beforeTransferBalance;

	// Return any remaining source tokens to user
	srcToken.transfer(msg.sender, change);
}
```

#### `swapEtherToTokenWithChange`

```
//@param _kyberNetworkProxy kyberNetworkProxy contract address
//@param token destination token contract address
//@param destAddress address to send swapped tokens to
//@param maxDestQty max number of tokens in swap outcome. will be sent to destAddress
//@param minRate minimum conversion rate for the swap
function swapEtherToTokenWithChange (
  KyberNetworkProxyInterface _kyberNetworkProxy,
	ERC20 token,
	address destAddress,
	uint maxDestQty,
	uint minRate
)
	public
	payable
{
  //note that this.balance has increased by msg.value before the execution of this function
	uint startEthBalance = this.balance;

	//send swapped tokens to dest address. change will be sent to this contract.
	_kyberNetworkProxy.trade.value(msg.value)(ETH_TOKEN_ADDRESS, msg.value, token, destAddress, maxDestQty, minRate, 0);

	//calculate contract starting ETH balance before receiving msg.value (startEthBalance - msg.value)
	//change = current balance after trade - starting ETH contract balance (this.balance - (startEthBalance - msg.value))
	uint change = this.balance - (startEthBalance - msg.value);

	//return change to msg.sender
	msg.sender.transfer(change);
}
```

#### `swapTokenToEtherWithChange`

[**A note about swapping from ERC20 tokens**](#conversion-from-erc20-tokens)

```
//@param _kyberNetworkProxy kyberNetworkProxy contract address
//@param token source token contract address
//@param tokenQty token wei amount
//@param destAddress address to send swapped tokens to
//@param maxDestQty max number of tokens in swap outcome. will be sent to destAddress
//@param minRate minimum conversion rate for the swap
function swapTokenToEtherWithChange (
	KyberNetworkProxyInterface _kyberNetworkProxy,
	ERC20 token,
	uint tokenQty,
	address destAddress,
	uint maxDestQty,
	uint minRate
)
	public
{
	uint beforeTransferBalance = srcToken.balanceOf(this);

	// Check that the token transferFrom has succeeded
	require(token.transferFrom(msg.sender, this, tokenQty));

	// Mitigate ERC20 Approve front-running attack, by initially setting
	// allowance to 0
	require(token.approve(_kyberNetworkProxy, 0));

	// Approve tokens so network can take them during the swap
	token.approve(address(_kyberNetworkProxy), tokenQty);

	_kyberNetworkProxy.trade(token, tokenQty, ETH_TOKEN_ADDRESS, destAddress, maxDestQty, minRate, 0);
	uint change = srcToken.balanceOf(this) - beforeTransferBalance;

	// Return any remaining source tokens to user
	token.transfer(msg.sender, change);
}
```

### Contract Example

Note that this is just an example smart contract. How the smart contract functions are modified and incorporated into your DApp is dependent on your requirements.

```
pragma solidity 0.4.18;


import "./ERC20Interface.sol";
import "./KyberNetworkProxy.sol";


contract KyberExample {
	//It is possible to take minRate from kyber contract, but best to get it as an input from the user.

	ERC20 constant internal ETH_TOKEN_ADDRESS = ERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);

	event SwapTokenChange(uint balanceBefore, uint balanceAfter, uint change);
	event SwapEtherChange(uint startBalance, uint currentBalance, uint change);

	//must have default payable since this contract expected to receive change
	function() public payable {}


	//@param _kyberNetworkProxy kyberNetworkProxy contract address
	//@param srcToken source token contract address
	//@param srcQty in token wei
	//@param destToken destination token contract address
	//@param destAddress address to send swapped tokens to
	function swapTokenToToken (KyberNetworkProxyInterface _kyberNetworkProxy, ERC20 srcToken, uint srcQty, ERC20 destToken, address destAddress) public {
		uint minRate;

		//getExpectedRate returns expected rate and slippage rate
		//we use the slippage rate as the minRate
		(, minRate) = _kyberNetworkProxy.getExpectedRate(srcToken, destToken, srcQty);

		// Check that the token transferFrom has succeeded
		require(srcToken.transferFrom(msg.sender, this, srcQty));

		// Mitigate ERC20 Approve front-running attack, by initially setting
		// allowance to 0
		require(srcToken.approve(_kyberNetworkProxy, 0));

		// Approve tokens so network can take them during the swap
		srcToken.approve(address(_kyberNetworkProxy), srcQty);
		uint destAmount = _kyberNetworkProxy.swapTokenToToken(srcToken, srcQty, destToken, minRate);

		// Send received tokens to destination address
		require(destToken.transfer(destAddress, destAmount));
	}


	//@dev assumed to be receiving ether wei
	//@param _kyberNetworkProxy kyberNetworkProxy contract address
	//@param token destination token contract address
	//@param destAddress address to send swapped tokens to
	function swapEtherToToken (KyberNetworkProxyInterface _kyberNetworkProxy, ERC20 token, address destAddress) public payable {

		uint minRate;
		(, minRate) = _kyberNetworkProxy.getExpectedRate(ETH_TOKEN_ADDRESS, token, msg.value);

		//will send back tokens to this contract's address
		uint destAmount = _kyberNetworkProxy.swapEtherToToken.value(msg.value)(token, minRate);

		//send received tokens to destination address
		require(token.transfer(destAddress, destAmount));
	}


	//@param _kyberNetworkProxy kyberNetworkProxy contract address
	//@param token source token contract address
	//@param tokenQty token wei amount
	//@param destAddress address to send swapped ETH to
	function swapTokenToEther (KyberNetworkProxyInterface _kyberNetworkProxy, ERC20 token, uint tokenQty, address destAddress) public {

		uint minRate;
		(, minRate) = _kyberNetworkProxy.getExpectedRate(token, ETH_TOKEN_ADDRESS, tokenQty);

		// Check that the token transferFrom has succeeded
		require(token.transferFrom(msg.sender, this, tokenQty));

		// Mitigate ERC20 Approve front-running attack, by initially setting
		// allowance to 0
		require(token.approve(_kyberNetworkProxy, 0));

		// Approve tokens so network can take them during the swap
		token.approve(address(_kyberNetworkProxy), tokenQty);
		uint destAmount = _kyberNetworkProxy.swapTokenToEther(token, tokenQty, minRate);

		// Send received ethers to destination address
		require(destAddress.transfer(destAmount));
	}


	//@param _kyberNetworkProxy kyberNetworkProxy contract address
	//@param srcToken source token contract address
	//@param srcQty in token wei
	//@param destToken destination token contract address
	//@param destAddress address to send swapped tokens to
	//@param maxDestQty max number of tokens in swap outcome. will be sent to destAddress
	//@param minRate minimum conversion rate for the swap
	function swapTokenToTokenWithChange (
		KyberNetworkProxyInterface _kyberNetworkProxy,
		ERC20 srcToken,
		uint srcQty,
		ERC20 destToken,
		address destAddress,
		uint maxDestQty,
		uint minRate
	)
		public
	{
	uint beforeTransferBalance = srcToken.balanceOf(this);

	// Check that the token transferFrom has succeeded
	require(srcToken.transferFrom(msg.sender, this, srcQty));

	// Mitigate ERC20 Approve front-running attack, by initially setting
	// allowance to 0
	require(srcToken.approve(_kyberNetworkProxy, 0));

	// Approve tokens so network can take them during the swap
	srcToken.approve(address(_kyberNetworkProxy), srcQty);

	_kyberNetworkProxy.trade(srcToken, srcQty, destToken, destAddress, maxDestQty, minRate, 0);
	uint change = srcToken.balanceOf(this) - beforeTransferBalance;

	// Return any remaining source tokens to user
	srcToken.transfer(msg.sender, change);
	}


	//@param _kyberNetworkProxy kyberNetworkProxy contract address
	//@param token destination token contract address
	//@param destAddress address to send swapped tokens to
	//@param maxDestQty max number of tokens in swap outcome. will be sent to destAddress
	//@param minRate minimum conversion rate for the swap
	function swapEtherToTokenWithChange (
		KyberNetworkProxyInterface _kyberNetworkProxy,
		ERC20 token,
		address destAddress,
		uint maxDestQty,
		uint minRate
	)
		public
		payable
	{
		//note that this.balance has increased by msg.value before the execution of this function
		uint startEthBalance = this.balance;

		//send swapped tokens to dest address. change will be sent to this contract.
		_kyberNetworkProxy.trade.value(msg.value)(ETH_TOKEN_ADDRESS, msg.value, token, destAddress, maxDestQty, minRate, 0);

		//calculate contract starting ETH balance before receiving msg.value (startEthBalance - msg.value)
		//change = current balance after trade - starting ETH contract balance (this.balance - (startEthBalance - msg.value))
		uint change = this.balance - (startEthBalance - msg.value);

		SwapEtherChange(startEthBalance, this.balance, change);

		//return change to msg.sender
		msg.sender.transfer(change);
	}


	//@param _kyberNetworkProxy kyberNetworkProxy contract address
	//@param token source token contract address
	//@param tokenQty token wei amount
	//@param destAddress address to send swapped tokens to
	//@param maxDestQty max number of tokens in swap outcome. will be sent to destAddress
	//@param minRate minimum conversion rate for the swap
	function swapTokenToEtherWithChange (
		KyberNetworkProxyInterface _kyberNetworkProxy,
		ERC20 token,
		uint tokenQty,
		address destAddress,
		uint maxDestQty,
		uint minRate
	)
		public
	{
	uint beforeTransferBalance = srcToken.balanceOf(this);

	// Check that the token transferFrom has succeeded
	require(token.transferFrom(msg.sender, this, tokenQty));

	// Mitigate ERC20 Approve front-running attack, by initially setting
	// allowance to 0
	require(token.approve(_kyberNetworkProxy, 0));

	// Approve tokens so network can take them during the swap
	token.approve(address(_kyberNetworkProxy), tokenQty);

	_kyberNetworkProxy.trade(token, tokenQty, ETH_TOKEN_ADDRESS, destAddress, maxDestQty, minRate, 0);
	uint change = srcToken.balanceOf(this) - beforeTransferBalance;

	// Return any remaining source tokens to user
	token.transfer(msg.sender, change);
	}
}
```

## Things To Note

### Conversion From ERC20 Tokens

The user is required to call the `approve` function **first** to give an allowance to the smart contract executing the `transferFrom` function.

#### Example

If the contract example above has an address of `0x818E6FECD516Ecc3849DAf6845e3EC868087B755`, and the user wants to swap from KNC to ETH, then we require the user to send the transaction below.

```
srcTokenContract = new web3.eth.Contract(ERC20ABI,'0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6') //Ropsten KNC token contract
txData = sourceTokenContract.methods.approve(
	'0x818E6FECD516Ecc3849DAf6845e3EC868087B755',
	'115792089237316195423570985008687907853269984665640564039457584007913129639935' //2**256 - 1
	).encodeABI()

txReceipt = await web3.eth.sendTransaction({
    from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
    to: srcTokenContract,
    data: txData
})
```

### `getExpectedRate`

More information regarding the input parameters of the `getExpectedRate` function can be found in [reference](api-kybernetworkproxy.md#getexpectedrate).

<!--| Parameter           | Type    | Description                                   |
| ------------------- |:-------:|:------------------------------------:|
| `src`     | ERC20 | source ERC20 token contract address |
| `dest`    | ERC20 | destination ERC20 token contract address |
| `srcQty`  | uint | wei amount of source ERC20 token |
**Returns:**\
The expected exchange rate and slippage rate. Note that these returned values are in **18 decimals** regardless of the destination token's decimals-->

### `trade`

More information regarding the input parameters of the `trade` function can be found in [reference](api-kybernetworkproxy.md#trade).

<!--| Parameter           | Type    | Description                                   |
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
If you are part of our [fee sharing program](guide-feesharing.md), this will be your registered wallet address. Set it as `0` if you are not a participant.-->

### Maximum Gas Price

To prevent user front running, the contract limits the gas price trade transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.

```js
let maxGasPrice = await KyberNetworkProxyContract.methods.maxGasPrice().call();
```

## Safeguarding Users From Slippage Rates

The token conversion rate varies with different source token quantities. It is important to highlight the slippage in rates to the user when dealing with large token amounts. We provide some methods how this can be done below.

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

### Fee Sharing Program

DApps have the opportunity to join our _Fee Sharing Program_, which allows fee sharing on each swap that originates from your app. Learn more about the program [here](guide-feesharing.md)!

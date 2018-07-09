---
id: DappsGuide
title: DApps Integration Guide
---
## Introduction
We will make use of the [ERC20 Interface](https://github.com/KyberNetwork/smart-contracts/blob/developV2/contracts/ERC20Interface.sol) and [KyberNetworkProxy](https://github.com/KyberNetwork/smart-contracts/blob/developV2/contracts/KyberNetworkProxy.sol) smart contracts. 

`getExpectedRate()`, `swapTokenToToken()`, `swapEtherToToken()` and `swapTokenToEther()` and `trade()` of `KyberNetworkProxy.sol` are the functions you would want to incorporate into your DApp's smart contract(s).

Consider 2 scenarios:
1. Loose token conversion: Convert from token A to token B without concern for the amount of tokens you will receive
2. Exact token conversion: Convert to an exact amount of token B, and return all excess change in token A

## Scenario 1: Loose Token Conversion 

### `swapTokenToToken`
```
//@param srcToken valid token address
//@param srcQty in token wei
//@param destToken valid token address
//@param destAddress where to send swapped tokens to
function swapTokenToToken (ERC20 srcToken, uint srcQty, ERC20 destToken, address destAddress) public {
	uint minRate;
	(, minRate) = kyber.getExpectedRate(srcToken, destToken, srcQty);
	
	//you can also send some user address to transfer from
	require(srcToken.transferFrom(msg.sender, this, srcQty));

	//approve tokens so network can take them during the swap.
	srcToken.approve(address(kyber), srcQty);
	uint destAmount = kyber.swapTokenToToken(srcToken, srcQty, destToken, minRate);

	//send received tokens to destination address
	require(destToken.transfer(destAddress, destAmount));
	}
```

### `swapEtherToToken`

```
//@dev notice this contract must have etherQtyWei. or it can be sent when calling this function.
function swapEtherToToken (ERC20 token, uint etherQtyWei, address destAddress) public payable {

	uint minRate;
	(, minRate) = kyber.getExpectedRate(ETH_TOKEN_ADDRESS, token, etherQtyWei);
	
	//will send back tokens to this contract's address
	uint destAmount = kyber.swapEtherToToken.value(etherQtyWei)(token, minRate);

	//send received tokens to destination address
	require(token.transfer(destAddress, destAmount));
	}
```

### `swapTokenToEther`

```
//@param token valid token address
//@param tokenQty in token wei
//@param destAddress address to send swapped ethers to
function swapTokenToEther (ERC20 token, uint tokenQty, address destAddress) public {

	uint minRate;
	(, minRate) = kyber.getExpectedRate(token, ETH_TOKEN_ADDRESS, tokenQty);
	
	require(token.transferFrom(msg.sender, this, tokenQty));
	
	token.approve(address(kyber), tokenQty);
	uint destAmount = kyber.swapTokenToEther(token, tokenQty, minRate);

	//send received ethers to destination address
	require(destAddress.transfer(destAmount));
	}
```

## Scenario 2: Precise Token Conversion 
### `swapTokenToTokenWithChange`

```
//@param srcToken a valid token address
//@param srcQty in token wei
//@param destToken valid token address
//@param destAddress where to send swap result.
//@param user where to get tokens from and and send change to
//@param maxDestQty max number of tokens in swap outcome. will be sent to destAddress
//@param minRate minimum conversion rate for this swap
function swapTokenToTokenWithChange (
	ERC20 srcToken, 
	uint srcQty, 
	ERC20 destToken, 
	address destAddress,
	address user, 
	uint maxDestQty, 
	uint minRate
)
	public
{
	uint startSrcBalance = srcToken.balanceOf(this);
	
	require(srcToken.transferFrom(user, this, srcQty));
	srcToken.approve(address(kyber), srcQty);

	kyber.trade(srcToken, srcQty, destToken, destAddress, maxDestQty, minRate, 0);
	uint change = srcToken.balanceOf(this) - startSrcBalance;

	SwapTokenChange(startSrcBalance, srcToken.balanceOf(this), change);
	srcToken.transfer(user, change);
}
```

### `swapEtherToTokenWithChange`

```
function swapEtherToTokenWithChange (
	ERC20 token, 
	uint etherQtyWei, 
	address destAddress, 
	address user, 
	uint minRate,
	uint maxDestQty
)
	public
	payable
{
	uint startEthBalance = this.balance;
	
	//will send tokens to dest address. change will be sent to this contract.
	kyber.trade.value(etherQtyWei)(ETH_TOKEN_ADDRESS, etherQtyWei, token, destAddress, maxDestQty, minRate, 0);
	
	uint change = this.balance - (startEthBalance - etherQtyWei);
	
	SwapEtherChange(startEthBalance, this.balance, change);
	
	//here change sent to user. could also be sent to msg.sender
	user.transfer(change);
}
```

### `swapTokenToEtherWithChange`
```
function swapTokenToEtherWithChange (
	ERC20 token, 
	uint tokenQty, 
	address destAddress, 
	address user, 
	uint minRate,
	uint maxDestQty
)
	public
{

	uint startTokenBalance = token.balanceOf(this);
	
	require(token.transferFrom(user, this, tokenQty));
	token.approve(address(kyber), tokenQty);
	
	kyber.trade(token, tokenQty, ETH_TOKEN_ADDRESS, destAddress, maxDestQty, minRate, 0);
	uint change = token.balanceOf(this) - startTokenBalance;
	
	SwapTokenChange(startTokenBalance, token.balanceOf(this), change);
	token.transfer(user, change);
}
```

## Contract Example
Note that the smart contract below is just an example. How the smart contract functions are modified and incorporated into your DApp is dependent on you to decide.
```
pragma solidity 0.4.18;


import "./ERC20Interface.sol";
import "./KyberNetworkProxy.sol";


contract KyberExample {
	//It is possible to take minRate from kyber contract, but best to get it from user.
	
	KyberNetworkProxy kyber;
	ERC20 constant internal ETH_TOKEN_ADDRESS = ERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);
	
	function UsingKyberExample(KyberNetworkProxy _kyber) public {
		require(_kyber != address(0));
		kyber = _kyber;
		}
		
	//must have default payable since this contract expected to receive change	
	function() public payable {}
	
	//@param srcToken valid token address
	//@param srcQty in token wei
	//@param destToken valid token address
	//@param destAddress where to send swapped tokens to
	function swapTokenToToken (ERC20 srcToken, uint srcQty, ERC20 destToken, address destAddress) public {}
		uint minRate;
		(, minRate) = kyber.getExpectedRate(srcToken, destToken, srcQty);
		
		//here can also send some user address to transfer from
		require(srcToken.transferFrom(msg.sender, this, srcQty));
		
		//approve tokens so network can take them during the swap
		srcToken.approve(address(kyber), srcQty);
		uint destAmount = kyber.swapTokenToToken(srcToken, srcQty, destToken, minRate);
		
		//send received tokens to destination address
		require(destToken.transfer(destAddress, destAmount));
		}
	
	//@dev notice this contract must have etherQtyWei. or it can be sent when calling this function.
	function swapEtherToToken (ERC20 token, uint etherQtyWei, address destAddress) public payable {
		uint minRate;
		(, minRate) = kyber.getExpectedRate(ETH_TOKEN_ADDRESS, token, etherQtyWei);
		
		//will send back tokens to this contract's address
		uint destAmount = kyber.swapEtherToToken.value(etherQtyWei)(token, minRate);
		
		//send received tokens to destination address
		require(token.transfer(destAddress, destAmount));
		}
			
	//@param token valid token address
	//@param tokenQty in token wei
	//@param destAddress where to send swapped ethers to
	function swapTokenToEther (ERC20 token, uint tokenQty, address destAddress) public {
		uint minRate;
		(, minRate) = kyber.getExpectedRate(token, ETH_TOKEN_ADDRESS, tokenQty);
		
		require(token.transferFrom(msg.sender, this, tokenQty));
		
		token.approve(address(kyber), tokenQty);
		uint destAmount = kyber.swapTokenToEther(token, tokenQty, minRate);
		
		//send received ethers to destination address
		require(destAddress.transfer(destAmount));
		}
		
	event SwapTokenChange(uint balanceBefore, uint balanceAfter, uint change);
	
	//@param srcToken a valid token address
	//@param srcQty in token wei
	//@param destToken valid token address
	//@param destAddress where to send swap result
	//@param user where to get tokens from and and send change to
	//@param maxDestQty max number of tokens in swap outcome. will be sent to destAddress
	//@param minRate minimum conversion rate for this swap
	function swapTokenToTokenWithChange (
		ERC20 srcToken, 
		uint srcQty, 
		ERC20 destToken, 
		address destAddress,
		address user, 
		uint maxDestQty, 
		uint minRate
	)
		public
	{
		uint startSrcBalance = srcToken.balanceOf(this);
		
		require(srcToken.transferFrom(user, this, srcQty));
		srcToken.approve(address(kyber), srcQty);
		
		kyber.trade(srcToken, srcQty, destToken, destAddress, maxDestQty, minRate, 0);
		uint change = srcToken.balanceOf(this) - startSrcBalance;
		
		SwapTokenChange(startSrcBalance, srcToken.balanceOf(this), change);
		srcToken.transfer(user, change);
	}
				
	event SwapEtherChange(uint startBalance, uint currentBalance, uint change);
	function swapEtherToTokenWithChange (
		ERC20 token, 
		uint etherQtyWei, 
		address destAddress, 
		address user, 
		uint minRate, 
		uint maxDestQty
	)
		public
		payable
	{
		uint startEthBalance = this.balance;
		
		//will send tokens to dest address. change will be sent to this contract.
		kyber.trade.value(etherQtyWei)(ETH_TOKEN_ADDRESS, etherQtyWei, token, destAddress, maxDestQty, minRate, 0);
			
		uint change = this.balance - (startEthBalance - etherQtyWei);
			
		SwapEtherChange(startEthBalance, this.balance, change);
			
		//here change sent to user. could also be sent to msg.sender
		user.transfer(change);
	}
	
	function swapTokenToEtherWithChange (
		ERC20 token, 
		uint tokenQty, 
		address destAddress, 
		address user, 
		uint minRate,
		uint maxDestQty
	)
		public
	{
		uint startTokenBalance = token.balanceOf(this);
		
		require(token.transferFrom(user, this, tokenQty));
		token.approve(address(kyber), tokenQty);
		
		kyber.trade(token, tokenQty, ETH_TOKEN_ADDRESS, destAddress, maxDestQty, minRate, 0);
		uint change = token.balanceOf(this) - startTokenBalance;
			
		SwapTokenChange(startTokenBalance, token.balanceOf(this), change);
		token.transfer(user, change);
	}
}
```
---
id: SmartContractOverview
title: Smart Contract Overview
---
## Introduction

The main smart contract components in the network include [KyberNetworkProxy](api-kybernetworkproxy.md) and [KyberReserve](api-kyberreserve.md) contracts.

## Main Functions

We describe the main functions of the [KyberNetworkProxy](api-kybernetworkproxy.md) contract below:

### Trade function
```js
function trade(
	ERC20 src,
	uint srcAmount,
	ERC20 dest,
	address destAddress,
	uint maxDestAmount,
	uint minConversionRate,
	address walletId
)
```

**Notes:**<br>
* To convert all tokens, set `maxDestAmount = MAX_UINT`. It should **not** be `0`.
* `destAddress` is a account to send the destination tokens to (not a contract).
* ETH token address = `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`
* If `src` is ETH, then you also need to send ether along with your call. 
* If `src` is an ERC20 token, then you need to call `token.approve(kyber_network_proxy_address, amount)` before your call.

**Important:** any value below 1000 wei/tokens is considered 0. Deals must be over 1000 wei (1000 tokens).

### getExpectedRate function
```js
  function getExpectedRate(ERC20 src, ERC20 dest, uint srcQty) public view returns(uint expectedRate, uint slippageRate);
```
The function returns the expected and slippage token exchange rate. Note that these returned values are in **18 decimals** regardless of the destination token's decimals
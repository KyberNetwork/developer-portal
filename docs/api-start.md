---
id: APIs
title: Getting Started
---
## Introduction

The Reference section provides in-depth information and documentation about the Kyber Network protocol, smart contracts and rest APIs. Details of each smart contract are well documented and can be found in their respective sections. If you wish to learn more about the specifications of our smart contracts, please refer to this [section](api-overview-smartcontract.md). The RESTful APIs give users (without understanding of smart contracts) the ability to interact with our smart contract functions. More details about our RESTful API can be found [here](api-overview-rest.md).

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

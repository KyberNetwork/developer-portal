---
id: APIs
title: Smart Contract Reference
---
## Introduction

There are three main smart contract components in the network including KyberNetwork, KyberReserve, and KyberWallet contracts.

## Main Functions

We describe the main functions of the Kyber Network contract as below:

### Trade function
```js
function trade( ERC20 source, uint srcAmount,
                ERC20 dest, address destAddress, uint maxDestAmount,
                uint minConversionRate,
                bool throwOnFailure )
```

`throwOnFailure = false`
`maxDestAmount = MAX_UINT`
`destAddress` is a simple account (not a contract).


token address = 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee means the token is ETH.
If source is ETH then you also need to send ether along with your call.
If source is token, then you need to call token.approve(kyber network address, amount) before your call.

Important notice: any value below 1000 wei/tokens is considered 0. Deals must be over 1000 wei (1000 tokens).

### getRate function

```js
  function getRate( ERC20 source, ERC20 dest, uint reserveIndex ) constant returns( uint rate, uint expBlock, uint balance );
```

`reserveIndex` should be 0.
The function returns three numbers (guessing in web3 it is an array of size 3. It is like that in truffle) including rate, expiration block and balance (how many tokens reserve has).


## Kyber wallet contract

Kyber wallet integrates with existing Kyber Network.

A user needs to deploy [this](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberWallet.sol) contract with c'tor param
`_kyberNetwork = 0x11542d7807dfb2b44937f756b9092c76e814f8ed`.

Then user should send ether and/or tokens to the contract. It can be in a standard way (just `send` or `transfer` ether or tokens to contract address).

The function to call is
```js
function convertAndCall( ERC20 srcToken, uint srcAmount,
                         ERC20 destToken, uint maxDestAmount,
                         uint minRate,
                         address destination,
                         bytes   destinationData,
                         bool onlyApproveTokens,
                         bool throwOnFail )
```

If `onlyApproveTokens = true` and `destToken` is not ETH, then function does not transfer tokens to destination, instead it is just appoving it.
If `destinationData` is an empty array, then then default function is called in destination (and destination could also be a standard account).
It is probably better to first try with empty data.
An example to non-empty data can be found [here](https://github.com/KyberNetwork/smart-contracts/blob/master/test/firstscenario.js#L364) and [here](https://github.com/KyberNetwork/smart-contracts/blob/master/test/firstscenario.js#L391).

For basic testings, it is possible to set the wallet as destination address and make the transfer invoke `recieveEther` and `recieveTokens`.

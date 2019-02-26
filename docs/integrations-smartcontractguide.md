---
id: Integrations-SmartContractGuide
title: Smart Contract
---
## Introduction
This guide will walk you through on how you can interact with our protocol implementation at a smart contract level. The most common group of users that can benefit from this guide are Dapps.

## Overview
We will cover 2 scenarios of integration; the first being a new smart contract integration with our smart contracts. The second is integrating an already deployed smart contract with our protocol implementation.

## Things to note
1) If possible, minimise the use of `msg.sender` within your smart contract. If you were to call a function within the wrapper contract, `msg.sender` [is the wrapper contract address]((https://ethereum.stackexchange.com/questions/28972/who-is-msg-sender-when-calling-a-contract-from-a-contract) instead of your wallet address.
2) We will make use of the [ERC20 Interface](https://github.com/KyberNetwork/smart-contracts/blob/developV2/contracts/ERC20Interface.sol) and [KyberNetworkProxy](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberNetworkProxy.sol) smart contracts
3) The main functions to incorporate into your smart contract(s) are `getExpectedRate()` and `trade() ` of `KyberNetworkProxy.sol`.
4) When converting from Token to ETH/Token, the user is required to call the `approve` function **first** to give an allowance to the smart contract executing the `transferFrom` function.
5) To prevent user front running, the contract limits the gas price trade transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.

```js
let maxGasPrice = await KyberNetworkProxyContract.methods.maxGasPrice().call()
```

## New Smart Contract Integration
### Pragma and imports
We will be using Solidity compiler version 0.4.18 for deploying our sample contract. You are free to use later compiler versions but note that you will [not be able to interact with any tokens that are deployed with versions earlier than 0.4.22](
https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca?ref=tokendaily).  


```
pragma solidity 0.4.18;

import "./ERC20Interface.sol";
import "./KyberNetworkProxy.sol";
```

### Define variables and events
Next, we want to define all variables and events that will be used
```
// Variables
KyberNetworkProxy public kyberNetworkProxyContract;

// Events
event Swap(address indexed sender, ERC20 srcToken, ERC20 destToken);
```

### Define a function to get conversion rates
```
/**
 * @dev Gets the conversion rate for the destToken given the srcQty.
 * @param srcToken source token contract address
 * @param srcQty amount of source tokens
 * @param destToken destination token contract address
 */
function getConversionRates(
    ERC20 srcToken,
    uint srcQty,
    ERC20 destToken
) public
  view
  returns (uint, uint)
{
  return kyberNetworkProxyContract.getExpectedRate(srcToken, destToken, srcQty);

}
```

### Define a function to perform the token trade
```
/**
 * @dev Swap the user's ERC20 token to another ERC20 token/ETH
 * @param srcToken source token contract address
 * @param srcQty amount of source tokens
 * @param destToken destination token contract address
 * @param destAddress address to send swapped tokens to
 * @param maxDestAmount address to send swapped tokens to
 */
function executeSwap(
    ERC20 srcToken,
    uint srcQty,
    ERC20 destToken,
    address destAddress,
    uint maxDestAmount
) public {
    uint minConversionRate;

    // Check that the token transferFrom has succeeded
    require(srcToken.transferFrom(msg.sender, address(this), srcQty));

    // Mitigate ERC20 Approve front-running attack, by initially setting
    // allowance to 0
    require(srcToken.approve(address(kyberNetworkProxyContract), 0));

    // Set the spender's token allowance to tokenQty
    require(srcToken.approve(address(kyberNetworkProxyContract), srcQty));

    // Get the minimum conversion rate
    (minConversionRate,) = kyberNetworkProxyContract.getExpectedRate(srcToken, destToken, srcQty);

    // Swap the ERC20 token and send to destAddress
    kyberNetworkProxyContract.trade(
        srcToken,
        srcQty,
        destToken,
        destAddress,
        maxDestAmount,
        minConversionRate,
        0
    );

    // Log the event
    Swap(msg.sender, srcToken, destToken);
}
```

### Full Code Example
```
pragma solidity ^0.4.18;

import "./ERC20Interface.sol";
import "./KyberNetworkProxy.sol";

contract MyContract {
    // Variables
    KyberNetworkProxy public kyberNetworkProxyContract;

    // Events
    event Swap(address indexed sender, ERC20 srcToken, ERC20 destToken);

    // Functions
    /**
     * @dev Contract constructor
     * @param _kyberNetworkProxyContract KyberNetworkProxy contract address
     */
    function MyContract(
        KyberNetworkProxy _kyberNetworkProxyContract
    ) public {
        kyberNetworkProxyContract = _kyberNetworkProxyContract;
    }

    /**
     * @dev Gets the conversion rate for the destToken given the srcQty.
     * @param srcToken source token contract address
     * @param srcQty amount of source tokens
     * @param destToken destination token contract address
     */
    function getConversionRates(
        ERC20 srcToken,
        uint srcQty,
        ERC20 destToken
    ) public
      view
      returns (uint, uint)
    {
      return kyberNetworkProxyContract.getExpectedRate(srcToken, destToken, srcQty);

    }

    /**
     * @dev Swap the user's ERC20 token to another ERC20 token/ETH
     * @param srcToken source token contract address
     * @param srcQty amount of source tokens
     * @param destToken destination token contract address
     * @param destAddress address to send swapped tokens to
     * @param maxDestAmount address to send swapped tokens to
     */
    function executeSwap(
        ERC20 srcToken,
        uint srcQty,
        ERC20 destToken,
        address destAddress,
        uint maxDestAmount
    ) public {
        uint minConversionRate;

        // Check that the token transferFrom has succeeded
        require(srcToken.transferFrom(msg.sender, address(this), srcQty));

        // Mitigate ERC20 Approve front-running attack, by initially setting
        // allowance to 0
        require(srcToken.approve(address(kyberNetworkProxyContract), 0));

        // Set the spender's token allowance to tokenQty
        require(srcToken.approve(address(kyberNetworkProxyContract), srcQty));

        // Get the minimum conversion rate
        (minConversionRate,) = kyberNetworkProxyContract.getExpectedRate(srcToken, destToken, srcQty);

        // Swap the ERC20 token and send to destAddress
        kyberNetworkProxyContract.trade(
            srcToken,
            srcQty,
            destToken,
            destAddress,
            maxDestAmount,
            minConversionRate,
            0
        );

        // Log the event
        Swap(msg.sender, srcToken, destToken);
    }
}
```
## Existing Smart Contract Integration
The steps for integrating an existing smart contract is similar to those of integrating a new smart contract. The only difference is that you'll be wrapping multiple functions from the deployed contracts within a single function in the wrapper contract. You can find an example of a wrapper contract [here](https://etherscan.io/address/0xf462b7dc7d85b416034833ee4f4e40906795c9f4#code).

## Filtering Out Permissionless Reserves
By default, reserves that were listed permissionlessly are also included when performing `getExpectedRate()` and `trade()`. Depending on the jurisdiction where your platform is operating in, you may be required to exclude these reserves. To filter them out, use the `tradeWithHint()` function. Refer to [this section](references-kybernetworkproxy.md#hint) for more information.

## Fee Sharing Program
DApps have the opportunity to join our *Fee Sharing Program*, which allows fee sharing on each swap that originates from your app. Learn more about the program [here](guide-feesharing.md)!
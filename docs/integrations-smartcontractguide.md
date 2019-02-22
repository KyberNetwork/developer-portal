---
id: Integrations-SmartContractGuide
title: Smart Contract
---
## Overview
This guide will walk you through on how you can interact with our protocol implementation at a smart contract level. We will be covering 2 scenarios; the first is integrating with a new contract that has yet to be deployed and the second is integrating with an already deployed contract using a wrapper contract.

## Things to note
1) If possible, minimise the use of `msg.sender` within your smart contract as it makes writing the wrapper contract much harder. You can get more details of it [here](https://ethereum.stackexchange.com/questions/28972/who-is-msg-sender-when-calling-a-contract-from-a-contract).
2) We will make use of the [ERC20 Interface](https://github.com/KyberNetwork/smart-contracts/blob/developV2/contracts/ERC20Interface.sol) and [KyberNetworkProxy](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberNetworkProxy.sol) smart contracts.
3) The main functions to incorporate into your smart contract(s) are `getExpectedRate()` and `trade() ` of `KyberNetworkProxy.sol`.
4) When converting from Token to ETH/Token, the user is required to call the `approve` function **first** to give an allowance to the smart contract executing the `transferFrom` function.
5) To prevent user front running, the contract limits the gas price trade transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.

```js
let maxGasPrice = await KyberNetworkProxyContract.methods.maxGasPrice().call()
```

## New Smart Contract Integration
### Pragma and imports
We will be using solidity version 0.4.18 
```
pragma solidity 0.4.18;

import "./ERC20Interface.sol";
import "./KyberNetworkProxy.sol";
```

### Define constants, events and payable function
```
contract KyberExample {
	//It is possible to take minRate from kyber contract, but best to get it as an input from the user.

	ERC20 constant internal ETH_TOKEN_ADDRESS = ERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);

	event SwapTokenChange(uint balanceBefore, uint balanceAfter, uint change);
	event SwapEtherChange(uint startBalance, uint currentBalance, uint change);

	//must have default payable since this contract expected to receive change
	function() public payable {}

  ...
}
```

### Define a function to get expected rates
```
add sample code
```

### Define a function to perform the token trade
```
add sample code
```

### Full Code Example
```
add sample code
```

## Deployed Smart Contract Integration

add more stuff here.

## Filtering Out Permissionless Reserves
By default, reserves that were listed permissionlessly are also included when performing `getExpectedRate()` and `trade()`. Depending on the jurisdiction where your platform is operating in, you may be required to exclude these reserves. To learn more about how you can filter them out, please refer to the [KyberNetworkProxy reference](references-kybernetworkproxy.md).

## Fee Sharing Program
DApps have the opportunity to join our *Fee Sharing Program*, which allows fee sharing on each swap that originates from your app. Learn more about the program [here](guide-feesharing.md)!

---
id: Integrations-SmartContractGuide
title: Smart Contract
---
[//]: # (tagline)
## Introduction

This guide will walk you through on how you can interact with our protocol implementation at a smart contract level. The most common group of users that can benefit from this guide are Dapps.

We break the guide into 2 sections:
1. [Trading Tokens](#trading-tokens) - The section covers what contract interfaces to import, and functions to call to fetch rates and perform a simple trade.
2. [Reserve Routing](#reserve-routing) - This section covers the reserve routing feature to include / exclude reserves, or to split trades amongst multiple reserves.

## Risk Mitigation

There are some risks when utilising Kyber. To safeguard users, we kindly ask that you refer to the [Slippage Rates Protection](integrations-slippagerateprotection.md) and [Price Feed Security](integrations-pricefeedsecurity.md) sections on what these risks are, and how to mitigate them.

## Things To Note

1. If possible, minimise the use of `msg.sender` within your smart contract. If you were to call a function within the wrapper contract, `msg.sender` [is the wrapper contract address](https://ethereum.stackexchange.com/questions/28972/who-is-msg-sender-when-calling-a-contract-from-a-contract) instead of your wallet address.
2. If the source token is not ETH (ie. an ERC20 token), the user is required to **first call the ERC20 `approve` function** to give an allowance to the smart contract executing the `transferFrom` function.
3. To prevent front running, the contract limits the gas price trade transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

let maxGasPrice = await KyberNetworkProxyContract.maxGasPrice();
```

## Trading Tokens

### File Import

We will use Solidity compiler version 0.6.6 for deploying our sample contract. The following interfaces are imported for these functionalities:
- [`IERC20.sol`](https://github.com/KyberNetwork/smart-contracts/blob/Katalyst/contracts/sol6/IERC20.sol): Token approvals and transfers. We recommend the usage of [OpenZeppelin's SafeERC20 contract](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/SafeERC20.sol) for these purposes.
- [`IKyberNetworkProxy.sol`](https://github.com/KyberNetwork/smart-contracts/blob/Katalyst/contracts/sol6/IKyberNetworkProxy.sol): Fetch rates and execute trades

```
pragma solidity 0.6.6;

import "./IERC20.sol";
import "./IKyberNetworkProxy.sol";
```

### Proxy Contract Declaration

The network proxy contract can be instantiated as such:

```
IKyberNetworkProxy kyberProxy;
```

### Fetching Rates

Call the `getExpectedRateAfterFee` function of the network proxy contract. The input parameters are explained below.

| Parameter          | Type    | Description                              |
|:------------------:|:-------:|:----------------------------------------:|
| `src`              | IERC20  | source ERC20 token contract address      |
| `dest`             | IERC20  | destination ERC20 token contract address |
| `srcQty`           | uint256 | `src` token wei amount                   |
| `platformFeeBps`   | uint256 | platform fee to be charged, in basis points. Read more about platform fees [here](integrations-platformfees.md) |
| `hint`             | bytes   | hint for reserve routing. hint for reserve routing. Refer to [this section](#reserve-routing) |

**Returns**\
Expected rate for a trade after deducting network and platform fees. To get a 'readable' rate, divide it by 10\*\*18. Refer to the example below.

#### Example

Get the conversion rate of 1 WBTC -> KNC, with a platform fee of 0.25%.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

uint256 expectedRate = kyberNetworkProxyContract.getExpectedRateAfterFee(
    0x2260fac5e5542a773aa44fbcfedf7c193bc2c599, // WBTC token address
    0xdd974d5c2e2928dea5f71b9825b8b646686bd200, // KNC token address
    100000000, // 1 WBTC
    25, // 0.25%
    '' // empty hint
    );

// expectedRate = 7980824281140923034320
// 7980824281140923034320 / 1e18 = 7980.824 => 1 WBTC = 7980.824 KNC
```

### Trade Execution

Call the `tradeWithHintAndFee` function of the network proxy contract. The input parameters are explained below.

| Parameter           | Type    | Description                                  |
|:-------------------:|:-------:|:--------------------------------------------:|
| `src`               | IERC20  | source ERC20 token contract address          |
| `srcAmount`         | uint256 | `src` token wei amount                       |
| `dest`              | IERC20  | destination ERC20 token contract address     |
| `destAddress`       | address | recipient address of `dest` tokens           |
| `maxDestAmount`     | uint256 | limit on maximum `dest` token wei receivable |
| `minConversionRate` | uint256 | minimal conversion rate. If actual rate is lower, trade reverts |
| `platformWallet`    | address | wallet address for receiving platform fees. Read more about platform fees [here](integrations-platformfees.md)  |
| `platformFeeBps`    | uint256 | platform fee to be charged, in basis points. Read more about platform fees [here](integrations-platformfees.md)  |
| `hint`             | bytes    | hint for reserve routing. Refer to [this section](#reserve-routing) |

**Returns**\
Actual `dest` token wei amount sent to `destAddress`

#### Example

Convert 1 ETH to KNC, specifying 0.25% platform fee.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

// Note: msg.value should be the srcQty if src == ETH, 0 otherwise
uint256 actualDestAmount = kyberNetworkProxyContract.tradeWithHintAndFee{value: msg.value}(
    0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee, // ETH address
    1000000000000000000, // 1 ETH
    0xdd974d5c2e2928dea5f71b9825b8b646686bd200, // KNC address
    0x56178a0d5f301baf6cf3e1cd53d9863437345bf9, // destAddress
    9999999999999999999999999999999, // maxDestAmount: arbitarily large to swap full amount
    expectedRate, // minConversionRate: value from getExpectedRate call
    0x56178a0d5f301baf6cf3e1cd53d9863437345bf9, // platform wallet
    25, // 0.25%
    '' // empty hint
    );
```

### Code Example

**Note: The following code is not audited and should not be used in production. If so, it is done at your own risk.**

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

pragma solidity 0.6.6;

import "./IERC20.sol";
import "./IKyberNetworkProxy.sol";

contract MyContract {
    IERC20 internal constant ETH_TOKEN_ADDRESS = IERC20(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    IKyberNetworkProxy kyberProxy;
    address payable public platformWallet;
    uint256 public platformFeeBps;

    // constructor
    // _platformWallet: To receive platform fees
    // _platformFeeBps: Platform fee amount in basis points
    constructor(
        IKyberNetworkProxy _kyberProxy,
        address payable _platformWallet,
        uint256 _platformFeeBps
        ) public
    {
        kyberProxy = _kyberProxy;
        platformWallet = _platformWallet;
        platformFeeBps = _platformFeeBps;
    }

    /// @dev Get the conversion rate for exchanging srcQty of srcToken to destToken
    function getConversionRates(
        IERC20 srcToken,
        IERC20 destToken,
        uint256 srcQty
    ) public
      view
      returns (uint256)
    {
      return kyberProxy.getExpectedRateAfterFee(srcToken, destToken, srcQty, platformFeeBps, '');
    }

    /// @dev Swap from srcToken to destToken (including ether)
    function executeSwap(
        IERC20 srcToken,
        uint256 srcQty,
        IERC20 destToken,
        address payable destAddress,
        uint256 maxDestAmount
    ) external payable {
        if (srcToken != ETH_TOKEN_ADDRESS) {
            // check that the token transferFrom has succeeded
            // we recommend using OpenZeppelin's SafeERC20 contract instead
            // NOTE: msg.sender must have called srcToken.approve(thisContractAddress, srcQty)
            require(srcToken.transferFrom(msg.sender, address(this), srcQty), "transferFrom failed");

            // mitigate ERC20 Approve front-running attack, by initially setting
            // allowance to 0
            require(srcToken.approve(address(kyberProxy), 0), "approval to 0 failed");

            // set the spender's token allowance to tokenQty
            require(srcToken.approve(address(kyberProxy), srcQty), "approval to srcQty failed");
        }

        // Get the minimum conversion rate
        uint256 minConversionRate = kyberProxy.getExpectedRateAfterFee(
            srcToken,
            destToken,
            srcQty,
            platformFeeBps,
            '' // empty hint
        );

        // Execute the trade and send to destAddress
        kyberProxy.tradeWithHintAndFee{value: msg.value}(
            srcToken,
            srcQty,
            destToken,
            destAddress,
            maxDestAmount,
            minConversionRate,
            platformWallet,
            platformFeeBps,
            '' // empty hint
        );
    }
}
```

## Reserve Routing

### Overview

In previous network versions, the `hint` parameter was used to filter permissionless reserves. With Katalyst, we utilise this parameter for routing trades to specific reserves.

There are 4 optional routing rules:
1.  **`BestOfAll`** - This is the default routing rule when no hint is provided, and is the classic reserve matching algorithm used by the Kyber smart contracts since the beginning.
2.  **`MaskIn` (Whitelist)** - Specify a list of reserves to be *included* and perform the `BestOfAll` routing on them
3.  **`MaskOut` (Blacklist)** - Specify a list of reserves to be *excluded* and perform the `BestOfAll` routing on the remaining reserves
4.  **`Split`** - Specify a list of reserves and their respective percentages of the total `srcQty` that will be routed to each reserve.

For token -> token trades, you can specify a routing rule for each half. For example, a `MaskIn` route can be used for the token -> ether side, while a `Split` route can be used for the ether -> token side.

### Recommendation

We strongly recommend for the building of hints to be performed off-chain to save gas costs, and we have not discovered a use case for it to be done on-chain yet. You can do so using [ethers](integrations-smartcontractguide.md#building-hints) or the [`/hint` RESTful API](integrations-restfulapiguide.md#building-hints). Nevertheless, this guide explains how you may do the building of hints on-chain.

### File Import

We will use Solidity compiler version 0.6.6 for deploying our sample contract. The following interfaces are imported for these functionalities:

- [`IKyberStorage.sol`](https://github.com/KyberNetwork/smart-contracts/blob/Katalyst/contracts/sol6/IKyberStorage.sol): Fetching reserve IDs. For more information about reserve IDs, refer to [this section](reserves-resIDs.md).
- [`IKyberHint.sol`](https://github.com/KyberNetwork/smart-contracts/blob/Katalyst/contracts/sol6/IKyberHint.sol): Building and parsing of hints
- [`IERC20.sol`](https://github.com/KyberNetwork/smart-contracts/blob/Katalyst/contracts/sol6/IERC20.sol): The `IERC20` input parameter of building / parsing hints

```
pragma solidity 0.6.6;

import "./IKyberHint.sol";
import "./IKyberStorage.sol";
```

### Contract Variable Declarations

The kyberStorage and kyberHintHandler contracts can be instantiated as such:

```
IKyberHint kyberHintHandler;
IKyberStorage kyberStorage;
```

### Fetching Reserve IDs

For the token -> ether side of the trade, call `getReserveIdsPerTokenSrc` of the kyberStorage contract.
For the ether -> token side of the trade, call `getReserveIdsPerTokenDest` of the kyberStorage contract.

#### Examples

Get reserve IDs for WBTC -> ETH

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

bytes32[] memory reserveIds = kyberStorage.getReserveIdsPerTokenSrc(WBTC_ADDRESS);
```

Get reserve IDs for ETH -> KNC

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

bytes32[] memory reserveIds = kyberStorage.getReserveIdsPerTokenDest(KNC_ADDRESS);
```

### Building Hints

- For token -> ether trades, call the `buildTokenToEthHint` function
- For ether -> token trades, call the `buildTokenToEthHint` function
- For token -> token trades, call the `buildTokenToTokenHint` function

Their input parameters are explained below:
| Parameter              | Type      | Description                                     |
|:----------------------:|:---------:|:-----------------------------------------------:|
| `tokenSrc`             | IERC20    | source ERC20 token contract address             |
| `tokenToEthType`       | TradeType | `BestOfAll`, `MaskIn`, `MaskOut` or `Split`     |
| `tokenToEthReserveIds` | bytes32[] | list of reserve IDs for token -> ether trade    |
| `tokenToEthSplits`     | uint256[] | percentages (in basis points) for `Split` trade |
| `tokenDest`            | IERC20    | source ERC20 token contract address             |
| `ethToTokenType`       | TradeType | `BestOfAll`, `MaskIn`, `MaskOut` or `Split`     |
| `ethToTokenReserveIds` | bytes32[] | list of reserve IDs for token -> ether trade    |
| `ethToTokenSplits`     | uint256[] | percentages (in basis points) for `Split` trade |

#### Notes

- The correct builder hint function must be used for the correct trade type. Otherwise, the hint will not be built correctly, and will result in transaction failure.
- For token -> token trades, a combination of TradeTypes are allowed. For example, the token -> eth trade can be `BestOfAll`, while the eth -> token trade can be `Split`.

### `MaskIn` TradeType

Note that the splits parameter must be empty.

#### Example

Select the first reserve for a WBTC -> ETH trade.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

bytes32[] memory reserveIds = kyberStorage.getReserveIdsPerTokenSrc(WBTC_ADDRESS);
bytes32[] memory includedReserveIds = new bytes32[](1);
includedReserveIds[0] = reserveIds[0];
uint256[] memory emptySplits;

bytes memory hint = kyberHintHandler.buildTokenToEthHint(
    WBTC_ADDRESS,
    IKyberHint.TradeType.MaskIn,
    includedReserveIds,
    emptySplits
);
```

### `MaskOut` TradeType

Note that the splits parameter must be empty.

#### Example

Exclude the first reserve from a WBTC -> ETH trade.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

bytes32[] memory reserveIds = kyberStorage.getReserveIdsPerTokenSrc(WBTC_ADDRESS);
bytes32[] memory excludedReserveIds = new bytes32[](1);
excludedReserveIds[0] = reserveIds[0];
uint256[] memory emptySplits;

bytes memory hint = kyberHintHandler.buildTokenToEthHint(
    WBTC_ADDRESS,
    IKyberHint.TradeType.MaskIn,
    excludedReserveIds,
    emptySplits
);
```

### `Split` TradeType

Note that the splits values must add up to `10000` (100%).

#### Example

Split evenly among 2 reserves for a ETH -> KNC trade.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

bytes32[] memory reserveIds = kyberStorage.getReserveIdsPerTokenDest(KNC_ADDRESS);
bytes32[] memory splitReserveIds = new bytes32[](2);
splitReserveIds[0] = reserveIds[0];
splitReserveIds[1] = reserveIds[1];
uint256[] memory splits = new uint256[](2);
splits[0] = 5000;
splits[1] = 5000;

bytes memory hint = kyberHintHandler.buildEthToTokenHint(
    KNC_ADDRESS,
    IKyberHint.TradeType.Split,
    splitReserveIds,
    splits
);
```

### `BestOfAll` TradeType
- The `BestOfAll` TradeType is primarily for specifying the `BestOfAll` behaviour for one side of token -> token trades. It is not needed for token -> ether and ether -> token trades.
- The reserveIds and splits parameters must be empty.

#### Example

For a WBTC -> KNC trade, do a `MaskIn` route for WBTC -> ETH, and `BestOfAll` route for ETH -> KNC.


```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

bytes32[] memory reserveIds = kyberStorage.getReserveIdsPerTokenSrc(WBTC_ADDRESS);
bytes32[] memory includedReserveIds = new bytes32[](1);
includedReserveIds[0] = reserveIds[0];
bytes32[] memory emptyReserveIds;
uint256[] memory emptySplits;

bytes memory hint = kyberHintHandler.buildTokenToTokenHint(
    WBTC_ADDRESS,
    IKyberHint.TradeType.MaskIn,
    includedReserveIds,
    emptySplits,
    KNC_ADDRESS,
    IKyberHint.TradeType.BestOfAll,
    emptyReserveIds,
    emptySplits
);
```

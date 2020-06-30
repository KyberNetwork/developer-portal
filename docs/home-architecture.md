---
id: Home-Architecture
title: Smart Contract Architecture
---
[//]: # (tagline)
## Kyber Core Smart Contract Overview
The three main components of any implementation of the Kyber protocol are the Kyber Core Smart Contracts, the Reserve Interface and the List of Registered Reserves and Token Pairs.

![Smart Contract Overview](/uploads/smartcontractoverview.png "Smart Contract Overview")

In our implementation of the protocol, these 3 components are represented by the `KyberNetwork.sol` and `IKyberReserve.sol` contracts. The `KyberNetworkProxy.sol` contract will act as a single endpoint for makers and takers to interface with in order to interact with our liquidity network. The contract will also contain a list of registered reserves that will be iterated through when processing a trade.

With upgradeability in mind, we have designed some auxiliary contracts, such as `KyberMatchingEngine.sol`, `KyberFeeHandler.sol` and `KyberStorage.sol`, will be deployed to help the main `KyberNetwork.sol` contract achieve the core functionalities of the protocol.

## Reserves Overview
The `IKyberReserve.sol` is the interface that all reserve implementations are required to adhere to.

![Kyber Reserve Interface Overview](/uploads/kyberreserveinterfaceoverview.png "Kyber Reserve Interface Overview")

Our existing codebase contains 3 types of reserves; Fed Price Reserve, Automated Price Reserve and the Orderbook Reserve. The functions of these reserves are encapsulated within the `KyberReserve.sol` contract. While each reserve type was designed with different features in mind, they share a common goal of contributing liquidity to the network.

### Fed Price Reserve
![Fed Price Reserve](/uploads/fedpricereserve.png "Fed Price Reserve")

The Fed Price Reserve (FPR) is our first type of reserve, offering reserve managers full control and flexibility over their pricing algorithm. However, the flexibility of managing a Fed Price Reserve came with a relatively steep learning curve and development costs that arose from having to build, run, and maintain an off-chain server and/or scripts to feed prices on-chain.

The FPR and conversion rates are represented by the `KyberReserve.sol` and `ConversionRates.sol` contracts respectively. The token conversion rates are fed to the `ConversionRates.sol` contract by the reserve managers. Furthermore, they also have the option of defining the upper and lower limits on the conversion rates via the `SanityRates.sol` contract.

### Automated Price Reserve
![Automated Price Reserve](/uploads/automatedpricereserve.png "Automated Price Reserve")

The Automated Price Reserve (APR) is the second type of reserve, which was designed with ease of maintenance as the top consideration. Unlike the Fed Price Reserve (FPR), reserve managers of the APR will delegate the control of their pricing strategy to a predefined algorithm set in the smart contract. But in exchange, they will no longer incur the development costs that arose from having to build, run, and maintain an off-chain server and/or scripts to feed prices on-chain.

Like the FPR, the APR can also be represented by the `KyberReserve.sol` contract. Reserve managers will instead interact with the `LiquidityConversionRates.sol` contract to [set the initial liquidity parameters](api_abi-liquidityconversionrates.md#setliquidityparams).

### Orderbook Reserve

The Orderbook Reserve will be updated to be compatible with the Katalyst upgrade.
<!-- ![Orderbook Reserve](/uploads/orderbookreserve.png "Orderbook Reserve")

The Orderbook reserve (OR) is another type of reserve which is defined by the `OrderbookReserve.sol` contract. For every instance of the OR, 2 instances of the `OrderList.sol` contracts are needed to keep track of the bid and ask limit orders respectively.

The 2 main features that sets the OR apart from other reserve types is that this is the first reserve type that can be deployed permissionlessly, i.e. any user can create a reserve for any token. Additionally, anyone can contribute to an orderbook reserve and make limit orders to help provide liquidity to the network.   -->

## Maintainer Overview
![Maintainer Overview](/uploads/maintaineroverview.png "Maintainer Overview")

Maintainers are entities within the ecosystem that have access to the functions for adding and removing reserves and token pairs. Currently, the maintainers are Kyber's team members.

## Exchange Overview
The liquidity network allows takers to convert one type of token (e.g. KNC) and receive a different token in return (e.g. DAI) according to the best rates provided by the reserves. The entire process happens in a single atomic transaction, so we can be assured that there is no partial execution of a trade. A conversion between KNC to DAI is depicted in the diagram below:

![KNC to DAI](/uploads/knctodai.png "KNC to DAI")

* A taker (e.g. end user wallets, smart contracts, trading bots) initiates the trade function from `KyberNetworkProxy.sol`.
* `KyberNetworkProxy.sol` forwards the trade request to `KyberNetwork.sol`.
* `KyberNetwork.sol` calls `KyberMatchingEngine.sol` to fetch the list of reserves supporting the KNC-ETH and ETH-DAI trade.
* `KyberMatchingEngine.sol` calls `KyberStorage.sol` to fetch the full reserves list.
* `KyberMatchingEngine.sol` applies the user-specified reserve route(s) for the trades, and returns the final reserve list to `KyberNetwork.sol`.
* `KyberNetwork.sol` queries the rates from each reserves specified in the list. If necessary, a call is made to `KyberMatchingEngine` to determine the best rate(s) for the trade, whilst calculating the trade amounts, network and platform fees required for the trade.
* `KyberNetwork.sol` executes the trades with the reserve(s), who will send the DAI tokens to the taker.
* If there are excess KNC tokens, `KyberNetwork.sol` will send them to the taker.
* Finally, `KyberNetwork.sol` sends the network and platform fees (calculated and collected in ETH) to `KyberFeeHandler`.

## Stack

Starting from the client and ending in the Ethereum blockchain, we can visualize the entire stack as seen in the figure below:

![Stack](/uploads/stack.png "Stack")

## Permissions

Every contract in the Kyber protocol has three permission groups:

### 1. Admin
The admin account is unique (usually cold wallet) and handles infrequent, manual operations like listing new tokens in the exchange. All sensitive operations (e.g. fund related) are limited to the admin address.

### 2. Operators
The operator account is a hot wallet and is used for frequent updates like setting reserve rates and withdrawing funds from the reserve to addresses that have been whitelisted by the admin address.

### 3. Alerters
The alerter account is also a hot wallet and is used halt the execution due to inconsistencies in the system (e.g., strange conversion rates). In such cases, the reserve operation is suspended and can be resumed only by the admin address.

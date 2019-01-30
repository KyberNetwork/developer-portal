---
id: Home-Architecture
title: Smart Contract Architecture
---
## Kyber Core Smart Contract Overview
The three main components of any implementation of the Kyber protocol are the Kyber Core Smart Contracts, the Reserve Interface and the List of Registered Reserves and Token Pairs.

![Smart Contract Overview](/uploads/smartcontractoverview.png "Smart Contract Overview")

In our implementation of the protocol, these 3 components are represented by the `KyberNetwork.sol` and `KyberReserveInterface.sol` contracts. The `KyberNetwork.sol` contract will act as a single endpoint for makers and takers to interface with in order to interact with our liquidity network. Moreover, the contract will also contain a list of registered reserves that will be iterated through when processing a trade.

We designed our solution with upgradeability in mind therefore additional auxiliary contracts (for example, `ExpectedRate.sol`, `FeeBurner.sol` and `KyberNetworkProxy.sol`) will be deployed to help the main `KyberNetwork.sol` contract achieve the core functionalities of the protocol.

## Reserves Overview
The `KyberReserveInterface.sol` is the interface that all reserve implementations are required to adhere to.

![Kyber Reserve Interface Overview](/uploads/kyberreserveinterfaceoverview.png "Kyber Reserve Interface Overview")

Our existing codebase contains 3 types of reserves; Fed Price Reserve, Automated Price Reserve and the Orderbook Reserve. The functions of these reserves are encapsulated within the `KyberReserve.sol` and `OrderbookReserve.sol` contracts. While each reserve type was designed with different features in mind, they share a common goal of contributing liquidity to the network.

### Fed Price Reserve
![Fed Price Reserve](/uploads/fedpricereserve.png "Fed Price Reserve")

The Fed Price Reserve (FPR) is our first type of reserve, offering reserve managers full control and flexibility over their pricing algorithm. However, the flexibility of managing a Fed Price Reserve came with a relatively steep learning curve and development costs that arose from having to build, run, and maintain an off-chain server and/or scripts to feed prices on-chain.

The FPR and conversion rates are represented by the `KyberReserve.sol` and `ConversionRates.sol` contracts respectively. The token conversion rates are fed to the `ConversionRates.sol` contract by the reserve managers. Furthermore, they also have the option of defining the upper and lower limits on the conversion rates via the `SanityRates.sol` contract.

### Automated Price Reserve
![Automated Price Reserve](/uploads/automatedpricereserve.png "Automated Price Reserve")

The Automated Price Reserve (APR) is the second type of reserve, which was designed with ease of maintenance as the top consideration. Unlike the Price Fed Reserve (PFR), reserve managers of the APR will delegate the control of their pricing strategy to a predefined algorithm set in the smart contract. But in exchange, they will no longer incur the development costs that arose from having to build, run, and maintain an off-chain server and/or scripts to feed prices on-chain.

Like the FPR, the APR can also be represented by the `KyberReserve.sol` contract. Reserve managers will instead interact with the `LiquidityConversionRates.sol` contract to [set the initial liquidity parameters](references-liquidityconversionrates.md#setliquidityparams).

### Orderbook Reserve
![Orderbook Reserve](/uploads/orderbookreserve.png "Orderbook Reserve")

The Orderbook reserve (OR) is another type of reserve which is defined by the `OrderbookReserve.sol` contract. For every instance of the OR, 2 instances of the `OrderList.sol` contracts are needed to keep track of the bid and ask limit orders respectively.

The 2 main features that sets the OR apart from other reserve types is that this is the first reserve type that can be deployed permissionlessly, i.e. any user can create a reserve for any token. Additionally, anyone can contribute to an orderbook reserve and make limit orders to help provide liquidity to the network.  

## Maintainer Overview
![Maintainer Overview](/uploads/maintaineroverview.png "Maintainer Overview")

Maintainers are entities within the ecosystem that have access to the functions for adding and removing reserves and token pairs. Currently, there are 2 groups of maintainers that help to perform the aforementioned functions. These maintainers are the Kyber's admin wallet (which is controlled by the core developers) and the `PermissionlessOrderbookReserveLister.sol` contract.  

## Exchange Overview
The liquidity network allows takers to convert one type of token (e.g. KNC) and receive a different token in return (e.g. DAI) according to the best rates provided by the reserves. The entire process happens in a single atomic transaction, so we can be assured that there is no partial execution of a trade. A conversion between KNC to DAI is depicted in the diagram below:

![KNC to DAI](/uploads/knctodai.png "KNC to DAI")

When a taker (e.g. end user wallets, smart contracts, trading bots) initiates the trade function from `KyberNetworkProxy.sol` contract, the proxy contract will forward the trade request to the `KyberNetwork.sol` contract.

An array of reserves that is stored on the `KyberNetwork.sol` contract will then be interated through to find the reserves that provide the best KNC to ETH and ETH to DAI rates. The actual trade amounts will be calculated and the change refunded to the taker. Subsequently, 2 trades will be performed to convert KNC to ETH and from ETH to DAI and the DAI is transferred to the taker.

The takers do not need to pay any additional fees other than the standard Ethereum transaction gas fees. The platform fees are paid for by the reserve / maker that executes the exchange and these fees are subsequently burnt. Note that some fees might be paid to the project that directed the user to the Kyber protocol as part of our [fee sharing program](integrations-feesharing.md).

## Stack

Starting from the client and ending in the Ethereum blockchain, we can visualize the entire stack as seen in the figure below:

![Stack](/uploads/stack.png "Stack")

## Permissions

Every contract in the Kyber protocol has three permission groups:

### 1. Admin
The admin account is unique (usually cold wallet) and handles infrequent, manual operations like listing new tokens in the exchange. All sensitive operations (e.g. fund related) are limited to the admin address.

### 2. Operators
The operator account is a hot wallet and is used for frequent updates like setting reserve rates and withdrawing funds from the reserve to certain destinations (e.g. when selling excess tokens in the open market).

### 3. Alerters
The alerter account is also a hot wallet and is used to alert the admin of inconsistencies in the system (e.g., strange conversion rates). In such cases, the reserve operation is halted and can be resumed only by the admin account.

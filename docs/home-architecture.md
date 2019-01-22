---
id: Home-Architecture
title: Smart Contract Architecture
---
## Kyber Core Smart Contract Overview
The three main components of any implementation of the Kyber protocol are the Kyber Core Smart Contracts, the Reserve Interface and the List of Registered Reserves and Token Pairs. 

![Smart Contract Overview](/uploads/smartcontractoverview.png "Smart Contract Overview")

In our implementation of the protocol, these 3 components are represented by the `KyberNetwork.sol` and `KyberReserveInterface.sol` contracts. The `KyberNetwork.sol` contract will act as a single endpoint for makers and takers to interface with in order to interact with our liquidity network. Moreover, the contract will also contain a list of registered reserves that will be iterated through when processing a trade. 

To future-proof our solution, we designed it with upgradeability in mind. Therefore, additional auxiliary contracts (for example, `ExpectedRate.sol`, `FeeBurner.sol` and `KyberNetworkProxy.sol`) will be deployed to help the main `KyberNetwork.sol` contract achieve the core functionalities of the protocol. 

## Reserves Overview
The `KyberReserveInterface.sol` is the interface that all reserve implementations are required to adhere to. 

![Kyber Reserve Interface Overview](/uploads/kyberreserveinterfaceoverview.png "Kyber Reserve Interface Overview")

Our existing codebase contains 3 types of reserves; Fed Price Reserve, Automated Price Reserve and the Orderbook Reserve. The functions of these reserves are encapsulated within the `KyberReserve.sol` and `OrderbookReserve.sol` contracts. While each reserve was designed with different features in mind, they share a common goal of contributing liquidity to the network. 

### Fed Price Reserve
![Fed Price Reserve](/uploads/fedpricereserve.png "Fed Price Reserve")

The Fed Price Reserve (FPR) is our first type of reserve, offering reserve managers full control and flexibility over their pricing algorithm. There is however a steeper learning curve and additional financial costs involved with running a server to feed prices on-chain.

The FPR and conversion rates are represented by the `KyberReserve.sol` and `ConversionRates.sol` contracts respectively. The token conversion rates are fed to the `ConversionRates.sol` contract by the reserve managers. Moreover, they also have the option of defining the upper and lower limits on the conversion rates via the `SanityRates.sol` contract.

### Automated Price Reserve
![Automated Price Reserve](/uploads/automatedpricereserve.png "Automated Price Reserve")

The Automated Price Reserve (APR) is the second type of reserve which was designed with ease of maintenance as the top consideration. Unlike the Price Fed Reserve (PFR), reserve managers of the APR will delegate some control of their pricing strategy to a [predefined algorithm](https://ipfs.io/ipfs/QmXaBUKx9MJwfT1B2hopqXQYZSK7M6dgTUMFMeSXX7SThj). But in exchange, they will no longer incur the financial costs that arises from having to run their own server.

Like the PFR, the APR can also be represented by the `KyberReserve.sol` contract. Reserve managers will instead interact with the `LiquidityConversionRates.sol` contract to [set the initial liquidity parameters](references-liquidityconversionrates.md#setliquidityparams). 

### Permissionless Orderbook Reserve
![Orderbook Reserve](/uploads/orderbookreserve.png "Orderbook Reserve")

The permissionless orderbook reserve (POR) is our newest type of reserve. The 2 main features that sets the POR apart from other reserve types is that this is our very first permissionless reserve. The permissionless nature of the POR allows any user to create an orderbook reserve for any tokens permissionlessly. The second feature can be found in the name of the POR; that it is an orderbook reserve. With the POR, any users can now easily make limit orders as opposed to being restricted to reserve managers only.

The POR is defined by the `OrderbookReserve.sol` contract. As token rates are determined by the available limit orders, supplementary contracts `Orderlist.Sol` and `OrderIdManager.sol` are required to keep track of the orders. 

## Maintainer Overview
![Maintainer Overview](/uploads/maintaineroverview.png "Maintainer Overview")

Maintainers are entities within the ecosystem that have access to the functions for adding and removing reserves and token pairs. In our current implementation of the protocol, the 2 groups of maintainers are the Kyber's admin wallet and the `PermissionlessOrderbookReserveLister.sol` contract. These maintainers are in charge of the

## Exchange Overview
The liquidity network allows takers to convert one type of token (e.g. KNC) and receive a different token in return (e.g. DAI) according to the rates provided by the reserve. The entire process happens in a single atomic transaction so we can be assured that there is no partial execution of a trade. A conversion between KNC to DAI is depicted in the diagram below:

![KNC to DAI](/uploads/knctodai.png "KNC to DAI")

When a taker (e.g. user, smart contract, trading bots) initiates the trade function from `KyberNetworkProxy.sol` contract which will in turn call the tradeWithHint function from `KyberNetwork.sol` contract. 




---
## Overview



The conversion is possible thanks to reserve contracts that hold inventories of tokens and provide conversion rates to `KyberNetwork.sol`. The token inventory and price feeds of permissioned reserves are managed by a reserve manager while that of the permissionless reserves are run by the community.  

The takers do not need to pay any additional fees other than the standard Ethereum transaction gas fees. The platform fees are paid for by the reserve / maker that executes the exchange and these fees are subsequently burnt. Note that some fees might be paid to the project that directed the user to the Kyber protocol as part of our [fee sharing program](guide-feesharing.md).

## Detailed Exchange Flow

When a trade is executed, the `KyberNetwork.sol` contract queries rates from all the reserves offering the required token (i.e., calls `KyberReserve.sol`). From the conversion rate, the token amount of the exchange is estimated.

The `KyberNetwork.sol` contract transfers user's funds to the reserve with the best rate, receives the destination token from the reserve and sends it to the destination address. After the exchange, the contract burns the platform fees and transfers some of the fees to the affiliated wallet. The exchange flow is depicted in the diagram below:
![BAT to DAI](/uploads/tokentotokenswap.png "BAT to DAI")

## Stack

Starting from the client and ending in the Ethereum blockchain, we can visualize the entire stack as seen in the figure below:

![Stack](/uploads/stack.png "Stack")

## Permissions

Every contract in the Kyber protocol has three permission groups:

### 1. Admin
The admin account is unique (usually cold wallet) and handles infrequent, manual operations like listing new tokens in the exchange. All sensitive operations (e.g. fund related) are limited to the Admin address.

### 2. Operators
The operator account is a hot wallet and is used for frequent updates like setting reserve rates and withdrawing funds from the reserve to certain destinations (e.g. when selling excess tokens in the open market).

### 3. Alerters
The alerter account is also a hot wallet and is used to alert the admin of inconsistencies in the system (e.g., strange conversion rates). In such cases, the reserve operation is halted and can be resumed only by the admin account.






---



## Detailed Exchange Flow



![Exchange Flow](/uploads/high-level-2.png "Exchange Flow")

## Reserve Flow

The reserve’s role is to execute exchanges and provide rates for `KyberNetwork.sol`. The reserve contract has no direct interaction with the end users but rather, with the reserve operator who manages the token inventory and feeds exchange rates every few minutes.

The exchange process, from `KyberReserve.sol`'s point of view is depicted in the figure below:

![Reserve Flow](/uploads/high-level-3.png "Reserve Flow")

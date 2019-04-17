---
id: Home-ProtocolOverview
title: Protocol Overview
---
![Protocol Overview](/uploads/protocoloverview.png "Protocol Overview")

The protocol implementation consists of a set of network contract(s), a reserve interface and a list of registered reserves and token pairs. The network diagram above shows an overview of the various actors that interacts with the protocol implementation.

## Network Actors
### Kyber Core Smart Contracts
The Kyber Core Smart Contracts contains the implementation of the major protocol functions to allow actors to join and interact with the network. The method signatures of these functions can be seen in the next diagram.

![Kyber Core Smart Contracts](/uploads/kybercoresmartcontracts.png "Kyber Core Smart Contracts")

Additional information about these functions can be found [here](api_abi-kybernetwork.md).

### Takers
A taker is an entity that takes the liquidity provided by the registered reserves by calling the `tradeWithHint()` function in the Kyber Core Smart Contracts to trade from one token to another token. A taker can be any blockchain entity including end user address, decentralized exchanges, or any smart contracts.

### Reserves
Reserves are liquidity providers in the network that contributes liquidity in terms of tokens inventory and prices on their smart contracts.

#### Reserve Interface
![Reserve Interface](/uploads/reserveinterface.png "Reserve Interface")
The reserve interface defines the contract functions which reserves are required to conform to. Note that the reserve interface above is a general template of what the reserve interface should look like. The interface may be tweaked further to better suit the needs of the respective blockchains.

Only by complying with the interface will network maintainers be able to register a reserve to the Kyber Core Smart Contracts. The exact implementation details of how reserves determine prices and manage its inventory is not explicitly defined in the protocol and is at the discretion of the developers of these reserves.

#### Registered Reserve
A list of reserves that will be iterated through when rates are queried or to facilitate a trade.

### Maintainers
Maintainers refer to anyone who has permissions to access the functions for the adding/removing of reserves and token pairs, such as a DAO or the team behind the protocol implementation.

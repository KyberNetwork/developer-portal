---
id: Reserves-Intro
title: Overiew
---
[//]: # (tagline)
### Overview Of Kyber Reserve System 

Reserves are liquidity sources in Kyber Network that provide liquidity in terms of token inventory and prices on their smart contracts. There is no limitation to the design of the reserve, as long as it adheres to the Kyber Reserve Interface, is secure, and does not introduce high gas costs for takers.

When a taker requests a trade, the protocol will scan the entire network to find the reserve with the best price and take liquidity from that particular reserve. The details for how reserves determine the prices and manage their inventory is not dictated in the protocol and is entirely up to the reserves, as long as the implementation complies with the Reserve Interface.

![Request for Trade](/uploads/request.png "Request for Trade")

Kyber’s Reserve Routing mechanism also allows trades to pass through predetermined reserves, saving gas costs, and allowing many more reserves to be added to the network. That opens up a wide range of reserve types/models that can be part of the network including manually managed reserves (i.e. having market makers to actively manage the prices and inventory), automated market making reserves, as well as many other on-chain liquidity sources. 


## RESERVE MODELS

Reserve models are unique smart contracts which can be deployed and added to the Kyber Network, catering to specific DeFi liquidity provision use cases. Once deployed and added, it will serve as a production reserve on Kyber. 

There are many reserve models available for different use cases. Based on their needs, anyone can deploy reserves using the reserve model of their choice, before registering it to the Protocol Smart Contracts and subsequently contributing liquidity to it. If there are no suitable reserve models, developers can create or customize a new model that is tailor-made for their needs.

# Examples Of Reserve Models

Anyone can use/customize existing models or create completely new ones. Here are examples of reserve models that have been deployed by Kyber and the ecosystem

![Reserve Deployment](/uploads/deploy.png "Reserve Deployment")

There are currently 3 ways you can deploy reserves :

1. `Deploy existing reserve models:` One can opt to deploy any of the existing reserve models, such as our APR, FPR if you are  a token team willing to provide liquidity for the token, or are a professional market making team offering liquidity on kyber. More details [here](Reserves-automatedpricereserve.md).

2. [`Customizing Existing Reserve Models:`] (reserves-Customize.md) If there's a specific requirement which can be tailored or can be added as an extension to the reserve models, teams can also decide to customize the existing reserve types to suit their needs.

3. [`Creating New Reserve Models:`] (reserves-create.md) If it's a completely new use case, developers will have to design a reserve model from scratch. There is no restriction on the type of reserves that can be developed, as long as the reserve implements the kyberReserve interface. 

- [Learn more about the existing reserve types and how they differ from each other](reserves-types.md)
- [See the requirements for creating a custom reserve type](reserves-requirements.md)

# Options For KyberDAO Pool Operators

Kyber will provide a wide variety of technical options for pool operators, depending on their preference and inclination. This will help to ensure there is a wide range of voting interests being represented. This will, in turn, allow KNC holders to easily stake their tokens and get rewards by choosing a pool operator who aligns with them.

This document will outline the options that pool operators can use to run KyberDAO voting pools, describe the mechanisms behind each option, and highlight the differences in terms of deployment and reward distribution. For 2 of these options, we are working with 2 talented groups of developers - [Protofire.io](Protofire.io) and [Michael Cohen](https://github.com/michaelcohen716).

For all these options, pool operators need to be responsible for understanding the DAO and manually vote for all the campaigns in every epoch. They will be able to determine their own fee structure. They will be incentivized to vote regularly since the rewards (and their fees) are directly proportionate to voting regularly. 

Below we present the list of options for running a voting pool as a pool operator.


## 1. Use The Default KyberDAO Pool Delegation

Pool operators can simply use the default pool delegation built into the KyberDAO to run their pool. This is the simplest option, since the pool operator does not need to deploy any smart contracts, hold the rewards or build a UI (members can delegate from the Kyber.org interface).

However, operators will have to develop their own mechanism for distributing the rewards to the members, since this is not covered by the base KyberDAO.


### How it works:

*   KNC holders can delegate their KNC to your pool using the default Kyber.org interface or through your own custom interface. 
*   You are the pool operator and they will become your pool members.
*   The KNC delegated to you will be non-custodial, i.e. you can vote on the behalf of your pool members with their KNC staking power but you have no control over the KNC delegated to you.
*   You will have to claim and hold the ETH rewards, and develop your own mechanisms for tracking your pool rewards and distributing them to your pool members.
*   ETH rewards distribution from the KyberDAO to your pool can be tracked on-chain. 

See [here](delegating-example.md) for details on how the default KyberDAO pool delegation works.


## 2. Deploy a Trustless Pool Operator Proxy Contract

For pool operators who prefer a trustless mechanism for reward distribution, they can choose to deploy a smart contract proxy (developed by [Protofire](http://protofire.io/)) that will store the rewards in the proxy contract and allow their pool members to claim the rewards directly from the proxy contract. 


### How it works

*   If you deploy this smart contract proxy, KNC holders can delegate their KNC voting power to you the pool operator.
*   You can vote on the behalf of pool members, but you will have no control over their KNC or ETH rewards.
*   After you vote, the subsequent ETH rewards are stored trustlessly in a smart contract and pool members can claim it themselves anytime.
*   Rewards can be tracked on-chain. 

[Protofire](http://protofire.io/) has been given a grant to develop a set of audited smart contracts proxy code that can be deployed by any pool operator. Testnet and audit will be ready (End May). Mainnet ready (Mid June). The specifications were developed by [StakeWith.Us](https://stakewith.us/).

See [here](smart-contract-proxy-grant.md) for more details.


## 3. Deploy Your Own Unique KyberDAO Pool Token

The second trustless mechanism with automated reward will be to deploy a KyberDAO Pool token. This KNC in this pool will be used to vote by the pool operator, and the rewards will be used to purchase more KNC and added to the pool. 

Therefore, the rewards for the pool members will be indirectly received via the value accrual of the pool token, which they can “claim” by converting the pool token back into KNC.

Pool operators will need to provide a front end interface to allow your pool members to burn their KyberPool tokens to unlock their KNC. Pool tokens are ERC20, and pool members are also free to sell them in other liquid markets. 


### How it works

*   KNC holders can become your pool members by locking up KNC tokens in your pool and minting new pool tokens (name and initial exchange rate determined by you). Let’s call these pool tokens xKNC.
*   As a pool operator, you are responsible for voting in every epoch to claim the full ETH rewards, which will then be automatically converted to KNC and restaked (you can take some ETH as pool operator fees depending on your business model). 
*   Over time, if there are more ETH rewards converted to KNC, the amount of KNC locked in your pool will increase, and each **xKNC token will be worth more KNC than before.**
*   Minting and burning of xKNC, delegation of voting power, and distribution of ETH rewards can be tracked on-chain. 

This set of smart contracts for the KyberDAO pool token is being developed by [Michael Cohen](https://github.com/michaelcohen716). Testnet and audit ready (End May). Mainnet ready (Mid June). See [here](tokenized-knc-grant.md) for details. 


## 4. Operate a Custodial Pool 

For pool operators who are comfortable with holding the tokens of the pool members, for example exchanges or custody services, they can operate a voting pool by allowing KNC holders to deposit their tokens, while voting on their behalf. 

No smart contracts need to be deployed for this method, but a portal for allowing users to deposit KNC, and withdraw KNC and rewards is needed.


### How it works

*   KNC holders can deposit their tokens into your staking service platform for you, the custodial pool operator, to hold and manage. 
*   You will be in full control of their KNC as well as their subsequent ETH rewards after you vote on their behalf. 
*   You are responsible for voting in every epoch to claim the full rewards and for distributing the ETH rewards back to your pool members. 
*   You can vote via the default kyber.org interface, without the need for smart contracts.
*   You will have to develop your own mechanisms for reward tracking and distribution. Rewards claiming and distribution are not tracked on-chain. 


## 5. Build And Deploy Your Own Smart Contracts

Motivated pool operators can also develop their own set of smart contracts to interact with the KyberDAO system. 

See [here](staking-api.md) for API details, join the Kyber developer chat. 

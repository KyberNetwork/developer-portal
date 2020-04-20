# KyberDAO Developer Overview
In the next version of Kyber Network protocol, we introduce the DAO and a staking model where KNC holders can stake KNC to have voting power (called stakers) in order to vote for different voting campaigns on the DAO contract. 

They can also delegate to custodial services or pool masters to help them vote. While the KyberDAO API offers a fully onchain mechanism to allow holders to specify an address to can vote on their behalf, **the role of distributing the rewards lies in the hands of the pool masters**. 


## Developers
While there will be a basic staking, voting and delegating interface provided by Kyber, there are several critical things that developers can build to be part of this process. 

For example:
- Interfaces to help KNC holders stake, vote and claim their rewards.
- Custodial platforms that accept KNC, vote on their behalf and distribute the rewards.
- Smart contract based platforms that allow the users to delegate their vote and get their rewards trustlessly.

Developers who are interested in building for KyberDAO can review the overview below for a quick idea of the concepts, run through the examples in detail for an understanding of the exact flow.

Docs are in a very early stage of development, so any ideas for improvements will be much appreciated.

## Resources
- [Staking, Voting Examples](staking-voting-examples.md)
- Testnet Details
- Reward Distribution Calculation
- [Delegating Overview And Example](delegating-example.md)
- [Kyber Team as DAO Maintainer](kyber-team-maintainer.md)
- Voting and claiming APIs
- [Staking and Delegating APIs](staking-api.md)
- Options For Staking Partners
- [FAQs](faqs.md)

## Grants (WIP)
We have grants available for talented developers to help extend the KyberDAO.
- Tokenized KNC With Rewards (Allocated)(tokenized-knc-grant.md)
- Smart Contract Proxy For Poolmasters(smart-contract-proxy-grant.md)


## Overview
All operations including staking and voting will be split into continuous epochs. We use timestamps to define the epoch duration (2 weeks) and the start time of the first epoch. There is no triggering mechanism needed to transit from one epoch to another, as this is done automatically when the Ethereum blockchain mines more blocks.

In every epoch, KNC holders can choose to vote on the ongoing campaigns. However, for their voting power (and rewards) to be considered, they will need to stake their KNC *before an epoch* and keep the staked KNC there for the whole epoch to be accounted to vote and rewards for that epoch. In *the following epoch*, they will be rewarded by the proportion of their share of KNC voting power, which they can claim.

KNC holders can choose to withdraw from the staking contract whenever they like. However, as soon as he withdraws his staked KNC, a portion of his current epoch reward will be given to other participants in their reward pool. His voting power will be decreased immediately as well. If he wants to vote and receive rewards for the next epoch, he has to stake his KNC again before the next epoch starts.

For a detailed understanding of this, refer to [Staking, Voting Examples](staking-voting-examples.md).

## Delegation
They can also delegate their KNC to pool masters, who will be in charge of voting and distributing the rewards. 

For details, refer to [Delegating Overview And Example](delegating-example.md).

## Voting Campaigns
In each epoch, the Kyber team will have to create 1 or more voting campaigns in order for stakers to vote on and help decide on either a network parameter or a consensus in Kyber Network’s community. Only the Kyber team has permission to create voting campaigns. If the Kyber team doesn’t create any voting campaign for an epoch, no one has any reward and all of the fees will be burnt regardless of any configurations.

There are different types of voting campaigns.
- Fee voting campaign to change network_fee config
- BRR (burn/reward/rebate distribution) voting campaign to change brr_data
- General voting campaign to conclude on one or zero winning option

This will be managed by the Kyber team. 


## Fees And Rewards
Whenever a taker does a transaction to trade, the Network contract takes the fee in ETH according to the network_fee config and sends it to the FeeHandler contract. 

Those fees will be split into 3 different parts:
1) Buy and **burn** KNC
2) Given to stakers as their **reward** for staking KNC
3) Given to reserves as their **rebate** for contributing liquidity

A staker can get his reward corresponding to his voting_point in the previous epoch. They can choose not to claim the reward and do it later in the future. There is no expiration of the reward. 

An end-user can also delegate ALL of his stakes to someone else (we call him the pool master). A pool master can vote on behalf of all of the stake he was delegated and will be able to claim the full amount of reward.

The staker needs to go after his pool master to ask for his reward. A pool master can also delegate his stake (not including the stakes that others delegated to him) to another pool master, in this case, he will only vote for other people and not for himself.

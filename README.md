# KyberDAO Developer Overview
In the next version of Kyber Network protocol, we introduce the DAO and a staking model where KNC holders can stake KNC to have voting power (called stakers) in order to vote for different voting campaigns on the DAO contract. 

## Pool Operators
Pool operators form an critial part of the overall KyberDAO system, helping to ensure that a wide range of voting interests will be represented while allowing KNC holders to easily stake their tokens and get rewards by choosing a pool operator who aligns with them.

Read options for operating a pool [here](pool-operator-options.md).

## Resources
- [Staking, Voting Examples](staking-voting-examples.md)
- Testnet Details
- [Delegating Overview And Example](delegating-example.md)
- [Kyber Team as DAO Maintainer](kyber-team-maintainer.md)
- Voting and claiming APIs
- [Staking and Delegating APIs](staking-api.md)
- [FAQs](faqs.md)

## Grants Given 
We have given out 2 grants to talented developers to build out important extensions of KyberDAO
- [Tokenized KNC With Rewards](tokenized-knc-grant.md)
- [Smart Contract Proxy For Poolmasters](smart-contract-proxy-grant.md)


## Overview
All operations including staking and voting will be split into continuous epochs. We use timestamps to define the epoch duration (2 weeks) and the start time of the first epoch. There is no triggering mechanism needed to transit from one epoch to another, as this is done automatically when the Ethereum blockchain mines more blocks.

In every epoch, KNC holders can choose to vote on the ongoing campaigns. However, for their voting power (and rewards) to be considered, they will need to stake their KNC *before an epoch* and keep the staked KNC there for the whole epoch to be accounted to vote and rewards for that epoch. In *the following epoch*, they will be rewarded by the proportion of their share of KNC voting power, which they can claim.

KNC holders can choose to withdraw from the staking contract whenever they like. However, as soon as he withdraws his staked KNC, a portion of his current epoch reward will be given to other participants in their reward pool. His voting power will be decreased immediately as well. If he wants to vote and receive rewards for the next epoch, he has to stake his KNC again before the next epoch starts.

For a detailed understanding of this, refer to [Staking, Voting Examples](staking-voting-examples.md).

## Delegation
They can also delegate their KNC to pool operators, who will be in charge of voting and distributing the rewards. 

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

An end-user can also delegate ALL of his stakes to someone else (we call him the pool operator, or representative). A pool operator can vote on behalf of all of the stake he was delegated and will be able to claim the full amount of reward.

The staker needs to go after his pool operator to ask for his reward. A pool operator can also delegate his stake (not including the stakes that others delegated to him) to another pool operator, in this case, he will only vote for other people and not for himself.

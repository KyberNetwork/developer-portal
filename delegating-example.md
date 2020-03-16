# Delegation Overview And Example

One important feature of our staking model is stake delegation. It allows for KNC stakers who are unable or have limited resources to participate in every DAO vote to still receive rewards for staking.

## Pool Masters And Members
Stakers can delegate their KNC voting power to a pool master who will vote on their behalf. Stakers who delegate their stake are also known as pool members and can only delegate their stake to one pool. 

The rewards will be given to the pool master. **The pool master needs to track how much each member owns**, **and is responsible for having to record it and have a mechanism for members to get it from him. Kyber do not hold any funds or take on any reward distribution responsibilities. **

## Stake Re-delegation

Should a pool member re-delegate his stake to another pool master (or back to himself) in the current epoch, changes will only take effect in the next epoch. Hence, delegated stakes for the current epoch remain unaffected. There is no limit to the frequency of stake re-delegation. 

Should a pool master delegate his stake to another pool master, only his stake gets delegated. He remains responsible for all stakes delegated to him.

## Pool Member Rewards

Rewards for pool members are given to their pool masters. The onus is therefore on pool masters to perform the reward distribution to their pool members. There will be smart contract functions for the pool masters to determine the reward allocated to each of their pool members for previous epochs. 

## Claiming Rewards

At the end of an epoch, pool masters can make a function call to the DAO contract to claim their rewards. Pool members need not perform any action, as their rewards are given to their pool masters.

---

## Accountability And Verification

Although the pool master is responsible for tracking and distributing rewards, KyberDAO stores onchain the key information needed to calculate or verify the distribution not just to the pool master, but also the stakes that the pool master needs to give to pool members.

**This allows for full accountability and verifiability,** since the amount per epoch and total amount due to pool members is always checkable and verifiable, although we obviously do not track payments that have/have not been made.

Note that this is only for pool masters that use the default onchain delegation, not if a a different delegation model is developed, or for custodial pool masters where the delegation is done offchain. 

---

## Example Of Delegation And Reward Distribution

Alice delegated her stake to the pool master, who voted in all the campaigns in this epoch (C). 


### Terminology

Alice as Staker (A)



*   Stake(AS) - the amount that was staked by A in the epoch 
*   Points (AP) - points accumulated by A in this epoch.It will be AS * C
*   Rewards (AR) - rewards deserved 

Pool Master (M)



*   Stake( MS) - the total amount staked by M, including delegations
*   Points (MP) - the total points accumulated. It is MS * C

Global (G)



*   Staked (GS) - global amount staked
*   Points (GP) - global points accumulated by everyone 
*   Reward (GR) - which is the portion allocated for voters 


### Sequence 
*   Alice delegates her KNC to pool master in epoch (N - 1). 
    *   Her stake is AS, basically amount of KNC staked
*   Pool master votes in all campaigns in epoch N 
    *   So his points will be MP = MS * C
    *   Alice points will be AP = AS * C
*   Pool master claims reward in epoch (N+1), which will be 
    *   MR = MP/GP * GR
*   Pool master can distribute the reward to Alice anytime in future
    *   AR = AS/MS * MR

**All the data needed for the above are stored onchain**, namely:
*   Stakes for the individual stakers and pool masters (AS, MS)
*   Points for the pool masters  (MP)
*   Global total rewards and points (GR, GP)

**Not Stored But Can Be Calculated**

*   All the onchain data is stored for all epochs, so things like all past epochs that Alice or master participated in, or the total rewards supposed to be due for Alice 

**Out Of Scope**

*   Reward distribution and history between pool master and Alice 
*   Reliability of Pool Master in voting



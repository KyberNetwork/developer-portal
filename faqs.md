
# Frequently Asked Questions (General)

### 1. What are the requirements for staking?
There are no other extraneous requirements to staking aside from holding KNC

### 2. Is there a minimum stake amount?
No.

### 3. How do I stake?
Simply deposit the amount of KNC you wish to stake into the KyberStaking smart contract. 

### 4. Is there a bonding period?
When you deposit your KNC to stake, your staked KNC will only be valid from the next epoch onwards. 

### 5. How long is one epoch?
Currently, an epoch is 81,000 blocks (~2 weeks).

### 6. Is there a lockup period for staking?
There is no minimum lockup period when your KNC is currently being staked. However, withdrawing your staked KNC might affect your stake amount for the current and subsequent epochs.

### 7. How can I be eligible for staking rewards?
To be eligible for 100% of your share of the rewards, you need to participate in every DAO vote (or delegate your voting power to someone else) and have your KNC staked for the entire epoch.

### 8. What currency are the rewards distributed in?
Rewards are distributed in Ether, as that is the currency fees are collected in.

### 9. When can I claim my rewards?
Stakers can claim their rewards of previous epochs whenever they want.

### 10. Can I delegate my voting power to someone else?
Yes. Stakers can delegate their KNC voting power to a pool master who will vote on their behalf. Stakers who delegate their stake are also known as pool members and can only delegate their stake to one pool.

### 11. Are there any risks to my staked funds?
There is always the risk of a potential attack that was not accounted for in our audits but that risk is prevalent across all dapps on Ethereum. You are also exposed to the risk of the price fluctuations in KNC but aside from these, there are no additional risks on your funds and it can only be withdrawn by you.


# Frequently Asked Questions (Pool Masters)

### 1. Can I withdraw a pool member’s KNC stake?
No, pool members have sole control of their own stakes. However, staking rewards of your pool are distributed to you, the pool master. 

### 2. How much reward do I receive?
The reward amount given to the pool master is calculated based on the sum of his stake, and all stakes that were delegated to him.

### 3. Does this mean I have to distribute rewards to my pool members? 
Yes.

### 4. How do I know how much stake / reward each pool member has / is entitled to?
Kindly take a look at [this example](#2-how-do-i-make-use-of-the-getstakerdataforpastepoch-function-to-calculate-the-stake-and-reward-distribution-for-my-pool-members) for a walkthrough. In essence, call the [`getStakerDataForPastEpoch`](staking-api.md#section-1-reward-calculation-for-pool-masters) function of the staking contract to determine the staked amount and eligible rewards for each of your pool members.

### 5. What happens when a pool member delegates his stake to another pool master?
As a rule of thumb, all actions performed only take effect in the next epoch. A pool member may perform re-delegation as often as he likes in the current epoch, but the changes will only kick in, in the next epoch. The pool member's stake remains delegated to their current designated pool master in the current epoch.

### 6. What happens to a pool member’s rewards if he re-delegates his stake to someone else?
Since stake re-delegation only takes effect in the next epoch, the pool member’s stake is still delegated to you for the current epoch. It is your responsibility to distribute rewards earned for the current epoch to him.

### 7. What if I delegate my stake to someone else? Does stakes delegated to me pass on to my pool master? 
Only your stake gets delegated to your pool master. Delegated stakes do not get delegated to your pool master. You are responsible for stakes delegated to you.

### 8. What happens when a pool member withdraws his stake?
#### Case 1: Withdrawal amount &lt;= deposit amount made during current epoch
Your voting power and reward distribution for the current epoch remains unchanged. The pool member’s delegated stake reduction takes effect from the next epoch onwards.

#### Case 2: Withdrawal amount > deposit amount made during current epoch
Your voting power and rewards for pool members (including the pool member who initiated the withdrawal) for the current epoch will be recomputed, even if you have voted prior to a pool member’s withdrawal. 

Refer to the table below on stake recomputations for various deposit and withdrawal scenarios.


<table>
  <tr>
   <td>Initial stake
   </td>
   <td>Current epoch actions
   </td>
   <td>Stake in current epoch
   </td>
   <td>Stake in subsequent epochs
   </td>
  </tr>
  <tr>
   <td rowspan="6" >1000 KNC
   </td>
   <td>
<ol>

<li>Deposit 500 KNC
</li>
</ol>
   </td>
   <td>1000 KNC
   </td>
   <td>1500 KNC
   </td>
  </tr>
  <tr>
   <td>
<ol>

<li>Withdraw 500 KNC
</li>
</ol>
   </td>
   <td>500 KNC
   </td>
   <td>500 KNC
   </td>
  </tr>
  <tr>
   <td>
<ol>

<li>Deposit 500 KNC

<li>Withdraw 200 KNC
</li>
</ol>
   </td>
   <td>1000 KNC
   </td>
   <td>1300 KNC
   </td>
  </tr>
  <tr>
   <td>
<ol>

<li>Deposit 500 KNC

<li>Withdraw 600 KNC
</li>
</ol>
   </td>
   <td>900 KNC
   </td>
   <td>900 KNC
   </td>
  </tr>
  <tr>
   <td>
<ol>

<li>Withdraw 500 KNC

<li>Deposit 200 KNC
</li>
</ol>
   </td>
   <td>500 KNC
   </td>
   <td>700 KNC
   </td>
  </tr>
  <tr>
   <td>
<ol>

<li>Withdraw 1000 KNC

<li>Deposit 2000 KNC
</li>
</ol>
   </td>
   <td>0 KNC
   </td>
   <td>2000 KNC
   </td>
  </tr>
</table>

## Technical FAQs (Pool Masters)
### 1. How do I obtain the list of pool members who delegated their stakes to me?
You will have to listen for the `Delegated` event emitted. Kyber will also provide an API for the list of pool members.

### 2. How do I make use of the `getStakerDataForPastEpoch` function to calculate the stake and reward distribution for my pool members?
Let us look at a simple example of 1 pool master, with 2 pool members who delegated their stakes to him.

#### Epoch 9
- Pool master `0xMASTER`, 1000 KNC stake
- Pool member `0xUSER1`, 1500 KNC stake
- Pool member `0xUSER2`, 2500 KNC stake

#### Epoch 10
Pool master voted for all campaigns

#### Reward distribution for epoch 10
- Call `getStakerDataForPastEpoch` for the pool master and each pool member.
```
// getStakerDataForPastEpoch(addr, epoch) returns (_stake, _delegatedStake, _delegatedAddres)
// _stake: stake amount eligible for reward
// _delegatedStake: stake amount delegated to addr by other stakers
// _delegatedAddress: Wallet address addr delegated his stake to

getStakerDataForPastEpoch(0xMASTER, 10) = (1000, 4000, 0xMASTER)
getStakerDataForPastEpoch(0xUSER1, 10) = (1500, 0, 0xMASTER)
getStakerDataForPastEpoch(0xUSER2, 10) = (2500, 0, 0xMASTER)
```

- Calculate reward distribution
  - Assume pool master received 10 ETH in rewards
  - Total stakes = 1000 + 4000 from 1st call = 5000 KNC
  - `0xMASTER` reward amt = 1000 / 5000 * 10 = 2 ETH
  - `0xUSER1` reward amt = 1500 / 5000 * 10 = 3 ETH
  - `0xUSER2` reward amt = 2500 / 5000 * 10 = 5 ETH

# Frequently Asked Questions (Pool Members)
### 1. Can a pool master or other pool members withdraw my KNC stake?
No, you have sole control of your staked funds. However, your staking rewards are distributed to your pool master.

### 2. How do I claim my rewards if I have delegated my stake to a pool master?
The onus is on the pool master to distribute the rewards to his pool members.

### 3. How many people can I delegate my stake to?
Stakers can delegate their stakes to 1 pool master only.

### 4. What happens when I delegate my stake to another pool master?
If the delegated stake is still waiting to take effect, stake re-delegation is immediate. However, if it is currently being staked by a pool then stake re-delegation only takes effect in the next epoch. Your stake remains delegated to your current pool master in the current epoch.

### 5. What happens when I withdraw my KNC stake?
#### Case 1: Withdrawal amount &lt;= deposit amount made during current epoch
Your stake (regardless of delegation) for the current epoch remains unchanged. Changes will only take effect from the next epoch onwards.

#### Case 2: Withdrawal amount > deposit amount made during current epoch
You or your pool master’s voting power and your reward amount will be recomputed for the current epoch, even if you or your pool master have voted prior to a pool member’s withdrawal. 

Refer to the table below on stake recomputations for various deposit and withdrawal scenarios.


<table>
  <tr>
   <td>Initial stake
   </td>
   <td>Current epoch actions
   </td>
   <td>Stake in current epoch
   </td>
   <td>Stake in subsequent epochs
   </td>
  </tr>
  <tr>
   <td rowspan="6" >1000 KNC
   </td>
   <td>
<ol>

<li>Deposit 500 KNC
</li>
</ol>
   </td>
   <td>1000 KNC
   </td>
   <td>1500 KNC
   </td>
  </tr>
  <tr>
   <td>
<ol>

<li>Withdraw 500 KNC
</li>
</ol>
   </td>
   <td>500 KNC
   </td>
   <td>500 KNC
   </td>
  </tr>
  <tr>
   <td>
<ol>

<li>Deposit 500 KNC

<li>Withdraw 200 KNC
</li>
</ol>
   </td>
   <td>1000 KNC
   </td>
   <td>1300 KNC
   </td>
  </tr>
  <tr>
   <td>
<ol>

<li>Deposit 500 KNC

<li>Withdraw 600 KNC
</li>
</ol>
   </td>
   <td>900 KNC
   </td>
   <td>900 KNC
   </td>
  </tr>
  <tr>
   <td>
<ol>

<li>Withdraw 500 KNC

<li>Deposit 200 KNC
</li>
</ol>
   </td>
   <td>500 KNC
   </td>
   <td>700 KNC
   </td>
  </tr>
  <tr>
   <td>
<ol>

<li>Withdraw 1000 KNC

<li>Deposit 2000 KNC
</li>
</ol>
   </td>
   <td>0 KNC
   </td>
   <td>2000 KNC
   </td>
  </tr>
</table>

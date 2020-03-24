# Kyber Team As Current DAO Maintainer 

## Overview

The KyberDAO is designed for maximum viable transparency, network stability and quick recovery in cases of emergencies. **Kyber team will serve as the current maintainer of the KyberDAO**, and we believe it is important to be as transparent and clear about this role as possible.

All processes and data will be stored and processed on-chain where feasible - for example, the results of any campaigns to change the network fees and fee allocation ratio will be immediately processed after the voting concludes. Where it is not practical, there will be a set of robust off-chain community and governance processes on multiple channels to ensure maximum debate and understanding. 

Given Kyber’s role as a key part of the decentralized infrastructure, network stability is crucial for the hundreds of important dapps and reserves that depend on us. In addition, there are certain operations that could result in suboptimal outcomes, like overpaying for the KNC to be burnt. Hence, the Kyber team will be taking on certain key roles, including putting up proposals for voting, set maximum amount of ETH to be sold, as well as the sanity checks.

One important action that the Kyber team can take is the DAO migration, where the key fee handling and DAO contracts are updated. This is a serious operation, and will only be conducted under maximum transparency and disclosure. Possible situations for migration include serious bugs, major flaws in the system or a DAO consensus that an upgrade is necessary.

This document outlines the key aspects the Kyber Team can or cannot perform:

## Kyber Team Cannot:

The following functionalities cannot be changed without a complete migration of the DAO and associated contracts.

### 1. Manipulate voting campaign outcome

Once a voting campaign starts, the Kyber team has no way to cancel, pause or remove the campaign and the outcome of the campaign has no way to deny. If the campaign is a fee or BRR campaign, its outcome takes effect immediately in the next epoch, no way to stop it.

### 2. Control staked KNC
The Kyber team has no way to control the staked KNC. Anyone can withdraw the staked KNC anytime and there is never a way to stop people from withdrawing. The Kyber team doesn’t have any way to transfer the staked KNC of others

### 3. Change network fee or brr setting without going through a voting campaign

The Kyber team CANNOT set the network fee nor bbr setting manually. The only 2 ever possible ways to change network fee or brr setting are either creating a voting campaign for them and have the DAO voted or to migrate the DAO

### 4. Change the hardcoded parameters

See full list of hard coded parameters below

## Kyber Team Manages:

The following tasks are actively managed by the Kyber team.

### 1. Create formal voting campaigns for the DAO

A voting campaign is a campaign for stakers to vote on to form a formal agreement among the DAO. There are 3 types of a voting campaign: Fee, BRR and general. A fee campaign is a campaign that decides the amount of fee in bps will be taken when a trade happens. A BRR campaign decides the percentage in bps of the fee to burn, reward to stakers and rebate to reserves.

The DAO maintainer is responsible for reviewing all proposals (a formalized KIP process will be unveiled after the launch), and put up formal proposals for voting accordingly.

### 2. Cancel a campaign if it is created and not yet started

Once a voting campaign is active, the **maintainer has no control over it anymore** and the result of the fee and brr campaign will inevitably take effect in the next epoch. Thus a mechanism for the campaign creator (which is the Kyber team) to cancel it before too late is needed.

We see cancelling campaigns for a few possible reasons: When it is created by mistake, if a new KIP proposal went through during the waiting period, and there is an abnormal condition of the network. The last situation should only happen in an emergency situation and the KyberDAO maintainer needs to disclose it ASAP and a postmortem needs to be published.

### 3. Set ETH amount of each burn operation 
If BRR indicates a non-zero percentage of the fee to be used to burn KNC, the ETH is kept in FeeHandler smart contract. Because the contract has ETH only, it has to use ETH to buy KNC then burn those KNC. 

However, choosing the time and the amount of ETH to buy KNC can be interpreted as an act of dishonesty to KNC holders if the ETH is used to buy KNC expensively in an  abnormal market condition. 

To remove the possibility for dishonesty, the ability to buy KNC and burn it is given to the public, on the other words, ANYONE that is not a smart contract can do the transaction to buy KNC and burn. The burn operation can only be done once in X blocks in order to avoid skewing KNC price, and maximum of Y eth will be used to buy KNC in order to avoid bad slippage. 
 
Kyber team will control the Y parameter, and this will only be changed if:

1. The KNC price toward ETH changes and makes the current ETH amount too little or too much. When it is too little, it is very difficult or impossible to catch up with the total ETH amount to burn. When it is too much, we will buy KNC with a bad slippage.
2. The ETH price toward USD goes up and makes the reserves change their market making algorithms to provide less KNC liquidity in ETH term.

We believe that this is the simplest model to go with at this point. Along with the sanity price contract, it prevents the likelihood of the DAO overpaying for KNC. 

### 4. Set KNC sanity price contract

In the burn KNC operation, anyone can do a transaction to buy KNC from the reserves and burn it, if he is a reserve manager, there is an incentive for him to tweak his reserve to sell KNC with a very bad price if other reserves are down (stop selling KNC) or selling KNC with a bad price together.  

To mitigate this possible exploitation, we need to secure the settlement price when KNC is bought to be around a sanity price (difference between settlement and sanity price is less than 10%). That sanity price comes from a KNC sanity price contract. 

In a good condition, the Kyber team will set the sanity contract to a contract that gets the price from a decentralized price oracle like ChainLink. In a bad condition like network congestion or the decentralized oracle got problems, Kyber team will set the sanity contract to a contract that Kyber team feeds the price themselves.

The maintainer can also stop the burning process by set the sanity KNC rate contract to 0x0 and it will not allow any burn KNC operations anymore.  

We expect the KNC sanity price contract to be changed when the sanity price contract is off too much from the market or in emergency situations when we have to protect the network or the ETH.

As the DAO maintainer who will monitor the burning operation, we will control the risk of burning less KNC than it should. The DAO maintainer doesn’t have incentive to burn less KNC as well. 

## Hardcoded parameters and assumptions

All of these parameters will be decided **before the Katalyst launch**, and not possible to be changed without redeployment of the whole DAO. 

**1. EPOCH_PERIOD_BLOCKS**

This is the number of blocks that an epoch lasts. The 2 weeks epoch time is decided taking into account the following pros and cons:

 1. **Pros** - Faster reward distribution, higher DAO participation and faster DAO conclusion.
 2. **Cons** - At least one voting campaign is held each 2 weeks in order for KNC stakers to get rewards hence more work for the Kyber team and more participation is required from KNC stakers. However, with the given scheduled voting campaign, this shouldn’t be a problem for the Kyber team and with delegation ability, busy stakers can delegate their voting power to other pools to vote for them.

The number of blocks for a 2 weeks time frame strictly depends on the block time of Ethereum, It is assumed to be 16s in average and also assumed it not to change any time soon in the future. It means if Ethereum block time becomes less than 8s or higher than 32s, the epoch duration will be a serious problem and we will need to redeploy and migrate the whole DAO. 

However, making epoch duration varies will complicate the staking algorithm  and introduces more trust or decentralization design. For the sake of simplicity, the epoch block is fixed.


**2. DEFAULT_REWARD_BPS, DEFAULT_REBATE_BPS**

During the launch of the Katalyst, before any voting has taken place, a set of default bps and brr settings are needed. These will be decided by a soft community voting before the launch of the DAO.

Because it is one time thing, the variables will become irrelevant after a first fee and brr voting campaign is concluded and takes effect.


**3. KNC_SANITY_ALLOWED_DIFF (10%)**

It is the maximum allowed difference between the settlement price (when KNC is bought using ETH to burn) and the sanity price. If the difference is higher than this setting, the whole burn knc operation is reverted.

This sanity check was decided with this assumptions in mind:

1. The sanity smart contract is up to date with the market in a 10% approximation.
2. If the sanity smart contract is off more than 10%, it means either sanity smart contract or the KNC reserves are abnormal and burn KNC operation is not allowed to advance.
3. If the reserves exploit the 10% price off and always price to sell KNC 10% more expensively than the sanity rate, they can benefit from the selling by (x + 10%) of the total burn fee at max, where x is the maximum percentage off of the sanity price. The Kyber team will actively monitor the sanity price rate and act if the price is off to the market by more than 5%. Let’s say B is the percentage of burn in network fee, so the maximum benefit of cheating reserves are: _volume * network_fee% * B% * (5% + 10%)_.

**4. MAX_EPOCH_CAMPS**

This is the maximum number of voting campaigns that can be created in an epoch. We do not expect there to be that many campaigns in an epoch, and even if there are, it should be spread out across multiple epochs to prevent overloading voters. This will also minimize storage abuse.

**5. MAX_CAMP_OPTIONS**

It is the maximum number of options the Kyber team can create in a campaign. Very few campaigns will need a lot of options, and in those rare cases, more campaigns can be created. This will simplify smart contract code and minimize the storage abuse.

**6. MIN_CAMP_DURATION_BLOCKS**

It is the minimum duration a campaign lasts, essentially the least amount of time in order to have the community participate. It prevents the KyberDAO maintainers from making flash voting campaigns and participating themself to out run other KNC stakers and make it less decentralized.


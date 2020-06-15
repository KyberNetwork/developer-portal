# Claiming APIs

## Introduction
The kyberFeeHandler contract primarily provides the following functionalities:
-  Converting fees to KNC for burning
-  Claiming staker rewards for participation in voting for campaigns
-  Claiming reserve reserves

For stakers and pool operators, the action you will be interested in are [claiming staker rewards](#claiming-staker-rewards).

### kyberFeeHandler Interface
[IKyberFeeHandler.sol](https://github.com/KyberNetwork/smart-contracts/blob/Katalyst/contracts/sol6/IKyberFeeHandler.sol)

### kyberFeeHandler Contract
[KyberFeeHandler.sol](https://github.com/KyberNetwork/smart-contracts/blob/Katalyst/contracts/sol6/Dao/KyberFeeHandler.sol)


## Claiming Staker Rewards
For pool operators, you are responsible for the reward calculation and distribution to your pool members. We first list the process, then illustrate with an example. It will require making calls to the kyberStaking, kyberDao and the kyberFeeHandler contracts.

### Rewards in multiple tokens and feeHandlers
In the future, we foresee supporting different quote tokens (Eg. stablecoins like DAI or USDC) instead of just ether. This means that network fees collected (and therefore staker rewards) will potentially be in these quote tokens as well. There may also be multiple feeHandlers to claim staker rewards from.

### Step A: Calculate rewards claimable 
1. `percentageInPrecision = kyberDao.getPastEpochRewardPercentageInPrecision(staker, epoch)`, which is the reward percentage entitled to you and your pool members in precision `(100% = 10**18)`.
2. `rewardsEntitled = kyberFeeHandler.rewardsPerEpoch(epoch)`, which is the rewards entitled to all stakers for that epoch.
3. The reward amount is `totalRewardAmt = rewardsEntitled.mul(percentageInPrecision).div(PRECISION)`

### Step B: Calculate rewards per epoch member
1. Call `kyberDao.getRawStakerData(poolOperatorAddress, epoch)` for the pool operator.
2. Call `kyberDao.getStakerData(poolMemberAddress, epoch)` for each pool member.
3. Reward allocated for the whole pool is the sum of the stake and delegated stake in step B1.
4. Calculate the reward amount for each entity using `totalRewardAmt` in step A3 and the information from the previous steps.

We recommend verifying that each pool member delegated to the operator for the reward claim epoch.

### Example
Let us look at an example of 1 pool operator, with 2 pool members who delegated their stakes to him. We assume that these 3 people are the only participants in the Kyber DAO. 

#### Epoch 9
- Pool operator `0xOPERATOR` deposits 1000 KNC stake
- Pool member `0xUSER1` deposits and delegates 1500 KNC stake
- Pool member `0xUSER2` deposits and delegates 2500 KNC stake

#### Epoch 10
Pool operator voted for all campaigns

#### Reward calculation and distribution
Assume that the total rewards allocated is 10 ETH.

**Note:**
- Addresses used in the code snippet below are for illustration purposes, and should be replaced with valid ethereum wallet addresses
- Comments are the expected values

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let epoch = new BN(10); // calculating rewards from epoch 10
let PRECISION = new BN(10).pow(new BN(18)); // 10 ** 18

/////////////////////////////////////////
// Step A: Calculate rewards claimable //
/////////////////////////////////////////
percentageInPrecision = await kyberDao.methods.getPastEpochRewardPercentageInPrecision(0xOPERATOR, epoch).call(); // 10**18 = 100%
rewardsEntitled = await kyberFeeHandler.methods.rewardsPerEpoch(epoch).call(); // 10 ETH
totalRewardAmt = rewardsEntitled.mul(percentageInPrecision).div(PRECISION); // 10 ETH

////////////////////////////////////////////////
// Step B: Calculate rewards per epoch member //
////////////////////////////////////////////////
// getRawStakerData(staker, epoch) and getStakerData(staker, epoch)
//    returns (stake, delegatedStake, representative)
// stake: stake amount eligible for reward
// delegatedStake: stake amount delegated to staker by other stakers
// representative: Wallet address staker delegated his stake to
operatorStakerData = await kyberStaking.getRawStakerData(0xOPERATOR, epoch).call() // (1000, 4000, 0xOPERATOR)
user1StakerData = await kyberStaking.getStakerData(0xUSER1, epoch).call() // (1500, 0, 0xOPERATOR)
user2StakerData = await kyberStaking.getStakerData(0xUSER2, epoch).call() // (2500, 0 , 0xOPERATOR)

totalStakes = operatorStakerData.stake.add(operatorStakerData.delegatedStake) // 1000 + 4000 = 5000 KNC
operatorRewardAmt = operatorStakerData.stake.div(totalStakes).mul(totalRewardAmt); // 1000 / 5000 * 10 = 2 ETH
user1RewardAmt = user1StakerData.stake.div(totalStakes).mul(totalRewardAmt); // 1500 / 5000 * 10 = 3 ETH
user2RewardAmt = user2StakerData.stake.div(totalStakes).mul(totalRewardAmt); // 2500 / 5000 * 10 = 5 ETH

// Example of verification that pool members did delegate to operator for epoch 10
assert.equal(user1StakerData.representative, 0xOPERATOR, "user1 did not delegate to operator");
assert.equal(user2StakerData.representative, 0xOPERATOR, "user2 did not delegate to operator");
```

---
`rewardsPerEpoch[epoch] = uint`

To get the reward amount entitled to all stakers for a given epoch number. Example as shown above.

### Viewing if rewards have been claimed
`hasClaimedReward[staker][epoch] = bool`

Returns `true` if staker has claimed his reward for a given epoch, false otherwise.

#### Example
Check if staker has claimed reward for epoch `5`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" // staker's address
let epoch = new BN(5);

let result = await kyberFeeHandler.methods.hasClaimedReward(staker, epoch).call();
```

### Claim Rewards
function **claimStakerReward**(address staker, uint256 epoch) external nonReentrant returns (uint256 amountWei)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |
| `epoch` | uint256 | epoch number |

**Returns:**
Amount (in wei) sent to staker.

#### Example
Claim staker rewards for epoch `5`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" // staker's address
let epoch = new BN(5);
let txData = kyberFeeHandler.methods.claimStakerReward(staker, epoch).encodeABI();

let txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, // can be any address
  to: kyberFeeHandler.address,
  data: txData
});
```

## Claiming Reserve Rebates

### Viewing Rewards Claimable
`rebatePerWallet[rebateWallet] = uint`

To get the reward amount entitled to the rebate wallet tagged to a reserve.
**Note:**
To save on gas costs, 1 wei is kept in the feeHandler contract, so the reward claimable has to be subtracted by 1.

#### Example
Get rebate amount claimable for rebate wallet `0x12340000000000000000000000000000deadbeef`/

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let rebateWallet = "0x12340000000000000000000000000000deadbeef" // rebate wallet's address

let result = await kyberFeeHandler.methods.rebatePerWallet(rebateWallet).call();
let rebateAmt = result.sub(new BN(1));
```

### Claim Reserve Rebates
function **claimReserveRebate**(address rebateWallet) external nonReentrant returns (uint256 amountWei)

**Inputs**
Reserve's rebate wallet address

**Returns:**
Amount (in wei) sent to rebate wallet.

#### Example

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let rebateWallet = "0x12340000000000000000000000000000deadbeef" // rebateWallet's address
let epoch = new BN(5);
let txData = kyberFeeHandler.methods.claimReserveRebate(rebateWallet).encodeABI();

let txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, // can be any address
  to: kyberFeeHandler.address,
  data: txData
});
```


## Claiming Platform Fees

### Viewing Rewards Claimable
`feePerPlatformWallet[platformWallet] = uint`

To get the reward amount entitled to the taker platform wallet.
**Note:**
To save on gas costs, 1 wei is kept in the feeHandler contract, so the reward claimable has to be subtracted by 1.

#### Example
Get rebate amount claimable for platform wallet `0x12340000000000000000000000000000deadbeef`/

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let platformWallet = "0x12340000000000000000000000000000deadbeef" // rebate wallet's address

let result = await kyberFeeHandler.methods.feePerPlatformWallet(platformWallet).call();
let platformFee = result.sub(new BN(1));
```

### Claim Platform Fees
function **claimPlatformFee**(address platformWallet) external nonReentrant returns (uint256 amountWei)

**Inputs**
Taker platform wallet address

**Returns:**
Amount (in wei) sent to platform wallet.

#### Example

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let platformWallet = "0x12340000000000000000000000000000deadbeef" // platformWallet's address
let epoch = new BN(5);
let txData = kyberFeeHandler.methods.claimPlatformFee(platformWallet).encodeABI();

let txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, // can be any address
  to: kyberFeeHandler.address,
  data: txData
});
```

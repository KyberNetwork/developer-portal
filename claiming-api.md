# Claiming APIs

## Introduction
The kyberFeeHandler contract primarily provides the following functionalities:
-  Converting fees to KNC for burning
-  Claiming staker rewards for participation in voting for campaigns
-  Claiming reserve reserves

For stakers and pool operators, the action you will be interested in are [claiming staker rewards](#section-1-claiming-staker-rewards).

### kyberFeeHandler Interface
[IKyberFeeHandler.sol](https://github.com/KyberNetwork/smart-contracts/blob/Katalyst/contracts/sol6/IKyberFeeHandler.sol)

### kyberFeeHandler Contract
[KyberFeeHandler.sol](https://github.com/KyberNetwork/smart-contracts/blob/Katalyst/contracts/sol6/Dao/KyberFeeHandler.sol)


## Section 1: Claiming Staker Rewards

### Viewing Rewards Claimable Per Epoch
To view the amount (in wei) claimable for an epoch, you will have to call APIs from both the kyberFeeHandler and dao contracts. We illustrate with an example.

#### Example
Let us assume as a pool operator (address `0xOPERATOR`), you would like to view the staker rewards entitled to you and your pool members for epoch `5`.

1. Call `kyberDao.getPastEpochRewardPercentageInPrecision(staker, epoch)` to get the percentage entitled in precision, where `(100% = 10**18)`.
2. Call `kyberFeeHandler.rewardsPerEpoch(epoch)` to get the rewards entitled to all stakers for that epoch.
3. Calculate the `amountWei` entitled = `rewardsPerEpoch(epoch).mul(percentageInPrecision).div(PRECISION)`
4. To then calculate the reward distribution to pool members, please visit [this section](#2-how-do-i-make-use-of-the-getrawstakerdata-and-getstakerdata-functions-to-calculate-the-stake-and-reward-distribution-for-my-pool-members).
   
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let PRECISION = new BN(10).pow(new BN(18)); // 10 ** 18
let poolOperator = "0x12340000000000000000000000000000deadbeef" // pool operator's address
let epoch = new BN(5);

let percentageInPrecision = await daoContract.methods.getPastEpochRewardPercentageInPrecision(poolOperator, epoch).call();
let rewards = await feeHandlerContract.methods.rewardsPerEpoch(epoch).call();
let weiAmount = rewards.mul(percentageInPrecision).div(PRECISION);
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

let result = await feeHandlerContract.methods.hasClaimedReward(staker, epoch).call();
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
let txData = feeHandlerContract.methods.claimStakerReward(staker, epoch).encodeABI();

let txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, // can be any address
  to: feeHandlerContract.address,
  data: txData
});
```

## Section 2: Claiming Reserve Rebates

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

let result = await feeHandlerContract.methods.rebatePerWallet(rebateWallet).call();
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
let txData = feeHandlerContract.methods.claimReserveRebate(rebateWallet).encodeABI();

let txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, // can be any address
  to: feeHandlerContract.address,
  data: txData
});
```


## Section 3: Claiming Platform Fees

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

let result = await feeHandlerContract.methods.feePerPlatformWallet(platformWallet).call();
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
let txData = feeHandlerContract.methods.claimPlatformFee(platformWallet).encodeABI();

let txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, // can be any address
  to: feeHandlerContract.address,
  data: txData
});
```

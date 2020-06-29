# Ropsten Contract Addresses
## `kyberStaking`
`0x9A73c6217cd595bc449bA6fEF6efF53f29014f42`

## `kyberDao`
`0x2Be7dC494362e4FCa2c228522047663B17aE17F9`

## `kyberFeeHandler`
`0xfF456D9A8cbB5352eF77dEc2337bAC8dEC63bEAC`

## `kyberProxy`
`0xd719c34261e099Fdb33030ac8909d5788D3039C4`


# Technical Changes

## 29/6/2020
### (Hopefully) Final Version

Minor fixes due to audit comments from ChainSecurity.
- Removed unnecessary import in KyberDao.sol
- Revert comment fixes for better clarity
- Added token parameter to events emitted by KyberFeeHandler
- Added MAX_ALLOWANCE variable, use `2**256 - 1` instead of `2**255` due to COMP token implementation

## 11/6/2020

### Ropsten Contract Addresses

#### `kyberStaking`
`0xDca0cB013EC92163fbbeb9A4962CBA31723a3515`

#### `kyberDao`
`0x98fac5AD613c707Ef3434B609A945986e4d05d07`

#### `kyberFeeHandler`
`0xe57B2c3b4E44730805358131a6Fc244C57178Da7`

#### `kyberProxy`
`0xa16Fc6e9b5D359797999adA576F7f4a4d57E8F75`

### Claim rewards from kyberFeeHandler
As we plan for post-Katalyst, we foresee supporting different quote tokens (such as stablecoins) instead of just ether. This means that network fees collected will potentially be in these quote tokens as well. As a result, there may be multiple feeHandlers to claim rewards from. 

We have thus made the following changes:
- The `claimStakerReward` function has moved from `kyberDao` to `kyberFeeHandler`. Now, the `kyberFeeHandler` contract will fetch the staker's reward percentage from the `kyberDao`.
- `kyberFeeHandler` has been removed from `kyberDao`
- `claimStakerReward` will not revert if reward is zero, or if a staker has already claimed his reward
- The token address parameter has been added to the `RewardPaid`, `RebatePaid`, `PlatformFeePaid` and `KncBurned` events in `kyberFeeHandler`

If you are buidling on top of the Kyber DAO contracts, we recommend that you plan for receiving staker rewards in ERC20 tokens as well.

### Added more functions to interfaces
- Added `getCurrentEpochNumber` and `getEpochNumber` to IEpochUtils (inherited by IKyberStaking and IKyberDao)
- Added `getStakerData` and `getLatestStakerData` to IKyberStaking

### Variable name change from `delegatedAddress` to `representative`
- `delegatedAddress` has been renamed to `representative`
- `getLatestDelegatedAddress` has been renamed to `getLatestRepresentative`

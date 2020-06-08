# Dao APIs

## Introduction
The kyberDao contract primarily provides the following functionalities:
- Creation and cancellation of campaigns by authorized personnel (namely, the `daoOperator`)
- Voting for campaigns
  
<!-- 
The kyberFeeHandler contract provides the following functionalities:
-  Converting fees to KNC for burning
-  Claiming staker rewards for participation in voting for campaigns
-  Claiming rebate reserves -->

For stakers and pool operators, the actions you will be interested in are:
1. [Viewing Campaign Details](#reading-campaign-information)
2. [Voting for a campaign](#voting-for-campaigns)

 The [voting formula](#voting-formula) used for deciding the winning options of a campaign may also be of interest.

## Creation and cancellation of campaigns
These actions can only be carried out by the `daoOperator`.

## Campaign Types
There are currently 3 different types of campaigns:
1. `GENERAL`: A generic campaign. 
2. `NETWORK_FEE`: The fee amount (in basis points) to be charged for every trade.
3. `FEE_HANDLER_BRR`: Proportion of fees to be **burnt**, given to stakers as **rewards**, and given to reserves as **rebates** for liquidity contribution.

Note that there can only be a maximum of 1 campaign per epoch for the `NETWORK_FEE` and `FEE_HANDLER_RR` campaign types.

## Voting Formula
The formula was designed to be simple enough such that it can be implemented on-chain, and is gas efficient for calculations. Hence, the "1 token 1 vote" idea is used for its simplicity. A quorum is also defined, in order for a winning option to be considered valid.

The quorum needed is linearly inversely proportional to the percentage of votes received for that campaign. In other words, fewer votes received, stricter quorum. 

In the event that there is more than 1 winning option (ie. more than 1 option sharing the same no. of votes), the campaign is considered to not have a winner.

### Quick Primer
A line can be expressed as `Y = tX + C`, where `t` is the gradient, and `C` shifts the line vertically up/down.

### Variables
- `winningOption`: Campaign option that received the most votes
- `totalVotes`: Total amount of votes received for a campaign
- `votedPercentage`: Percentage of votes (out of the total KNC supply at the time of the campaign)
- `minThreshold`: Minimum percentage (out of all campaign votes) needed for the winning option to be valid

### Explanation
1. We first find `winningOption` with a simple iteration through the votes received by each option.
2. Calculate `votedPercentage`: `totalVotes` / total KNC supply at time of campaign
3. `minThreshold`: `-t * votedPercentage + C`. `t` and `C` were determined by `daoOperator` upon campaign initialisation (to allow for flexibility). Rearranging this, we get `minThreshold = C - t * votedPercentage`
4. If enough people have voted such that `t * votedPercentage > C` (ie. `minThreshold < 0`), then the quorum condition has been met, and we can consider `winningOption` to be valid.
5. Otherwise, we have to check that `winningOption >= minThreshold` before considering it to be a valid winning option.

## Public Dao Variables
- `MAX_EPOCH_CAMPAIGNS`: Maximum number of campaigns that can be created in an epoch by `daoOperator`
- `MAX_CAMPAIGN_OPTIONS`: Maximum number of options that a campaign can have
- `minCampaignDurationInSeconds`: Minimum duration for a campaign
- `kncToken`: The KNC token contract
- `staking`: The staking contract
- `numberCampaigns`: Number of campaigns in total, used to generate a unique ID for each campaign

## Getting Current Epoch Number
Obtain the current epoch number of the Dao contract

---
function **`getCurrentEpochNumber`**() public view returns (uint)

#### Example
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper
let currentEpochNum = await DaoContract.getCurrentEpochNumber().call();
```


## `NETWORK_FEE` Campaign Information
While this section is specific to the `NETWORK_FEE` campaign type, the other sections below are of relevance.

### `networkFeeCampaigns`
`networkFeeCampaigns[epoch] = uint`
`NETWORK_FEE` campaign ID number for a given epoch. Note that there can only be a maximum of 1 `NETWORK_FEE` campaign per epoch.

#### Example
Get the `NETWORK_FEE` campaign ID number for epoch `5`.
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let epochNum = new BN(5);
let result = await DaoContract.methods.networkFeeCampaigns(epochNum).call();
```

### `getLatestNetworkFeeData`
Gets the network fee (in basis points) charged for trades, and the timestamp for which it expires.

---
function **getLatestNetworkFeeData`**() public view returns(uint feeInBps, uint expiryTimestamp)

**Returns:**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `feeInBps` | `uint` | Network fee (in basis points) to be charged for trades |
| `expiryTimestamp` | `uint` | Time which the network fee becomes invalid |
---
**Notes:**
- Unlike the `getLatestNetworkFeeDataWithCache()` function below, this is a `view` function, and does not cache the data

#### Example
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper
let result = await DaoContract.methods.getLatestNetworkFeeData().call();
```

### `getLatestNetworkFeeDataWithCache`
In addition to reading the latest network fee data, it concludes the network fee campaign if necessary, thereby caching the data as well.

---
function **getLatestNetworkFeeDataWithCache`**() public returns(uint feeInBps, uint expiryTimestamp)

**Returns:**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `feeInBps` | `uint` | Network fee (in basis points) to be charged for trades |
| `expiryTimestamp` | `uint` | Time which the network fee becomes invalid |
---
**Notes:**
- Unlike the `getLatestNetworkFeeData()` function above, the network fee data is cached as well.

#### Example
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper
txData = DaoContract.methods.getLatestNetworkFeeDataWithCache().encodeABI();

txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, //obtained from web3 interface
  to: Dao_CONTRACT_ADDRESS,
  data: txData
});
```


## `FEE_HANDLER_BRR` Campaign Information
While this section is specific to the `FEE_HANDLER_BRR` campaign type, the other sections below are of relevance.

### `brrCampaigns`
`brrCampaigns[epoch] = uint`
`FEE_HANDLER_BRR` campaign ID number for a given epoch. Note that there can only be a maximum of 1 `FEE_HANDLER_BRR` campaign per epoch.

#### Example
Get the `FEE_HANDLER_BRR` campaign ID number for epoch `5`.
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let epochNum = new BN(5);
let result = await DaoContract.methods.brrCampaigns(epochNum).call();
```

### `getLatestBRRData`
Gets the latest BRR distribution for the network fee, and the timestamp for which it expires.

---
function **getLatestBRRData()** public returns (uint burnInBps, uint rewardInBps, uint rebateInBps, uint epoch, uint expiryTimestamp)

**Returns:**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `burnInBps` | `uint` | Ratio (in basis points) of fees collected for burning KNC |
| `rewardInBps` | `uint` | Ratio (in basis points) of fees collected for staker rewards |
| `rebateInBps` | `uint` | Ratio (in basis points) of fees collected for reserve rebates |
| `epoch` | `uint` | Current epoch of Staking and Dao contracts |
| `expiryTimestamp` | `uint` | Timestamp for which BRR becomes invalid |
---
**Notes:**
- `epoch` has the same value as calling [`getCurrentEpochNumber()`](#getting-current-epoch-number)
- Unlike the `getLatestBRRDataWithCache()` function below, this is a `view` function, and does not cache the data

#### Example
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper
let result = await DaoContract.methods.getLatestBRRData().call();
```

### `getLatestBRRDataWithCache`
In addition to reading the latest BRR data, it also concludes a BRR campaign if necessary, thereby caching the latest BRR data as well.

---
function **getLatestBRRDataWithCache()** public returns (uint burnInBps, uint rewardInBps, uint rebateInBps, uint epoch, uint expiryTimestamp)

**Returns:**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `burnInBps` | `uint` | Ratio (in basis points) of fees collected for burning KNC |
| `rewardInBps` | `uint` | Ratio (in basis points) of fees collected for staker rewards |
| `rebateInBps` | `uint` | Ratio (in basis points) of fees collected for reserve rebates |
| `epoch` | `uint` | Current epoch of Staking and Dao contracts |
| `expiryTimestamp` | `uint` | Timestamp for which BRR becomes invalid |
---
**Notes:**
- `epoch` has the same value as calling [`getCurrentEpochNumber()`](#getting-current-epoch-number)
- Unlike the `getLatestBRRData()` function above, this function caches the BRR data too.

#### Example
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper
txData = DaoContract.methods.getLatestBRRDataWithCache().encodeABI();

txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, //obtained from web3 interface
  to: Dao_CONTRACT_ADDRESS,
  data: txData
});
```


## Reading Campaign Information
This section details all the APIs related to fetching information about campaigns (including results).

### `getListCampaignIDs`
Get a list of all existing campaigns of an epoch.

---
function **`getListCampaignIDs`**(uint256 epoch) external view returns (uint256[] memory campaignIDs)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `epoch` | uint256 | epoch number |

**Returns:**
List of `campaignIDs` for given `epoch`.

#### Example
Get the list of campaign IDs for current epoch.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let currentEpoch = await DaoContract.methods.getCurrentEpochNumber().call();
let result = await DaoContract.methods.campaignIDs(currentEpoch).call();
```

### `getCampaignDetails`
Get information about a campaign.

---
function **`getCampaignDetails`**(uint256 campaignID) external view returns (
  CampaignType campaignType, uint256 startTimestamp, uint256 endTimestamp,
  uint256 totalKNCSupply, uint256 minPercentageInPrecision, uint256 cInPrecision,
  uint256 tInPrecision, bytes memory link, uint256[] memory options)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `campaignID` | uint256 | campaign ID |

**Returns:**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `campaignType` | CampaignType | One of the 3 campaign types |
| `startTimestamp` | uint256 | Starting time of the campaign |
| `endTimestamp` | uint256 | Ending time of the campaign |
| `totalKNCSupply` | uint256 | Total KNC supply at the time of campaign creation |
| `minPercentageInPrecision` | uint256 | Minimum percentage in precision for formula to conclude campaign |
| `cInPrecision` | uint256 |c value (in precision) for formula to conclude campaign | 
| `tInPrecision` | uint256 | t value (in precision) for formula to conclude campaign |
| `link` | bytes | Additional information about this campaign. Typically a URL |
| `options` | uint256[] | List of vote options for the campaign |
---
**Note:**
- More information about the formula and its parameters `minPercentageInPrecision`, `cInPrecision` and `tInPrecision` can be found [here](#voting-formula)

#### Example
Get the details of campaign number `5`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let campaignNum = new BN(5);
let result = await DaoContract.methods.getCampaignDetails(campaignNum).call();
```

### `getCampaignVoteCountData`
Get the vote counts for each option of a campaign, and the total vote count.

---
function **`getCampaignVoteCountData`**(uint256 campaignID) external view returns (uint256[] memory voteCounts, uint256 totalVoteCount)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `campaignID` | uint256 | campaign ID |

**Returns:**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `voteCounts` | uint256[] | List of vote counts per option |
| `totalVoteCount` | uint256 | Total vote count for the campaign |

#### Example
Get the campaign vote count data of campaign number `5`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let campaignNum = new BN(5);
let result = await DaoContract.methods.getCampaignVoteCountData(campaignNum).call();
```

### `getCampaignWinningOptionAndValue`
Get the winning option and value of a campaign

---
function **getCampaignWinningOptionAndValue**(uint256 campaignID) public view returns (uint256 optionID, uint256 value)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `campaignID` | uint256 | campaign ID |

**Returns:**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `optionID` | uint256 | Winning option ID |
| `value` | uint256 | Winning option value |
---
**Note:**
Values `(0,0)` will be returned under the following circumstances:
- Campaign does not exist
- Campaign is still ongoing
- Campaign has no winning option based on the formula (more than 1 winning option, insufficient votes, etc.)

#### Example
Get the winning option and value of campaign number `5`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let campaignNum = new BN(5);
let result = await DaoContract.methods.getCampaignWinningOptionAndValue(campaignNum).call();
```

## Voting for Campaigns
This section details all the APIs related to voting for a campaign, and staker-centric data related to campaign options and results.

### `numberVotes`
`numberVotes[stakerAddress][epoch] = uint`
To determine the number of campaigns that a staker has voted for at a given epoch number.

#### Example
Get number of campaigns staker has voted for in epoch `5`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" //staker's address
let epochNum = new BN(5);
let result = await DaoContract.methods.numberVotes(staker, epochNum).call();
```

### `stakerVotedOption`
`stakerVotedOption[stakerAddress][campID] = uint`
To obtain the option number a staker voted on, for a campaign.

#### Example
See which option staker has voted on, for campaign ID `5`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" //staker's address
let campaignID = new BN(5);
let result = await DaoContract.methods.stakerVotedOption(staker, campaignID).call();
```

### `vote`
Vote for a campaign.

---
function **vote**(uint campID, uint option) public

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `campID` | `uint` | Campaign ID voting on |
| `option` | `uint` | Option ID |

#### Example
Vote for option `3` for campaign ID `5`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let campaignID = new BN(5);
let optionID = new BN(3);
txData = DaoContract.methods.vote(campaignID, optionID).encodeABI();

txReceipt = await web3.eth.sendTransaction({
  from: VOTING_WALLET_ADDRESS,
  to: Dao_CONTRACT_ADDRESS,
  data: txData
});
```

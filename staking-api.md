# Staking APIs

## Introduction
The kyberStaking contract primarily provides the following functionalities:
- Deposit, delegation and withdrawal of stakes
- Getting staker information

### kyberStaking Interface
[IKyberStaking.sol](https://github.com/KyberNetwork/smart-contracts/blob/Katalyst/contracts/sol6/Dao/IKyberStaking.sol)

### kyberStaking Contract
[KyberStaking.sol](https://github.com/KyberNetwork/smart-contracts/blob/Katalyst/contracts/sol6/Dao/KyberStaking.sol)


## Staking Actions
The APIs in this section require users to send transactions. The general rule of thumb is that any action performed by the user will only take effect in the **next epoch**. The exception to this is when the user withdraws an amount greater than deposits made in the current epoch.

### Deposit
The first step for any user is to deposit KNC into the staking contract (in token wei).

---
function **`deposit`**(uint256 amount) external
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `amount` | uint256 | KNC twei to be deposited |
---
Note: The user must have given an allowance to the staking contract, ie. made the following function call
`KNC.approve(stakingContractaddress, someAllowance)`

#### Example
Deposit 1000 KNC

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

const BN = web3.utils.BN;
let tokenAmount = new BN(10).pow(new BN(21)); // 1000 KNC in twei

let txData = stakingContract.methods.deposit(tokenAmount).encodeABI();

let txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, // obtained from web3 interface
  to: stakingContract.address,
  data: txData
});
```

### Delegate
Once the user has staked some KNC, he can delegate his **entire** KNC stake to a pool operator (with address `newRepresentative`), who will vote on his behalf. Note that we do not support partial stake delegation. Also, users can only have a maximum of 1 pool operator.

---
function **`delegate`**(address newRepresentative) external
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `newRepresentative` | address | Representative's wallet address |
---

#### Example
User delegates his stake to a pool operator (of address `0x12340000000000000000000000000000deadbeef`) who will vote on the user's behalf.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let poolOperator = "0x12340000000000000000000000000000deadbeef" //pool operator's address

let txData = stakingContract.methods.delegate(poolOperator).encodeABI();

let txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, // obtained from web3 interface
  to: stakingContract.address,
  data: txData
});
```

### Withdrawing KNC
The user can withdraw KNC (in token wei) from the staking contract at any point in time. 

---
function **`withdraw`**(uint256 amount) external
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `amount` | uint256 | KNC twei to be withdrawn |
---

#### Example
Withdraw 1000 KNC

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

const BN = web3.utils.BN;
let tokenAmount = new BN(10).pow(new BN(21)); // 1000 KNC in twei

let txData = stakingContract.methods.withdraw(tokenAmount).encodeABI();

let txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, // obtained from web3 interface
  to: stakingContract.address,
  data: txData
});
```


## Getting Epoch Information
This section documents the API related to getting epoch related information, such as the duration of one epoch, or the current epoch number.

### Epoch Duration
Obtain the duration of 1 epoch.

---
function **`epochPeriodInSeconds`**() external view returns (uint256)

#### Example
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper
let epochDuration = await stakingContract.epochPeriodInSeconds().call();
```

### Timestamp of 1st Epoch
Obtain the timestamp of the first epoch

---
function **`firstEpochStartTimestamp`**() external view returns (uint256)

#### Example
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper
let firstEpochStartTimestamp = await stakingContract.firstEpochStartTimestamp().call();
```

### Current Epoch Number
Obtain the current epoch number of the staking contract

---
function **`getCurrentEpochNumber`**() external view returns (uint256)

#### Example
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper
let currentEpochNum = await stakingContract.getCurrentEpochNumber().call();
```

## Reading Staking Data
There are primarily 3 parameters of interest (apart from getting the current epoch number):
|       Parameter      |                 Description                   |
| ---------------------|:---------------------------------------------:|
| `stake` | KNC amount staked by a staker |
| `delegatedStake` | KNC amount delegated to a staker |
| `representative` | Who the staker delegated his stake to |

We can classify the APIs for reading staking data in 3 broad sections:
- Reward percentage calculation for pool operators
- Getting the above 3 parameters for the past epochs and the current epoch
- Getting the above 3 parameters for the next epoch


## Section 1: Reward calculation for pool operators
### Staker Data Of An Epoch
Obtains a staker's information for a specified epoch. Used in conjunction with [getStakerData](#all-staker-information) for calculating reward percentage by pool operators (and the DAO contract). Kindly refer to [this example](faqs.md#2-how-do-i-make-use-of-the-getrawstakerdata-and-getstakerdata-functions-to-calculate-the-stake-and-reward-distribution-for-my-pool-members) for a walkthrough on reward calculation.

---
function **`getStakerRawData`**(address staker, uint256 epoch) external view returns (uint256 stake, uint256 delegatedStake, address representative)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |
| `epoch` | uint256 | epoch number |

**Returns:**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `stake` | uint256 | `staker` stake amount |
| `delegatedStake` | uint256 | Stake amount delegated to `staker` by other stakers |
| `representative` | address | Wallet address `staker` delegated his stake to |
---
**Notes:**
- Delegated stakes to `staker` are not forwarded to `representative`. `staker` is still responsible for voting on behalf of all stakes delegated to him.
- To accurately get the stakes of pool members for reward calculation, use the (getStakerData)[#all-staker-information] function.
- It is recommended to verify that the `representative` for each pool member is the pool operator's address

#### Example
Obtain representative's information (of address `0x12340000000000000000000000000000deadbeef`) at epoch 5.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let poolOperator = "0x12340000000000000000000000000000deadbeef" // staker's address
let epoch = new BN(5);

let result = await stakingContract.methods.getStakerRawData(poolOperator, epoch).call();
```


## Section 2: Staking info of past and current epochs
There are 2 options for getting the information of a staker for a specified epoch (up to the next epoch):
  - Option A: Get all parameters in 1 function call
    - [`getStakerData`](#all-staker-information)
  - Option B: Get each parameter individually. While these functions are in the staking contract, they are not in the interface. As such, you will have to extend the interface in order to access these functions.

    - [`getStake`](#stakers-knc-stake)
    - [`getDelegatedStake`](#stakers-delegated-stake)
    - [`getRepresentative`](#stakers-delegated-address)

### All staker information
Obtain the `stake`, `delegatedStake` and `representative` of a staker for a specified epoch (up to the next epoch)

---
function **`getStakerData`**(address staker, uint256 epoch) external view returns (uint256 stake, uint256 delegatedStake, address representative)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |
| `epoch` | uint256 | epoch number |

**Returns:**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `stake` | uint256 | `staker` stake amount |
| `delegatedStake` | uint256 | Stake amount delegated to `staker` by other stakers |
| `representative` | address | Wallet address `staker` delegated his stake to |
---
**Note:**
`getStakerData(staker, N+1) == getLatestStakerData(staker)` where `N` is the current epoch number only when staker data has been initialised due to a staker action

#### Example
Obtain staker's information (of address `0x12340000000000000000000000000000deadbeef`) at epoch 5.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" // staker's address
let epoch = new BN(5);

let result = await stakingContract.methods.getStakerData(staker, epoch).call();
```

### Staker's KNC stake
Obtains a staker's KNC stake for a specified epoch (up to the next epoch)

---
function **getStake**(address staker, uint256 epoch) external view returns (uint256)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |
| `epoch` | uint256 | epoch number |

**Returns:**
`staker` KNC stake at `epoch`

---
**Notes:**
- `getStake(staker, N+1) == getLatestStakeBalance(staker)` where `N` is the current epoch only when staker data has been initialised due to a staker action
- `getStake(staker, N) == getStakerData(staker, N).stake`

#### Example
Obtain staker's KNC stake (of address `0x12340000000000000000000000000000deadbeef`) at epoch 5.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" // staker's address
let epoch = new BN(5);

let result = await stakingContract.methods.getStake(staker, epoch).call();
```

### Staker's delegated stake
Obtains staking amount delegated to an address for a specified epoch (up to the next epoch)

---
function **getDelegatedStake**(address staker, uint256 epoch) external view returns (uint256)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |
| `epoch` | uint256 | epoch number |

**Returns:**
Delegated stake amount to `staker` at `epoch`

---
**Notes:**
- `getDelegatedStake(staker, N+1) == getLatestDelegatedStake(staker)` where `N` is the current epoch number only when staker data has been initialised due to a staker action
- `getDelegatedStake(staker, N) == getStakerData(staker, N).delegatedStake`

#### Example
Obtain stake amount delegated to address `0x12340000000000000000000000000000deadbeef` at epoch 5.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" // staker's address
let epoch = new BN(5);

let result = await stakingContract.methods.getDelegatedStake(staker, epoch).call();
```

### Staker's delegated address
Obtains the representative's address of `staker` at a specified epoch (up to the next epoch)

---
function **getRepresentative**(address staker, uint256 epoch) external view returns (address)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |
| `epoch` | uint256 | epoch number |

**Returns:**
`staker` representative address

---
**Notes:**
- If user is not a staker, null address is returned
- If user did not delegate to anyone, `staker` address is returned
- `getRepresentative(staker, N+1) == getLatestRepresentative(staker)` where `N` is the current epoch number only when staker data has been initialised due to a staker action
- `getRepresentative(staker, N) == getStakerData(staker, N).representative`

#### Example
Get `0x12340000000000000000000000000000deadbeef` representative's address at epoch 5.
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" // staker's address
let epoch = new BN(5);

let result = await stakingContract.methods.getRepresentative(staker, epoch).call();
```


## Section 3: Staking info of the next epoch
There are 2 options for getting the information of a staker for the next epoch:
  - Option A: Get all parameters in 1 function call
    - [`getLatestStakerData`](#all-staker-information-1)
  - Option B: Get each parameter individually. While these functions are in the staking contract, they are not in the interface. As such, you will have to extend the interface in order to access these functions.
    - [`getLatestStake`](#stakers-knc-stake-1)
    - [`getLatestDelegatedStake`](#stakers-delegated-stake-1)
    - [`getLatestRepresentative`](#stakers-delegated-address-1)
  
### All staker information
Obtain the `stake`, `delegatedStake` and `representative` of a staker for the next epoch

---
function **`getLatestStakerData`**(address staker, uint256 epoch) external view returns (uint256 stake, uint256 delegatedStake, address representative)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |
| `epoch` | uint256 | epoch number |

**Returns:**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `stake` | uint256 | `staker` stake amount |
| `delegatedStake` | uint256 | Stake amount delegated to `staker` by other stakers |
| `representative` | address | Wallet address `staker` delegated his stake to |
---
**Note:**
`getLatestStakerData(staker) == getStakerData(staker, N+1)` where `N` is the current epoch number only when staker data has been initialised due to a staker action

#### Example
Obtain staker's information (of address `0x12340000000000000000000000000000deadbeef`) at epoch 5.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" // staker's address
let epoch = new BN(5);

let result = await stakingContract.methods.getLatestStakerData(staker, epoch).call();
```

### Staker's KNC stake
Obtains a staker's KNC stake for the next epoch

---
function **getLatestStakeBalance**(address staker) external view returns (uint256)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |

**Returns:**
`staker` KNC stake for the next epoch.

---
**Note:**
`getLatestStakeBalance(staker) == getStake(staker, N+1)` where `N` is the current epoch number only when staker data has been initialised due to a staker action

#### Example
Obtain staker's KNC stake (of address `0x12340000000000000000000000000000deadbeef`) for the next epoch.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" // staker's address

let result = await stakingContract.methods.getLatestStakeBalance(staker).call();
```

### Staker's delegated stake
Obtains staking amount delegated to an address for the next epoch

---
function **getLatestDelegatedStake**(address staker) external view returns (uint256)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |

**Returns:**
Delegated stake amount to `staker` for the next epoch.

---
**Note:**
`getLatestDelegatedStake(staker) == getDelegatedStake(staker, N+1)` where `N` is the current epoch number only when staker data has been initialised due to a staker action

#### Example
Obtain stake amount delegated to address `0x12340000000000000000000000000000deadbeef` for the next epoch.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" // staker's address

let result = await stakingContract.methods.getLatestDelegatedStake(staker).call();
```

### Staker's delegated address
Obtains the representative's address of `staker` for the next epoch only when staker data has been initialised due to a staker action

---
function **getLatestRepresentative**(address staker, uint256 epoch) external view returns (address)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |

**Returns:**
`staker` representative address

---
**Notes:**
- `getLatestRepresentative(staker) == getRepresentative(staker, N+1)` where `N` is the current epoch number only when staker data has been initialised due to a staker action
- If user is not a staker, null address is returned
- If user did not delegate to anyone, `staker` address is returned

#### Example
Get `0x12340000000000000000000000000000deadbeef` representative's address for the next epoch.
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" // staker's address

let result = await stakingContract.methods.getLatestRepresentative(staker).call();
```

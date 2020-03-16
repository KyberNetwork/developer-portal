# Staking APIs

## Staking Actions
The APIs in this section require users to send transactions. The general rule of thumb is that any action performed by the user will only take effect in the **next epoch**. The exception to this is when the user withdraws an amount greater than deposits made in the current epoch.

### Deposit
The first step for any user is to deposit KNC into the staking contract (in token wei).

---
function **`deposit`**(uint amount) public
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `amount` | uint | KNC twei to be deposited |
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

txData = StakingContract.methods.deposit(tokenAmount).encodeABI();

txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, //obtained from web3 interface
  to: STAKING_CONTRACT_ADDRESS,
  data: txData
});
```

### Delegate
Once the user has staked some KNC, he can delegate his **entire** KNC stake to a pool master (with address `dAddr`), who will vote on his behalf. Note that we do not support partial stake delegation. Also, users can only have a maximum of 1 pool master.

---
function **`delegate`**(address dAddr) public
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `dAddr` | address | Pool master's wallet address |
---

#### Example
User delegates his stake to a pool master (of address `0x12340000000000000000000000000000deadbeef`) who will vote on the user's behalf.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let dAddr = "0x12340000000000000000000000000000deadbeef" //pool master's address

txData = StakingContract.methods.delegate(dAddr).encodeABI();

txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, //obtained from web3 interface
  to: STAKING_CONTRACT_ADDRESS,
  data: txData
});
```

### Withdrawing KNC
The user can withdraw KNC (in token wei) from the staking contract at any point in time. 

---
function **`withdraw`**(uint amount) public
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `amount` | uint | KNC twei to be withdrawn |
---

#### Example
Withdraw 1000 KNC

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

const BN = web3.utils.BN;
let tokenAmount = new BN(10).pow(new BN(21)); // 1000 KNC in twei

txData = StakingContract.methods.withdraw(tokenAmount).encodeABI();

txReceipt = await web3.eth.sendTransaction({
  from: USER_WALLET_ADDRESS, //obtained from web3 interface
  to: STAKING_CONTRACT_ADDRESS,
  data: txData
});
```

## Getting Current Epoch Number
Obtain the current epoch number of the staking contract

---
function **`getCurrentEpochNumber`**() public view returns (uint)

#### Example
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper
let currentEpochNum = await StakingContract.getCurrentEpochNumber().call();
```

## Reading Staking Data
There are primarily 3 parameters of interest (apart from getting the current epoch number):
|       Parameter      |                 Description                   |
| ---------------------|:---------------------------------------------:|
| `stake` | KNC amount staked by a staker |
| `delegatedStake` | KNC amount delegated to a staker |
| `delegatedAddress` / `dAddr` | Who the staker delegated his stake to |

We can classify the APIs for reading staking data in 4 broad sections:
- Reward percentage calculation for pool masters
- Getting the above 3 parameters for the past epochs and the current epoch
- Getting the above 3 parameters for the next epoch

## Section 1: Reward calculation for pool masters
### Staker Data Of An Epoch
Obtains a staker's information for a specified epoch. Used for calculating reward percentage by pool masters (and the DAO contract).

---
function **`getStakerDataForPastEpoch`**(address staker, uint epoch) public view returns (uint _stake, uint _delegatedStake, address _delegatedAddress)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |
| `epoch` | uint | epoch number |

**Returns:**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `_stake` | uint | `staker` stake amount |
| `_delegatedStake` | uint | Stake amount delegated to `staker` by other stakers |
| `_delegatedAddress` | address | Wallet address `staker` delegated his stake to |
---
**Notes:**
- Delegated stakes to `staker` are not forwarded to `delegatedAddress`. `staker` is still responsible for voting on behalf of all stakes delegated to him.

#### Example
Obtain staker's information (of address `0x12340000000000000000000000000000deadbeef`) at epoch 5.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" //staker's address
let epoch = new BN(5);

let result = await StakingContract.methods.getStakerDataForPastEpoch(staker, epoch).call();
```

## Section 2: Staking info of past and current epochs
### Staker's KNC stake
Obtains a staker's KNC stake for a specified epoch (up to the next epoch)

---
function **getStake**(address staker, uint epoch) public view returns (uint)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |
| `epoch` | uint | epoch number |

**Returns:**\
`staker` KNC stake at `epoch`
---
**Note:**
`getStake(staker, N+1) == getLatestStakeBalance(staker)` where `N` is the current epoch number

#### Example
Obtain staker's KNC stake (of address `0x12340000000000000000000000000000deadbeef`) at epoch 5.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" //staker's address
let epoch = new BN(5);

let result = await StakingContract.methods.getStake(staker, epoch).call();
```

### Staker's delegated stake
Obtains staking amount delegated to an address for a specified epoch (up to the next epoch)

---
function **getDelegatedStake**(address staker, uint epoch) public view returns (uint)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |
| `epoch` | uint | epoch number |

**Returns:**\
Delegated stake amount to `staker` at `epoch`
---
**Note:**
`getDelegatedStake(staker, N+1) == getLatestDelegatedStake(staker)` where `N` is the current epoch number

#### Example
Obtain stake amount delegated to address `0x12340000000000000000000000000000deadbeef` at epoch 5.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" //staker's address
let epoch = new BN(5);

let result = await StakingContract.methods.getDelegatedStake(staker, epoch).call();
```

### Staker's delegated address
Obtains the pool master's address of `staker` at a specified epoch (up to the next epoch)

---
function **getDelegatedAddress**(address staker, uint epoch) public view returns (address)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |
| `epoch` | uint | epoch number |

**Returns:**\
`staker` pool master address
---
**Notes:**
- `getDelegatedAddress(staker, N+1) == getLatestDelegatedAddress(staker)` where `N` is the current epoch number
- If user is not a staker, null address is returned
- If user did not delegate to anyone, `staker` address is returned

#### Example
Get `0x12340000000000000000000000000000deadbeef` pool master's address at epoch 5.
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" //staker's address
let epoch = new BN(5);

let result = await StakingContract.methods.getDelegatedAddress(staker, epoch).call();
```

## Section 3: Staking info of the next epoch
### Staker's KNC stake
Obtains a staker's KNC stake for the next epoch

---
function **getLatestStakeBalance**(address staker) public view returns (uint)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |

**Returns:**\
`staker` KNC stake for the next epoch.
---
**Note:**
`getLatestStakeBalance(staker) == getStake(staker, N+1)` where `N` is the current epoch number

#### Example
Obtain staker's KNC stake (of address `0x12340000000000000000000000000000deadbeef`) for the next epoch.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" //staker's address

let result = await StakingContract.methods.getLatestStakeBalance(staker).call();
```

### Staker's delegated stake
Obtains staking amount delegated to an address for the next epoch

---
function **getDelegatedStake**(address staker) public view returns (uint)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |

**Returns:**\
Delegated stake amount to `staker` for the next epoch.
---
**Note:**
`getLatestDelegatedStake(staker) == getDelegatedStake(staker, N+1)` where `N` is the current epoch number

#### Example
Obtain stake amount delegated to address `0x12340000000000000000000000000000deadbeef` for the next epoch.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" //staker's address

let result = await StakingContract.methods.getLatestDelegatedStake(staker).call();
```

### Staker's delegated address
Obtains the pool master's address of `staker` for the next epoch

---
function **getLatestDelegatedAddress**(address staker, uint epoch) public view returns (address)

**Inputs**
| Parameter | Type | Description |
| ---------- |:-------:|:-------------------:|
| `staker` | address | Staker's wallet address |

**Returns:**\
`staker` pool master address
---
**Notes:**
- `getLatestDelegatedAddress(staker) == getDelegatedAddress(staker, N+1)` where `N` is the current epoch number
- If user is not a staker, null address is returned
- If user did not delegate to anyone, `staker` address is returned

#### Example
Get `0x12340000000000000000000000000000deadbeef` pool master's address for the next epoch.
```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper

let staker = "0x12340000000000000000000000000000deadbeef" //staker's address

let result = await StakingContract.methods.getLatestDelegatedAddress(staker).call();
```

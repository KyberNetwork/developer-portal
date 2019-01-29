---
id: Reserves-OrderbookReserve
title: Orderbook Reserve
---
## Objective

In this guide, we will learn how to configure and deploy a Orderbook Reserve either locally via ganache or to the Ropsten testnet. Subsequently, we will also learn how to make, view, update and cancel orders.

## Introduction

The goal of the Orderbook Reserve is a fully on-chain reserve type that allows anyone to become a market maker (i.e., provide liquidity) for the ecosystem, in any ERC20 token of his choice. Specifically, anyone will be able to:
1. Create and list a reserve for token <-> ETH trades.
2. Deposit funds and add buy or sell limit orders, subject to general (i.e., not user dependent) limitations.

The actions above can be performed without the need for any action from Kyber (such as the network admin and / or operators).

#### Points to Note

On creation and listing:
* Anyone can create a new Orderbook Reserve that will be listed in the Kyber Network contract.
* Anyone can create limit orders once the reserve has been created and listed.
* The reserve creator has no advantage over other market makers who wish to add liquidity to this reserve.
* **There can only be 1 orderbook reserve per token.** Hence, all makers that wish to add liquidity for a specific token will add their orders on the same reserve.

On making orders:
* There is a [**minimum order amount**](#minimum-order-size) defined in dollars (Eg. USD $1000) to prevent dust orders.
* Each order requires some KNC tokens to be deposited, for the [fee sharing program](guide-feesharing.md#fee-example) and fee burning.
* Market makers have to deposit funds and KNC tokens first before making orders.
* Funds locked up in active orders cannot be withdrawn until these active orders are canceled.
* The required KNC amount for each order is dependent on the Ether value of the order.
* Each maker can have at most 64 active orders (32 buy orders and 32 sell orders).

On taking orders:
* As is the case for other reserve types, orders are fulfilled when they offer the best conversion rate, unless the taker explicitly states the exclusion of permissionless reserves for his trade request.
* A maximum of 5 orders is traversed (and therefore used) to fulfill 1 trade request.
* Upon the fulfillment of an order, a portion of the KNC locked up is set aside for burning, and the remaining KNC amount is freed up for use by the market maker, either for withdrawal or for creating new orders.
* Should an order be partially filled, the remaining order size must be at least 1/2 of the minimum amount required for a new order (Eg. USD $500) for it to stay in the orderbook. Otherwise, the order is removed, and the maker gets his remaining funds back for creating another order.

## How to set up your own reserve

### Public testnet or mainnet deployment
Before setting up an Orderbook Reserve for any token, check if such a reserve has already been deployed and listed. Note that the guide below is applicable for both testnet and mainnet.

### `Step 0: Finding a deployed reserve`

Call the [`getOrderbookListingStage()`](api-permissionlessorderbookreservelister.md#getorderbooklistingstage) function of the PermissionlessOrderbookReserveLister contract. If a reserve has been successfully deployed, the function should return:
1. A non-null address
2. A listing stage of 3.

A smaller listing stage number indicates that the listing process failed, or was not completed. Regardless of who started the process, anyone is able to continue and complete the listing process by repeating the stage that failed.

### `Step 1: Setting up an orderbook reserve`

To setup a reserve for a token that is not listed yet, the user should call the following functions of the deployed PermissionlessOrderbookReserveLister contract **in the specified order below**. The process is split into 3 steps due to gas limits.

1. [`addOrderbookContract(tokenAddress)`](api-permissionlessorderbookreservelister.md#addorderbookcontract)
This function deploys a new Orderbook Reserve contract.

2. [`initOrderbookContract(tokenAddress)`](api-permissionlessorderbookreservelister.md#initorderbookcontract)
This function initializes the orderbook contract deployed in step 1.

3. [`listOrderbookContract(tokenAddress)`](api-permissionlessorderbookreservelister.md#listorderbookcontract)
This function lists the reserve created in step 1 in the network and fee burner contracts.

After calling the 3 functions above for a specific token, the new orderbook reserve is ready to use. Its address can be found by calling the `getOrderbookListingStage()`function.

**Note:** If the token does not support the decimals API, the listing will fail.

## Making, Viewing, Updating, and Canceling Orders

Once the orderbook reserve for a specific ERC20 token has been deployed, we can start using it to create new orders. A maker must first deposit KNC and some funds prior to making new orders. Note that each reserve will only accept fund deposits in KNC, Ether and the supported reserve token.

### Making Orders and Order limits

#### Minimum order size
The minimum order size is defined in Ether wei. Token to Ether orders limits are determined by the specified `dstAmount`, while Ether to Token orders are determined by `srcAmount`.
The limit value can be seen in `limits` public variable of the orderbook contract. Attempts made to create orders below this limit will be reverted.

#### Order KNC stake
Sufficient KNC should be deposited. The stake amount required is dependent on the Ether value of the order.
To calculate this amount, one can call the [`calcKncStake(weiAmount)`](api-orderbookreserve.md#calckncstake) function, where `weiAmount` is the Ether value of the order.

To check how much KNC is available for staking, one can call the [`makerUnlockedKnc(makerAddress)`](api-orderbookreserve.md#makerunlockedknc) function.

### `Step 2: Deposit KNC Tokens`
Deposit KNC tokens by executing the [`depositKncForFee(makerAddress, weiAmount)` ](api-orderbookreserve.md#depositkncforfee) function.

<br />**Notes:**
- A KNC token allowance should be approved to this reserve before executing this function.
- Consider depositing a large amount of KNC tokens if you are creating multiple orders, to reduce the need to execute this function numerous times.

### `Step 3: Deposit Funds`

#### `Option A: Deposit Ether for Ether to Token Orders`
Deposit Ether by executing the [`depositEther(makerAddress)`](api-orderbookreserve.md#depositether) function.
<br />**Note:** Ether should be sent when executing this function.

#### `Option B: Deposit Tokens for Token To Ether Orders`
Deposit tokens by executing the [`depositToken(makerAddress, amount)`](api-orderbookreserve.md#deposittoken) function.
<br />**Note:** An allowance should be approved to this reserve before executing this function.

### `Step 4: Creating Orders`

#### `Option A: Creating an Ether to Token Order`
Execute the [`submitEthToTokenOrder(srcAmount, dstAmount)`](api-orderbookreserve.md#submitethtotokenorder) function to submit a new Ether to Token order.
<br/>**Note:** The sending address (`msg.sender`) must be the maker address specified when depositing funds.

#### `Option B: Creating a Token to Ether Order`
Execute the [`submitTokenToEthOrder(srcAmount, dstAmount)`](api-orderbookreserve.md#submittokentoethorder) function to submit a new Token to Ether order.
<br/>**Note:** The sending address (`msg.sender`) must be the maker address specified when depositing funds.

### Viewing Ether To Token Orders

**Obtaining all active Ether to Token order IDs for a specific maker**<br />
[`getEthToTokenMakerOrderIds(makerAddress)`](api-orderbookreserve.md#getethtotokenmakerorderids)

**Obtaining all active Ether to Token order IDs in the orderbook**<br />
[`getEthToTokenOrderList()`](api-orderbookreserve.md#getethtotokenorderlist)

**View the details of an Ether to Token Order**<br />
[`getEthToTokenOrder(orderId)`](api-orderbookreserve.md#getethtotokenorder)

### Viewing Token To Ether Orders

**Obtaining all active Token to Ether order IDs for a specific maker**<br />
[`getTokenToEthMakerOrderIds(makerAddress)`](api-orderbookreserve.md#gettokentoethmakerorderids)

**Obtaining all active Token to Ether order IDs in the orderbook**<br />
[`getTokenToEthOrderList()`](api-orderbookreserve.md#gettokentoethorderlist)

**View the details of a Token to Ether Order**<br />
[`getTokenToEthOrder(orderId)`](api-orderbookreserve.md#gettokentoethorder)

### Updating Orders

**Updating an Ether to Token Order**<br />
1) Obtain all active order IDs by calling [`getEthToTokenMakerOrderIds(makerAddress)`](api-orderbookreserve.md#getethtotokenmakerorderids).
2) Find the order ID that matches the `srcAmount` and `dstAmount` of the order to be updated by calling [`getEthToTokenOrder(orderId)`](api-orderbookreserve.md#getethtotokenorder).
3) Update the order by calling [`updateEthToTokenOrder(orderId, newSrcAmount, newDstAmount)`](api-orderbookreserve.md#updateethtotokenorder).

**Updating a Token to Ether Order**<br />
1) Obtain all active order IDs by calling [`getTokenToEthMakerOrderIds(makerAddress)`](api-orderbookreserve.md#gettokentoethmakerorderids).
2) Find the order ID that matches the `srcAmount` and `dstAmount` of the order to be updated by calling [`getTokenToEthOrder(orderId)`](api-orderbookreserve.md#gettokentoethorder).
3) Update the order by calling [`updateTokenToEthOrder(orderId, newSrcAmount, newDstAmount)`](api-orderbookreserve.mde/#updatetokentoethorder).

### Cancelling Orders

**Canceling an Ether to Token Order**<br />
1) Obtain all active order IDs by calling [`getEthToTokenMakerOrderIds(makerAddress)`](api-orderbookreserve.md#getethtotokenmakerorderids).
2) Find the order ID that matches the srcAmount and dstAmount of the order to be canceled by calling [`getEthToTokenOrder(orderId)`](api-orderbookreserve.md#getethtotokenorder).
3) Cancel the order by calling [`cancelEthToTokenOrder(orderId)`](api-orderbookreserve.md#cancelethtotokenorder).

**Canceling a Token To Ether Order**<br />
1) Obtain all active order IDs by calling [`getTokenToEthMakerOrderIds(makerAddress)`](api-orderbookreserve.md#gettokentoethmakerorderids).
2) Find the order ID that matches the srcAmount and dstAmount of the order to be canceled by calling [`getTokenToEthOrder(orderId)`](api-orderbookreserve.md#gettokentoethorder).
3) Cancel the order by calling [`cancelTokenToEthOrder(orderId)`](api-orderbookreserve.md#canceltokentoethorder).

### Viewing Unused Fund Amounts
The public variables below are used to view available funds for withdrawal or for creating new orders.

**Viewing Unused Ether**<br />
`makerFunds(makerAddress, 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee)`

**Viewing Unused KNC Tokens**<br />
`makerUnlockedKnc(makerAddress)`

**Viewing Unused ERC20 Tokens (including KNC tokens)**<br />
`makerFunds(makerAddress, tokenContractAddress)`

## Withdrawing Funds
Note that funds used for active orders cannot be withdrawn. One should first cancel an order so that he can withdraw the amount offered inside the order. The same applies for KNC deposits.

**Withdrawing Ether**<br />
[`withdrawEther(amount)`](api-orderbookreserve.md#withdrawether)

**Withdrawing KNC Tokens**<br />
[`withdrawKncFee(amount)`](api-orderbookreserve.md#withdrawkncfee)

**Withdrawing ERC20 Tokens**<br />
[`withdrawToken(amount)`](api-orderbookreserve.md#withdrawtoken)

## Advanced Features
To reduce gas costs, the functions for creating and updating orders have their counterparts that include an additional hint input parameter. Additionally, there are functions for creating and updating batch orders in a single transaction.

### Hint Model
As the name suggests, this additional input parameter hints to the contract which position in the order list to insert it in, by taking in the order ID of the order that is just ahead of it.

#### Obtaining the Hint
The following functions are called to obtain the hint for creating orders:
- [`getEthToTokenAddOrderHint(uint srcAmount, uint dstAmount)`](api-orderbookreserve.md#getethtotokenaddorderhint)
- [`getTokenToEthAddOrderHint(uint srcAmount, uint dstAmount)`](api-orderbookreserve.md#gettokentoethaddorderhint)

The following functions are called to obtain the hint for updating orders:
- [`getEthToTokenUpdateOrderHint(uint srcAmount, uint dstAmount)`](api-orderbookreserve.md#getethtotokenupdateorderhint)
- [`getTokenToEthUpdateOrderHint(uint srcAmount, uint dstAmount)`](api-orderbookreserve.md#gettokentoethupdateorderhint)

To understand how this hint model works, let us look at an example. Suppose the ETH to BAT buy order list contains the following orders:
| Order ID | srcAmount (`10^18`) | dstAmount (`10^18`) |
| --------- |:----------:|:-----------:|
|      `20`       |    `10`    |    `100`      |
|      `7`         |    `10`     |    `105`      |
|      `38`       |    `10`    |     `110`      |

We would like to create a new order with srcAmount `10` and dstAmount `103`. Note that this new order is better than order 7, but worse than order 20. Hence, calling the `getEthToTokenAddOrderHint(10*(10^18),103*(10^18))` returns a value of `20`.

Hence, to create the order, we pass this value of `20` as the last parameter `hintPrevOrder` of the `submitEthToTokenOrderWHint` function. The same procedure can be performed for updating orders.

#### Using the Hint
The following functions are executed for creating orders:
- [`submitEthToTokenOrderWHint(uint128 srcAmount, uint128 dstAmount, uint32 hintPrevOrder)`](api-orderbookreserve.md#submitethtotokenorderwhint)
- [`submitTokenToEthOrderWHint(uint128 srcAmount, uint128 dstAmount, uint32 hintPrevOrder)`](api-orderbookreserve.md#submittokentoethorderwhint)

The following functions are executed for updating orders:
- [`updateEthToTokenOrderWHint(uint srcAmount, uint dstAmount, uint32 hintPrevOrder)`](api-orderbookreserve.md#updateethtotokenorderwhint)
- [`updateTokenToEthOrderWHint(uint srcAmount, uint dstAmount, uint32 hintPrevOrder)`](api-orderbookreserve.md#updatetokentoethorderwhint)

#### Web3 Example
The code snippet below illustrates how one can submit a ETH to ZIL buy order using the hint.
```
const srcAmount = new web3.utils.BN('10000000000000000000') // Eg. 10 ETH
const dstAmount = new web3.utils.BN('3000000000000000') // Eg. 3000 ZIL
var hint = await OrderbookReserve.methods.getEthToTokenAddOrderHint(srcAmount, dstAmount).call()

transactionData = OrderbookReserve.methods.submitEthToTokenOrderWHint(
  srcAmount,
  dstAmount,
    hint
).encodeABI()

txReceipt = await web3.eth.sendTransaction({
    from: WALLET_ADDRESS,
    to: ORDERBOOK_RESERVE_ADDRESS,
    data: transactionData
})
```

### Batch Orders
Batch orders allow for the creation and update of both buy and sell orders in a single transaction, thus reducing gas costs.

**Note:**
While the hint model is applicable for batch orders, it should only be used for at most 1 buy order and 1 sell order, which have to offer the most favourable rate to the taker. This is because subsequent hints provided are ignored. To understand this, let's look at an example.

#### Example
Suppose the ETH to BAT buy order list contains the following orders:
| Order ID | srcAmount (`10^18`) | dstAmount (`10^18`) |
| --------- |:----------:|:-----------:|
|      `5`       |    `10`    |    `100`      |
|      `9`       |    `10`    |    `105`      |

The BAT to ETH sell order list contains the following orders:
| Order ID | srcAmount (`10^18`) | dstAmount (`10^18`) |
| --------- |:----------:|:-----------:|
|      `10`       |    `100`    |    `12`      |
|      `38`       |    `100`    |     `15`     |

We would like to add the following orders:
1. Order A: Buy order with srcAmount `10`, dstAmount `102`
2. Order B: Buy order with srcAmount `10`, dstAmount `104`
3. Order C: Sell order with srcAmount `100`, dstAmount `18`

In this scenario, the best buy and sell orders for the taker are orders A and C respectively. Calling the respective getHint functions yield order IDs 5 and 38.

We call the [`addOrderBatch`](api-orderbookreserve.md#addorderbatch) function to add orders A, B and C in this order, with the input parameters below.
| **Parameter** | **Example Input** | **Explanation** |
| --------- |:----------:|:-----------:|
|      `isEthToToken`       |    `[true,true,false]`    | Orders A and B are buy orders, Order C is a sell order |
|      `srcAmount`       |    `[(10*10^18),(10*10^18),(100*10^18)]`    | Respective order source amounts |
|      `dstAmount`       |    `[(102*10^18),(104*10^18),(18*10^18)]`    | Respective order destination amounts |
|      `hintPrevOrder`       |    `[5,0,38]`    | Hints of previous order IDs. If unsure, use `0` |
|      `isAfterPrevOrder` |   `[false,true,false]`  | Since order B is to be in the position after order A, and order A will only have its ID assigned after its addition to the list, we cannot possibly know the previous ID for order B. Hence, we need to set its value to `true` in this array. If unsure, use `false` |

We give a short code snippet below.
```
transactionData = OrderbookReserve.methods.addOrderBatch(
	[true,true,false],
	[(10*10^18),(10*10^18),(100*10^18)],
	[(102*10^18),(104*10^18),(18*10^18)],
	[5,0,38],
	[false,true,false]
).encodeABI()
```

#### Adding Batch Orders
[`addOrderBatch`](api-orderbookreserve.md#addorderbatch)

#### Updating Batch Orders
[`updateOrderBatch`](api-orderbookreserve.md#updateorderbatch)

## Local testnet deployment
Here, we will walk you through an example on running the deployment script on [Truffle's Ganache](https://truffleframework.com/ganache).

#### Before you begin
Check that you have the following:
1. [node.js](https://nodejs.org/en/download/)
2. [web3 1.X.X](https://www.npmjs.com/package/web3)
3. [Ganache CLI)](https://github.com/trufflesuite/ganache-cli)

#### Prerequisites

1. Node and NPM LTS versions `10.14.1` and `6.4.1` respectively. Download from [nodejs.org](https://nodejs.org/en/download/)

2. Ganache

Install the Ganache AppImage by downloading here https://truffleframework.com/ganache.
To use the provided Ganache snapshot, install `ganache-cli`.

```sh
sudo npm install -g ganache-cli
```

3. Truffle

Install the latest Truffle v5.

```sh
sudo npm install -g truffle@latest
```

Truffle v5.0 is needed in order to take advantage of new features, such as using async/await in the migration scripts. You can read more about the new features in the [Truffle release page](https://github.com/trufflesuite/truffle/releases/tag/v5.0.0)


#### Notes
1. The sequence of migrating to Ganache can be seen in the migration scripts under `workshop/migrations`.
2. The migration scripts or Ganache snapshot uses test tokens. New test tokens can be configured in `workshop/contracts/mockTokens`.


### `Step 1: Cloning the repository`

Create a local directory and clone the `master` branch from our [workshop repo](https://github.com/KyberNetwork/workshop) on GitHub.

```sh
git clone https://github.com/KyberNetwork/workshop.git
```

Install the the NPM packages

```sh
npm install
```

### `Step 2A: Running Ganache with local snapshot`

A Ganache snapshot has already been pre-made with the Kyber contracts deployed. You can immediately interact with the contracts without having to do migrations. The snapshot is stored in `db` folder.

We use the mnemonic `gesture rather obey video awake genuine patient base soon parrot upset lounge` for the accounts. The user wallet (`0x47a793D7D0AA5727095c3Fe132a6c1A46804c8D2`) already contains some ETH and test ERC20 tokens.

**NOTE:** The mnemonic provided is used only for testing. DO NOT use the accounts generated for your own personal use in mainnet, as you can potentially lose those funds.

To run the snapshot locally, run the command:

```sh
ganache-cli --db db --accounts 10 --defaultBalanceEther 500 --mnemonic 'gesture rather obey video awake genuine patient base soon parrot upset lounge' --networkId 5777 --debug
```

### `Step 2B: Running the Truffle migration scripts with new Ganache instance`

If you wish to deploy the Kyber contracts in Ganache yourself, you can run the following commands:

Run a new ganache-cli in one terminal session.

```
ganache-cli --accounts 10 --defaultBalanceEther 500 --mnemonic 'gesture rather obey video awake genuine patient base soon parrot upset lounge' --networkId 5777 --debug
```

In a new terminal session, connect to the Ganache, and run the truffle migration scripts
```
truffle migrate --network development --reset
```

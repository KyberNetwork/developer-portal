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

## Disclaimer
**All code snippets in this guide have not been audited and should not be used in production. If so, it is done at your own risk.**

#### Points to Note

On creation and listing:
* Anyone can create a new Orderbook Reserve that will be listed in the Kyber Network contract.
* Anyone can create limit orders once the reserve has been created and listed.
* The reserve creator has no advantage over other market makers who wish to add liquidity to this reserve.
* **There can only be 1 orderbook reserve per token.** Hence, all makers that wish to add liquidity for a specific token will add their orders on the same reserve.

On making orders:
* There is a [**minimum order amount**](#minimum-order-size) defined in dollars (Eg. USD $1000) to prevent dust orders.
* Each order requires some KNC tokens to be deposited, for the [fee sharing program](integrations-feesharing.md) and fee burning.
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

### Local testnet deployment
You may refer to [this section](reserves-ganache.md) on how to deploy and test the reserve locally using [Truffle's Ganache](https://truffleframework.com/ganache).

### Public testnet deployment
Before setting up an Orderbook Reserve for any token, check if such a reserve has already been deployed and listed. The guide is applicable for mainnet deployment as well.

### `Step 0: Finding a deployed reserve`

Call the [`getOrderbookListingStage()`](api_abi-permissionlessorderbookreservelister.md#getorderbooklistingstage) function of the PermissionlessOrderbookReserveLister contract. If a reserve has been successfully deployed, the function should return:
1. A non-null address
2. A listing stage of 3.

A smaller listing stage number indicates that the listing process failed, or was not completed. Regardless of who started the process, anyone is able to continue and complete the listing process by repeating the stage that failed.

### `Step 1: Setting up an orderbook reserve`

To setup a reserve for a token that is not listed yet, the user should call the following functions of the deployed PermissionlessOrderbookReserveLister contract **in the specified order below**. The process is split into 3 steps due to gas limits.

1. [`addOrderbookContract(tokenAddress)`](api_abi-permissionlessorderbookreservelister.md#addorderbookcontract)
This function deploys a new Orderbook Reserve contract.

2. [`initOrderbookContract(tokenAddress)`](api_abi-permissionlessorderbookreservelister.md#initorderbookcontract)
This function initializes the orderbook contract deployed in step 1.

3. [`listOrderbookContract(tokenAddress)`](api_abi-permissionlessorderbookreservelister.md#listorderbookcontract)
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
To calculate this amount, one can call the [`calcKncStake(weiAmount)`](api_abi-orderbookreserve.md#calckncstake) function, where `weiAmount` is the Ether value of the order.

To check how much KNC is available for staking, one can call the [`makerUnlockedKnc(makerAddress)`](api_abi-orderbookreserve.md#makerunlockedknc) function.

### `Step 2: Deposit KNC Tokens`
Deposit KNC tokens by executing the [`depositKncForFee(makerAddress, weiAmount)` ](api_abi-orderbookreserve.md#depositkncforfee) function.

<br />**Notes:**
- A KNC token allowance should be approved to this reserve before executing this function.
- Consider depositing a large amount of KNC tokens if you are creating multiple orders, to reduce the need to execute this function numerous times.

### `Step 3: Deposit Funds`

#### `Option A: Deposit Ether for Ether to Token Orders`
Deposit Ether by executing the [`depositEther(makerAddress)`](api_abi-orderbookreserve.md#depositether) function.
<br />**Note:** Ether should be sent when executing this function.

#### `Option B: Deposit Tokens for Token To Ether Orders`
Deposit tokens by executing the [`depositToken(makerAddress, amount)`](api_abi-orderbookreserve.md#deposittoken) function.
<br />**Note:** An allowance should be approved to this reserve before executing this function.

### `Step 4: Creating Orders`

#### `Option A: Creating an Ether to Token Order`
Execute the [`submitEthToTokenOrder(srcAmount, dstAmount)`](api_abi-orderbookreserve.md#submitethtotokenorder) function to submit a new Ether to Token order.
<br/>**Note:** The sending address (`msg.sender`) must be the maker address specified when depositing funds.

#### `Option B: Creating a Token to Ether Order`
Execute the [`submitTokenToEthOrder(srcAmount, dstAmount)`](api_abi-orderbookreserve.md#submittokentoethorder) function to submit a new Token to Ether order.
<br/>**Note:** The sending address (`msg.sender`) must be the maker address specified when depositing funds.

### Viewing Ether To Token Orders

**Obtaining all active Ether to Token order IDs for a specific maker**<br />
[`getEthToTokenMakerOrderIds(makerAddress)`](api_abi-orderbookreserve.md#getethtotokenmakerorderids)

**Obtaining all active Ether to Token order IDs in the orderbook**<br />
[`getEthToTokenOrderList()`](api_abi-orderbookreserve.md#getethtotokenorderlist)

**View the details of an Ether to Token Order**<br />
[`getEthToTokenOrder(orderId)`](api_abi-orderbookreserve.md#getethtotokenorder)

### Viewing Token To Ether Orders

**Obtaining all active Token to Ether order IDs for a specific maker**<br />
[`getTokenToEthMakerOrderIds(makerAddress)`](api_abi-orderbookreserve.md#gettokentoethmakerorderids)

**Obtaining all active Token to Ether order IDs in the orderbook**<br />
[`getTokenToEthOrderList()`](api_abi-orderbookreserve.md#gettokentoethorderlist)

**View the details of a Token to Ether Order**<br />
[`getTokenToEthOrder(orderId)`](api_abi-orderbookreserve.md#gettokentoethorder)

### Updating Orders

**Updating an Ether to Token Order**<br />
1) Obtain all active order IDs by calling [`getEthToTokenMakerOrderIds(makerAddress)`](api_abi-orderbookreserve.md#getethtotokenmakerorderids).
2) Find the order ID that matches the `srcAmount` and `dstAmount` of the order to be updated by calling [`getEthToTokenOrder(orderId)`](api_abi-orderbookreserve.md#getethtotokenorder).
3) Update the order by calling [`updateEthToTokenOrder(orderId, newSrcAmount, newDstAmount)`](api_abi-orderbookreserve.md#updateethtotokenorder).

**Updating a Token to Ether Order**<br />
1) Obtain all active order IDs by calling [`getTokenToEthMakerOrderIds(makerAddress)`](api_abi-orderbookreserve.md#gettokentoethmakerorderids).
2) Find the order ID that matches the `srcAmount` and `dstAmount` of the order to be updated by calling [`getTokenToEthOrder(orderId)`](api_abi-orderbookreserve.md#gettokentoethorder).
3) Update the order by calling [`updateTokenToEthOrder(orderId, newSrcAmount, newDstAmount)`](api_abi-orderbookreserve.mde/#updatetokentoethorder).

### Cancelling Orders

**Canceling an Ether to Token Order**<br />
1) Obtain all active order IDs by calling [`getEthToTokenMakerOrderIds(makerAddress)`](api_abi-orderbookreserve.md#getethtotokenmakerorderids).
2) Find the order ID that matches the srcAmount and dstAmount of the order to be canceled by calling [`getEthToTokenOrder(orderId)`](api_abi-orderbookreserve.md#getethtotokenorder).
3) Cancel the order by calling [`cancelEthToTokenOrder(orderId)`](api_abi-orderbookreserve.md#cancelethtotokenorder).

**Canceling a Token To Ether Order**<br />
1) Obtain all active order IDs by calling [`getTokenToEthMakerOrderIds(makerAddress)`](api_abi-orderbookreserve.md#gettokentoethmakerorderids).
2) Find the order ID that matches the srcAmount and dstAmount of the order to be canceled by calling [`getTokenToEthOrder(orderId)`](api_abi-orderbookreserve.md#gettokentoethorder).
3) Cancel the order by calling [`cancelTokenToEthOrder(orderId)`](api_abi-orderbookreserve.md#canceltokentoethorder).

### Viewing Unused Fund Amounts
The public variables below are used to view available funds for withdrawal or for creating new orders.

**Viewing Unused Ether**<br />
`makerFunds(makerAddress, 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee)`

**Viewing Unused KNC Tokens**<br />
`makerUnlockedKnc(makerAddress)`

**Viewing Unused ERC20 Tokens (excluding KNC tokens)**<br />
`makerFunds(makerAddress, tokenContractAddress)`

## Withdrawing Funds
Note that funds used for active orders cannot be withdrawn. One should first cancel an order so that he can withdraw the amount offered inside the order. The same applies for KNC deposits.

**Withdrawing Ether**<br />
[`withdrawEther(amount)`](api_abi-orderbookreserve.md#withdrawether)

**Withdrawing KNC Tokens**<br />
[`withdrawKncFee(amount)`](api_abi-orderbookreserve.md#withdrawkncfee)

**Withdrawing ERC20 Tokens**<br />
[`withdrawToken(amount)`](api_abi-orderbookreserve.md#withdrawtoken)

## Advanced Features
To reduce gas costs, the functions for creating and updating orders have their counterparts that include an additional hint input parameter. Additionally, there are functions for creating and updating batch orders in a single transaction.

### Hint Model
As the name suggests, this additional input parameter hints to the contract which position in the order list to insert it in, by taking in the order ID of the order that is just ahead of it.

#### Obtaining the Hint
The following functions are called to obtain the hint for creating orders:
- [`getEthToTokenAddOrderHint(uint srcAmount, uint dstAmount)`](api_abi-orderbookreserve.md#getethtotokenaddorderhint)
- [`getTokenToEthAddOrderHint(uint srcAmount, uint dstAmount)`](api_abi-orderbookreserve.md#gettokentoethaddorderhint)

The following functions are called to obtain the hint for updating orders:
- [`getEthToTokenUpdateOrderHint(uint srcAmount, uint dstAmount)`](api_abi-orderbookreserve.md#getethtotokenupdateorderhint)
- [`getTokenToEthUpdateOrderHint(uint srcAmount, uint dstAmount)`](api_abi-orderbookreserve.md#gettokentoethupdateorderhint)

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
- [`submitEthToTokenOrderWHint(uint128 srcAmount, uint128 dstAmount, uint32 hintPrevOrder)`](api_abi-orderbookreserve.md#submitethtotokenorderwhint)
- [`submitTokenToEthOrderWHint(uint128 srcAmount, uint128 dstAmount, uint32 hintPrevOrder)`](api_abi-orderbookreserve.md#submittokentoethorderwhint)

The following functions are executed for updating orders:
- [`updateEthToTokenOrderWHint(uint srcAmount, uint dstAmount, uint32 hintPrevOrder)`](api_abi-orderbookreserve.md#updateethtotokenorderwhint)
- [`updateTokenToEthOrderWHint(uint srcAmount, uint dstAmount, uint32 hintPrevOrder)`](api_abi-orderbookreserve.md#updatetokentoethorderwhint)

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
The hint model is applicable for batch orders, unless the previous order is an order that is added as part of this batch call (where `prevOrderId` is not known beforehand). In the scenario where new orders in the batch will be added one after the other, it is recommended to arrange them such that better orders are placed first, so that subsequent orders will have the flag: `isAfterPrevOrder` set to `true`.

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
3. Order C: Buy order with srcAmount `10`, dstAmount `107`
4. Order D: Sell order with srcAmount `100`, dstAmount `18`

In this scenario, the best buy and sell orders for the taker are orders A and D respectively. Calling the respective getHint functions yield order IDs 5 and 38.

We call the [`addOrderBatch`](api_abi-orderbookreserve.md#addorderbatch) function to add orders A, B, C and D in this order, with the input parameters below.
| **Parameter** | **Example Input** | **Explanation** |
| --------- |:----------:|:-----------:|
|      `isEthToToken`       |    `[true,true,true,false]`    | Orders A, B, C are buy orders, Order D is a sell order |
|      `srcAmount`       |    `[(10*10^18),(10*10^18),(10*10^18),(100*10^18)]`    | Respective order source amounts |
|      `dstAmount`       |    `[(102*10^18),(104*10^18),(107*10^18),(18*10^18)]`    | Respective order destination amounts |
|      `hintPrevOrder`       |    `[5,0,9,38]`    | Hints of previous order IDs. If unsure, use `0` |
|      `isAfterPrevOrder` |   `[false,true,false,false]`  | Since order B is to be in the position after order A, and order A will only have its ID assigned after its addition to the list, we cannot possibly know the previous ID for order B. Hence, we need to set its value to `true` in this array. If unsure, use `false` |

We give a short code snippet below.
```
transactionData = OrderbookReserve.methods.addOrderBatch(
	[true,true,true,false], //isEthToToken
	[10000000000000000000,10000000000000000000,10000000000000000000,100000000000000000000], //srcAmount
	[102000000000000000000,104000000000000000000,107000000000000000000,18000000000000000000], //dstAmount
	[5,0,9,38], //hintPrevOrder
	[false,true,false,false] //isAfterPrevOrder
).encodeABI()
```

#### Adding Batch Orders
[`addOrderBatch`](api_abi-orderbookreserve.md#addorderbatch)

#### Updating Batch Orders
[`updateOrderBatch`](api_abi-orderbookreserve.md#updateorderbatch)

## Local testnet deployment
You may refer to [this section](reserves-ganache.md) on how to deploy and test the reserve locally using [Truffle's Ganache](https://truffleframework.com/ganache).

## Etherscan Orderbook Reserve Code Verification
1. Copy the source code from a verified orderbook reserve contract, such as [this DAI orderbook reserve](https://etherscan.io/address/0x9d27a2d71ac44e075f764d5612581e9afc1964fd#code)
2. Contract name is `OrderbookReserve`
3. Use compiler version `v0.4.18+commit.9cf6e910`
4. Optimization: `On`
5. Add the ABI-encoded constructor arguments which are as follows:
```
ERC20 knc //KNC token contract address
ERC20 reserveToken, //Token contract address orderbook reserve supports
address burner //feeBurner contract address
address network, //KyberNetwork contract address
MedianizerInterface medianizer, //Medianizer contract address
OrderListFactoryInterface factory, //Factory contract address
uint minNewOrderUsd, //Minimum order size in USD
uint maxOrdersPerTrade, // maximum orders to traverse
uint burnFeeBps //fee burn in BPS
```

### Points To Note
- All constructor arguments except `reserveToken` can be read from the PermissionlessOrderbookReserveLister contract
- The constructor arguments should be changed accordingly, depending on the network environment

### Mainnet Example
```
000000000000000000000000dd974d5c2e2928dea5f71b9825b8b646686bd200
00000000000000000000000089d24a6b4ccb1b6faa2625fe562bdd9a23260359
00000000000000000000000052166528FCC12681aF996e409Ee3a421a4e128A3
0000000000000000000000009ae49C0d7F8F9EF4B864e004FE86Ac8294E20950
000000000000000000000000729d19f657bd0614b4985cf1d82531c67569197b
000000000000000000000000e7d2c6c4e9a423412225e50464dcde99c803e42b
00000000000000000000000000000000000000000000000000000000000003e8
0000000000000000000000000000000000000000000000000000000000000005
0000000000000000000000000000000000000000000000000000000000000019
```

### Ropsten Example
```
0000000000000000000000004e470dc7321e84ca96fcaedd0c8abcebbaeb68c6
0000000000000000000000004e470dc7321e84ca96fcaedd0c8abcebbaeb68c6
00000000000000000000000081ae4de9a3aec67a35c05c889052260e39bc42a4
0000000000000000000000003f9a8e219ab1ad42f96b22c294e564b2b48fe636
000000000000000000000000ca582805ebb662974862bce7411b1ae939d366aa
000000000000000000000000e5d890fc1fb24b6cbc69281171540cc65d117bfc
00000000000000000000000000000000000000000000000000000000000003e8
0000000000000000000000000000000000000000000000000000000000000005
0000000000000000000000000000000000000000000000000000000000000019
```

---
id: OrderbookReservesGuide
title: Orderbook Reserve Setup
---
## Objective
In this guide, we will learn how to configure and deploy a Orderbook Reserve either locally via ganache or to the Ropsten testnet. Subsequently, we will also learn how to make, view, update and cancel orders.

## Introduction
The goal of the Orderbook Reserve is a fully on-chain reserve type that allows anyone to become a market maker (i.e., provide liquidity) for the ecosystem, in any ERC20 token of his choice. Specifically, anyone will be able to:
1. Create and list a reserve for token <-> ETH trades.
2. Deposit funds and add buy or sell limit orders, subject to general (i.e., not user dependent) limitations.

The actions above can be performed without the need for any action from Kyber (such as the network admin and / or operators).

## Points to Note
#### Creation and listing
- Anyone can create a new Orderbook Reserve that will be listed in the Kyber Network contract.
- Anyone can create limit orders once the reserve has been created and listed.
- The reserve creator has no advantage over other market makers who wish to add liquidity to this reserve.
- **There can only be 1 orderbook reserve per token.** Hence, all makers that wish to add liquidity for a specific token will add their orders on the same reserve.

#### Making orders
- There is a **minimum order amount** defined in dollars (Eg. USD $1000) to prevent dust orders.
- Each order requires some KNC tokens to be deposited, as payment for using the network.
- Market makers have to deposit funds and KNC tokens first before making orders.
- Funds locked up in active orders cannot be withdrawn until these active orders are cancelled.
- The required KNC amount for each order is dependent on the Ether value of the order.
- Each maker can have at most 64 active orders (32 buy orders and 32 sell orders).

#### Taking orders
- As is the case for other reserve types, orders are fulfilled when they offer the best conversion rate, unless the taker explicitly states the exclusion of permissionless reserves for his trade request.
- A maximum of 5 orders is traversed (and therefore used) to fulfill 1 trade request.
- Upon the fulfillment of an order, a portion of the KNC locked up is set aside for burning, and the remaining KNC amount is freed up for use by the market maker, either for withdrawal or for creating new orders.
- Should an order be partially filled, the remaining order size must be at least 1/2 of the minimum amount required for a new order (Eg. USD $500) for it to stay in the orderbook. Otherwise, the order is removed, and the maker gets his remaining funds back for creating another order.

## How to set up your own reserve

### Public testnet deployment
Before setting up an Orderbook Reserve for any token, check if such a reserve has already been deployed and listed.

#### Step 0: Finding a deployed reserve
Call the [`getOrderbookListingStage()`](PermissionlessOrderbookReserveLister#getorderbooklistingstage) function of the PermissionlessOrderbookReserveLister contract. If a reserve has been successfully deployed, the function should return:
1. A non-null address
2. A listing stage of 3.

A smaller listing stage number indicates that the listing process failed, or was not completed. Regardless of who started the process, anyone is able to continue and complete the listing process by repeating the stage that failed.


#### Step 1: Setting up an orderbook reserve
To setup a reserve for a token that is not listed yet, the user should call the following functions of the deployed PermissionlessOrderbookReserveLister contract **in the specified order below**. The process is split into 3 steps due to gas limits.

1. [`addOrderbookContract(tokenAddress)`](PermissionlessOrderbookReserveLister#addorderbookcontract)
This function deploys a new Orderbook Reserve contract.

2. [`initOrderbookContract(tokenAddress)`](PermissionlessOrderbookReserveLister#initorderbookcontract)
This function initializes the orderbook contract deployed in step 1.

3. [`listOrderbookContract(tokenAddress)`](PermissionlessOrderbookReserveLister#listorderbookcontract)
This function lists the reserve created in step 1 in the network and fee burner contracts.

After calling the 3 functions above for a specific token, the new orderbook reserve is ready to use. Its address can be found by calling the `getOrderbookListingStage()`function.

## Making, Viewing, Updating and Cancelling Orders
Once the orderbook reserve for a specific ERC20 token has been deployed, we can start using it to create new orders. A maker must first deposit KNC and some funds prior to making new orders. Note that each reserve will only accept fund deposits in Ether or the supported reserve token.

### Making Orders
#### Order limits
##### Minimum order size
The minimum order size is defined in Ether wei. Token to Ether orders limits are determined by the specified `dstAmount`, while Ether to Token orders are determined by `srcAmount`.
The limit value can be seen in `limits` public variable of the orderbook contract. Attempts made to create orders below this limit will be reverted.

##### Order KNC stake
Sufficient KNC should be deposited. The stake amount required is dependent on the Ether value of the order.
To calculate this amount, one can call the [`calcKncStake(weiAmount)`](OrderbookReserve#calckncstake) function, where `weiAmount` is the Ether value of the order.

To check how much KNC is available for staking, one can call the [`makerUnlockedKnc(makerAddress)`](OrderbookReserve#makerunlockedknc) function, where `maker` should the maker's address.

#### Step 2a: Creating a Token to Ether Order
1) [`depositKncForFee(makerAddress, weiAmount)` ](OrderbookReserve#depositkncforfee)
<br />**Note:** A KNC token allowance should be approved to this reserve before calling this function.

2) [`depositToken(makerAddress, amount)`](OrderbookReserve#deposittoken)
<br />**Note:** An allowance should be approved to this reserve before calling this function.

3) [`submitTokenToEthOrder(srcAmount, dstAmount)`](OrderbookReserve#submittokentoethorder)
<br/>**Note:** The sending address (`msg.sender`) must be the maker address specified for depositing funds.

Steps 1 and 2 can be done in any order, but step 3 requires the completion of the previous steps.

#### Step 2b: Creating an Ether to Token Order
1) [`depositKncForFee(makerAddress, weiAmount)` ](OrderbookReserve#depositkncforfee)
<br />**Note:** A KNC token allowance should be approved to this reserve before calling this function.

2) [`depositEther(makerAddress)`](OrderbookReserve#depositether)
<br />**Note:** Ether should be sent when calling this function.

3) [`submitEthToTokenOrder(srcAmount, dstAmount)`](OrderbookReserve#submitethtotokenorder)
<br/>**Note:** The sending address (`msg.sender`) must be the maker address specified for depositing funds.

Steps 1 and 2 can be done in any order, but step 3 requires the completion of the previous steps.

### Viewing Orders
#### Viewing Ether To Token Orders

##### Obtaining all active Ether to Token order IDs for a specific maker
[`getEthToTokenMakerOrderIds(makerAddress)`](OrderbookReserve#getethtotokenmakerorderids)

##### Obtaining all active Ether to Token order IDs in the orderbook
[`getEthToTokenOrderList()`](OrderbookReserve#getethtotokenorderlist)

##### View the details of an Ether to Token Order
[`getEthToTokenOrder(orderId)`](OrderbookReserve#getethtotokenorder)

#### Viewing Token to Ether Orders

##### Obtaining all active Token to Ether order IDs for a specific maker
[`getTokenToEthMakerOrderIds(makerAddress)`](OrderbookReserve#gettokentoethmakerorderids)

##### Obtaining all active Token to Ether order IDs in the orderbook
[`getTokenToEthOrderList()`](OrderbookReserve#gettokentoethorderlist)

##### View the details of a Token to Ether Order
[`getTokenToEthOrder(orderId)`](OrderbookReserve#gettokentoethorder)

### Updating Orders
#### Updating an Ether to Token Order
[`updateEthToTokenOrder(orderId, newSrcAmount, newDstAmount)`](OrderbookReserve#updateethtotokenorder)

#### Updating a Token to Ether Order
[`updateTokenToEthOrder(orderId, newSrcAmount, newDstAmount)`](OrderbookReserve#updatetokentoethorder)

### Cancelling Orders
#### Cancelling an Ether to Token Order
[`cancelEthToTokenOrder(orderId)`](OrderbookReserve#cancelethtotokenorder)

#### Cancelling a Token To Ether Order
[`cancelTokenToEthOrder(orderId)`](OrderbookReserve#canceltokentoethorder)

### Viewing Unused Fund Amounts
The function below is used to view available funds for withdrawal or for creating new orders.

#### Viewing Unused Ether
`makerFunds(makerAddress, 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee)`

#### Viewing Unused ERC20 Tokens (including KNC tokens)
`makerFunds(makerAddress, tokenContractAddress)`

### Withdrawing Funds
Note that funds used for active orders cannot be withdrawn. One should first cancel an order so that he can withdraw the amount offered inside the order. The same applies for KNC deposits.

#### Withdrawing Ether
[`withdrawEther(amount)`](OrderbookReserve#withdrawether)

#### Withdrawing KNC Tokens
[`withdrawKncFee(amount)`](OrderbookReserve#withdrawkncfee)

#### Withdrawing ERC20 Tokens
[`withdrawToken(amount)`](OrderbookReserve#withdrawtoken)

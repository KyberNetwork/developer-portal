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

#### Points to Note

On creation and listing:
* Anyone can create a new Orderbook Reserve that will be listed in the Kyber Network contract.
* Anyone can create limit orders once the reserve has been created and listed.
* The reserve creator has no advantage over other market makers who wish to add liquidity to this reserve.
* **There can only be 1 orderbook reserve per token.** Hence, all makers that wish to add liquidity for a specific token will add their orders on the same reserve.

On making orders:
* There is a **minimum order amount** defined in dollars (Eg. USD $1000) to prevent dust orders.
* Each order requires some KNC tokens to be deposited, as payment for using the network.
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

### Public testnet deployment
Before setting up an Orderbook Reserve for any token, check if such a reserve has already been deployed and listed.

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

#### Making, Viewing, Updating, and Canceling Orders

Once the orderbook reserve for a specific ERC20 token has been deployed, we can start using it to create new orders. A maker must first deposit KNC and some funds prior to making new orders. Note that each reserve will only accept fund deposits in Ether or the supported reserve token.

#### Making Orders and Order limits

##### Minimum order size
The minimum order size is defined in Ether wei. Token to Ether orders limits are determined by the specified `dstAmount`, while Ether to Token orders are determined by `srcAmount`.
The limit value can be seen in `limits` public variable of the orderbook contract. Attempts made to create orders below this limit will be reverted.

##### Order KNC stake
Sufficient KNC should be deposited. The stake amount required is dependent on the Ether value of the order.
To calculate this amount, one can call the [`calcKncStake(weiAmount)`](api-orderbookreserve.md#calckncstake) function, where `weiAmount` is the Ether value of the order.

To check how much KNC is available for staking, one can call the [`makerUnlockedKnc(makerAddress)`](api-orderbookreserve.md#makerunlockedknc) function, where `maker` should the maker's address.

### `Step 2A: Creating a Token to Ether Order`

1) [`depositKncForFee(makerAddress, weiAmount)` ](api-orderbookreserve.md#depositkncforfee)
<br />**Note:** A KNC token allowance should be approved to this reserve before calling this function.

2) [`depositToken(makerAddress, amount)`](api-orderbookreserve.md#deposittoken)
<br />**Note:** An allowance should be approved to this reserve before calling this function.

3) [`submitTokenToEthOrder(srcAmount, dstAmount)`](api-orderbookreserve.md#submittokentoethorder)
<br/>**Note:** The sending address (`msg.sender`) must be the maker address specified for depositing funds.

(1) and (2) can be done in any order, but (3) requires the completion of the previous steps.

### `Step 2B: Creating an Ether to Token Order`

1) [`depositKncForFee(makerAddress, weiAmount)` ](api-orderbookreserve.md#depositkncforfee)
<br />**Note:** A KNC token allowance should be approved to this reserve before calling this function.

2) [`depositEther(makerAddress)`](api-orderbookreserve.md#depositether)
<br />**Note:** Ether should be sent when calling this function.

3) [`submitEthToTokenOrder(srcAmount, dstAmount)`](api-orderbookreserve.md#submitethtotokenorder)
<br/>**Note:** The sending address (`msg.sender`) must be the maker address specified for depositing funds.

(1) and (2) can be done in any order, but (3) requires the completion of the previous steps.

#### VIEWING ETHER TO TOKEN ORDERS

**Obtaining all active Ether to Token order IDs for a specific maker**<br />
[`getEthToTokenMakerOrderIds(makerAddress)`](api-orderbookreserve.md#getethtotokenmakerorderids)

**Obtaining all active Ether to Token order IDs in the orderbook**<br />
[`getEthToTokenOrderList()`](api-orderbookreserve.md#getethtotokenorderlist)

**View the details of an Ether to Token Order**<br />
[`getEthToTokenOrder(orderId)`](api-orderbookreserve.md#getethtotokenorder)

#### VIEWING TOKEN TO ETHER ORDERS

**Obtaining all active Token to Ether order IDs for a specific maker**<br />
[`getTokenToEthMakerOrderIds(makerAddress)`](api-orderbookreserve.md#gettokentoethmakerorderids)

**Obtaining all active Token to Ether order IDs in the orderbook**<br />
[`getTokenToEthOrderList()`](api-orderbookreserve.md#gettokentoethorderlist)

**View the details of a Token to Ether Order**<br />
[`getTokenToEthOrder(orderId)`](api-orderbookreserve.md#gettokentoethorder)

#### UPDATING ORDERS

**Updating an Ether to Token Order**<br />
1) Obtain all active order IDs by calling [`getEthToTokenMakerOrderIds(makerAddress)`](api-orderbookreserve.md#getethtotokenmakerorderids).
2) Find the order ID that matches the srcAmount and dstAmount of the order to be updated by calling [`getEthToTokenOrder(orderId)`](api-orderbookreserve.md#getethtotokenorder).
3) Update the order by calling [`updateEthToTokenOrder(orderId, newSrcAmount, newDstAmount)`](api-orderbookreserve.md#updateethtotokenorder).

**Updating a Token to Ether Order**<br />
1) Obtain all active order IDs by calling [`getTokenToEthMakerOrderIds(makerAddress)`](api-orderbookreserve.md#gettokentoethmakerorderids).
2) Find the order ID that matches the srcAmount and dstAmount of the order to be updated by calling [`getTokenToEthOrder(orderId)`](api-orderbookreserve.md#gettokentoethorder).
3) Update the order by calling [`updateTokenToEthOrder(orderId, newSrcAmount, newDstAmount)`](api-orderbookreserve.mde/#updatetokentoethorder).

#### CANCELING ORDERS

**Canceling an Ether to Token Order**<br />
1) Obtain all active order IDs by calling [`getEthToTokenMakerOrderIds(makerAddress)`](api-orderbookreserve.md#getethtotokenmakerorderids).
2) Find the order ID that matches the srcAmount and dstAmount of the order to be canceled by calling [`getEthToTokenOrder(orderId)`](api-orderbookreserve.md#getethtotokenorder).
3) Cancel the order by calling [`cancelEthToTokenOrder(orderId)`](api-orderbookreserve.md#cancelethtotokenorder).

**Canceling a Token To Ether Order**<br />
1) Obtain all active order IDs by calling [`getTokenToEthMakerOrderIds(makerAddress)`](api-orderbookreserve.md#gettokentoethmakerorderids).
2) Find the order ID that matches the srcAmount and dstAmount of the order to be canceled by calling [`getTokenToEthOrder(orderId)`](api-orderbookreserve.md#gettokentoethorder).
3) Cancel the order by calling [`cancelTokenToEthOrder(orderId)`](api-orderbookreserve.md#canceltokentoethorder).

#### VIEWING UNUSED FUND AMOUNTS
The public variables below is used to view available funds for withdrawal or for creating new orders.

**Viewing Unused Ether**<br />
`makerFunds(makerAddress, 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee)`

**Viewing Unused ERC20 Tokens (including KNC tokens)**<br />
`makerFunds(makerAddress, tokenContractAddress)`

#### WITHDRAWING FUNDS
Note that funds used for active orders cannot be withdrawn. One should first cancel an order so that he can withdraw the amount offered inside the order. The same applies for KNC deposits.

**Withdrawing Ether**<br />
[`withdrawEther(amount)`](api-orderbookreserve.md#withdrawether)

**Withdrawing KNC Tokens**<br />
[`withdrawKncFee(amount)`](api-orderbookreserve.md#withdrawkncfee)

**Withdrawing ERC20 Tokens**<br />
[`withdrawToken(amount)`](api-orderbookreserve.md#withdrawtoken)


### Local testnet deployment
Here, we will walk you through an example on running the deployment script on [Truffle's Ganache](https://truffleframework.com/ganache).

#### Before you begin
Check that you have the following:
1. [node.js](https://nodejs.org/en/download/)
2. [web3 1.0.0-beta.34](https://www.npmjs.com/package/web3)
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

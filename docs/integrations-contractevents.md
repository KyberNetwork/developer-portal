---
id: Integrations-ContractEvents
title: Contract Events
---
[//]: # (tagline)
## Introduction

Ethereum allows smart contracts to emit events during the execution of a function. Your application can track these events to find information such as trades, fee burning, reserves listed etc. Using these events, you will be able to calculate other important information such as overall volume, volume per token, volume per reserve, and more. Our [in-house built tracker](https://tracker.kyber.network/) uses the events emitted to track these statistics.

## Tracking Guide

For the different information needed, a link to the relevant event is given.

### Events to track volume and trade history
* [ExecuteTrade](integrations-contractevents.md#executetrade)
* [KyberTrade](integrations-contractevents.md#kybertrade)

### Events to track Price Feed Reserve (PFR) and Automated Price Reserve (APR) statistics
* [TradeExecute](integrations-contractevents.md#tradeexecute)
* [DepositToken](integrations-contractevents.md#deposittoken)
* [WithdrawFunds](integrations-contractevents.md#withdrawfunds)

### Events to track Permissionless Orderbook Reserve (POR) statistics
* [OrderbookReserveTrade](integrations-contractevents.md#orderbookreservetrade)
* [NewLimitOrder](integrations-contractevents.md#newlimitorder)
* [OrderCanceled](integrations-contractevents.md#ordercanceled)
* [FullOrderTaken](integrations-contractevents.md#fullordertaken)
* [PartialOrderTaken](integrations-contractevents.md#partialordertaken)


### Events to track fees
* [AssignBurnFees](integrations-contractevents.md#assignburnfees)
* [AssignFeeToWallet](integrations-contractevents.md#assignfeetowallet)
* [BurnAssignedFees](integrations-contractevents.md#burnassignedfees)
* [SendWalletFees](integrations-contractevents.md#sendwalletfees)

## Events

### [KyberNetworkProxy](environments-mainnet.md#kybernetworkproxy)
_Contract Address_: [0x818E6FECD516Ecc3849DAf6845e3EC868087B755](https://etherscan.io/address/0x818E6FECD516Ecc3849DAf6845e3EC868087B755/)
<br />
_Source_: [KyberNetworkProxy.sol](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberNetworkProxy.sol)

### `ExecuteTrade`

Event is emitted when a trade is executed.

---

event **ExecuteTrade**(address indexed sender, ERC20 src, ERC20 dest, uint actualSrcAmount, uint actualDestAmount)
| Parameter          | Type    | Indexed | Description                              |
|:------------------:|:-------:|:-------:|:----------------------------------------:|
| `sender`           | address | YES     | sender's address                         |
| `src`              | ERC20   | NO      | source ERC20 token contract address      |
| `dest`             | ERC20   | NO      | destination ERC20 Token contract address |
| `actualSrcAmount`  | uint    | NO      | source ERC20 token amount in wei         |
| `actualDestAmount` | uint    | NO      | destination ERC20 token amount in wei    |

Event Signature: `0x1849bd6a030a1bca28b83437fd3de96f3d27a5d172fa7e9c78e7b61468928a39`
<br />



### [KyberNetwork](environments-mainnet.md#kybernetwork)
_Contract Address_: [0x65bF64Ff5f51272f729BDcD7AcFB00677ced86Cd](https://etherscan.io/address/0x65bF64Ff5f51272f729BDcD7AcFB00677ced86Cd/)
<br />
_Past Contract Addresses_:<br />
[v3 - 0x9ae49C0d7F8F9EF4B864e004FE86Ac8294E20950](https://etherscan.io/address/0x9ae49C0d7F8F9EF4B864e004FE86Ac8294E20950/),<br />
[v2 - 0x91a502C678605fbCe581eae053319747482276b9](https://etherscan.io/address/0x91a502c678605fbce581eae053319747482276b9/),<br />
[v1 - 0x964F35fAe36d75B1e72770e244F6595B68508CF5](https://etherscan.io/address/0x964f35fae36d75b1e72770e244f6595b68508cf5/)
<br />
_Source_: [KyberNetwork.sol](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberNetwork.sol)

### `AddReserveToNetwork`

Event is emitted when a reserve is added to the network.

---

event **AddReserveToNetwork**(KyberReserveInterface indexed reserve, bool add, bool isPermissionless)
| Parameter          | Type                  | Indexed | Description                                                    |
|:------------------:|:---------------------:|:-------:|:--------------------------------------------------------------:|
| `reserve`          | KyberReserveInterface | YES     | reserve's contract address                                     |
| `add`              | bool                  | NO      | `true` if reserve was successfully added, `false` otherwise    |
| `isPermissionless` | bool                  | NO      | `true` if reserve was permissionlessly added, `false`otherwise |

Event Signature: `0x97c85c355415dd5f652ce2c1193f2ff9e7fa9bed8fe5619c7b10ef8b8780357f`
<br />

### `KyberNetworkSetEnable`

Event is emitted when the network is enabled or disabled.

---

event **KyberNetworkSetEnable**(bool isEnabled)
| Parameter   | Type | Indexed | Description                                             |
|:-----------:|:----:|:-------:|:-------------------------------------------------------:|
| `isEnabled` | bool | NO      | `true` if network is enabled, `false` if it is disabled |

Event Signature: `0x8a846a525e22497042ee2f99423a8ff8bbb831d3ae5384692bf6040f591c1eba`
<br />

### `KyberTrade`

Emitted when a trade is executed in the internal network.

---

event **KyberTrade**(address indexed trader, ERC20 src, ERC20 dest, uint srcAmount, uint dstAmount, address destAddress, uint ethWeiValue, address reserve1, address reserve2, bytes hint)
| Parameter     | Type    | Indexed | Description                                                 |
|:-------------:|:-------:|:-------:|:-----------------------------------------------------------:|
| `trader`      | address | YES     | trader's address                                            |
| `src`         | ERC20   | NO      | source ERC20 token contract address                         |
| `dest`        | ERC20   | NO      | destination ERC20 token contract address                    |
| `srcAmount`   | uint    | NO      | source ERC20 token amount                                   |
| `dstAmount`   | uint    | NO      | destination ERC20 token amount                              |
| `destAddress` | ERC20   | NO      | recipient address for destination ERC20 token               |
|`ethWeiValue`  | uint    | NO      | Ether wei value of the trade                                |
| `reserve1`    | address | NO      | address of reserve selected for source token to Ether trade |
| `reserve2`    | address | NO      | address of reserve selected for source token to Ether trade |
| `hint`        | bytes   | NO      | used to determine if permissionless reserves are to be used |

Event Signature: `0xd30ca399cb43507ecec6a629a35cf45eb98cda550c27696dcb0d8c4a3873ce6c`
<br />

### `ListReservePairs`

Event is emitted when a token pair is listed for a reserve.

---

event **ListReservePairs**(address reserve, ERC20 src, ERC20 dest, bool add)
| Parameter | Type    | Indexed | Description                                       |
|:---------:|:-------:|:-------:|:-------------------------------------------------:|
| `reserve` | address | NO      | reserve's contract address                        |
| `src`     | ERC20   | NO      | source ERC20 token contract address               |
| `dest`    | ERC20   | NO      | destination ERC20 token contract address          |
| `add`     | bool    | NO      | `true` if token pair is listed, `false` otherwise |

Event Signature: `0xadb5a4f14d89b3a5ffb3900ac1ea4574d991f93887f6199fabaf25393644e01c`
<br />

### `RemoveReserveFromNetwork`

Event is emitted when a reserve has been removed from the network.

---

event **RemoveReserveFromNetwork**(KyberReserveInterface reserve)
| Parameter | Type                  | Indexed | Description                |
|:---------:|:---------------------:|:-------:|:--------------------------:|
| `reserve` | KyberReserveInterface | NO      | reserve's contract address |

Event Signature: `0x861f07ab6bad95b71c362ed240dc0082c3d9bbfe75e7830be646ef0d61da3117`
<br />



### [KyberReserve](environments-mainnet.md#kyberreserve)
_Contract Address_: [0x63825c174ab367968EC60f061753D3bbD36A0D8F](https://etherscan.io/address/0x63825c174ab367968EC60f061753D3bbD36A0D8F/)
<br />
_Other Reserves_: Visit our [tracker](https://tracker.kyber.network/#/reserves) to see other reserve addresses.
<br />
_Source_: [KyberReserve.sol](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberReserve.sol)

### `DepositToken`

Event is emitted when the contract receives the token deposit.

---

event **DepositToken**(ERC20 token, uint amount)
| Parameter | Type   | Indexed | Description                  |
|:---------:|:------:|:-------:|:----------------------------:|
| `token`   | ERC20  | NO      | ERC20 token contract address |
| `amount`  | uint   | NO      | ERC20 token amount in wei    |

Event Signature: `0x2d0c0a8842b9944ece1495eb61121621b5e36bd6af3bba0318c695f525aef79f`
<br />

### `TradeEnabled`

Event is emitted when trading is enabled for the reserve.

---

event **TradeEnabled**(bool enable)
| Parameter | Type    | Indexed | Description                                                 |
|:---------:|:-------:|:-------:|:-----------------------------------------------------------:|
| `enable`  | bool    | NO      | `true` if reserve is enabled, otherwise `false` if disabled |

Event Signature: `0x7d7f00509dd73ac4449f698ae75ccc797895eff5fa9d446d3df387598a26e735`
<br />

### `TradeExecute`

Event is emitted when the reserve has executed a trade.

---

event **TradeExecute**(address indexed origin, address src, uint srcAmount, address destToken, uint destAmount, address destAddress)
| Parameter     | Type    | Indexed | Description                                    |
|:-------------:|:-------:|:-------:|:----------------------------------------------:|
| `origin`      | address | YES     | sender's address                               |
| `src`         | address | NO      | source ERC20 token contract address            |
| `srcAmount`   | uint    | NO      | wei amount of source ERC20 tokens              |
| `destToken`   | address | NO      | destination ERC20 token contract address       |
| `destAmount`  | uint    | NO      | wei amount of destination ERC20 tokens         |
| `destAddress` | address | NO      | recipient address for destination ERC20 tokens |

Event Signature: `0xea9415385bae08fe9f6dc457b02577166790cde83bb18cc340aac6cb81b824de`
<br />

### `WithdrawFunds`

Event is emitted with funds are withdrawn from the reserve.

---

event **WithdrawFunds**(ERC20 token, uint amount, address destination)
| Parameter     | Type    | Indexed | Description                             |
|:-------------:|:-------:|:-------:|:---------------------------------------:|
| `token`       | ERC20   | NO      | ERC20 token contract address            |
| `amount`      | uint    | NO      | wei amount of tokens that was withdrawn |
| `destination` | address | NO      | recipient address of withdrawn funds    |

Event Signature: `0xb67719fc33c1f17d31bf3a698690d62066b1e0bae28fcd3c56cf2c015c2863d6`
<br />



### [OrderbookReserve](environments-mainnet.md#orderbookreserve)
_Contract Address_: [0x9D27a2D71Ac44E075f764d5612581E9Afc1964fd](https://etherscan.io/address/0x9D27a2D71Ac44E075f764d5612581E9Afc1964fd/)
<br />
_Other Reserves_: Check the [KyberNetwork contract](https://etherscan.io/address/0x9ae49C0d7F8F9EF4B864e004FE86Ac8294E20950#readContract/) to see other OR addresses.
<br />
_Source_: [OrderbookReserve.sol](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/reserves/orderBookReserve/permissionless/OrderbookReserve.sol)

### `OrderbookReserveTrade`

Event is emitted when a trade is executed on this orderbook reserve.

---

event **OrderbookReserveTrade**(ERC20 srcToken, ERC20 dstToken, uint srcAmount, uint dstAmount)
| Parameter   | Type  | Indexed | Description                                          |
|:-----------:|:-----:|:-------:|:----------------------------------------------------:|
| `srcToken`  | ERC20 | NO      | source ERC20 token contract address                  |
| `dstToken`  | ERC20 | NO      | destination ERC20 token contract address             |
| `srcAmount` | uint  | NO      | source ERC20 token amount in its token decimals      |
| `dstAmount` | uint  | NO      | destination ERC20 token amount in its token decimals |

Event Signature: `0x36cfc7e9779b5ccf22f92f2f0d9adf9c74df05ab07de27c8cb508020389f9adc`
<br />


### `NewLimitOrder`

Event is emitted when a limit order is submitted.

---

event **NewLimitOrder**(address indexed maker, uint32 orderId, bool isEthToToken, uint128 srcAmount, uint128 dstAmount, bool addedWithHint)
| Parameter       | Type    | Indexed | Description                                                 |
|:---------------:|:-------:|:-------:|:-----------------------------------------------------------:|
| `maker`         | address | YES     | maker wallet or contract address                            |
| `orderId`       | uint32  | NO      | order ID                                                    |
| `isEthToToken`  | bool    | NO      | `true` if Ether to token order submitted, `false` otherwise |
| `srcAmount`     | uint128 | NO      | source ERC20 token amount in its token decimals             |
| `dstAmount`     | uint128 | NO      | destination ERC20 token amount in its token decimals        |
| `addedWithHint` | bool    | NO      | `true` if order was added with a hint, `false` otherwise    |

Event Signature: `0x2fb3fe66d41cb2d1b0d335656d86e7c779ebdc34c6f6fc806d35790a30be0e6d`
<br />

### `OrderCanceled`

Event is emitted when an existing order is cancelled.

---

event **OrderCanceled**(address indexed maker, bool isEthToToken, uint32 orderId, uint128 srcAmount, uint dstAmount)
| Parameter      | Type    | Indexed | Description                                                  |
|:--------------:|:-------:|:-------:|:------------------------------------------------------------:|
| `maker`        | address | YES     | maker wallet or contract address                             |
| `isEthToToken` | bool    | NO      | `rrue` if Ether to token order submitted, `false` otherwise  |
| `orderId`      | uint32  | NO      | order ID                                                     |
| `srcAmount`    | uint128 | NO      | updated source ERC20 token amount in its token decimals      |
| `dstAmount`    | uint    | NO      | updated destination ERC20 token amount in its token decimals |

Event Signature: `0x179f16fddc625e40df9cb92cfcea70d64a6262c82b7a769e52996b1ff511ff56`
<br />

### `FullOrderTaken`

Event is emitted when the full amount of a limit order is taken.

---

event **FullOrderTaken**(address maker, uint32 orderId, bool isEthToToken)
| Parameter      | Type    | Indexed | Description                                                 |
|:--------------:|:-------:|:-------:|:-----------------------------------------------------------:|
| `maker`        | address | NO      | maker wallet or contract address                            |
| `orderId`      | uint32  | NO      | order ID                                                    |
| `isEthToToken` | bool    | NO      | `true` if Ether to token order submitted, `false` otherwise |

Event Signature: `0xfc2eaa59b7259e4eb0ce92d7a86fce8b0fb67fade6f9f69df98f4771035a50c2`
<br />

### `PartialOrderTaken`

Event is emitted when a partial amount of a limit order is taken.

---

event **PartialOrderTaken**(address maker, uint32 orderId, bool isEthToToken, bool isRemoved)
| Parameter      | Type    | Indexed | Description                                                                                              |
|:--------------:|:-------:|:-------:|:--------------------------------------------------------------------------------------------------------:|
| `maker`        | address | NO      | maker wallet or contract address                                                                         |
| `orderId`      | uint32  | NO      | order ID                                                                                                 |
| `isEthToToken` | bool    | NO      | `true` if Ether to token order submitted, `false` otherwise                                              |
| `isRemoved`    | bool    | NO      | `true` if order is removed from order list (because remaining order value is too low), `false` otherwise |

Event Signature: `0xd499cca7d46b5236c2cb522ceec930ccf485eefca1f0472c020a1b7328bf0643`
<br />



### [FeeBurner](environments-mainnet.md#feeburner)
_Contract Address_: [0x8007aa43792A392b221DC091bdb2191E5fF626d1](https://etherscan.io/address/0x8007aa43792A392b221DC091bdb2191E5fF626d1/)
<br />
_Past Contract Addresses_:<br />
[v3 - 0x52166528FCC12681aF996e409Ee3a421a4e128A3](https://etherscan.io/address/0x52166528FCC12681aF996e409Ee3a421a4e128A3/),<br />
[v2 - 0xed4f53268bfdFF39B36E8786247bA3A02Cf34B04](https://etherscan.io/address/0xed4f53268bfdFF39B36E8786247bA3A02Cf34B04/),<br />
[v1 - 0x07f6e905f2a1559cd9fd43cb92f8a1062a3ca706](https://etherscan.io/address/0x07f6e905f2a1559cd9fd43cb92f8a1062a3ca706/)
<br />
_Source_: [FeeBurner.sol](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/FeeBurner.sol)

### `AssignBurnFees`

Event is emitted when fees for burning are assigned for a reserve.

---

event **AssignBurnFees**(address reserve, uint burnFee)
| Parameter | Type    | Indexed | Description                        |
|:---------:|:-------:|:-------:|:----------------------------------:|
| `reserve` | address | NO      | reserve's contract address         |
| `burnFee` | uint    | NO      | amount of fees to be burned in wei |

Event Signature: `0xf838f6ddc89706878e3c3e698e9b5cbfbf2c0e3d3dcd0bd2e00f1ccf313e0185`
<br />

### `AssignFeeToWallet`

Event is emitted when fees for fee sharing are assigned for a reserve.

---

event **AssignFeeToWallet**(address reserve, address wallet, uint walletFee)
| Parameter   | Type    | Indexed | Description                                     |
|:-----------:|:-------:|:-------:|:-----------------------------------------------:|
| `reserve`   | address | NO      | reserve's contract address                      |
| `wallet`    | address | NO      | wallet address to send fees to                  |
| `walletFee` | uint    | NO      | amount of fees to be assigned to wallet address |

Event Signature: `0x366bc34352215bf0bd3b527cfd6718605e1f5938777e42bcd8ed92f578368f52`
<br />

### `BurnAssignedFees`

Event is emitted when fees are burned.

---

event **BurnAssignedFees**(address indexed reserve, address sender, uint quantity)
| Parameter  | Type    | Indexed | Description                          |
|:----------:|:-------:|:-------:|:------------------------------------:|
| `reserve`  | address | YES     | reserve's contract address           |
| `sender`   | address | NO      | sender's address                     |
| `quantity` | uint    | NO      | amount of assigned fees to be burned |

Event Signature: `0x2f8d2d194cbe1816411754a2fc9478a11f0707da481b11cff7c69791eb877ee1`
<br />

### `SendWalletFees`

Event is emitted when fees are sent to a wallet as part of the fee sharing program.

---

event **SendWalletFees**(address indexed wallet, address reserve, address sender)
| Parameter | Type    | Indexed | Description                        |
|:---------:|:-------:|:-------:|:----------------------------------:|
| `wallet`  | address | YES     | reserve's specified wallet address |
| `reserve` | address | NO      | reserve's contract address         |
| `sender`  | address | NO      | sender's address                   |

Event Signature: `0xb3f3e7375c0c0c4f7dd94069a5a4e68667827491318da786c818b8c7a794924e`
<br />

---
id: Reserves-Requirements
title: Reserves Requirements
---
## Overview
This section details some guidelines on creating a new reserve type.

## Step 1: Implementing the Reserve Interface
![Reserve Interface](/uploads/reserveinterface.png "Reserve Interface")
The reserve interface provides a generic template of the contract functions one should implement in their smart contract. This interface may be tweaked depending on the needs and features of each blockchain. All existing reserve types, like the ones covered in the developer portal (Eg. Fed Price Reserve), as well as integrated reserves (Eg. Uniswap Reserve), implement this interface.

For the exact functions and inputs to implement, refer to the [KyberReserveInterface](References-KyberReserveInterface.md) contract.

## Step 2: Write Unit Tests
Smart contract security is of upmost importance. As such, we require tests to be written for the smart contract functions to ensure that they only do what is expected. You may take a look at our [test](https://github.com/KyberNetwork/smart-contracts/tree/master/test) repository for examples of test scripts.

## Step 3: Setup KNC Fee Wallet
Reserves of the network needs to hold some KNC tokens for the [fee sharing program](integrations-feesharing.md#fee-example) and fee burning. As such, a wallet should be setup with KNC tokens for the payment of these fees.

## Step 4: Contact Us
Once the previous steps are completed, contact us to list and test your reserve! You may do so via email at support@kyber.network, or our [Telegram group](https://t.me/kyberdeveloper).

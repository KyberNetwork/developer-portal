---
id: Reserves-Requirements
title: Reserve Requirements
---
[//]: # (tagline)
## Overview
This section lists some guidelines on creating a new reserve type.

## Step 1: Implement the Reserve Interface
![Reserve Interface](/uploads/reserveinterface.png "Reserve Interface")
The reserve interface provides a generic template of the contract functions one should implement in their smart contract. This interface may be tweaked depending on the needs and features of each blockchain. All existing reserve types, like the ones covered in the developer portal (e.g. Price Feed Reserve), as well as integrated reserves (e.g. Uniswap Reserve), implement this interface.

For the exact functions and inputs to implement, refer to the [KyberReserveInterface](api_abi-kyberreserveinterface.md) contract.

## Step 2: Write Unit Tests
Smart contract security is of upmost importance. As such, we require tests to be written for the smart contract functions to ensure that they only do what is expected. You may take a look at our [test](https://github.com/KyberNetwork/smart-contracts/tree/master/test) repository for test script examples.

## Step 3: Setup KNC Fee Wallet
Reserves of the network need to hold some KNC tokens to pay for network fees whenever the reserves facilitate a trade. Of the 0.25% that is paid by the reserve, a portion of that (currently 30%) is given to the Kyber-integrated application or platform that facilitated the trade as part of the [fee sharing program](integrations-feesharing.md#fee-example), and the rest of the KNC are burnt (taken out of circulation forever).

## Step 4: Contact Us
Once the previous steps are completed, contact us to list and test your reserve! You may do so via email at support@kyber.network, or our [Telegram group](https://t.me/kyberdeveloper).

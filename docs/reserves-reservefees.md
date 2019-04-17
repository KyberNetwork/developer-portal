---
id: Reserves-ReserveFees
title: Verifying Reserve Fees
---
To verify the reserve fee percentage that will be charged for every trade, kindly perform the following steps:

### Step 1: Read the FeeBurner contract in Etherscan
Obtain the [FeeBurner contract address here](environments-mainnet.md#feeburner). You may then view this address in Etherscan.

### Step 2: Query the `reserveFeesInBps` variable
Key in your reserve's contract address in the input field for the `reserveFeesInBps` variable. The query should return the fees in basis points (bps). As an example, an output of `25` means that your reserve is charged 0.25% of the trade value (in KNC tokens) for every trade processed via your reserve.

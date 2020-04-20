---
id: Reserves-burningFees
title: Fee burning
---
[//]: # (tagline)

## How do I burn fees?

Call the `burnReserveFees` function of the [fee burner contract](https://etherscan.io/address/0x8007aa43792A392b221DC091bdb2191E5fF626d1). This function **will have to be called for each reserve**. At the moment, our server has a [script](https://github.com/KyberNetwork/smart-contracts/blob/master/scripts/feeHandler.js) to call this function for all the reserves once every week. More information regarding the input parameters of the `burnReserveFees` function can be found in [API/ABI](api_abi-feeburner.md#burnreservefees).

## Calculation of Fees :

In every trade, 0.25% of the transaction value is charged as a fee. The payment of the fees during a trade is administered by the [handleFees()](api_abi-feeburner.md#handleFees) of the [fee burner contract](https://etherscan.io/address/0x8007aa43792A392b221DC091bdb2191E5fF626d1). This fee amount is converted to its equivalent KNC value and recorded in the reserve’s KNC wallet by the fee burner contract. 30% of this fee paid by the reserves will be shared among the fee sharing partners and rest is burned.
The reserve manager may read the `reserveFeesToBurn` of the fee burner contract to view the total fee to burn and share.

### Step 1: Read the FeeBurner contract in Etherscan
Obtain the [FeeBurner contract address here](environments-mainnet.md#feeburner). You may then view this address in Etherscan.io.

### Step 2: Query the `reserveFeesToBurn` variable
Key in your reserve's contract address in the input field for the `reserveFeesToBurn` variable. The query should return the total fees (burn and share) in KNC.


## Withdrawing funds from the reserve:

The operator account could withdraw funds to the whitelisted address of your reserve,
**Withdraw ETH** : call the `withdrawEther` function of the reserve contract by passing the amount of Ether you would want to withdraw. More information regarding the input parameters of the `withdrawEther` function can be found in [API/ABI](api_abi-withdrawable.md#withdrawEther).
**Withdraw Token** : call the `withdrawToken` function of the reserve contract by passing the amount of tokens you would want to withdraw. More information regarding the input parameters of the `withdrawToken` function can be found in [API/ABI](api_abi-withdrawable.md#withdrawtoken).

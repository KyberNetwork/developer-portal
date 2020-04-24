---
id: Reserves-BurningFees
title: Guide to Fee Burning
---
[//]: # (tagline)

## How do I burn fees?

Call the `burnReserveFees` function of the [FeeBurner contract](https://etherscan.io/address/0x8007aa43792A392b221DC091bdb2191E5fF626d1). This function **will have to be called for each reserve**. At the moment, we run a [script](https://github.com/KyberNetwork/smart-contracts/blob/master/scripts/feeHandler.js) to call this function for all the reserves once every week. More information regarding the input parameters of the `burnReserveFees` function can be found in [API/ABI](api_abi-feeburner.md#burnreservefees).

## Calculation of Fees

In every trade, 0.25% of the transaction value is charged as a fee. The payment of the fees during a trade is administered by the [handleFees()](api_abi-feeburner.md#handleFees) of the [FeeBurner contract](https://etherscan.io/address/0x8007aa43792A392b221DC091bdb2191E5fF626d1). This fee amount is converted to its equivalent KNC value and recorded for the reserve by the FeeBurner contract. 30% of this fee paid by the reserves will be shared among the fee sharing partners and the rest is burned.

The reserve manager may read the `reserveFeesToBurn` of the fee burner contract to view the total fee to burn and share.

### Step 1: Read the FeeBurner contract in Etherscan
Obtain the [FeeBurner contract address here](environments-mainnet.md#feeburner). You may then view this address using Etherscan.

### Step 2: Query the `reserveFeesToBurn` variable
Key in your reserve's contract address in the input field for the `reserveFeesToBurn` variable. The query should return the total fees to burn and share in KNC.

## Withdrawing funds from the reserve

The **Operator** account can withdraw funds to the registered whitelisted addresses of your reserve by calling the [`withdraw()`](api_abi-kyberreserve/#withdraw) function in the reserve contract.

The **Admin** account can withdraw funds to any destination address by calling the [`withdrawEther()`](api_abi-withdrawable.md#withdrawEther) or [`withdrawToken()`](api_abi-withdrawable.md#withdrawtoken) functions. For more information regarding the input parameters of the `withdrawEther()` and `withdrawToken()` functions  function can be found in [API/ABI](api_abi-withdrawable.md#withdrawEther).

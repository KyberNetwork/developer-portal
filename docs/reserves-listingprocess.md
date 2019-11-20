---
id: Reserves-ListingProcess
title: Reserve Listing Process and Policies
---
[//]: # (tagline)
## Requirements to be listed on KyberSwap.com

There are few requirements to have your token listed on Kyber Network:

1. The token is an ERC20 token.

2. Legal opinion that the token is a **utility token**, based on Malta law.

3. The legal opinion should come from a licensed Law Firm in its respective jurisdiction.

4. Liquidity has to be provided for the token. This is done by being a permissioned token reserve, or by using an existing 3rd party reserve that is already integrated with Kyber.

5. Completed listing form as indicated here: [listing form](https://forms.gle/zWLwZEvjUudSikF67)

6. A **deposit of USD $1000 worth of KNC** as commitment towards this listing process, because considerable effort is required on both parties. The funds will be returned once the token goes live on KyberSwap.

## Process to list a permissioned reserve on Kyber

Below is a complete sequence when listing a new permissioned reserve in Kyber. A permissioned reserve goes through the legal process mentioned above.

### TESTING: Deployment on Ropsten testnet

1. Deploy your reserve on Ropsten using the following guides depending no your reserve type choice: [Price Feed Reserve](reserves-pricefeedreserve.md) or [Automated Price Reserve](reserves-automatedpricereserve.md)

2. Test ETH and token withdrawals on your reserve. Deposit a small amount of ETH (e.g. 0.001 ETH) and tokens (e.g. 1 token) to the KyberReserve contract, and call `withdrawEther()` and `withdrawToken()` to test withdrawals. Once withdrawals are successful, you can deposit the full inventory amount.

3. Configure the token conversion rates of your reserve by either calling [`setBaseRate()`](api_abi-conversionrates.md#setBaseRate), [`setQtyStepFunction()`](api_abi-conversionrates.md#setQtyStepFunction), and [`setImbalanceStepFunction()`](api_abi-conversionrates.md#setImbalanceStepFunction) if using the PFR or calling [`setLiquidityParams()`](api_abi-liquidityconversionrates.md#setLiquidityParams) if using the APR.

4. Check that the rates conform to settings by calling [`getConversionRate()`](api_abi-kyberreserve.md#getconversionrate) in the KyberReserve contract.

5. Ask the Kyber team to list your reserve in Kyber Network in Ropsten.

6. Perform test trades.

### STAGING: Deployment on Kyber's staging network in Mainnet

1. Deploy your reserve on Mainnet using the following guides depending no your reserve type choice: [Price Feed Reserve](reserves-pricefeedreserve.md) or [Automated Price Reserve](reserves-automatedpricereserve.md). However, you will need to use the Staging KyberNetwork contract address. Kindly reach out to the Kyber developer team for the contract address for the staging network. This is a controlled private network in the Mainnet meant to do testing with real funds before going live on the production network. Only whitelisted addresses, mainly from the Kyber team, are allowed to trade on this network.

2. Test ETH and token withdrawals on your reserve. Deposit a small amount of ETH (e.g. 0.001 ETH) and tokens (e.g. 1 token) to the KyberReserve contract, and call `withdrawEther()` and `withdrawToken()` to test withdrawals. Once withdrawals are successful, you can deposit the full inventory amount.

3. Configure the token conversion rates of your reserve by either calling [`setBaseRate()`](api_abi-conversionrates.md#setBaseRate), [`setQtyStepFunction()`](api_abi-conversionrates.md#setQtyStepFunction), and [`setImbalanceStepFunction()`](api_abi-conversionrates.md#setImbalanceStepFunction) if using the PFR or calling [`setLiquidityParams()`](api_abi-liquidityconversionrates.md#setLiquidityParams) if using the APR.

4. Check that the rates conform to settings by calling [`getConversionRate()`](api_abi-kyberreserve.md#getconversionrate) in the KyberReserve contract.

5. Ask the Kyber team to list your reserve in the Mainnet staging network.

6. Kyber's QA team will run several tests and trades to make sure everything is in working order.

7. In the meantime, a separate KNC fee wallet needs to be set up in order for the reserve to pay the 0.25% fee to the network. This can be done in parallel while QA tests are being done on the reserve in the staging network, but must be completed before going live in production.

### PRODUCTION: Deployment on Mainnet

1. Once QA clears, align with the Kyber team the date and time when listing will be publicly live.

2. A few hours before listing, configure the token conversion rates of your reserve again, inputting the latest market price of your token(s).

3. The Kyber admins will list the reserve on Mainnet production. At this point, the reserve is live on the network.

4. Verify the rates show in [KyberSwap](https://https://kyberswap.com/) or on any application that has integrated the Kyber protocol and is supporting the tokens your reserve is serving liquidity form.


## Policies

* **Transparency**: All operations that occur on the Kyber protocol can be publicly verified on the blockchain.

* **Non-custodial**: At no point does the Kyber protocol control the funds of its users. Hence, users' funds will not be affected even in hacking incidents.

* **Instant Confirmation**: A transaction happens with instant confirmation if it's sent from on-chain entities like smart contracts. Otherwise, once the transaction is included on the blockchain, the execution triggered by the transaction is immediately confirmed.

* **Operation Certainty**: There are no transactional risks. Users know the rate and how much liquidity is available before they commit their transaction. There is no settlement uncertainty or counterparty risk.

* **On-chain Settlement**: Atomic and immediate on-chain settlement of trades.

* **Reserve Managers control their reserves**: Reserves also keep and contribute liquidity for their token via smart contracts that they control (source code prepared, tested and provided by us).

* **Code Audits**: Kyber’s smart contract has also been audited and verified by [ChainSecurity](https://chainsecurity.com/), an audit platform for smart contracts. Read the full audit report here: https://medium.com/chainsecurity/kyber-network-audit-completed-b737acb1860f

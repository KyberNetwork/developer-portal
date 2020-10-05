---
id: KyberPro-MainnetStaging
title: Mainnet Staging Ready
---
[//]: # (tagline)

# Introduction:

Up to this point, we believe that you’ve had a brief understanding of how Kyber FPR’s run and how you can manage token prices on your reserve. 

This document is a comprehensive guide to deploy reserve contracts on mainnet staging and outlines additional points on fund management . The staging kyber network address is limited to kyber team and isn’t the actual production smart contract available for trading. This step will help us test if the reserve is well set and is okay for production.

Having said that, we haven’t covered the techniques for optimization and efficiency, the steps covered should suffice managing a reserve on Mainnet.

## Rundown on how to set up a reserve : 

We have briefed the process on how to set up and manage a running reserve on ROPSTEN testnet in walkthrough [1](kyberpro-walkthrough1.md) and [2](/kyberpro-walkthrough2.md), outlined here is the gist

* **Step 1 : Deploy contracts** 

Deploy Reserve and Conversion rates contracts using the KYBER-FPR-SDK. If you are using Infura node, ensure to change the Node URLto mainnet and kyberNetworkAddress to the staging smart contract. 
[source code](https://github.com/KyberNetwork/kyber-pro/tree/master/tutorials/scripts)
```js
//KNAddress : “0x9CB7bB6D4795A281860b9Bfb7B1441361Cc9A794”. 
const provider = new Web3.providers.HttpProvider(process.env.MAINNET_NODE_URL)
const KNAddress= '“0x9CB7bB6D4795A281860b9Bfb7B1441361Cc9A794”';
(async ()=>{
    const addresses = await deployer.deploy(account.address, KNAddress);
  })();
```
* **Step 2: Set permission group**

In walkthrough 1 and 2 we have set operators to the conversion rates contract, additional details and permission settings are discussed [below](#Permission-groups) in this document

* **Step 3: Add token/s**

You can invoke the addToken function and pass in tokenControlInfo. Optimization to modify and manage multiple token will be discussed in the coming walkthrough

* **Step: 4: Get the reserve listed**

Deposit inventory, test withdrawals and **contact kyber team** to get reserve listed on the network also let the team know if you have preference for reserveID.([Details below](#Reserve-ID-and-rebate-wallet)).

*Although your funds reside on a smart contract, you always have access to your funds and can withdraw them at any point in time.*

* **Step 5: Testing Phase**

After this step, our team will perform test on the reserve. To do so, enable trade on reserve, set buy/sell rate by invoking setRate() and quantity step for the token using setQtyStepFunction() , we’d recommend you to just initialize the imbalance step function to 0


## Permission groups: 
Here, we set additional managing roles for the reserve and conversion rates contracts. As discussed earlier, each role has specific rights and responsibilities in each contract. Please make sure you have assigned these roles to rightful addresses.

In summary, every contract in the Kyber protocol has three permission groups:

`Admin`:
The admin account is the most important we'd recommend you to have a cold wallet, or a multisig address for this action. All sensitive operations (e.g. fund related) are limited to the admin address.

`Operators`:
The operator account, (preferably a hot wallet) is used for frequent updates. you could have the operator account set to the bot which can update reserve rates and withdrawing funds from the reserve, inorder to rebalance the inventory (only to addresses that have been whitelisted by the admin address)

`Alerters`: 
The alerter account is also a hot wallet and is used to halt trading due to inconsistencies in the system (e.g., strange conversion rates). In such cases, the reserve operation is suspended and can be resumed only by the admin address.

**Admin**

*Context:* The admin of both the contracts are set to the address used to deploy contracts. However if you’d wish to transfer admin, then current admin can call transferAdmin() to the desired address, and the newAdmin should call claimAdmin(), in order to complete the transfer of admin rights.

```js
//snippet
const baseContract = new FPR.BaseContract(web3, addresses.reserve);
 
(async() => {
   //transfer Admin to new Admin
   console.log("Transferring Admin..... Might take a while for tx to be mined ");
   await baseContract.transferAdmin(account.address , '0x9e5f206aA7aAc88fe4d5Bc378d114FF8bD5A67c5');
   //claim admin using new Admin account
   console.log("claimAdmin from new admin account......");
   await baseContract.claimAdmin(newAdmin.address);
   //Console log new admin
   console.log("New admin is " + await baseContract.admin());
})();
```

**Also, only an Admin can invoke enabletrade().**

```js
(async() => {
  await reservemanager.enableTrade(account.address);
}
```
**Operators**

`Fund Management`
An Operator account, preferably a hot wallet, is granted permission to withdraw funds from the reserve. However, the Operator is entitled to withdraw ETH/tokens from the reserve only to the whitelisted addresses. The main reason for having the admin approve withdraw addresses is that hot wallets are at a greater risk of being compromised, hence, a limited list of whitelisted addresses are defined per token by the admin address. We encourage you to have at least one whitelisted address per token.


*Context:* to withdraw 100 KTT tokens from reserve 
```js
//snippet
(async () => {
  //admin operations - approve withdraw address
  console.log('approve withdraw address');
  await reserveManager.approveWithdrawAddress(account.address, KTTokenAddress, '0x9e5f206aA7aAc88fe4d5Bc378d114FF8bD5A67c5');
  //withdraw is an only operator function
  await reserveManager.withdraw(
           operator.address, KTTokenAddress,
            convertToTWei(100), '0x9e5f206aA7aAc88fe4d5Bc378d114FF8bD5A67c5'
  );
})();
```
**Alerters**

*Context:* In any case of anomaly like weird pattern of prices, fund mismanagement, wrong price update etc., you might want to halt trading on the reserve. 

Only only an alerter can disable trading of the reserve, we’d recommend you to maintain a hot wallet for this operation.

```js
(async() => {
 //adding operator to reserve contract
 await baseContract.addalerter(account.address, ‘operator’s address’);
}
```
Then, from the Alerter’s account you can call disabletrade().

```js
(async() => {
  await reservemanager.disableTrade(alerter.address);
}
```

## Reserve ID and rebate wallet:

Instead of Ethereum addresses, reserves are now identified using reserve IDs. Each reserve ID is 32 bytes long. Reserve addresses can change in the event of reserve upgrades or reserve migrations. With the new Reserve Routing feature for takers, and as reserves may upgrade their contracts over time (and thus have changing reserve addresses), we utilise reserve IDs for a more stable identity.

As for reserve rebates, the motivation for rebates is to reward FPRs based on their performance (i.e. amount of trade volume they facilitate). This incentivizes reserves to provide better liquidity and tighter spreads, thereby driving greater volume, value, and network fees. The rebate fees will need to be claimed manually through the KyberFeeHandler contract. 


## Next steps
Once you have deployed contracts on mainnet, completed all the steps, let the Kyber team know the following:
1. Deployed Reserve address
2. Token/s you want to support
3. Any particular reserve address
4. And a rebate wallet

## Appendix

* Set of responsibilities each of the permission group holds
![Permission Groups](/uploads/perm.png)
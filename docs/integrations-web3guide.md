---
id: Integrations-Web3Guide
title: Web3
---
## Introduction
This guide will walk you through on how you can interact with our protocol implementation using the [Web3](https://github.com/ethereum/web3.js/) Javascript package. The most common group of users that can benefit from this guide are Wallet providers or Vendors who want to use their own UI.

## Overview
In this guide, we will using Web3 to get conversion rates and perform a token to token swap. The guide assumes that you are a wallet provider and a user of your wallet wants to swap 100 KNC for ZIL tokens.

## Things to note
1) If your version of Web3 is 1.0.0-beta.37 and below, the full code example will not work for you due to breaking changes that were introduced in version [1.0.0-beta.38](https://github.com/ethereum/web3.js/releases/tag/v1.0.0-beta.38).
2) We will make use of the [ERC20 Interface](https://github.com/KyberNetwork/smart-contracts/blob/developV2/contracts/ERC20Interface.sol) and [KyberNetworkProxy](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberNetworkProxy.sol) smart contracts
3) The main functions to incorporate into your smart contract(s) are [`getExpectedRate()`](references-kybernetworkproxy.md#getexpectedrate) and [`trade()`](references-kybernetworkproxy.md#trade) of `KyberNetworkProxy.sol`.
4) When converting from Token to ETH/Token, the user is required to call the `approve` function **first** to give an allowance to the smart contract executing the `trade` function i.e. the `KyberNetworkProxy.sol` contract.
5) To prevent front running, the contract limits the gas price trade transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.
6) The example swaps KNC tokens for ZIL. You may swap some Ropsten ETH for KNC tokens at https://ropsten.kyber.network.

```js
let maxGasPrice = await KyberNetworkProxyContract.methods.maxGasPrice().call()
```

## Using Web3 to Interact
### Import the relevant packages
We will be using the `web3` package for interacting with the Ethereum blockchain. The `ethereumjs-tx` library is used to sign and serialize a raw transaction to be broadcasted.
```js
// Importing the relevant packages
const Web3 = require("web3");
const Tx = require("ethereumjs-tx");
```

### Connect to an Ethereum node
In this example, we will connect to Infura's ropsten node.
```js
// Connecting to ropsten infura node
const WS_PROVIDER = "wss://ropsten.infura.io/ws";
const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_PROVIDER));
```

### Define constants
Next, we will define the constants that we will be using for this guide.
```js
// Token Details
const SRC_TOKEN = "KNC";
const DST_TOKEN = "ZIL";
const SRC_TOKEN_ADDRESS = "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6";
const DST_TOKEN_ADDRESS = "0xaD78AFbbE48bA7B670fbC54c65708cbc17450167";
const SRC_DECIMALS = 18;
const DST_DECIMALS = 12;
const MAX_ALLOWANCE = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

// Contract ABIs
const ERC20_ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"supply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"digits","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
const KYBER_NETWORK_PROXY_ABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"},{"name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToEther","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetworkContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapEtherToToken","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdminQuickly","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"},{"name":"token","type":"address"}],"name":"getUserCapInTokenWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_kyberNetworkContract","type":"address"}],"name":"setKyberNetworkContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"field","type":"bytes32"}],"name":"info","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"}],"name":"trade","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"trader","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"actualSrcAmount","type":"uint256"},{"indexed":false,"name":"actualDestAmount","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newNetworkContract","type":"address"},{"indexed":false,"name":"oldNetworkContract","type":"address"}],"name":"KyberNetworkSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}];

// Kyber Network Proxy Contract Address
const KYBER_NETWORK_PROXY_ADDRESS = "0x818e6fecd516ecc3849daf6845e3ec868087b755";

// Wallet Address for Fee Sharing Program
const REF_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E";

// Trade Details
const SRC_QTY = "100";
const SRC_QTY_WEI = (SRC_QTY * 10**SRC_DECIMALS).toString();

// User Details
const PRIVATE_KEY = Buffer.from("ENTER_USER_PRIVATE_KEY", "hex"); //exclude 0x prefix
const USER_ADDRESS = web3.eth.accounts.privateKeyToAccount("0x" + PRIVATE_KEY.toString('hex')).address;
```

### Getting the existing instance of the relevant contracts
```js
// Get the contract instances
const KYBER_NETWORK_PROXY_CONTRACT = new web3.eth.Contract(KYBER_NETWORK_PROXY_ABI, KYBER_NETWORK_PROXY_ADDRESS);;
const SRC_TOKEN_CONTRACT = new web3.eth.Contract(ERC20_ABI, SRC_TOKEN_ADDRESS);
```

### Define auxiliary functions to support the main functions
2 auxiliary functions are created to support this guide. The first is a function to get the max allowed gas price and the second is a function to broadcast a transaction payload.
```js
// Auxiliary contracts
// Function to get max gas price allowed on the KyberNetworkProxy contract
async function getMaxGasPrice() {
	let maxGasPrice = await KYBER_NETWORK_PROXY_CONTRACT.methods.maxGasPrice().call();
	return maxGasPrice;
}

// Function to broadcast transactions
async function broadcastTx(from, to, txData, gasLimit) {
	let txCount = await web3.eth.getTransactionCount(USER_ADDRESS);
	let gasPrice = await KYBER_NETWORK_PROXY_CONTRACT.methods.maxGasPrice().call();

    let rawTx = {
        from: from,
        to: to,
        data: txData,
        gasLimit: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(gasPrice),
        nonce: txCount
    };

    let tx = new Tx(rawTx);

    tx.sign(PRIVATE_KEY);
    const serializedTx = tx.serialize();
    txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).catch(error => console.log(error))
    console.log(txReceipt)
}
```
### Define a function to approve allowance
Since we're doing a token to token swap, we will need a function to give the `KyberNetworkProxy` contract with sufficient allowance to manage the user's funds.
```js
// Function to approve the KyberNetworkProxy contract to spend src token on the user's behalf
async function approveContract(allowance) {
    console.log("Approving KNP contract to manage my KNC");
    let txData = await SRC_TOKEN_CONTRACT.methods.approve(
        KYBER_NETWORK_PROXY_ADDRESS,
        allowance
    ).encodeABI();

    await broadcastTx(USER_ADDRESS, SRC_TOKEN_ADDRESS, txData, "200000")
}
```

### Define a function to perform the trade
This is the core function that will be used to perform the actual token swap.
```js
// Function to convert src token to dst token
async function trade(srcTokenAddress, srcQtyWei, dstTokenAddress, dstAddress, maxDstAmount, minConversionRate, walletId) {
    console.log(`Convering ${SRC_TOKEN} to ${DST_TOKEN}`);
    let txData = await KYBER_NETWORK_PROXY_CONTRACT.methods.trade(
        srcTokenAddress,
        srcQtyWei,
        dstTokenAddress,
        dstAddress,
        maxDstAmount,
        minConversionRate,
        walletId
    ).encodeABI();

    await broadcastTx(USER_ADDRESS, KYBER_NETWORK_PROXY_ADDRESS, txData, "500000")
}
```

### Define a main function
The main function will be used to get the conversion rates, check that there is sufficient allowance before performing the trade.
```js
async function main() {
	// Calculate slippage rate
	let results = await KYBER_NETWORK_PROXY_CONTRACT.methods.getExpectedRate(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI).call();

	// Check KyberNetworkProxy contract allowance
	let contractAllowance = await SRC_TOKEN_CONTRACT.methods.allowance(USER_ADDRESS, KYBER_NETWORK_PROXY_ADDRESS).call();

	// If insufficient allowance, approve else convert KNC to ETH.
    if (SRC_QTY_WEI <= contractAllowance.remaining) {
        await trade(SRC_TOKEN_ADDRESS, SRC_QTY_WEI, DST_TOKEN_ADDRESS, USER_ADDRESS, MAX_ALLOWANCE, results.slippageRate, REF_ADDRESS);
    } else {
        await approveContract(MAX_ALLOWANCE);
        await trade(SRC_TOKEN_ADDRESS, SRC_QTY_WEI, DST_TOKEN_ADDRESS, USER_ADDRESS, MAX_ALLOWANCE, results.slippageRate, REF_ADDRESS);
    }
    // Quit the program
    process.exit(0);
}
```
### Full code example
Before running this code example, change `ENTER_USER_PRIVATE_KEY` to the private key (without `0x` prefix) of the Ethereum wallet holding the Ropsten KNC tokens.
```js
// Importing the relevant packages
const Web3 = require("web3");
const Tx = require("ethereumjs-tx");

// Connecting to ropsten infura node
const WS_PROVIDER = "wss://ropsten.infura.io/ws";
const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_PROVIDER));

// Token Details
const SRC_TOKEN = "KNC";
const DST_TOKEN = "ZIL";
const SRC_TOKEN_ADDRESS = "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6";
const DST_TOKEN_ADDRESS = "0xaD78AFbbE48bA7B670fbC54c65708cbc17450167";
const SRC_DECIMALS = 18;
const DST_DECIMALS = 12;
const MAX_ALLOWANCE = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

// Contract ABIs
const ERC20_ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"supply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"digits","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
const KYBER_NETWORK_PROXY_ABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"},{"name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToEther","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetworkContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapTokenToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"minConversionRate","type":"uint256"}],"name":"swapEtherToToken","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdminQuickly","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"},{"name":"token","type":"address"}],"name":"getUserCapInTokenWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_kyberNetworkContract","type":"address"}],"name":"setKyberNetworkContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"field","type":"bytes32"}],"name":"info","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"}],"name":"trade","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"trader","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"actualSrcAmount","type":"uint256"},{"indexed":false,"name":"actualDestAmount","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newNetworkContract","type":"address"},{"indexed":false,"name":"oldNetworkContract","type":"address"}],"name":"KyberNetworkSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}];

// Kyber Network Proxy Contract Address
const KYBER_NETWORK_PROXY_ADDRESS = "0x818e6fecd516ecc3849daf6845e3ec868087b755";

// Wallet Address for Fee Sharing Program
const REF_ADDRESS = "0x483C5100C3E544Aef546f72dF4022c8934a6945E";

// Trade Details
const SRC_QTY = "100";
const SRC_QTY_WEI = (SRC_QTY * 10**SRC_DECIMALS).toString();

// User Details
const PRIVATE_KEY = Buffer.from("ENTER_USER_PRIVATE_KEY", "hex"); //exclude 0x prefix
const USER_ADDRESS = web3.eth.accounts.privateKeyToAccount("0x" + PRIVATE_KEY.toString('hex')).address;

// Get the contract instances
const KYBER_NETWORK_PROXY_CONTRACT = new web3.eth.Contract(KYBER_NETWORK_PROXY_ABI, KYBER_NETWORK_PROXY_ADDRESS);;
const SRC_TOKEN_CONTRACT = new web3.eth.Contract(ERC20_ABI, SRC_TOKEN_ADDRESS);

async function main() {
	// Calculate slippage rate
	let results = await KYBER_NETWORK_PROXY_CONTRACT.methods.getExpectedRate(SRC_TOKEN_ADDRESS, DST_TOKEN_ADDRESS, SRC_QTY_WEI).call();

	// Check KyberNetworkProxy contract allowance
	let contractAllowance = await SRC_TOKEN_CONTRACT.methods.allowance(USER_ADDRESS, KYBER_NETWORK_PROXY_ADDRESS).call();

	// If insufficient allowance, approve else convert KNC to ETH.
    if (SRC_QTY_WEI <= contractAllowance.remaining) {
        await trade(SRC_TOKEN_ADDRESS, SRC_QTY_WEI, DST_TOKEN_ADDRESS, USER_ADDRESS, MAX_ALLOWANCE, results.slippageRate, REF_ADDRESS);
    } else {
        await approveContract(MAX_ALLOWANCE);
        await trade(SRC_TOKEN_ADDRESS, SRC_QTY_WEI, DST_TOKEN_ADDRESS, USER_ADDRESS, MAX_ALLOWANCE, results.slippageRate, REF_ADDRESS);
    }
    // Quit the program
    process.exit(0);
}

// Function to approve the KyberNetworkProxy contract to spend src token on the user's behalf
async function approveContract(allowance) {
    console.log("Approving KNP contract to manage my KNC");
    let txData = await SRC_TOKEN_CONTRACT.methods.approve(
        KYBER_NETWORK_PROXY_ADDRESS,
        allowance
    ).encodeABI();

    await broadcastTx(USER_ADDRESS, SRC_TOKEN_ADDRESS, txData, "200000")
}

// Function to convert src token to dst token
async function trade(srcTokenAddress, srcQtyWei, dstTokenAddress, dstAddress, maxDstAmount, minConversionRate, walletId) {
    console.log(`Convering ${SRC_TOKEN} to ${DST_TOKEN}`);
    let txData = await KYBER_NETWORK_PROXY_CONTRACT.methods.trade(
        srcTokenAddress,
        srcQtyWei,
        dstTokenAddress,
        dstAddress,
        maxDstAmount,
        minConversionRate,
        walletId
    ).encodeABI();

    await broadcastTx(USER_ADDRESS, KYBER_NETWORK_PROXY_ADDRESS, txData, "500000")
}


// Auxiliary contracts
// Function to get max gas price allowed on the KyberNetworkProxy contract
async function getMaxGasPrice() {
	let maxGasPrice = await KYBER_NETWORK_PROXY_CONTRACT.methods.maxGasPrice().call();
	return maxGasPrice;
}

// Function to broadcast transactions
async function broadcastTx(from, to, txData, gasLimit) {
	let txCount = await web3.eth.getTransactionCount(USER_ADDRESS);
	let gasPrice = await KYBER_NETWORK_PROXY_CONTRACT.methods.maxGasPrice().call();

    let rawTx = {
        from: from,
        to: to,
        data: txData,
        gasLimit: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(gasPrice),
        nonce: txCount
    };

    let tx = new Tx(rawTx);

    tx.sign(PRIVATE_KEY);
    const serializedTx = tx.serialize();
    txReceipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).catch(error => console.log(error))
    console.log(txReceipt)
}

main()
```

## Filtering Out Permissionless Reserves
By default, reserves that were listed permissionlessly are also included when performing `getExpectedRate()` and `trade()`. Depending on the jurisdiction where your platform is operating in, you may be required to exclude these reserves. To filter them out, use the `tradeWithHint()` function. Refer to [this section](references-kybernetworkproxy.md#hint) for more information.

## Fee Sharing Program
Wallets have the opportunity to join our *Fee Sharing Program*, which allows fee sharing on each swap that originates from your wallet. Learn more about the program [here](guide-feesharing.md)!

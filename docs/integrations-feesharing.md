---
id: Integrations-FeeSharing
title: Fee Sharing Program
---
## What is the Fee Sharing Program?
It’s an opportunity to be an integrated part of Kyber Network and receive commision for each conversion that originates from your DApp, wallet or payment gateway.

## How do I join the program?
Anyone can join the program by calling the [`registerWallet`](https://etherscan.io/address/0xECa04bB23612857650D727B8ed008f80952654ee#writeContract) function of [`KyberRegisterWallet`](https://etherscan.io/address/0xECa04bB23612857650D727B8ed008f80952654ee) contract! You may do so using [MyEtherWallet](#myetherwallet), [MyCrypto](#mycrypto) or programmatically via [web3](#web3).

## How do I earn fees?
Send your registered wallet address as part of the trade transaction data. More information regarding the input parameters of the `trade` function can be found in [reference](api-kybernetworkproxy.md#trade).</br>
<!--The input parameters of the `trade` function are shown below.
| Parameter           | Type    | Description                                   |
| ------------------- |:-------:|:--------------------------------------------------------------------:|
| `src`               | ERC20   | source ERC20 token contract address                                  |
| `srcAmount`         | uint    | wei amount of source ERC20 token                                     |
| `dest`              | ERC20   | destination ERC20 token contract address                             |
| `destAddress`       | address | recipient address for destination ERC20 token                        |
| `maxDestAmount`     | uint    | limit on the amount of destination tokens                            |
| `minConversionRate` | uint    | minimum conversion rate;  trade is canceled if actual rate is lower |
| `walletId`          | address | wallet address to send part of the fees to                           |
The `walletId` input parameter would be your registered wallet address.-->

## Fee Example
Suppose a user has successfully made a trade transaction of 10 ETH in value. 0.25% of the transaction value is to be paid by reserves in KNC. 30% of this fee paid by the reserves will be given to the registered party.

| Description | Amount | Calculation | % of Transaction Value |
| ------------- | ------------- | ------------- | ------------- |
| Trasaction Value | 10 ETH  |  na | 100% |
| Fee Paid by Reserves | 0.025 ETH (in KNC)  | `0.025 = 10 * 0.25%` | 0.25% |
| Fee Shared to Registered Party  | 0.0075 ETH (in KNC)  | `0.0075 = 0.025 * 30%` | 0.075% |

## How do I claim fees?
Call the `sendFeeToWallet` function of the [fee burner contract](https://etherscan.io/address/0xed4f53268bfdFF39B36E8786247bA3A02Cf34B04). This function **will have to be called for each reserve**. In other words, you would have to iterate through every reserve and call this function for your wallet address. At the moment, our server has a [script](https://github.com/KyberNetwork/smart-contracts/blob/master/scripts/feeHandler.js) to call this function for all wallets once every week.

You may refer to this [code example](#claiming-fees-with-sendfeetowallet) on how you may go about calling the function. This script can be called once every few days, or whenever a reasonable amount has accumulated in your account. More information regarding the input parameters of the `sendFeeToWallet` function can be found in [reference](api-feeburner.md#sendfeetowallet).</br>

<!--###`sendFeeToWallet`
| Parameter     | Type   | Description                                 |
| ------------- |:------:|:-------------------------------------------:|
| `wallet`         | address | wallet address to send part of the fees to |
| `reserve`        | address | reserve's contract address |-->

## Code Examples

### Registering Your Wallet

#### MyEtherWallet
1. Go to https://www.myetherwallet.com/#contracts
*   Check that you are connected to the mainnet.
![Mewjoinfee 1](/uploads/mewjoinfee-1.jpg "Mewjoinfee 1")

2. Insert `0xECa04bB23612857650D727B8ed008f80952654ee` as the contract address.
![Mewjoinfee 2](/uploads/mewjoinfee-2.jpg "Mewjoinfee 2")

3. Copy the `KyberRegisterWallet ABI` below.\
`
[{"constant":false,"inputs":[{"name":"wallet","type":"address"}],"name":"registerWallet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeBurnerWrapperProxyContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"feeBurnerWrapperProxy","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]
`

4. Paste it into the `ABI / JSON Interface` field.
![Mewjoinfee 3](/uploads/mewjoinfee-3.jpg "Mewjoinfee 3")

5. Click `Access`
![Mycryptojoinfee 4](/uploads/mycryptojoinfee-4.jpg "Mycryptojoinfee 4")

6. Under `Select a function`, choose `registerWallet`
![Mewjoinfee 5](/uploads/mewjoinfee-5.jpg "Mewjoinfee 5")

7. Input your wallet address for which you will receive the commission fees.
![Mewjoinfee 6](/uploads/mewjoinfee-6.jpg "Mewjoinfee 6")

8. Access your wallet using any of the given options.
![Mewjoinfee 7](/uploads/mewjoinfee-7.jpg "Mewjoinfee 7")

9. Sign, approve and wait for the transaction to be mined.
![Mewjoinfee 8](/uploads/mewjoinfee-8.jpg "Mewjoinfee 8")

Congratulations, you are now part of the fee sharing program!

#### MyCrypto
1. Go to https://mycrypto.com/contracts/interact
*   Check that you are connected to the mainnet.
![Mycryptojoinfee 1](/uploads/mycryptojoinfee-1.jpg "Mycryptojoinfee 1")

2. Insert `0xECa04bB23612857650D727B8ed008f80952654ee` as the contract address.
![Mewjoinfee 2](/uploads/mewjoinfee-2.jpg "Mewjoinfee 2")

3. Copy the `KyberRegisterWallet ABI` below.\
`[{"constant":false,"inputs":[{"name":"wallet","type":"address"}],"name":"registerWallet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeBurnerWrapperProxyContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"feeBurnerWrapperProxy","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]`

4. Paste it into the `ABI / JSON Interface` field.
![Mewjoinfee 3](/uploads/mewjoinfee-3.jpg "Mewjoinfee 3")

5. Click `Access`
![Mycryptojoinfee 4](/uploads/mycryptojoinfee-4.jpg "Mycryptojoinfee 4")

6. Under `Read / Write Contract`, choose `registerWallet`
![Mycryptojoinfee 7](/uploads/mycryptojoinfee-7.jpg "Mycryptojoinfee 7")

7. Input your wallet address for which you will receive the comission fees.
![Mycryptojoinfee 8](/uploads/mycryptojoinfee-8.jpg "Mycryptojoinfee 8")

8. Access your wallet using any of the given options.
![Mycryptojoinfee 5](/uploads/mycryptojoinfee-5.jpg "Mycryptojoinfee 5")

9. Sign, approve and wait for the transaction to be mined.
![Mycryptojoinfee 6](/uploads/mycryptojoinfee-6.jpg "Mycryptojoinfee 6")

Congratulations, you are now part of the fee sharing program!

#### Web3
1. Change the `WALLET_ADDRESS` to be the desired wallet address for which you would like to receive the commission fees.
2. Change `SENDER_ADDRESS_PRIVATE_KEY` to the private key of an ETH address to send the transaction. Kindly ensure that this address **has sufficient funds** to send the transaction.

```js
const Web3 = require('web3')
const BN = require('bignumber.js')
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"))

var WALLET_ADDRESS = "YOUR_WALLET_ADDRESS" //Eg. "0x8640d5a5c11782ea9cc63833843a7b8f8911d568"
var SENDER_ADDRESS_PRIVATE_KEY = "YOUR_SENDER_ADDRESS_PRIVATE_KEY"
SENDER_ACCOUNT = web3.eth.accounts.privateKeyToAccount(SENDER_ADDRESS_PRIVATE_KEY)

const KyberRegisterWalletABI  = [{"constant":false,"inputs":[{"name":"wallet","type":"address"}],"name":"registerWallet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeBurnerWrapperProxyContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"feeBurnerWrapperProxy","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]
var KyberRegisterWalletContractAddress = "0xECa04bB23612857650D727B8ed008f80952654ee"

async function main() {
  KyberRegisterWalletContract = new web3.eth.Contract(KyberRegisterWalletABI, KyberRegisterWalletContractAddress)
  txData = KyberRegisterWalletContract.methods.registerWallet(WALLET_ADDRESS)
  txResult = await broadcastTx(txData)
}

async function broadcastTx(txObject) {
  const gasLimit = await txObject.estimateGas();
  const gasPrice = new BN(50).times(10 ** 9); // 50 Gwei
  const nonce = await web3.eth.getTransactionCount(SENDER_ACCOUNT.address);
  const chainId = await web3.eth.net.getId();
  const txTo = txObject._parent.options.address;
  const txData = txObject.encodeABI();
  const txFrom = SENDER_ACCOUNT.address;
  const txKey = SENDER_ACCOUNT.privateKey;

  const tx = {
    from : txFrom,
    to : txTo,
    nonce : nonce,
    data : txData,
    gas : gasLimit,
    chainId : chainId,
    gasPrice : gasPrice
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, txKey);
  web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}

main()
```

### Earning Fees With `trade`
```js
transactionData = KyberNetworkProxyContract.methods.trade(
        SRC_TOKEN_ADDRESS, //ERC20 srcToken
        srcTokenWeiAmount, //uint srcAmount
        DEST_TOKEN_ADDRESS, //ERC20 destToken
        DEST_WALLET_ADDRESS, //address destAddress
        maximumDestTokenWeiAmount, //uint maxDestAmount
        minConversionWeiRate, //uint minConversionRate
        YOUR_WALLET_ADDRESS_HERE //uint walletId <-- your wallet address goes here, Eg. 0x91a502C678605fbCe581eae053319747482276b9
        ).encodeABI()

txReceipt = await web3.eth.sendTransaction({
    from: USER_ACCOUNT, //obtained from website interface Eg. Metamask, Ledger etc.
    to: KYBER_NETWORK_PROXY_ADDRESS,
    data: transactionData
 })
 ```

 ### Claiming Fees With `sendFeeToWallet`
1. Change the `WALLET_ADDRESS` to the registered wallet address of the fee sharing program.
2. Change `SENDER_ADDRESS_PRIVATE_KEY` to the private key of an ETH address to send the transaction. Kindly ensure that this address **has sufficient funds** to send the transaction.

 ```js
const Web3 = require('web3')
var ethers = require('ethers')
const BN = require('bignumber.js')
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"))

var WALLET_ADDRESS = "YOUR_WALLET_ADDRESS" //Eg. "0x8640d5a5c11782ea9cc63833843a7b8f8911d568"
var SENDER_ADDRESS_PRIVATE_KEY = "YOUR_SENDER_ADDRESS_PRIVATE_KEY"

SENDER_ACCOUNT = web3.eth.accounts.privateKeyToAccount(SENDER_ADDRESS_PRIVATE_KEY)

const KyberNetworkABI = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"trader","type":"address"},{"name":"src","type":"address"},{"name":"srcAmount","type":"uint256"},{"name":"dest","type":"address"},{"name":"destAddress","type":"address"},{"name":"maxDestAmount","type":"uint256"},{"name":"minConversionRate","type":"uint256"},{"name":"walletId","type":"address"},{"name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"infoFields","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"feeBurner","type":"address"}],"name":"setFeeBurner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"reservesPerTokenSrc","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"whiteList","type":"address"}],"name":"setWhiteList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"negligibleRateDiff","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeBurnerContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"expectedRate","type":"address"}],"name":"setExpectedRate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"expectedRateContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"whiteListContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"field","type":"bytes32"},{"name":"value","type":"uint256"}],"name":"setInfo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"}],"name":"getUserCapInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isEnabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_enable","type":"bool"}],"name":"setEnable","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetworkProxyContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"isReserve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdminQuickly","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"name":"expectedRate","type":"uint256"},{"name":"slippageRate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"reserves","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"user","type":"address"},{"name":"token","type":"address"}],"name":"getUserCapInTokenWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"reservesPerTokenDest","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"reserve","type":"address"},{"name":"add","type":"bool"}],"name":"addReserve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcAmount","type":"uint256"}],"name":"searchBestRate","outputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxGasPriceValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"field","type":"bytes32"}],"name":"info","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"dest","type":"address"},{"name":"srcAmount","type":"uint256"}],"name":"findBestRate","outputs":[{"name":"obsolete","type":"uint256"},{"name":"rate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_maxGasPrice","type":"uint256"},{"name":"_negligibleRateDiff","type":"uint256"}],"name":"setParams","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"networkProxy","type":"address"}],"name":"setKyberProxy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getNumReserves","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"user","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"reserve","type":"address"},{"name":"token","type":"address"},{"name":"ethToToken","type":"bool"},{"name":"tokenToEth","type":"bool"},{"name":"add","type":"bool"}],"name":"listPairForReserve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_admin","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"EtherReceival","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reserve","type":"address"},{"indexed":false,"name":"add","type":"bool"}],"name":"AddReserveToNetwork","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reserve","type":"address"},{"indexed":false,"name":"src","type":"address"},{"indexed":false,"name":"dest","type":"address"},{"indexed":false,"name":"add","type":"bool"}],"name":"ListReservePairs","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"proxy","type":"address"},{"indexed":false,"name":"sender","type":"address"}],"name":"KyberProxySet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"srcAddress","type":"address"},{"indexed":false,"name":"srcToken","type":"address"},{"indexed":false,"name":"srcAmount","type":"uint256"},{"indexed":false,"name":"destAddress","type":"address"},{"indexed":false,"name":"destToken","type":"address"},{"indexed":false,"name":"destAmount","type":"uint256"}],"name":"KyberTrade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}]
const FeeBurnerAPI  = [{"constant":false,"inputs":[{"name":"alerter","type":"address"}],"name":"removeAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"reserveKNCWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"rate","type":"uint256"}],"name":"setKNCRate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"reserveFeeToWallet","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOperators","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"reserveFeeToBurn","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"taxWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"reserveFeesInBps","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"taxFeeBps","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAlerter","type":"address"}],"name":"addAlerter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"walletFeesInBps","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"reserve","type":"address"},{"name":"feesInBps","type":"uint256"},{"name":"kncWallet","type":"address"}],"name":"setReserveData","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wallet","type":"address"},{"name":"feesInBps","type":"uint256"}],"name":"setWalletFees","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"transferAdminQuickly","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAlerters","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"kncPerETHRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOperator","type":"address"}],"name":"addOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_taxFeeBps","type":"uint256"}],"name":"setTaxInBps","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"operator","type":"address"}],"name":"removeOperator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kyberNetwork","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"sendTo","type":"address"}],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"feePayedPerReserve","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"wallet","type":"address"},{"name":"reserve","type":"address"}],"name":"sendFeeToWallet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"knc","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_taxWallet","type":"address"}],"name":"setTaxWallet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"reserve","type":"address"}],"name":"burnReserveFees","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"tradeWeiAmount","type":"uint256"},{"name":"reserve","type":"address"},{"name":"wallet","type":"address"}],"name":"handleFees","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_admin","type":"address"},{"name":"kncToken","type":"address"},{"name":"_kyberNetwork","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reserve","type":"address"},{"indexed":false,"name":"feeInBps","type":"uint256"},{"indexed":false,"name":"kncWallet","type":"address"}],"name":"ReserveDataSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"wallet","type":"address"},{"indexed":false,"name":"feesInBps","type":"uint256"}],"name":"WalletFeesSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"feesInBps","type":"uint256"}],"name":"TaxFeesSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"taxWallet","type":"address"}],"name":"TaxWalletSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reserve","type":"address"},{"indexed":false,"name":"wallet","type":"address"},{"indexed":false,"name":"walletFee","type":"uint256"}],"name":"AssignFeeToWallet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reserve","type":"address"},{"indexed":false,"name":"burnFee","type":"uint256"}],"name":"AssignBurnFees","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"reserve","type":"address"},{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"quantity","type":"uint256"}],"name":"BurnAssignedFees","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"reserve","type":"address"},{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"taxWallet","type":"address"},{"indexed":false,"name":"quantity","type":"uint256"}],"name":"SendTaxFee","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"wallet","type":"address"},{"indexed":false,"name":"reserve","type":"address"},{"indexed":false,"name":"sender","type":"address"}],"name":"SendWalletFees","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"TokenWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"sendTo","type":"address"}],"name":"EtherWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"pendingAdmin","type":"address"}],"name":"TransferAdminPending","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAdmin","type":"address"},{"indexed":false,"name":"previousAdmin","type":"address"}],"name":"AdminClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAlerter","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"AlerterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOperator","type":"address"},{"indexed":false,"name":"isAdd","type":"bool"}],"name":"OperatorAdded","type":"event"}]

const KYBER_NETWORK_ADDRESS = "0x91a502C678605fbCe581eae053319747482276b9"

async function main() {
  KyberNetworkContract = new web3.eth.Contract(KyberNetworkABI, KYBER_NETWORK_ADDRESS)
  reserves = await KyberNetworkContract.methods.getReserves().call()
  feeBurnerAddress = await KyberNetworkContract.methods.feeBurnerContract().call()
  feeBurnerContract = new web3.eth.Contract(FeeBurnerAPI, feeBurnerAddress)

  for (let reserve_index in reserves) {
        let reserveAddress = reserves[reserve_index]
        console.log()
        console.log("reserveAddress: ", reserveAddress)
        console.log("-------------------------------------")
        await broadcastTx(feeBurnerContract.methods.sendFeeToWallet(WALLET_ADDRESS, reserveAddress))
    }
}

async function broadcastTx(txObject) {
  const gasLimit = await txObject.estimateGas()
  console.log(gasLimit)
  const gasPrice = new BN(50).times(10 ** 9); // 50 Gwei, change to your preferred gas price
  const nonce = await web3.eth.getTransactionCount(SENDER_ACCOUNT.address)
  const chainId = await web3.eth.net.getId()
  const txTo = txObject._parent.options.address
  const txData = txObject.encodeABI()
  const txFrom = SENDER_ACCOUNT.address
  const txKey = SENDER_ACCOUNT.privateKey

  const tx = {
    from : txFrom,
    to : txTo,
    nonce : nonce,
    data : txData,
    gas : gasLimit,
    chainId : chainId,
    gasPrice : gasPrice
    }

    console.log(tx)
    const signedTx = await web3.eth.accounts.signTransaction(tx, txKey)
    txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
}

main()
 ```

 ## Web3 Injection
### Adding web3
You may add `web3` to your project using 1 of the following methods:
* npm: `npm install web3`
* bower: `bower install web3`
* meteor: `meteor add ethereum:web3`
* vanilla: link the `dist./web3.min.js`

### Requesting for web3 instance
Metamask and other dapp browsers will no longer automatically inject an Ethereum provider or a Web3 instance at a website's page load time.  As a result, one has to asynchronously request a provider. Find out more [in this article](https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8). The code below shows how you may go about doing so:
```
window.addEventListener('load', () => {
    // If web3 is not injected (modern browsers)...
    if (typeof web3 === 'undefined') {
        // Listen for provider injection
        window.addEventListener('message', ({ data }) => {
            if (data && data.type && data.type === 'ETHEREUM_PROVIDER_SUCCESS') {
                // Use injected provider, start dapp...
                web3 = new Web3(ethereum);
            }
        });
        // Request provider
        window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST' }, '*');
    }
    // If web3 is injected (legacy browsers)...
    else {
        // Use injected provider, start dapp
        web3 = new Web3(web3.currentProvider);
    }
});
```

For convenience, a Web3 instance *can* be injected by passing a web3 flag when requesting a provider:
```
//Request web3 provider
window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST', web3: true }, '*');
```
There is no guarantee about what version of web3 will be injected in response to this request, so it should only be used for convenience in development and debugging.
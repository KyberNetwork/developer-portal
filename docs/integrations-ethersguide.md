---
id: Integrations-EthersGuide
title: Ethers JS
---
[//]: # (tagline)
## Introduction

This guide will walk you through on how you can interact with our protocol implementation using the [ethers.js](https://docs.ethers.io/) library. You may also use the [Web3](https://web3js.readthedocs.io/) library, with some syntax changes. The most common group of users that can benefit from this guide are wallets or vendors who want to use their own UI.

## Risk Mitigation

There are some risks when utilising Kyber. To safeguard users, we kindly ask that you refer to the [Slippage Rates Protection](integrations-slippagerateprotection.md) and [Price Feed Security](integrations-pricefeedsecurity.md) sections on what these risks are, and how to mitigate them.

## Overview

We break this guide into 2 sections:
1. [Trading Tokens](#trading-tokens) - The section covers what contract interfaces to import, and functions to call to fetch rates and perform a simple trade.
2. [Reserve Routing](#reserve-routing) - This section covers the reserve routing feature to include / exclude reserves, or to split trades amongst multiple reserves.

## Things to note

1. If the source token is not ETH (ie. an ERC20 token), the user is required to **first call the ERC20 `approve` function** to give an allowance to the kyber proxy contract.
2. To prevent front running, the contract limits the gas price trade transactions can have. The transaction will be reverted if the limit is exceeded. To query for the maximum gas limit, check the public variable `maxGasPrice`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

let maxGasPrice = await KyberNetworkProxyContract.maxGasPrice();
```

## Trading Tokens

Suppose we want to convert 100 KNC to DAI tokens on Ropsten, which is a token to token conversion. In addition, we want to charge a platform fee of 0.25%. Note that ETH is used as the base pair i.e. KNC -> ETH -> DAI.

The code example will also work for token -> ether and ether -> token conversions.

### Import Relevant Packages

* We use `ethers` for connecting to the Ethereum blockchain
* `ethers` includes a BN utils library for BigNumber variables, which we shall also instantiate for convenience
* The `node-fetch` module is used for making API queries

```js
// Importing the relevant packages
const ethers = require('ethers');
const BN = ethers.BigNumber;
const fetch = require('node-fetch');
```

### Connect to an Ethereum Node

`ethers` provides a very simple method `getDefaultProvider` to easily connect to the Ethereum blockchain. While not necessary, it is recommended to provide an API key for the various providers offered (Eg. Alchemy, Infura and Etherscan).

```js
// Connecting to a provider
const NETWORK = "ropsten";
const PROJECT_ID = "INFURA_PROJECT_ID" // Replace this with your own Project ID
const provider = new ethers.getDefaultProvider(NETWORK, {'infura': PROJECT_ID});
```

### Define Constants and Trade Details

Next, we will define the constants that we will be using for this scenario.

#### Universal Constants

* `ETH_ADDRESS` used by Kyber to represent Ether
* `ZERO_BN`: BigNumber instance of `0`
* `MAX_UINT256`: BigNumber instance of `2**256 - 1` 
* `EMPTY_HINT`: The `hint` parameter is used for [reserve routing]. In this case, an empty hint would be `0x`.

```js
const ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const ZERO_BN = ethers.constants.Zero;
const MAX_UINT256 = ethers.constants.MaxUint256;
const EMPTY_HINT = '0x';
```

#### Tokens and Source Quantity

We define the source and destination tokens, as well as the source quantity to be used for the trade.

```js
// Tokens and srcQty
const SRC_TOKEN_ADDRESS = "0x7b2810576aa1cce68f2b118cef1f36467c648f92"; // Ropsten KNC address
const DEST_TOKEN_ADDRESS = "0xad6d458402f60fd3bd25163575031acdce07538d"; // Ropsten DAI address
const SRC_DECIMALS = new BN.from(18);
const SRC_QTY = BN.from(100).mul((BN.from(10).pow(SRC_DECIMALS))); // 100 KNC
```

#### Contract ABIs and Proxy Address

The following ABIs are imported for these functionalities:
- [`IERC20_ABI`](api_abi-abi.md#ierc20): Token approvals and transfers
- [`IKyberNetworkProxy_ABI`](api_abi-abi.md#ikybernetworkproxy): Fetch rates and execute trades

```js
// Contract ABIs and proxy address
const IERC20_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"digits","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"supply","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
const IKyberNetworkProxy_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":false,"internalType":"contract IERC20","name":"src","type":"address"},{"indexed":false,"internalType":"contract IERC20","name":"dest","type":"address"},{"indexed":false,"internalType":"address","name":"destAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"actualSrcAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"actualDestAmount","type":"uint256"},{"indexed":false,"internalType":"address","name":"platformWallet","type":"address"},{"indexed":false,"internalType":"uint256","name":"platformFeeBps","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"inputs":[],"name":"enabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ERC20","name":"src","type":"address"},{"internalType":"contract ERC20","name":"dest","type":"address"},{"internalType":"uint256","name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"internalType":"uint256","name":"expectedRate","type":"uint256"},{"internalType":"uint256","name":"worstRate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"src","type":"address"},{"internalType":"contract IERC20","name":"dest","type":"address"},{"internalType":"uint256","name":"srcQty","type":"uint256"},{"internalType":"uint256","name":"platformFeeBps","type":"uint256"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"getExpectedRateAfterFee","outputs":[{"internalType":"uint256","name":"expectedRate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxGasPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"src","type":"address"},{"internalType":"uint256","name":"srcAmount","type":"uint256"},{"internalType":"contract IERC20","name":"dest","type":"address"},{"internalType":"address payable","name":"destAddress","type":"address"},{"internalType":"uint256","name":"maxDestAmount","type":"uint256"},{"internalType":"uint256","name":"minConversionRate","type":"uint256"},{"internalType":"address payable","name":"platformWallet","type":"address"}],"name":"trade","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"contract ERC20","name":"src","type":"address"},{"internalType":"uint256","name":"srcAmount","type":"uint256"},{"internalType":"contract ERC20","name":"dest","type":"address"},{"internalType":"address payable","name":"destAddress","type":"address"},{"internalType":"uint256","name":"maxDestAmount","type":"uint256"},{"internalType":"uint256","name":"minConversionRate","type":"uint256"},{"internalType":"address payable","name":"walletId","type":"address"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"src","type":"address"},{"internalType":"uint256","name":"srcAmount","type":"uint256"},{"internalType":"contract IERC20","name":"dest","type":"address"},{"internalType":"address payable","name":"destAddress","type":"address"},{"internalType":"uint256","name":"maxDestAmount","type":"uint256"},{"internalType":"uint256","name":"minConversionRate","type":"uint256"},{"internalType":"address payable","name":"platformWallet","type":"address"},{"internalType":"uint256","name":"platformFeeBps","type":"uint256"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"tradeWithHintAndFee","outputs":[{"internalType":"uint256","name":"destAmount","type":"uint256"}],"stateMutability":"payable","type":"function"}];

// Kyber Network Proxy Contract Address
const IKyberNetworkProxy_ADDRESS = "0xa16Fc6e9b5D359797999adA576F7f4a4d57E8F75";
```

#### Sender

Replace the `PRIVATE_KEY` with a private key (including the `0x` prefix) of the sender of the transaction. There are other import methods that `ethers.js` support, such as reading from Metamask, and mnemonic phrases.

```js
// User Details
const PRIVATE_KEY = "PRIVATE_KEY"; // Eg. 0x40ddbce3c7df9ab8d507d6b4af3861d224711b35299470ab7a217f780fe696cd
const USER_WALLET = new ethers.Wallet(PRIVATE_KEY, provider);
```

#### Platofrm Wallet and Fees

Find out more about platform fees [here](integrations-platformfees.md).

```js
// Platform fees
const PLATFORM_WALLET = "PLATFORM_WALLET"; // Eg. 0x483C5100C3E544Aef546f72dF4022c8934a6945E
const PLATFORM_FEE = 25; // 0.25%
```

### Instantiate Contracts

Note that we fix `USER_WALLET` as the sender of any transactions made here to these contracts.

```js
// Instantiate contracts, using USER_WALLET as sender of txns
const KyberNetworkProxyContract = new ethers.Contract(
  IKyberNetworkProxy_ADDRESS,
  IKyberNetworkProxy_ABI,
  USER_WALLET
);
const srcTokenContract = new ethers.Contract(SRC_TOKEN_ADDRESS, IERC20_ABI, USER_WALLET);
```

### Core Steps For Trade Execution

Now that we have defined the trade details, we break down the process into a number of steps.

#### Step 1: Checking Token Allowance

We first check if there is sufficient allowance given to the proxy contract for the trade. Should it be insufficient, we will call the approve function of the source token contract.

```js
async function checkAndApproveTokenForTrade(srcTokenContract, userAddress, srcQty) {
  if (srcTokenContract.address == ETH_ADDRESS) {
    return;
  }

  // check existing allowance given to proxy contract
  let existingAllowance = await srcTokenContract.allowance(userAddress, IKyberNetworkProxy_ADDRESS);

  // if zero allowance, just set to MAX_UINT256
  if (existingAllowance.eq(ZERO_BN)) {
    console.log("Approving KNP contract to max allowance");
    await srcTokenContract.approve(IKyberNetworkProxy_ADDRESS, MAX_UINT256);
  } else if (existingAllowance.lt(srcQty)) {
    // if existing allowance is insufficient, reset to zero, then set to MAX_UINT256
    console.log("Approving KNP contract to zero, then max allowance");
    await srcTokenContract.approve(IKyberNetworkProxy_ADDRESS, ZERO_BN);
    await srcTokenContract.approve(IKyberNetworkProxy_ADDRESS, MAX_UINT256);
  }
  return;
}
```

#### Step 2: Hint

For simple trades, we can simply set the hint as the `EMPTY_HINT`. Otherwise, we can build hints to specify [reserve routes](#reserve-routing).

```js
let hint = EMPTY_HINT;
```

#### Step 3: Fetching Rates

Next, we fetch the expected rate for the trade, which we can set as the minimum conversion rate. Should the actual rate fall below this, the trade will revert. You may choose to add a buffer (reduce the fetched expected rate by some percentage).

```js
let minConversionRate = await KyberNetworkProxyContract.getExpectedRateAfterFee(
    SRC_TOKEN_ADDRESS,
    DEST_TOKEN_ADDRESS,
    SRC_QTY,
    PLATFORM_FEE,
    hint
    );
```

#### Step 3: Gas Configurations

We next define the gas limit and price to be used for the trade. There are a number of ways to go about this. We give 2 possible methods to determine each parameter, but this is definitely customisable to suit your needs.

```js
async function getGasConfig(
  KyberNetworkProxyContract, provider, srcTokenAddress, destTokenAddress, srcQty,
  destAddress, maxDestAmount, minConversionRate, platformWallet, platformFee, hint
  )
{
  let gasConfig = { gasLimit: ZERO_BN, gasPrice: ZERO_BN};

  // Configure gas limit
  // Method 1: Use estimateGas function, add buffer
  let gasLimit = await KyberNetworkProxyContract.estimateGas.tradeWithHintAndFee(
    srcTokenAddress,
    srcQty,
    destTokenAddress,
    destAddress,
    maxDestAmount,
    minConversionRate,
    platformWallet,
    platformFee,
    hint
  );

  gasConfig.gasLimit = gasLimit.mul(BN.from(110)).div(BN.from(100));

  // Method 2: Use /gasLimit API (only Ropsten and mainnet)
  // let gasLimitRequest = await fetch(
  //   `https://${NETWORK == "mainnet" ? "" : NETWORK + "-"}api.kyber.network/gas_limit?` + 
  //   `source=${srcTokenAddress}&dest=${destTokenAddress}&amount=${srcQty}`
  //   );

  // let gasLimit = await gasLimitRequest.json();
  // if (gasLimit.error) {
  //   console.log(gasLimit);
  //   process.exit(0);
  // } else {
  //   gasConfig.gasLimit = BN.from(gasLimit.data);
  // }

  // Configure gas price
  let maxGasPrice = await KyberNetworkProxyContract.maxGasPrice();
  // Method 1: Fetch gasPrice
  let gasPrice = await provider.getGasPrice();

  //Method 2: Manual gasPrice input
  // let gasPrice = BN.from(30).mul((BN.from(10).mul(BN.from(9))));

  // Check against maxGasPrice
  gasConfig.gasPrice = gasPrice.gt(maxGasPrice) ? maxGasPrice : gasPrice;
  return gasConfig;
}
```

#### Step 4: Executing Trade

We can finally make a call to execute the trade.

```js
let ethValue = (SRC_TOKEN_ADDRESS == ETH_ADDRESS) ? SRC_QTY : ZERO_BN;

await KyberNetworkProxyContract.tradeWithHintAndFee(
  SRC_TOKEN_ADDRESS,
  SRC_QTY,
  DEST_TOKEN_ADDRESS,
  USER_WALLET.address, // destAddress
  MAX_UINT256, // maxDestAmount: set to be arbitrarily large
  minConversionRate,
  PLATFORM_WALLET,
  PLATFORM_FEE,
  hint,
  { value: ethValue, gasLimit: gasConfig.gasLimit, gasPrice: gasConfig.gasPrice }
);
```

### Tying Everything Together

The main function will combine the different functions together to obtain the conversion rate and execute the trade.

```js
async function main() {
  // Step 1: Check and approve allowance if needed
  await checkAndApproveTokenForTrade(srcTokenContract, USER_WALLET.address, SRC_QTY);

  let hint = EMPTY_HINT; // build hint here (see section on reserve routing)
  // Step 2: Get rate for trade
  let minConversionRate = await KyberNetworkProxyContract.getExpectedRateAfterFee(
    SRC_TOKEN_ADDRESS,
    DEST_TOKEN_ADDRESS,
    SRC_QTY,
    PLATFORM_FEE,
    hint
    );

  // Step 3: Get gas limit estimates and price
  let gasConfig = await getGasConfig(
    KyberNetworkProxyContract, provider, SRC_TOKEN_ADDRESS, DEST_TOKEN_ADDRESS, SRC_QTY,
    USER_WALLET.address, MAX_UINT256, minConversionRate, PLATFORM_WALLET, PLATFORM_FEE, hint
    );

  // Step 4: Execute trade
  let ethValue = (SRC_TOKEN_ADDRESS == ETH_ADDRESS) ? SRC_QTY : ZERO_BN;

  console.log("Executing Trade...");
  await KyberNetworkProxyContract.tradeWithHintAndFee(
    SRC_TOKEN_ADDRESS,
    SRC_QTY,
    DEST_TOKEN_ADDRESS,
    USER_WALLET.address, // destAddress
    MAX_UINT256, // maxDestAmount: set to be arbitrarily large
    minConversionRate,
    PLATFORM_WALLET,
    PLATFORM_FEE,
    hint,
    { value: ethValue, gasLimit: gasConfig.gasLimit, gasPrice: gasConfig.gasPrice }
  );

  // Quit the program
  process.exit(0);
}
```

### Full code example
Before running this code example, the following fields need to be modified:
1. Change `INFURA_PROJECT_ID` to your Infura Project ID.
2. Change `PRIVATE_KEY` to the private key (with `0x` prefix) of the Ethereum wallet holding Ether.
3. Change `PLATFORM_WALLET` to a wallet address for platform fees.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const ethers = require('ethers');
const BN = ethers.BigNumber;
const fetch = require('node-fetch');

const NETWORK = "ropsten";
const PROJECT_ID = "INFURA_PROJECT_ID" // Replace this with your own Project ID
const provider = new ethers.getDefaultProvider(NETWORK, {'infura': PROJECT_ID});

// Universal Constants
const ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const ZERO_BN = ethers.constants.Zero;
const MAX_UINT256 = ethers.constants.MaxUint256;
const EMPTY_HINT = "0x";

// Tokens and srcQty
const SRC_TOKEN_ADDRESS = "0x7b2810576aa1cce68f2b118cef1f36467c648f92"; // Ropsten KNC address
const DEST_TOKEN_ADDRESS = "0xad6d458402f60fd3bd25163575031acdce07538d"; // Ropsten DAI address
const SRC_DECIMALS = new BN.from(18);
const SRC_QTY = BN.from(100).mul((BN.from(10).pow(SRC_DECIMALS))); // 100 KNC

// Contract ABIs and proxy address
const IERC20_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"digits","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"supply","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
const IKyberNetworkProxy_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":false,"internalType":"contract IERC20","name":"src","type":"address"},{"indexed":false,"internalType":"contract IERC20","name":"dest","type":"address"},{"indexed":false,"internalType":"address","name":"destAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"actualSrcAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"actualDestAmount","type":"uint256"},{"indexed":false,"internalType":"address","name":"platformWallet","type":"address"},{"indexed":false,"internalType":"uint256","name":"platformFeeBps","type":"uint256"}],"name":"ExecuteTrade","type":"event"},{"inputs":[],"name":"enabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ERC20","name":"src","type":"address"},{"internalType":"contract ERC20","name":"dest","type":"address"},{"internalType":"uint256","name":"srcQty","type":"uint256"}],"name":"getExpectedRate","outputs":[{"internalType":"uint256","name":"expectedRate","type":"uint256"},{"internalType":"uint256","name":"worstRate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"src","type":"address"},{"internalType":"contract IERC20","name":"dest","type":"address"},{"internalType":"uint256","name":"srcQty","type":"uint256"},{"internalType":"uint256","name":"platformFeeBps","type":"uint256"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"getExpectedRateAfterFee","outputs":[{"internalType":"uint256","name":"expectedRate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxGasPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"src","type":"address"},{"internalType":"uint256","name":"srcAmount","type":"uint256"},{"internalType":"contract IERC20","name":"dest","type":"address"},{"internalType":"address payable","name":"destAddress","type":"address"},{"internalType":"uint256","name":"maxDestAmount","type":"uint256"},{"internalType":"uint256","name":"minConversionRate","type":"uint256"},{"internalType":"address payable","name":"platformWallet","type":"address"}],"name":"trade","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"contract ERC20","name":"src","type":"address"},{"internalType":"uint256","name":"srcAmount","type":"uint256"},{"internalType":"contract ERC20","name":"dest","type":"address"},{"internalType":"address payable","name":"destAddress","type":"address"},{"internalType":"uint256","name":"maxDestAmount","type":"uint256"},{"internalType":"uint256","name":"minConversionRate","type":"uint256"},{"internalType":"address payable","name":"walletId","type":"address"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"tradeWithHint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"src","type":"address"},{"internalType":"uint256","name":"srcAmount","type":"uint256"},{"internalType":"contract IERC20","name":"dest","type":"address"},{"internalType":"address payable","name":"destAddress","type":"address"},{"internalType":"uint256","name":"maxDestAmount","type":"uint256"},{"internalType":"uint256","name":"minConversionRate","type":"uint256"},{"internalType":"address payable","name":"platformWallet","type":"address"},{"internalType":"uint256","name":"platformFeeBps","type":"uint256"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"tradeWithHintAndFee","outputs":[{"internalType":"uint256","name":"destAmount","type":"uint256"}],"stateMutability":"payable","type":"function"}];

// Kyber Network Proxy Contract Address
const IKyberNetworkProxy_ADDRESS = "0xa16Fc6e9b5D359797999adA576F7f4a4d57E8F75";

// User Details
const PRIVATE_KEY = "PRIVATE_KEY"; // Eg. 0x40ddbce3c7df9ab8d507d6b4af3861d224711b35299470ab7a217f780fe696cd
const USER_WALLET = new ethers.Wallet(PRIVATE_KEY, provider);

// Platform fees
const PLATFORM_WALLET = "PLATFORM_WALLET"; // Eg. 0x483C5100C3E544Aef546f72dF4022c8934a6945E
const PLATFORM_FEE = 25; // 0.25%

// Instantiate contracts, using USER_WALLET as sender of txns
const KyberNetworkProxyContract = new ethers.Contract(
  IKyberNetworkProxy_ADDRESS,
  IKyberNetworkProxy_ABI,
  USER_WALLET
);
const srcTokenContract = new ethers.Contract(SRC_TOKEN_ADDRESS, IERC20_ABI, USER_WALLET);

async function main() {
  // Step 1: Check and approve allowance if needed
  await checkAndApproveTokenForTrade(srcTokenContract, USER_WALLET.address, SRC_QTY);

  let hint = EMPTY_HINT; // build hint here (see section on reserve routing)
  // Step 2: Get rate for trade
  let minConversionRate = await KyberNetworkProxyContract.getExpectedRateAfterFee(
    SRC_TOKEN_ADDRESS,
    DEST_TOKEN_ADDRESS,
    SRC_QTY,
    PLATFORM_FEE,
    hint
    );

  // Step 3: Get gas limit estimates and price
  let gasConfig = await getGasConfig(
    KyberNetworkProxyContract, provider, SRC_TOKEN_ADDRESS, DEST_TOKEN_ADDRESS, SRC_QTY,
    USER_WALLET.address, MAX_UINT256, minConversionRate, PLATFORM_WALLET, PLATFORM_FEE, hint
    );

  // Step 4: Execute trade
  let ethValue = (SRC_TOKEN_ADDRESS == ETH_ADDRESS) ? SRC_QTY : ZERO_BN;

  console.log("Executing Trade...");
  await KyberNetworkProxyContract.tradeWithHintAndFee(
    SRC_TOKEN_ADDRESS,
    SRC_QTY,
    DEST_TOKEN_ADDRESS,
    USER_WALLET.address, // destAddress
    MAX_UINT256, // maxDestAmount: set to be arbitrarily large
    minConversionRate,
    PLATFORM_WALLET,
    PLATFORM_FEE,
    hint,
    { value: ethValue, gasLimit: gasConfig.gasLimit, gasPrice: gasConfig.gasPrice }
  );

  // Quit the program
  process.exit(0);
}

async function checkAndApproveTokenForTrade(srcTokenContract, userAddress, srcQty) {
  if (srcTokenContract.address == ETH_ADDRESS) {
    return;
  }

  // check existing allowance given to proxy contract
  let existingAllowance = await srcTokenContract.allowance(userAddress, IKyberNetworkProxy_ADDRESS);

  // if zero allowance, just set to MAX_UINT256
  if (existingAllowance.eq(ZERO_BN)) {
    console.log("Approving KNP contract to max allowance");
    await srcTokenContract.approve(IKyberNetworkProxy_ADDRESS, MAX_UINT256);
  } else if (existingAllowance.lt(srcQty)) {
    // if existing allowance is insufficient, reset to zero, then set to MAX_UINT256
    console.log("Approving KNP contract to zero, then max allowance");
    await srcTokenContract.approve(IKyberNetworkProxy_ADDRESS, ZERO_BN);
    await srcTokenContract.approve(IKyberNetworkProxy_ADDRESS, MAX_UINT256);
  }
  return;
}

async function getGasConfig(
  KyberNetworkProxyContract, provider, srcTokenAddress, destTokenAddress, srcQty,
  destAddress, maxDestAmount, minConversionRate, platformWallet, platformFee, hint
  )
{
  let gasConfig = { gasLimit: ZERO_BN, gasPrice: ZERO_BN};

  // Configure gas limit
  // Method 1: Use estimateGas function, add buffer
  let gasLimit = await KyberNetworkProxyContract.estimateGas.tradeWithHintAndFee(
    srcTokenAddress,
    srcQty,
    destTokenAddress,
    destAddress,
    maxDestAmount,
    minConversionRate,
    platformWallet,
    platformFee,
    hint
  );

  gasConfig.gasLimit = gasLimit.mul(BN.from(110)).div(BN.from(100));

  // Method 2: Use /gasLimit API (only Ropsten and mainnet)
  // let gasLimitRequest = await fetch(
  //   `https://${NETWORK == "mainnet" ? "" : NETWORK + "-"}api.kyber.network/gas_limit?` + 
  //   `source=${srcTokenAddress}&dest=${destTokenAddress}&amount=${srcQty}`
  //   );

  // let gasLimit = await gasLimitRequest.json();
  // if (gasLimit.error) {
  //   console.log(gasLimit);
  //   process.exit(0);
  // } else {
  //   gasConfig.gasLimit = BN.from(gasLimit.data);
  // }

  // Configure gas price
  let maxGasPrice = await KyberNetworkProxyContract.maxGasPrice();
  // Method 1: Fetch gasPrice
  let gasPrice = await provider.getGasPrice();

  //Method 2: Manual gasPrice input
  // let gasPrice = BN.from(30).mul((BN.from(10).mul(BN.from(9))));

  // Check against maxGasPrice
  gasConfig.gasPrice = gasPrice.gt(maxGasPrice) ? maxGasPrice : gasPrice;
  return gasConfig;
}

main();
```

## Reserve Routing

### Overview

In previous network versions, the `hint` parameter was used to filter permissionless reserves. With Katalyst, we utilise this parameter for routing trades to specific reserves.

There are 4 optional routing rules:
1.  **`BestOfAll`** - This is the default routing rule when no hint is provided, and is the classic reserve matching algorithm used by the Kyber smart contracts since the beginning.
2.  **`MaskIn` (Whitelist)** - Specify a list of reserves to be *included* and perform the `BestOfAll` routing on them
3.  **`MaskOut` (Blacklist)** - Specify a list of reserves to be *excluded* and perform the `BestOfAll` routing on the remaining reserves
4.  **`Split`** - Specify a list of reserves and their respective percentages of the total `srcQty` that will be routed to each reserve.

For token -> token trades, you can specify a routing rule for each half. For example, a `MaskIn` route can be used for the token -> ether side, while a `Split` route can be used for the ether -> token side.

### Fetching Reserve IDs

The contract to interact with for this functionality here is the *KyberStorage* contract.

#### Define Contract ABI and Address

We import the [`IKyberStorage_ABI`](api_abi-abi.md#ikyberstorage) to fetch reserve IDs, and define the kyberStorage address.

```js
const IKyberStorage_ABI = [{"inputs":[{"internalType":"address","name":"kyberProxy","type":"address"},{"internalType":"uint256","name":"maxApprovedProxies","type":"uint256"}],"name":"addKyberProxy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"name":"getEntitledRebateData","outputs":[{"internalType":"bool[]","name":"entitledRebateArr","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"name":"getFeeAccountedData","outputs":[{"internalType":"bool[]","name":"feeAccountedArr","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getKyberProxies","outputs":[{"internalType":"contract IKyberNetworkProxy[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"name":"getRebateWalletsFromIds","outputs":[{"internalType":"address[]","name":"rebateWallets","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"reserveId","type":"bytes32"}],"name":"getReserveAddressesByReserveId","outputs":[{"internalType":"address[]","name":"reserveAddresses","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"name":"getReserveAddressesFromIds","outputs":[{"internalType":"address[]","name":"reserveAddresses","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"uint256","name":"startIndex","type":"uint256"},{"internalType":"uint256","name":"endIndex","type":"uint256"}],"name":"getReserveAddressesPerTokenSrc","outputs":[{"internalType":"address[]","name":"reserveAddresses","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"reserve","type":"address"}],"name":"getReserveDetailsByAddress","outputs":[{"internalType":"bytes32","name":"reserveId","type":"bytes32"},{"internalType":"address","name":"rebateWallet","type":"address"},{"internalType":"enum IKyberStorage.ReserveType","name":"resType","type":"uint8"},{"internalType":"bool","name":"isFeeAccountedFlag","type":"bool"},{"internalType":"bool","name":"isEntitledRebateFlag","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"reserveId","type":"bytes32"}],"name":"getReserveDetailsById","outputs":[{"internalType":"address","name":"reserveAddress","type":"address"},{"internalType":"address","name":"rebateWallet","type":"address"},{"internalType":"enum IKyberStorage.ReserveType","name":"resType","type":"uint8"},{"internalType":"bool","name":"isFeeAccountedFlag","type":"bool"},{"internalType":"bool","name":"isEntitledRebateFlag","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"reserve","type":"address"}],"name":"getReserveId","outputs":[{"internalType":"bytes32","name":"reserveId","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"reserveAddresses","type":"address[]"}],"name":"getReserveIdsFromAddresses","outputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"getReserveIdsPerTokenDest","outputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"getReserveIdsPerTokenSrc","outputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"},{"internalType":"contract IERC20","name":"src","type":"address"},{"internalType":"contract IERC20","name":"dest","type":"address"}],"name":"getReservesData","outputs":[{"internalType":"bool","name":"areAllReservesListed","type":"bool"},{"internalType":"bool[]","name":"feeAccountedArr","type":"bool[]"},{"internalType":"bool[]","name":"entitledRebateArr","type":"bool[]"},{"internalType":"contract IKyberReserve[]","name":"reserveAddresses","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isKyberProxyAdded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"kyberProxy","type":"address"}],"name":"removeKyberProxy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_kyberFeeHandler","type":"address"},{"internalType":"address","name":"_kyberMatchingEngine","type":"address"}],"name":"setContracts","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_kyberDao","type":"address"}],"name":"setKyberDaoContract","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const IKyberStorage_ADDRESS = "0xa4eaD31a6c8e047E01cE1128E268c101AD391959";
```

#### Methods

For the token -> ether side of the trade, call `getReserveIdsPerTokenSrc` of the kyberStorage contract.
For the ether -> token side of the trade, call `getReserveIdsPerTokenDest` of the kyberStorage contract.

#### Examples

Get reserve IDs for WBTC -> ETH.

```js
let srcTokenReserveIds = await KyberStorageContract.getReserveIdsPerTokenSrc(WBTC_ADDRESS);
```

Get reserve IDs for ETH -> KNC.

```js
let destTokenReserveIds = await KyberStorageContract.getReserveIdsPerTokenDest(KNC_ADDRESS);
```

### Building Hints

The contract to interact with for this functionality here is the *KyberHintHandler* contract, which is inherited by the *KyberMatchingEngine* contract.

- For token -> ether trades, call the `buildTokenToEthHint` function
- For ether -> token trades, call the `buildTokenToEthHint` function
- For token -> token trades, call the `buildTokenToTokenHint` function

Their input parameters are explained below:
| Parameter              | Type      | Description                                     |
|:----------------------:|:---------:|:-----------------------------------------------:|
| `tokenSrc`             | IERC20    | source ERC20 token contract address             |
| `tokenToEthType`       | uint256 | `0 = BestOfAll`, `1 = MaskIn`, `2 = MaskOut`, `3 = Split` |
| `tokenToEthReserveIds` | bytes32[] | list of reserve IDs for token -> ether trade    |
| `tokenToEthSplits`     | uint256[] | percentages (in basis points) for `Split` trade |
| `tokenDest`            | IERC20    | source ERC20 token contract address             |
| `ethToTokenType`       | uint256 | `0 = BestOfAll`, `1 = MaskIn`, `2 = MaskOut`, `3 = Split` |
| `ethToTokenReserveIds` | bytes32[] | list of reserve IDs for token -> ether trade    |
| `ethToTokenSplits`     | uint256[] | percentages (in basis points) for `Split` trade |

#### Notes

- The correct builder hint function must be used for the correct trade type. Otherwise, the hint will not be built correctly, and will result in transaction failure.
- For token -> token trades, a combination of TradeTypes are allowed. For example, the token -> eth trade can be `BestOfAll`, while the eth -> token trade can be `Split`.

#### Define Contract ABI and Address

We import the [`IKyberHint_ABI`](api_abi-abi.md#ikyberhint) to fetch reserve IDs, and define the kyberHintHandler address.

```js
const IKyberHint_ABI = [{"inputs":[{"internalType":"contract IERC20","name":"tokenDest","type":"address"},{"internalType":"enum IKyberHint.TradeType","name":"ethToTokenType","type":"uint8"},{"internalType":"bytes32[]","name":"ethToTokenReserveIds","type":"bytes32[]"},{"internalType":"uint256[]","name":"ethToTokenSplits","type":"uint256[]"}],"name":"buildEthToTokenHint","outputs":[{"internalType":"bytes","name":"hint","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenSrc","type":"address"},{"internalType":"enum IKyberHint.TradeType","name":"tokenToEthType","type":"uint8"},{"internalType":"bytes32[]","name":"tokenToEthReserveIds","type":"bytes32[]"},{"internalType":"uint256[]","name":"tokenToEthSplits","type":"uint256[]"}],"name":"buildTokenToEthHint","outputs":[{"internalType":"bytes","name":"hint","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenSrc","type":"address"},{"internalType":"enum IKyberHint.TradeType","name":"tokenToEthType","type":"uint8"},{"internalType":"bytes32[]","name":"tokenToEthReserveIds","type":"bytes32[]"},{"internalType":"uint256[]","name":"tokenToEthSplits","type":"uint256[]"},{"internalType":"contract IERC20","name":"tokenDest","type":"address"},{"internalType":"enum IKyberHint.TradeType","name":"ethToTokenType","type":"uint8"},{"internalType":"bytes32[]","name":"ethToTokenReserveIds","type":"bytes32[]"},{"internalType":"uint256[]","name":"ethToTokenSplits","type":"uint256[]"}],"name":"buildTokenToTokenHint","outputs":[{"internalType":"bytes","name":"hint","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenDest","type":"address"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"parseEthToTokenHint","outputs":[{"internalType":"enum IKyberHint.TradeType","name":"ethToTokenType","type":"uint8"},{"internalType":"bytes32[]","name":"ethToTokenReserveIds","type":"bytes32[]"},{"internalType":"contract IKyberReserve[]","name":"ethToTokenAddresses","type":"address[]"},{"internalType":"uint256[]","name":"ethToTokenSplits","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenSrc","type":"address"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"parseTokenToEthHint","outputs":[{"internalType":"enum IKyberHint.TradeType","name":"tokenToEthType","type":"uint8"},{"internalType":"bytes32[]","name":"tokenToEthReserveIds","type":"bytes32[]"},{"internalType":"contract IKyberReserve[]","name":"tokenToEthAddresses","type":"address[]"},{"internalType":"uint256[]","name":"tokenToEthSplits","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenSrc","type":"address"},{"internalType":"contract IERC20","name":"tokenDest","type":"address"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"parseTokenToTokenHint","outputs":[{"internalType":"enum IKyberHint.TradeType","name":"tokenToEthType","type":"uint8"},{"internalType":"bytes32[]","name":"tokenToEthReserveIds","type":"bytes32[]"},{"internalType":"contract IKyberReserve[]","name":"tokenToEthAddresses","type":"address[]"},{"internalType":"uint256[]","name":"tokenToEthSplits","type":"uint256[]"},{"internalType":"enum IKyberHint.TradeType","name":"ethToTokenType","type":"uint8"},{"internalType":"bytes32[]","name":"ethToTokenReserveIds","type":"bytes32[]"},{"internalType":"contract IKyberReserve[]","name":"ethToTokenAddresses","type":"address[]"},{"internalType":"uint256[]","name":"ethToTokenSplits","type":"uint256[]"}],"stateMutability":"view","type":"function"}];
const IKyberHintHandler_ADDRESS = "0xeB4DBDEC268bC9818669E9926e62004317d84b54";
```

### `MaskIn` TradeType

Note that the splits parameter must be empty, ie. `[]`.

#### Example

Select the first reserve for a WBTC -> ETH trade.

```js
let reserveIds = await KyberStorageContract.getReserveIdsPerTokenSrc(WBTC_ADDRESS);
let hint = await KyberHintHandlerContract.buildTokenToEthHint(
  WBTC_ADDRESS,
  BN.from(1), // MaskIn
  reserveIds.slice(0,1), // only first reserve
  []
);
```

### `MaskOut` TradeType

Note that the splits parameter must be empty, ie. `[]`.

#### Example

Exclude the first reserve from a WBTC -> ETH trade.

```js
let reserveIds = await KyberStorageContract.getReserveIdsPerTokenSrc(WBTC_ADDRESS);
let hint = await KyberHintHandlerContract.buildTokenToEthHint(
  WBTC_ADDRESS,
  BN.from(2), // MaskOut
  reserveIds.slice(0,1), // exclude only first reserve
  []
);
```

### `Split` TradeType

Note that the splits values must add up to `10000` (100%).

#### Example

Split evenly among 2 reserves for a ETH -> KNC trade.

```js
let reserveIds = await KyberStorageContract.getReserveIdsPerTokenDest(KNC_ADDRESS);
let hint = await KyberHintHandlerContract.buildEthToTokenHint(
  KNC_ADDRESS,
  BN.from(3), // Split
  reserveIds.slice(0,2), // select first 2 reserves
  [BN.from(5000), BN.from(5000)]
);
```

### `BestOfAll` TradeType
- The `BestOfAll` TradeType is primarily for specifying the `BestOfAll` behaviour for one side of token -> token trades. It is not needed for token -> ether and ether -> token trades.
- The reserveIds and splits parameters must be empty.

#### Example

For a WBTC -> KNC trade, do a `MaskIn` route for WBTC -> ETH, and `BestOfAll` route for ETH -> KNC.


```js
let reserveIds = await KyberStorageContract.getReserveIdsPerTokenSrc(WBTC_ADDRESS);
let hint = await KyberHintHandlerContract.buildTokenToTokenHint(
    WBTC_ADDRESS,
    1, // MaskIn
    reserveIds.slice(0,1), // select only 1 reserve
    [],
    KNC_ADDRESS,
    0, // BestOfAll
    [],
    []
);
```

### Full Code Example

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const ethers = require('ethers');
const BN = ethers.BigNumber;
const NETWORK = "ropsten";
const provider = new ethers.getDefaultProvider(NETWORK);

const IKyberStorage_ABI = [{"inputs":[{"internalType":"address","name":"kyberProxy","type":"address"},{"internalType":"uint256","name":"maxApprovedProxies","type":"uint256"}],"name":"addKyberProxy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"name":"getEntitledRebateData","outputs":[{"internalType":"bool[]","name":"entitledRebateArr","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"name":"getFeeAccountedData","outputs":[{"internalType":"bool[]","name":"feeAccountedArr","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getKyberProxies","outputs":[{"internalType":"contract IKyberNetworkProxy[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"name":"getRebateWalletsFromIds","outputs":[{"internalType":"address[]","name":"rebateWallets","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"reserveId","type":"bytes32"}],"name":"getReserveAddressesByReserveId","outputs":[{"internalType":"address[]","name":"reserveAddresses","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"name":"getReserveAddressesFromIds","outputs":[{"internalType":"address[]","name":"reserveAddresses","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"uint256","name":"startIndex","type":"uint256"},{"internalType":"uint256","name":"endIndex","type":"uint256"}],"name":"getReserveAddressesPerTokenSrc","outputs":[{"internalType":"address[]","name":"reserveAddresses","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"reserve","type":"address"}],"name":"getReserveDetailsByAddress","outputs":[{"internalType":"bytes32","name":"reserveId","type":"bytes32"},{"internalType":"address","name":"rebateWallet","type":"address"},{"internalType":"enum IKyberStorage.ReserveType","name":"resType","type":"uint8"},{"internalType":"bool","name":"isFeeAccountedFlag","type":"bool"},{"internalType":"bool","name":"isEntitledRebateFlag","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"reserveId","type":"bytes32"}],"name":"getReserveDetailsById","outputs":[{"internalType":"address","name":"reserveAddress","type":"address"},{"internalType":"address","name":"rebateWallet","type":"address"},{"internalType":"enum IKyberStorage.ReserveType","name":"resType","type":"uint8"},{"internalType":"bool","name":"isFeeAccountedFlag","type":"bool"},{"internalType":"bool","name":"isEntitledRebateFlag","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"reserve","type":"address"}],"name":"getReserveId","outputs":[{"internalType":"bytes32","name":"reserveId","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"reserveAddresses","type":"address[]"}],"name":"getReserveIdsFromAddresses","outputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"getReserveIdsPerTokenDest","outputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"getReserveIdsPerTokenSrc","outputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"reserveIds","type":"bytes32[]"},{"internalType":"contract IERC20","name":"src","type":"address"},{"internalType":"contract IERC20","name":"dest","type":"address"}],"name":"getReservesData","outputs":[{"internalType":"bool","name":"areAllReservesListed","type":"bool"},{"internalType":"bool[]","name":"feeAccountedArr","type":"bool[]"},{"internalType":"bool[]","name":"entitledRebateArr","type":"bool[]"},{"internalType":"contract IKyberReserve[]","name":"reserveAddresses","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isKyberProxyAdded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"kyberProxy","type":"address"}],"name":"removeKyberProxy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_kyberFeeHandler","type":"address"},{"internalType":"address","name":"_kyberMatchingEngine","type":"address"}],"name":"setContracts","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_kyberDao","type":"address"}],"name":"setKyberDaoContract","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const IKyberHint_ABI = [{"inputs":[{"internalType":"contract IERC20","name":"tokenDest","type":"address"},{"internalType":"enum IKyberHint.TradeType","name":"ethToTokenType","type":"uint8"},{"internalType":"bytes32[]","name":"ethToTokenReserveIds","type":"bytes32[]"},{"internalType":"uint256[]","name":"ethToTokenSplits","type":"uint256[]"}],"name":"buildEthToTokenHint","outputs":[{"internalType":"bytes","name":"hint","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenSrc","type":"address"},{"internalType":"enum IKyberHint.TradeType","name":"tokenToEthType","type":"uint8"},{"internalType":"bytes32[]","name":"tokenToEthReserveIds","type":"bytes32[]"},{"internalType":"uint256[]","name":"tokenToEthSplits","type":"uint256[]"}],"name":"buildTokenToEthHint","outputs":[{"internalType":"bytes","name":"hint","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenSrc","type":"address"},{"internalType":"enum IKyberHint.TradeType","name":"tokenToEthType","type":"uint8"},{"internalType":"bytes32[]","name":"tokenToEthReserveIds","type":"bytes32[]"},{"internalType":"uint256[]","name":"tokenToEthSplits","type":"uint256[]"},{"internalType":"contract IERC20","name":"tokenDest","type":"address"},{"internalType":"enum IKyberHint.TradeType","name":"ethToTokenType","type":"uint8"},{"internalType":"bytes32[]","name":"ethToTokenReserveIds","type":"bytes32[]"},{"internalType":"uint256[]","name":"ethToTokenSplits","type":"uint256[]"}],"name":"buildTokenToTokenHint","outputs":[{"internalType":"bytes","name":"hint","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenDest","type":"address"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"parseEthToTokenHint","outputs":[{"internalType":"enum IKyberHint.TradeType","name":"ethToTokenType","type":"uint8"},{"internalType":"bytes32[]","name":"ethToTokenReserveIds","type":"bytes32[]"},{"internalType":"contract IKyberReserve[]","name":"ethToTokenAddresses","type":"address[]"},{"internalType":"uint256[]","name":"ethToTokenSplits","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenSrc","type":"address"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"parseTokenToEthHint","outputs":[{"internalType":"enum IKyberHint.TradeType","name":"tokenToEthType","type":"uint8"},{"internalType":"bytes32[]","name":"tokenToEthReserveIds","type":"bytes32[]"},{"internalType":"contract IKyberReserve[]","name":"tokenToEthAddresses","type":"address[]"},{"internalType":"uint256[]","name":"tokenToEthSplits","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenSrc","type":"address"},{"internalType":"contract IERC20","name":"tokenDest","type":"address"},{"internalType":"bytes","name":"hint","type":"bytes"}],"name":"parseTokenToTokenHint","outputs":[{"internalType":"enum IKyberHint.TradeType","name":"tokenToEthType","type":"uint8"},{"internalType":"bytes32[]","name":"tokenToEthReserveIds","type":"bytes32[]"},{"internalType":"contract IKyberReserve[]","name":"tokenToEthAddresses","type":"address[]"},{"internalType":"uint256[]","name":"tokenToEthSplits","type":"uint256[]"},{"internalType":"enum IKyberHint.TradeType","name":"ethToTokenType","type":"uint8"},{"internalType":"bytes32[]","name":"ethToTokenReserveIds","type":"bytes32[]"},{"internalType":"contract IKyberReserve[]","name":"ethToTokenAddresses","type":"address[]"},{"internalType":"uint256[]","name":"ethToTokenSplits","type":"uint256[]"}],"stateMutability":"view","type":"function"}];

const IKyberStorage_ADDRESS = "0xa4eaD31a6c8e047E01cE1128E268c101AD391959";
const IKyberHintHandler_ADDRESS = "0xeB4DBDEC268bC9818669E9926e62004317d84b54";

const KyberStorageContract = new ethers.Contract(
  IKyberStorage_ADDRESS,
  IKyberStorage_ABI,
  provider
);

const KyberHintHandlerContract = new ethers.Contract(
  IKyberHintHandler_ADDRESS,
  IKyberHint_ABI,
  provider
);

const WBTC_ADDRESS = "0x3dff0dce5fc4b367ec91d31de3837cf3840c8284"; // Ropsten WBTC address
const KNC_ADDRESS = "0x7b2810576aa1cce68f2b118cef1f36467c648f92"; // Ropsten KNC address

async function main() {
  let srcTokenReserveIds = await KyberStorageContract.getReserveIdsPerTokenSrc(WBTC_ADDRESS);
  let destTokenReserveIds = await KyberStorageContract.getReserveIdsPerTokenDest(KNC_ADDRESS);

  let hint;

  // MaskIn Hint
  hint = await KyberHintHandlerContract.buildTokenToEthHint(
    WBTC_ADDRESS,
    BN.from(1), // MaskIn
    srcTokenReserveIds.slice(0,1), // only first reserve
    []
  );

  // MaskOut Hint
  hint = await KyberHintHandlerContract.buildEthToTokenHint(
    KNC_ADDRESS,
    BN.from(2), // MaskOut
    srcTokenReserveIds.slice(0,1), // exclude only first reserve
    []
  );

  // Split + BestOfAll Hint
  hint = await KyberHintHandlerContract.buildTokenToTokenHint(
    WBTC_ADDRESS,
    BN.from(0), // BestOfAll
    [],
    [],
    KNC_ADDRESS,
    BN.from(3), // Split
    destTokenReserveIds.slice(0,3), // 3 reserves
    [BN.from(4000), BN.from(3000), BN.from(3000)] // 1st reserve 40%, 2nd and 3rd reserves 30% each
  );
}

main();
```
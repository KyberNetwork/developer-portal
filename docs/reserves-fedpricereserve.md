---
id: Reserves-FedPriceReserve
title: Fed Price Reserve
---
[//]: # (tagline)
## Objective

In this guide, we will learn how to configure and deploy a Fed Price Reserve either locally via ganache or to the Ropsten testnet.

## Introduction

A Fed Price Reserve consists of two main components: an on-chain component of your reserve smart contracts and an off-chain component (normally, an automated system) that manages your on-chain component. The two components are depicted in the diagram below.

![Kyber Reserve Components](/uploads/kyberreservecomponents.png "Kyber Reserve Components")

The on-chain component has smart contracts that store your tokens, provide conversion rates, and swap your tokens with users. The off-chain component hosts your [trading strategy](reserves-tradingstrategy.md) that calculate and feed conversion rates and rebalance your reserve of tokens.

## Points to Note

A reserve manager's primary purpose is to keep funds safe. This however is a difficult task since inventory and prices are on-chain. On-chain issues such as gas prices and network congestion can delay pricing rate updates in the contracts.

With this in mind, the reserve was designed with various parameters to help secure your funds.

- Valid duration gives a time limit to the last price update, when the duration is over trades are stopped until the next price update.
- Max imbalance values limit inventory changes since the last price update. Once again, if the imbalance threshold is exceeded for a specific token, trades are blocked until the next price update.
- Step functions enable “automatic” price updates. When some token price has a clear trend, automatic price changes could act as a degenerated order book. This way, during periods the reserve manager doesn’t control the price (between updates) steps simulate actual liquidity in an order book market.
- Limited list of destination withdrawal addresses will prevent the operator account (hot wallet) from withdrawing funds to any destination address (if this account is compromised).

## How to set up your own reserve

### Local testnet deployment

You may refer to [this section](reserves-ganache.md) on how to deploy and test the reserve locally using [Truffle's Ganache](https://truffleframework.com/ganache).

### Public testnet deployment

Here, we will walk you through an example to set up a reserve on the Ropsten testnet. The guide is applicable for mainnet deployment as well.

#### Before you begin

Check that you have the following:

1. [node.js](https://nodejs.org/en/download/)
2. [web3 v1.0.0](https://www.npmjs.com/package/web3)
3. An ETH account. You can easily create one on [MEW](https://www.myetherwallet.com/), [MyCrypto](https://mycrypto.com/), or [MetaMask](https://metamask.io/).
4. Ropsten ETH. You may get some from the [MetaMask faucet](https://faucet.metamask.io/) or [Ropsten faucet](http://faucet.ropsten.be:3001/).

#### Step 1: Set reserve

Create a local directory and clone the `master` branch of our [smart contracts repo](https://github.com/KyberNetwork/smart-contracts) on GitHub.

```
git clone https://github.com/KyberNetwork/smart-contracts.git
```

##### Adding Tokens

After you have a local copy, go to `web3deployment` directory and open `ropsten.json`, where you will find a list of currently supported tokens on Kyber Network.

```json
{
  "tokens": {
    "OMG": {
      "symbol": "OMG",
      "name": "OmiseGO",
      "decimals": 18,
      "address": "0x4BFBa4a8F28755Cb2061c413459EE562c6B9c51b",
      "minimalRecordResolution": "1000000000000",
      "maxPerBlockImbalance": "439790000000000000000",
      "maxTotalImbalance": "922360000000000000000",
      "rate": "0.01824780",
      "internal use": true,
      "listed": true
    },
    ...
  }
}
```

As we are creating a reserve of KNC tokens, we will copy the `symbol`, `decimals`, and `address` information of KNC from `ropsten.json` to `ropsten_reserve_input.json`. The fields `minimalRecordResolution`, `maxPerBlockImbalance` and `maxTotalImbalance` are input fields for you as a reserve manager to decide on. These 3 fields are explained below.

| Input field               | Explanation                                                                                                                                                                                                                                                                                                                     | Example                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `minimalRecordResolution` | Per trade imbalance values are recorded and stored in the contract. Since this storage of data is an expensive operation, the data is squeezed into one bytes32 object. To prevent overflow while squeezing data, a resolution unit exists. Recommended value is the token wei equivalent of \$0.001 - \$0.01.                          | Assume 1 OMG = $1.<br>$0.001 = 0.001 OMG<br>Now OMG has 18 decimals, so `0.001*(10**18) = 10000000000000`                                                                                                                                                                                                                                                                                                                                                                              |
| `maxPerBlockImbalance`    | The maximum wei amount of net absolute (+/-) change for a token in an ethereum block. We recommend this value to be larger than the maximum allowed tradeable token amount for a whitelisted user. Suppose we want the maximum change in 1 block to be 439.79 OMG, then we use `439.79 * (10 ** 18) = 439790000000000000000`    | Suppose we have 2 users Alice and Bob. Alice tries to buy 200 OMG and Bob tries to buy 300 OMG. Assuming both transactions are included in the same block and Alice's transaction gets processed first, Bob's transaction will **fail** because the resulting net change of -500 OMG would exceed the limit of 439.79 OMG. However, if Bob decides to sell instead of buy, then the net change becomes +100 OMG, which means an additional 539.79 OMG can be bought, or 339.79 OMG sold. |
| `maxTotalImbalance`       | Has to be `>= maxPerBlockImbalance`. Represents the amount in wei for the net token change that happens between 2 price updates. This number is reset everytime `setBaseRate()` is called in `ConversionRates.sol`. This acts as a safeguard measure to prevent reserve depletion from unexpected events between price updates. | If we want the maximum total imbalance to be 922.36 OMG, we will use: `922.36 * (10 ** 18) = 922360000000000000000`                                                                                                                                                                                                                                                                                                                                                                      |

In essence, an example of the first part of `ropsten_reserve_input.json` would be:

```json
{
  "tokens": {
    "KNC": {
      "name": "KyberNetwork",
      "decimals": 18,
      "address": "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6",
      "minimalRecordResolution" : "100000000000000",
      "maxPerBlockImbalance" : "3475912029567568052224",
      "maxTotalImbalance" : "5709185508564730380288"
    }
  },
	...
}
```

##### Defining withdrawal addresses

Since withdrawing funds from the reserve contract might happen frequently, we assume the withdraw operation will be done from a hot wallet address, or even some automated script. That is why the withdraw permissions are granted to the operator addresses of the reserve contract. As hot wallets are in greater risk of being compromised, a limited list of withdrawal addresses is defined per token by the admin address. In the json file, a few withdrawal addresses can be defined per token and at least one address per exchange.

Let's take a look at the `exchanges` dictionary in `ropsten_reserve_input.json`. Fill in your ETH and KNC withdraw addresses for the purposes of rebalancing your reserve. Note that the `binance` string is just an example. Also note that **all tokens you wish to support must have withdraw addresses**.

```json
  "exchanges": {
		"binance" : {
			"ETH" : "0x1234567890ABCDEF1234567890ABCDEF1111111",
			"KNC" : "0x1234567890ABCDEF1234567890ABCDEF1111111"
		}
  },
```

##### Setting permissions

In the `permission` dictionary, you will fill in the addresses for admin, operator, and alerter. We recommend that you use different addresses for each of the 3 roles. It is highly recomended that for sensitive conracts like the reserve, a cold wallet is used as the admin wallet. Notice: It is possible to have multiple operators and alerters, but there can only be 1 admin.

```json
"permission" : {
	"KyberReserve" : {
		"admin" : "0x1234567890ABCDEF1234567890ABCDEF1111111",
		"operator" : ["0x9876543210FDECBA9876543210FDECBA2222222"],
		"alerter" : ["0x1234567890ABCDEF9876543210FDECBA3333333"]
	},
	"ConversionRates" : {
		"admin" : "0x1234567890ABCDEF1234567890ABCDEF1111111",
		"operator" : ["0x9876543210FDECBA9876543210FDECBA2222222","0x1234567890ABCDEF9876543210FDECBA3333333"],
		"alerter" : ["0x1234567890ABCDEF9876543210FDECBA4444444","0x1234567890ABCDEF1234567890ABCDEF5555555"]
	}
},
```

- `admin`: The admin account is unique (usually cold wallet) and handles infrequent, manual operations like listing new tokens in the exchange.
- `operator`: The operator account is used for frequent updates like setting reserve rates and withdrawing funds from the reserve to certain destinations (e.g. when selling excess tokens in the open market).
- `alerter`: The alerter account is used to halt the operation of the reserve on alerting conditions (e.g., strange conversion rates). In such cases, the reserve operation can be resumed only by the admin account.

##### Valid price duration

The `valid duration block` parameter is the time in blocks (Ethereum processes ~4 blocks per minute) that your conversation rate will expire since the last price update. If the value remains at 60, your price updates should happen at least approximately every 14 minutes.

```json
  "valid duration block" : 60,
```

#### Step 2: Deploying contracts

Run the command below in your terminal to install all required dependencies. Ensure that you are in the `/web3deployment` directory.

```
npm install
```

Then run the command

```
node reserveDeployer.js --config-path ropsten_reserve_input.json --gas-price-gwei 30 ----rpc-url https://ropsten.infura.io --print-private-key true --network-address "0x3f9a8e219ab1ad42f96b22c294e564b2b48fe636"
```

- `--gas-price-gwei`: The gas price in gwei
- `--rpc-url`: The URL of your geth, parity or infura node. Here we use infura's node, `https://ropsten.infura.io`.
- `--print-private-key`: The script generates a random and one-time ETH account that will send transactions to deploy and setup your contracts. The `true` value reveals the private key of this generated account to you (you may want to set it to `false` when deploying onto the mainnet).
- `--network-address`: `KyberNetwork.sol` contract address (the address above is Ropsten testnet address).

You should see something similar to the image below while the script is running.

![Waitforbalance](/uploads/waitforbalance.jpg "Waitforbalance")

The generated ETH account is waiting for some ETH to be deposited so that it can send transactions to deploy and setup your contracts. Send around 0.3 ETH to the address. The console will eventually show

![Ethsent](/uploads/ethsent.jpg "Ethsent")

- `reserve` shows the address of your deployed `KyberReserve.sol` contract.
- `pricing` shows the address of your deployed `ConversionRates.sol` contract.
- `network` should be the same as that of `--network-address`

Congratulations, you have successfully deployed contracts on the Ropsten testnet!

#### Step 3: Setting token conversion rates (prices)

Now, as your reserve contracts are deployed on the Ropsten testnet, you should be able to find them on [Etherscan](https://ropsten.etherscan.io/). As a reserve manager, you will need to interact with `KyberReserve.sol` and `ConversionRates.sol`, both of which have been deployed previous step. In other words, you have to call the functions of these 2 contracts. For example, to update the conversion rate of your tokens, you have to call the `setBaseRate` function of `ConversionRates.sol`. There is another **optional** but recommended contract `SanityRates.sol` that you can deploy and interact with.

- `KyberReserve.sol`: The contract has no direct interaction with the end users (the only interaction with them is via the network platform). Its main interaction is with the reserve operator who manages the token inventory and feeds conversion rates to Kyber Network's contract.
- `ConversionRates.sol`: Provides logic to maintain simple on-chain adjustment to the prices and an optimized cheap (w.r.t gas consumption) interface to enter rate feeds.
- `SanityRates.sol`: Provides sanity rate feeds. If there are large inconsistencies between the sanity rates and the actual rates, then trades involving your reserve will fail. The sanity module protects both parties from bugs in the conversion rate logic or from hacks into the conversion rate system.

One key responsibility of your automated system is to continually set your tokens rate based on your strategy, ie. there should be frequent automated calls made to the `setBaseRate` and / or `setCompactData` function of your `ConversionRates.sol` contract using your operator account.

##### How to programmatically call `setBaseRate` / `setCompactData`

First let's understand how the rate in `ConversionRates.sol` is defined and modified. The rate presented by the contract is calculated from 3 different components:

1. Base Rate
2. Compact Data
3. Step Functions

Base rate sets the basic rate per token, and is set separately for buy and sell values. Compact data and step functions enable advanced functionality and serve as modifiers of the base rate. To avoid frequent expensive updates of base rates, compact data enables modification to a group of tokens in one on chain storage operation. Each compact data array is squeezed into one bytes32 parameter and holds modifiers for buy / sell prices of 14 tokens. If your reserve supports more than 1-2 tokens, we recommend updating token rates using the `setCompactData` function to save gas costs for your updates. Finally, step functions enable degenerated order book functionality, whereby rates are modified according to imbalance values. Refer to the [step function section](#step-functions) for details. More information regarding the input parameters of the `setBaseRate` function can be found in [API/ABI](api_abi-conversionrates.md#setbaserate).

<!--Here are the input parameters of the `setBaseRate` function.
| Input field | Explanation | Examples |
| ------------- | ------------- | ------------- |
| `ERC20[] tokens`  | Array of token contract addresses you will be supporting  | `["0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6"]` <br> `["0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6","0xa577731515303F0C0D00E236041855A5C4F114dC"]` |
| `uint[] baseBuy`  | Array of token buy rates in token wei | Suppose we want to set `1 ETH = 500 KNC`.<br>So `500 * (10 ** 18) = 500000000000000000000` |
| `uint[] baseSell`  | Array of token sell rates in token wei | Suppose we want to set `1 KNC = 0.00182 ETH`<br>So `0.00182 * (10 ** 18) = 1820000000000000`|
| `bytes14[] buy` | Compact data representation of basis points (bps) with respect to `baseBuy` rates | `[0]`<br>`[0x19302f]` |
| `bytes14[] sell` | Compact data representation of basis points (bps) with respect to `baseSell` rates | `[0]`<br>`[0xa1503d]` |
| `uint blockNumber` | Most recent ETH block number (can be obtained on Etherscan) | `3480805` |
| `uint[] indices` | Index of array to apply the compact data bps rates on | `[0]` |-->

##### Single token

If you plan to support just 1 token, set `buy`, `sell` and `indices` to `[0]`. The code below is an example of how to call the `setBaseRate` function. If you plan to use it, kindly take note of the following:

1. Replace the `CONVERSION_RATES_CONTRACT_ADDRESS` with your own contract address.
2. Replace the `PRIVATE_KEY` with the private key of an account you own. It is recommended to generate a new account for security reasons. Include the `0x` prefix.
3. Calculate desired buy and sell rates for your token(s) and set it to `BUY_RATE` and `SELL_RATE`.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

//REPLACE WITH YOUR ConversionRates.sol CONTRACT ADDRESS
const CONVERSION_RATES_CONTRACT_ADDRESS =
  "0x69E3D8B2AE1613bEe2De17C5101E58CDae8a59D4";
const KNC_TOKEN_CONTRACT_ADDRESS = "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6";
var Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://ropsten.infura.io")
);
const BN = require("bignumber.js");

//REPLACE WITH YOUR PRIVATE KEY
let PRIVATE_KEY = "YOUR_PRIVATE_KEY"; //Eg. "0x5fba6c1ccf757875f65dca7098318be8d76dc4d7a40ded4deb14ff4e0a1bd083"
let SENDER_ACCOUNT = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

const ConversionRatesABI = [
  {
    constant: false,
    inputs: [{ name: "alerter", type: "address" }],
    name: "removeAlerter",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "reserve", type: "address" }],
    name: "setReserveAddress",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "token", type: "address" }],
    name: "disableTokenTrade",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "validRateDurationInBlocks",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "tokens", type: "address[]" },
      { name: "baseBuy", type: "uint256[]" },
      { name: "baseSell", type: "uint256[]" },
      { name: "buy", type: "bytes14[]" },
      { name: "sell", type: "bytes14[]" },
      { name: "blockNumber", type: "uint256" },
      { name: "indices", type: "uint256[]" }
    ],
    name: "setBaseRate",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "token", type: "address" }],
    name: "enableTokenTrade",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "pendingAdmin",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getOperators",
    outputs: [{ name: "", type: "address[]" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getListedTokens",
    outputs: [{ name: "", type: "address[]" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "sendTo", type: "address" }
    ],
    name: "withdrawToken",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "newAlerter", type: "address" }],
    name: "addAlerter",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "numTokensInCurrentCompactData",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "token", type: "address" },
      { name: "command", type: "uint256" },
      { name: "param", type: "uint256" }
    ],
    name: "getStepFunctionData",
    outputs: [{ name: "", type: "int256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "buy", type: "bytes14[]" },
      { name: "sell", type: "bytes14[]" },
      { name: "blockNumber", type: "uint256" },
      { name: "indices", type: "uint256[]" }
    ],
    name: "setCompactData",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "duration", type: "uint256" }],
    name: "setValidRateDurationInBlocks",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "token", type: "address" }],
    name: "getTokenBasicData",
    outputs: [{ name: "", type: "bool" }, { name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "newAdmin", type: "address" }],
    name: "transferAdmin",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "claimAdmin",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getAlerters",
    outputs: [{ name: "", type: "address[]" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "token", type: "address" }],
    name: "getRateUpdateBlock",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "token", type: "address" },
      { name: "xBuy", type: "int256[]" },
      { name: "yBuy", type: "int256[]" },
      { name: "xSell", type: "int256[]" },
      { name: "ySell", type: "int256[]" }
    ],
    name: "setQtyStepFunction",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "newOperator", type: "address" }],
    name: "addOperator",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "reserveContract",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }, { name: "", type: "uint256" }],
    name: "tokenImbalanceData",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "operator", type: "address" }],
    name: "removeOperator",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "token", type: "address" },
      { name: "currentBlockNumber", type: "uint256" },
      { name: "buy", type: "bool" },
      { name: "qty", type: "uint256" }
    ],
    name: "getRate",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "token", type: "address" },
      { name: "xBuy", type: "int256[]" },
      { name: "yBuy", type: "int256[]" },
      { name: "xSell", type: "int256[]" },
      { name: "ySell", type: "int256[]" }
    ],
    name: "setImbalanceStepFunction",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "token", type: "address" },
      { name: "minimalRecordResolution", type: "uint256" },
      { name: "maxPerBlockImbalance", type: "uint256" },
      { name: "maxTotalImbalance", type: "uint256" }
    ],
    name: "setTokenControlInfo",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "token", type: "address" },
      { name: "buyAmount", type: "int256" },
      { name: "rateUpdateBlock", type: "uint256" },
      { name: "currentBlock", type: "uint256" }
    ],
    name: "recordImbalance",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "sendTo", type: "address" }
    ],
    name: "withdrawEther",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "token", type: "address" }, { name: "buy", type: "bool" }],
    name: "getBasicRate",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "token", type: "address" }],
    name: "addToken",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "token", type: "address" }],
    name: "getCompactData",
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
      { name: "", type: "bytes1" },
      { name: "", type: "bytes1" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "token", type: "address" }],
    name: "getTokenControlInfo",
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
      { name: "", type: "uint256" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "admin",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_admin", type: "address" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "sendTo", type: "address" }
    ],
    name: "TokenWithdraw",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "sendTo", type: "address" }
    ],
    name: "EtherWithdraw",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "pendingAdmin", type: "address" }],
    name: "TransferAdminPending",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "newAdmin", type: "address" },
      { indexed: false, name: "previousAdmin", type: "address" }
    ],
    name: "AdminClaimed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "newAlerter", type: "address" },
      { indexed: false, name: "isAdd", type: "bool" }
    ],
    name: "AlerterAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "newOperator", type: "address" },
      { indexed: false, name: "isAdd", type: "bool" }
    ],
    name: "OperatorAdded",
    type: "event"
  }
];

var ConversionRatesContract = new web3.eth.Contract(
  ConversionRatesABI,
  CONVERSION_RATES_CONTRACT_ADDRESS
);
/*
Do some calculations, add some spread to obtain some desired buy / sell rates for your token(s)
Example values below are from the table above
*/
BUY_RATE = [500000000000000000000]; //Eg. [100000000000000000000, 200000000000000000000]
SELL_RATE = [1820000000000000]; //Eg. [1800000000000000, 1900000000000000]

async function main() {
  const blockNumber = await web3.eth.getBlockNumber();
  var txData = ConversionRatesContract.methods
    .setBaseRate(
      [KNC_TOKEN_CONTRACT_ADDRESS], //ERC20[] tokens
      BUY_RATE, //uint[] baseBuy
      SELL_RATE, //uint[] baseSell
      [0], //bytes14[] buy
      [0], //bytes14[] sell
      blockNumber, //most recent ropsten ETH block number as time of writing
      [0] //uint[] indices
    )
    .encodeABI();
  var signedTx = await web3.eth.accounts.signTransaction(
    {
      from: SENDER_ACCOUNT.address,
      to: CONVERSION_RATES_CONTRACT_ADDRESS,
      value: 0,
      data: txData,
      gas: 300000, //gasLimit
      gasPrice: new BN(10).times(10 ** 9), //10 Gwei
      chainId: await web3.eth.net.getId()
    },
    SENDER_ACCOUNT.privateKey
  );
  txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log(txHash);
}

main();
```

##### Multiple tokens

As mentioned, to save on gas costs, we recommend using the `setCompactData` function instead of `setBaseRates`. The inputs of `setCompactData` are the last 4 inputs of `setBaseRates`, namely: `bytes14[] buy`, `bytes14[] sell`, `uint blockNumber` and `uint[] indices`.

##### `uint[] indices`

![Multipletokensfig 1](/uploads/multipletokensfig-1.jpg "Multipletokensfig 1")
Each index allows you to modify up to 14 tokens at once. The token index number is determined by the order which they were added. Intuitively, an earlier token would have a smaller index, ie. the earliest token would be token 0, the next would be token 1, etc.

##### `bytes14[] buy / sell`

For simplicity, assume that we want to modify the base buy rates. The logic for modifying base sell rates is the same.

- Suppose the reserve supports 3 tokens: DAI, BAT and DGX.
- We want to make the following modifications to their base buy rates: 1. +2.5% (+25 pts) to DAI_BASE_BUY_RATE 2. +1% (+10 pts) to BAT_BASE_BUY_RATE 3. -3% (-30 pts) to DGX_BASE_BUY_RATE

**Note:**

1. One pt here means a **0.1% change**, as compared to basis points used in step functions where 1 basis point = 0.01%.
2. The range which compact data can handle is from -12.8% to 12.7%.

This gives us the buy array `[25,10,-30]`. Encoding this to hex yields `[0x190ae2]`. The code for encoding the array is shown below:

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

compactBuyArr = [25, 10, -30];
let compactBuyHex = bytesToHex(compactBuyArr);

function bytesToHex(byteArray) {
  let strNum = toHexString(byteArray);
  let num = "0x" + strNum;
  return num;
}

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

//should print [0x190ae2]
console.log(compactBuyHex);
```

Thus, `bytes14[] buy = [0x190ae2]`.

##### `uint blockNumber`

This should be the block number which you want your modified rates to be valid from. In other words, the modified rates would be valid up till blockNumber + validRateDurationInBlocks.

##### `Input Example`

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

transactionData = ConversionRatesContract.methods
  .setCompactData(
    [0x190ae2], //bytes14 buy
    [0x190ae2], //bytes14 sell
    5984303, //uint blockNumber
    [0] //uint indices
  )
  .encodeABI();
```

Note that we are applying the same price adjustments to base sell rates as buy rates in the above example. In practice, you probably will have separate modifications.

##### Step functions

Using flat rate might not be sufficient. A user that buys/sells a big number of tokens will have a different impact on your portfolio compared to another user that buys/sells a small number of tokens. The purpose of steps, therefore, is to have the contract alter the price depending on the buy / sell quantities of a user, and the net traded amount between price update operations.

##### Different buy/sell quantities

Operators can call `setQtyStepFunction()` of `ConversionRates.sol` to allow different conversion rates for different buy/sell quantities.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

function setQtyStepFunction(
	ERC20 token,
	int[] xBuy,
	int[] yBuy,
	int[] xSell,
	int[] ySell
	)
```

More information regarding the input parameters of the `setQtyStepFunction` function can be found in [API/ABI](api_abi-conversionrates.md#setqtystepfunction).

<!--| Input field | Explanation | Example |
| ------------- | ------------- | ------------- |
| `ERC20 token`  |  Token contract address | `0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6` |
| `int[] xBuy`  | Buy steps in token wei | `[100000000000000000000,200000000000000000000,300000000000000000000,5000000000000000000000]` |
| `int[] yBuy`  | Buy impact on conversion rate in basis points (bps). `1 bps = 0.01%`<br>Eg. `-30 = -0.3%`  |  `[0,-30,-60,-80]`<br>**Values should be `<=0`** |
| `int[] xSell`  | Buy steps in token wei | `[100000000000000000000,200000000000000000000,300000000000000000000,5000000000000000000000]` |
| `int[] ySell`  | Sell impact on conversion rate in basis points (bps). `1 bps = 0.01%`<br>Eg. `-30 = -0.3%`  |  `[0,-30,-60,-80]`<br>**Values should be `<=0`** |
* Buy steps (`xBuy`) are used to change ASK prices, sell steps (`xSell`) are used to change BID prices
* When `yBuy` and `ySell` numbers are non-positive (`< 0`) they will modify the rate to be lower, meaning the rate will be **reduced** by the Y-value set in each step. So negative steps mean worse rates for the user. Setting positive step values will give user better rates and could be considered as an advanced method to encourage users to "re balance" the inventory.-->

Given the example parameters in the API/ABI section, assume the base buy rate is 100 (1 ETH = 100 KNC) and sell rate is 0.01 (1 KNC = 0.01 ETH), different buy and sell quantities will result in different conversion rates as below:

| Buy/Sell quantity | Actual conversion rate | Explanation                                                                                                                                                                         |
| ----------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Buy 10 KNC        | 100 `100*(1+0%)`       | 10 is in the range of 0 to 100, which is the **first** buy step in the `xBuy`, so the impact on the the base rate is 0% according to the **first** number in the `yBuy`.            |
| Buy 110 KNC       | 99.7 `100*(1-0.3%)`    | 110 is in the range of 100 to 200, which is the **second** buy step in the `xBuy`, so the impact on the the base rate is -0.3% according to the **second** number in the `yBuy`.    |
| Buy 210 KNC       | 99.4 `100*(1-0.6%)`    | 210 is in the range of 200 to 300, which is the **third** buy step in the `xBuy`, so the impact on the the base rate is -0.6% according to the **third** number in the `yBuy`.      |
| Buy 1,000 KNC     | 99.2 `100*(1-0.8%)`    | 1,000 is in the range of 500 to above, which is the **last** buy step in the `xBuy`, so the impact on the the base rate is -0.8% according to the **last** number in the `yBuy`.    |
| Sell 10 KNC       | 0.01 `0.01*(1+0%)`     | 10 is in the range of 0 to 100, which is the **first** sell step in the `xSell`, so the impact on the the base rate is 0% according to the **first** number in the `ySell`.         |
| Sell 110 KNC      | 0.0097 `0.01*(1-0.3%)` | 110 is in the range of 100 to 200, which is the **second** sell step in the `xSell`, so the impact on the the base rate is -0.3% according to the **second** number in the `ySell`. |
| Sell 210 KNC      | 0.0094 `0.01*(1-0.6%)` | 210 is in the range of 200 to 300, which is the **third** sell step in the `xSell`, so the impact on the the base rate is -0.6% according to the **third** number in the `ySell`.   |
| Sell 1,000 KNC    | 0.0092 `0.01*(1-0.8%)` | 1,000 is in the range of 500 to above, which is the **last** sell step in the `xSell`, so the impact on the the base rate is -0.8% according to the **last** number in the `ySell`. |

##### Net traded amount

They can also call `setImbalanceStepFunction()` of `ConversionRates.sol` to allow different conversion rates based on the net traded token amount between price update operations. For example, if Alice buys 100 KNC, Bob sells 50 KNC and Carol buys 10 KNC, then the net traded amount is -60 KNC.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

function setImbalanceStepFunction(
	ERC20 token,
	int[] xBuy,
	int[] yBuy,
	int[] xSell,
	int[] ySell
	)
```

More information regarding the input parameters of the `setImbalanceStepFunction` function can be found in [API/ABI](api_abi-conversionrates.md#setimbalancestepfunction).

<!--| Input field | Explanation | Example |
| ------------- | ------------- | ------------- |
| `ERC20 token`  |  Token contract address | `0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6` |
| `int[] xBuy`  | Buy steps in token wei  | `[100000000000000000000,200000000000000000000,300000000000000000000,5000000000000000000000]`|
| `int[] yBuy`  | Impact on conversion rate in basis points (bps). `1 bps = 0.01%`<br>Eg. `-30 = -0.3%` |  `[0,-30,-60,-80]`<br>**Values should be `<=0`** |
| `int[] xSell`  | Sell steps in token wei | `[-300000000000000000000,-200000000000000000000,-100000000000000000000,0]`|
| `int[] ySell`  | Impact on conversion rate in basis points (bps). `1 bps = 0.01%`<br>Eg. `-30 = -0.3%` | `[-70,-50,-25,0]`<br>**Values should be `<=0`** |
* Buy steps (`xBuy`) are used to change ASK prices, sell steps (`xSell`) are used to change BID prices
* `yBuy` and `ySell` numbers should always be non-positive (`<=0`) because the smart contract **reduces** the output amount by the Y-value set in each step.-->

Given the example parameters in the API/ABI section, assume the base buy rate is 100 (1 ETH = 100 KNC) and sell rate is 0.01 (1 KNC = 0.01 ETH), different net traded amount will result in different conversion rates as below:

| Net traded amount | Actual conversion rate   | Explanation                                                                                                                                                                             |
| ----------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10 KNC            | 100 `100*(1+0%)`         | 10 is in the range of 0 to 100, which is the **first** buy step in the `xBuy`, so the impact on the the base rate is 0% according to the **first** number in the `yBuy`.                |
| 110 KNC           | 99.7 `100*(1-0.3%)`      | 110 is in the range of 100 to 200, which is the **second** buy step in the `xBuy`, so the impact on the the base rate is -0.3% according to the **second** number in the `yBuy`.        |
| 210 KNC           | 99.4 `100*(1-0.6%)`      | 210 is in the range of 200 to 300, which is the **third** buy step in the `xBuy`, so the impact on the the base rate is -0.6% according to the **third** number in the `yBuy`.          |
| 1,000 KNC         | 99.2 `100*(1-0.8%)`      | 1000 is in the range of 500 to above, which is the **last** buy step in the `xBuy`, so the impact on the the base rate is -0.8% according to the **last** number in the `yBuy`.         |
| -10 KNC           | 0.01 `0.01*(1+0%)`       | -10 is in the range of 0 to -100, which is the **last** sell step in the `xSell`, so the impact on the the base rate is 0% according to the **last** number in the `ySell`.             |
| -110 KNC          | 0.00975 `0.01*(1-0.25%)` | -110 is in the range of -100 to -200, which is the **third** sell step in the `xSell`, so the impact on the the base rate is -0.25% according to the **third** number in the `ySell`.   |
| -210 KNC          | 0.0095 `0.01*(1-0.5%)`   | -210 is in the range of -200 to -300, which is the **second** sell step in the `xSell`, so the impact on the the base rate is -0.5% according to the **second** number in the `ySell`.  |
| -1,000 KNC        | 0.0093 `0.01*(1-0.7%)`   | -1,000 is in the range of -300 to below, which is the **first** sell step in the `xSell`, so the impact on the the base rate is -0.7% according to the **first** number in the `ySell`. |

##### Additional safeguards

In the case of unforeseen adverse circumstances (Eg. a hack in your automated system or operator accounts), whereby your conversion rate is compromised to be very unfavorable, you may set up additional safeguards in place to protect your reserve.

##### Sanity Rates

Operators can set a sanity rate by calling `setSanityRates` and `setReasonableDiff` from `SanityRates.sol` to allow automatic swap disabling if rate inconsistencies exceed a certain percentage between two rate updates. Refer to [this section](reserves-sanityrates.md) and [API documentation](api_abi-sanityrates.md) to learn more about sanity rates.

##### Alerters

As mentioned previously, the role of alerters is to look out for unexpected / malicious behaviour of the reserve and halt operations. They can do so by calling `disableTokenTrade()` in the `ConversionRates.sol`. Thereafter, only the admin account is able to resume operations by calling `enableTokenTrade()` in the same contract.

#### Step 4: Deposit tokens to and withdraw tokens from your reserve

A reserve can’t operate without tokens. A reserve that supports ETH-KNC swap pair will need to hold both ETH and KNC so that users can sell and buy KNC from your reserve.

Filling up your reserve is easy. You can transfer tokens to your reserve contract from any address.

However, only authorized accounts have the right to withdraw tokens from the reserve.

- `admin` can call `withdrawEther` and `withdrawToken` of `KyberReserve.sol` to withdraw tokens to any address
- `operator` can only withdraw tokens to whitelisted addresses by calling `withdraw`
- `admin` can add withdraw/whitelisted address by calling `approveWithdrawAddress` of `KyberReserve.sol`.

#### Step 5: Get your reserve authorized and running

Once you have completed the above steps, you can let any network operator know so that they can approve your reserve and every specific pair you are allowed to list. Kyber Network is currently the only network operator.

Once approved, you can test your reserve on [KyberSwap](https://ropsten.kyber.network) Ropsten site! Please note that if there are other reserves listing same swap pair as you, your swap may not get matched with your reserve, because only the reserve that offer best rate will be matched. We can disable other reserves on the testnet to make sure you will swap with your reserve.

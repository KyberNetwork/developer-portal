---
id: Reserves-AutomatedPriceReserve
title: Automated Price Reserve
---
## Objective

In this guide, we will learn how to configure and deploy an Automated Price Reserve either locally via Ganache or to the Ropsten testnet.

## Introduction

The automated reserve was created with ease of maintenance as a top consideration. For the automated price reserve model, you rely on the smart contract and its predefined algorithm to automatically provide rates for the token being served liquidity for. In this model, you don't have gas, server, or development costs, but there is a learning curve and inability to control the rates in creative ways. This automated model only supports one token for one reserve. If you need to list another token using this model, another automated reserve must be deployed.

Moreover, the automated reserve was also designed to help discover the price of a newly created token that is previously not available in any centralized or decentralized exchange. Through the interaction of buyers and sellers, an estimated market price is discovered based on the market's sentiment at a point in time.

The automated reserve consists of only one component: an on-chain component of your reserve smart contracts that manages prices based on inventory.

The on-chain component has smart contracts that store your tokens, provide conversion rates, and swap your tokens with users. Since the smart contracts uses a pre-defined trading strategy based on initial parameters, the automated reserve automatically calculates the conversion rate. As a reserve manager, your primary purpose is to make sure that your automated reserve's ETH and token inventory is replenished when depleted. In the event of reserve depletion, you will need to deposit more ETH or tokens, and to set the parameters once again.

#### Points to Note

With this in mind, the automated reserve was designed with various parameters to help secure your funds.

- Prices are automatically updated based on a pre-defined algorithm as trades occur.
- A single buy or sell trade in ETH quantity does not go beyond the allowed max quantity cap parameter.
- Limited list of destination withdrawal addresses to prevent the operator account (hot wallet) from withdrawing funds to any destination address (if this account is compromised).
- **An automated price reserve can only support one token.** If another token needs to be supported, another automated price reserve needs to be deployed.

## How to set up your own reserve

### Local testnet deployment

You may refer to [this section](reserves-ganache.md) on how to deploy and test the reserve locally using [Truffle's Ganache](https://truffleframework.com/ganache).

### Public testnet deployment

Here, we will walk you through an example to set up an automated reserve on the Ropsten testnet. The guide is applicable for mainnet deployment as well.

#### Before you begin

Check that you have the following:

1. [node.js](https://nodejs.org/en/download/)
2. [web3 v1.0.0](https://www.npmjs.com/package/web3)
3. An ETH account. You can easily create one on [MEW](https://www.myetherwallet.com/), [MyCrypto](https://mycrypto.com/), or [MetaMask](https://metamask.io/).
4. Ropsten ETH. You may get some from the [MetaMask faucet](https://faucet.metamask.io/) or [Ropsten faucet](http://faucet.ropsten.be:3001/).
   ​

### `Step 1: Setting up the reserve`

Create a local directory and clone the `master` branch of our [smart contracts repo](https://github.com/KyberNetwork/smart-contracts) on GitHub.

```
git clone https://github.com/KyberNetwork/smart-contracts.git
```

#### Specifying the supported token

After you have a local copy, go to `web3deployment` directory and open `liquidityReserve_input.json`, where you will find the token details that the automated reserve will support.

```json
{
  "tokens": {
    "KNC": {
      "name": "KyberNetwork",
      "decimals": 18,
      "address": "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6",
    }
    (...)
  }
}
```

Specify your token details, filling in these fields.

In essence, an example of the first part of `liquidityReserve_input.json` would be:

```json
{
  "tokens": {
    "XYZ": {
      "name": "TokenXYZ",
      "decimals": 18,
      "address": "0xB2f3dD487708ca7794f633D9Df57Fdb9347a7afF"
    },
    ...
  }
}
```

#### Defining withdrawal addresses

Since withdrawing funds from the reserve contract might be needed in the future, we assume the withdraw operation will be done from a hot wallet address. That is why the withdraw permissions are granted to the operator addresses of the reserve contract. As hot wallets are in greater risk of being compromised, a limited list of withdrawal addresses is defined per token by the admin address. In the JSON file, a few withdrawal addresses can be defined per token and at least one address per exchange.

Let's take a look at the `exchanges` dictionary in `liquidityReserve_input.json`. Fill in your ETH and XYZ token withdraw addresses. Note that the `binance` string is just an example. Also note that the **token you wish to support must have withdraw addresses**.

```json
  "exchanges": {
		"binance" : {
			"ETH" : "0x1234567890ABCDEF1234567890ABCDEF1111111",
			"XYZ" : "0x1234567890ABCDEF1234567890ABCDEF1111111"
		}
  },
```

#### Setting permissions

In the `permission` dictionary, you will fill in the addresses for admin, operator, and alerter. We recommend that you use different addresses for each of the 3 roles. It is highly recommended that for sensitive contracts like the reserve, a cold wallet is used as the admin wallet. <br>
**Note:** It is possible to have multiple operators and alerters, but there can only be 1 admin.

```json
"permission" : {
	"KyberReserve" : {
		"admin" : "0x1234567890ABCDEF1234567890ABCDEF1111111",
		"operator" : ["0x9876543210FDECBA9876543210FDECBA2222222"],
		"alerter" : ["0x1234567890ABCDEF9876543210FDECBA3333333"]
	},
  "LiquidityConversionRates" : {
		"admin" : "0x1234567890ABCDEF1234567890ABCDEF1111111",
		"operator" : ["0x9876543210FDECBA9876543210FDECBA2222222"],
		"alerter" : ["0x1234567890ABCDEF9876543210FDECBA3333333"]
	}
},
```

**KyberReserve**
| Property | Explanation |
| :-------: | :---------: |
| `admin` | Wallet address (usually a cold wallet) that handles infrequent, manual operations like calling `setLiquidityParams().` |
| `alerter` | The alerter account is used to halt the operation of the reserve on alerting conditions (e.g. strange conversion rates). In such cases, the reserve operation can be resumed only by the admin account. |
| `operator` | The operator account is used for withdrawing funds from the reserve to certain destinations (e.g. when selling excess tokens in the open market). |

### `Step 2: Deploying the contracts`

The relevant contracts to deploy are the following:

- `KyberReserve.sol`: The contract has no direct interaction with the end users (the only interaction with them is via the network platform). Its main interaction is with the reserve operator who manages the token inventory and feeds conversion rates to Kyber Network's contract.
- `LiquidityConversionRates.sol`: Provides the interface to set the liquidity parameters and the logic to maintain on-chain adjustment to the prices.

Run the command below in your terminal to install all required dependencies. Ensure that you are in the `/web3deployment` directory.

```
npm install
```

Then run the command

```
node liquidityReserveDeployer.js --config-path liquidityReserve_input.json --gas-price-gwei 30 --rpc-url https://ropsten.infura.io --print-private-key true --network-address "0x3f9a8e219ab1ad42f96b22c294e564b2b48fe636"

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

### `Step 3: Deposit tokens to and withdraw tokens from your reserve`

A reserve can’t operate without tokens. A reserve that supports ETH-KNC swap pair will need to hold both ETH and KNC so that users can sell and buy KNC from your reserve.

Filling up your reserve is easy. You can transfer tokens to your reserve contract from any address.

However, only authorized accounts have the right to withdraw tokens from the reserve.

- `admin` can call `withdrawEther` and `withdrawToken` of `KyberReserve.sol` to withdraw tokens to any address
- `operator` can only withdraw tokens to whitelisted addresses by calling `withdraw`
- `admin` can add withdraw/whitelisted address by calling `approveWithdrawAddress` of `KyberReserve.sol`.

### `Step 4: Depositing the inventory and setting the liquidity parameters`

The reserve manager needs to only decide on the initial liquidity parameters of the automated reserve. Specifically, the following information need to be considered:

1. Liquidity Rate
2. Initial Token Price
3. Initial Ether Amount
4. Initial Token Amount
5. Minimum and Maximum Supported Price Factor
6. Maximum Buy and Maximum Sell Amount in a Trade
7. Fee Percentage

There are several things to take note of in the list of parameters.

First, notice that some parameters will have the **InFp** suffix. InFp refers to formula precision. While this is configurable, 2^40 is the recommended value.

Second, **r** is liquidity the rate in basis points or units of 100 which the price should move each time the ETH/token inventory changes in 1 ETH worth of quantity. For an _r_ of 0.01, the price will move 1%. _r_ is calculated taking into account the amount of initial ETH and tokens deposited into the contract, and the desired minimum/maximum price factor ratio. A smaller _r_ also means more ETH and token inventory is needed to facilitate the liquidity.

For the **minimum/maximum supported price factor ratio**, it is recommended to start with a ratio of 0.5:2.0. This indicates that the inventory will suffice for up to 100% increase or 50% decrease in token price with respect to ETH.

Setting the liquidity parameters is done by executing the [`setLiquidityParameters()`](api_abi-liquidityconversionrates.md#setliquidityparams) function from the LiquidityConversionRates contract. We explain the different parameters below:

|  Type  |            Parameter            |                                                        Explanation                                                        |
| :----: | :-----------------------------: | :-----------------------------------------------------------------------------------------------------------------------: |
| `uint` |            `_rInFp`             |                                     r in formula precision, calculated as r \* InFp.                                      |
| `uint` |           `_pMinInFp`           | Minimum supported price factor in formula precision, calculated as min price factor _ initial price of your token _ InFp. |
| `uint` |          `_numFpBits`           |                The formula precision in bits, therefore for formula precision of 2^40, \_numFpBits is 40.                 |
| `uint` |        `_maxCapBuyInWei`        |                                      The allowed quantity for one BUY trade in ETH.                                       |
| `uint` |       `_maxCapSellInWei`        |                                      The allowed quantity for one SELL trade in ETH.                                      |
| `uint` |           `_feeInBps`           |                   The fee amount in basis points (1 bp = 0.01%) that should be calculated in the price.                   |
| `uint` | `_maxTokenToEthRateInPrecision` |       The maximum allowed price taking into consideration the maximum supported price factor and must be in 10^18.        |
| `uint` | `_minTokenToEthRateInPrecision` |       The minimum allowed price taking into consideration the minimum supported price factor and must be in 10^18.        |

#### Example

Now, Let's assume we want to list a token with the following considerations:

1. Liquidity Rate – 0.01 (1%)
2. Initial Token Price – 1 token = 0.00005 ETH
3. Initial Ether Amount – 100 ETH
4. Initial Token Amount – 2,000,000 tokens (100 ETH worth)
5. Minimum (pMin) and Maximum (pMax) Supported Price Factor – 0.5:2.0
6. Maximum Buy and Maximum Sell Amount in a Trade – 5 ETH max buy and sell cap
7. Fee Percentage – 0.25%

Below, we will calculate the different parameters.

|            Parameter            |                Formula                |                                 Example Value                                  |
| :-----------------------------: | :-----------------------------------: | :----------------------------------------------------------------------------: |
|            `_rInFp`             |               r \* InFp               |                   \_rInFp = (0.01 \* 2^40) = **10995116277**                   |
|           `_pMinInFp`           | pMin _ initial price of token _ InFp  |               \_pMinInFp = (0.5 _ 0.00005 _ 2^40) = **27487790**               |
|          `_numFpBits`           |           InFp in numFpBits           |                              \_numFpBits = **40**                              |
|        `_maxCapBuyInWei`        |         max buy cap \* 10^18          |           \_maxCapBuyInWei = (5 \* 10^18) = **5000000000000000000**            |
|       `_maxCapSellInWei`        |         max sell cap \* 10^18         |           \_maxCapSellInWei = (5 \* 10^18) = **5000000000000000000**           |
|           `_feeInBps`           |         fee percentage in BPS         |                              \_feeInBps = **25**                               |
| `_maxTokenToEthRateInPrecision` | pMax _ initial price of token _ 10^18 | \_maxTokenToEthRateInPrecision = (2.0 _ 0.00005 _ 10^18) = **100000000000000** |
| `_minTokenToEthRateInPrecision` | pMin _ initial price of token _ 10^18 | \_minTokenToEthRateInPrecision = (0.5 _ 0.00005 _ 10^18) = **25000000000000**  |

#### Using get_liquidity_params.py Python script

A Python script, located in `scripts/get_liquidity_params.py` in the `smart-contracts` repository, will help you calculate the liquidity parameters. Edit the input file `liquidity_input_params.json`, and specify the inputs similar to the considerations in the example above.

```json
{
  "liquidity_rate": 0.01,
  "initial_ether_amount": 100.0,
  "initial_token_amount": 2000000,
  "initial_price": 0.00005,
  "min_supported_price_factor": 0.5,
  "max_supported_price_factor": 2.0,
  "max_tx_buy_amount_eth": 5.0,
  "max_tx_sell_amount_eth": 5.0,
  "fee_percent": 0.25,
  "formula_precision_bits": 40
}
```

Please note that the `formula_precision_bits` refers to `_numFpBits`, which the recommended value is 40.

Afterwards, just execute the Python script, using the following command:

```sh
python3 get_liquidity_params.py --input liquidity_input_params.json --get params
```

It should give the following output:

```sh
_rInFp: 10995116277
_pMinInFp: 37933151
_numFpBits: 40
_maxCapBuyInWei: 10000000000000000000
_maxCapSellInWei: 10000000000000000000
_feeInBps: 25
_maxTokenToEthRateInPrecision: 138000000000000
_minTokenToEthRateInPrecision: 34500000000000
```

To finalize this step, deposit exact amount of Ether and tokens (in our example above, it is 100 ETH and 2,000,000 tokens), and finally invoke the `setLiquidityParams()` using web3, Etherescan's write contract feature, or MyEtherWallet, passing in the calculated parameters above.

### `Step 5: Get your reserve authorized and running`

Once you have completed the above steps, you can let any network operator know so that they can approve your reserve and list your token to the network. Kyber Network is currently the only network operator.

Once approved, you can test your reserve on [KyberSwap](https://ropsten.kyber.network) Ropsten site! Please note that if there are other reserves listing same swap pair as you, your swap may not get matched with your reserve, because only the reserve that offers best rate will be matched. We can disable other reserves on the testnet to make sure you will swap with your reserve.

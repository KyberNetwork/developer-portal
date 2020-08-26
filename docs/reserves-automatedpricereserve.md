---
id: Reserves-AutomatedPriceReserve
title: Automated Price Reserve
---
[//]: # (tagline)
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

Create a local directory and clone the `master_preKatalyst` branch of our [smart contracts repo](https://github.com/KyberNetwork/smart-contracts/tree/master_preKatalyst) on GitHub.

```
git clone https://github.com/KyberNetwork/smart-contracts/tree/master_preKatalyst
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
node liquidityReserveDeployer.js --config-path liquidityReserve_input.json --gas-price-gwei 30 --rpc-url https://ropsten.infura.io --print-private-key true --network-address "0x920B322D4B8BAB34fb6233646F5c87F87e79952b"

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
The reserve manager needs to decide on the initial liquidity parameters of the automated reserve. The following parameters should be configured:

1. Liquidity Rate `r`
2. Initial Token Price `initialPrice`
3. Initial Ether Amount `E`
4. Initial Token Amount
5. Minimum (`pMin`) and Maximum (`pMax`) Supported Price Factor
6. Maximum Buy and Maximum Sell Amount in a Trade
7. Fee Percentage

#### About liquidity rate `r`
`r` is liquidity the rate in basis points or units of 100 which the price should move each time the ETH/token inventory changes in 1 ETH worth of quantity. For an `r` of 0.007, the price will move 0.7% when buying / selling 1 Eth.

#### About `pMin` and `pMax`
With regards to the minimum/maximum supported price factor ratio, it is recommended to start with a ratio of 0.5:2.0. This indicates that the inventory will suffice for up to 100% increase or 50% decrease in token price with respect to ETH.

#### Relationship between `r`, `initialPrice`, `E` and `pMin`
The initial token price determined by the pricing algorithm is as follows:

`initialPrice = minPrice * e^(r*E)` where  `minPrice` = `pMin * initialPrice`

Rearranging the formula above, you find that
`r = ln(initialPrice / minPrice) / E)`  or
`r = ln(1 / pMin) / E`

Hence, since the 4 variables are tightly coupled together, you are **only able to determine 3 out of these 4 variables, and use the formula to calculate the fourth.** Our recommendation is to **determine `initialPrice`, `E` and `pMin`, then calculate `r` using the above formula.**

#### Graphical Illustration of Price adjustments
A quick overview of how price adjusts for a given price range can be seen below. This illustration uses 0.1, 70, 2 and 0.5 for the `intial price`, initial ETH amount `E`, `pMax` and `pMin` respectively.

![AprChart](/uploads/aprchart.png "AprChart")

#### Setting liquidity parameters
Setting the liquidity parameters is done by executing the [`setLiquidityParameters()`](api_abi-liquidityconversionrates.md#setliquidityparams) function from the LiquidityConversionRates contract. We explain the different parameters below:

|  Type  |            Parameter            |                                                        Explanation                                                        |
| :----: | :-----------------------------: | :-----------------------------------------------------------------------------------------------------------------------: |
| `uint` |            `_rInFp`             |                                     r in formula precision, calculated as r \* Fp.                                        |
| `uint` |           `_pMinInFp`           |      Minimum supported price in formula precision, calculated as min price factor \* initial price of your token \* Fp.   |
| `uint` |          `_numFpBits`           |                The formula precision in bits, currently only 40 can be used, which gives precision of 2^40                |
| `uint` |        `_maxCapBuyInWei`        |                                      The allowed quantity for one BUY trade in ETH.                                       |
| `uint` |       `_maxCapSellInWei`        |                                      The allowed quantity for one SELL trade in ETH.                                      |
| `uint` |           `_feeInBps`           |                   The fee amount in basis points that should be calculated in the price.                                  |
| `uint` | `_maxTokenToEthRateInPrecision` |       The maximum allowed price taking into consideration the maximum supported price factor. Units are in 10^18.         |
| `uint` | `_minTokenToEthRateInPrecision` |       The minimum allowed price taking into consideration the minimum supported price factor. Units are in 10^18.         |

#### Example

Now, Let's assume we want to list a token with the following considerations:

1. Liquidity Rate – 0.007 (0.7%)
2. Initial Token Price – 1 token = 0.00005 ETH
3. Initial Ether Amount – 100 ETH
4. Initial Token Amount – 2,000,000 tokens (100 ETH worth)
5. Minimum (pMin) and Maximum (pMax) Supported Price Factor – 0.5:2.0
6. Maximum Buy and Maximum Sell Amount in a Trade – 5 ETH max buy and sell cap
7. Fee Percentage – 0.10%

Below, we will calculate the different parameters.

|            Parameter            |                Formula                |                                 Example Value                                  |
| :-----------------------------: | :-----------------------------------: | :----------------------------------------------------------------------------: |
|            `_rInFp`             |               r \* InFp               |                   \_rInFp = (0.007 \* 2^40) = **7696581394**                   |
|           `_pMinInFp`           | pMin \* initial price of token \* InFp  |               \_pMinInFp = (0.5 \* 0.00005 \* 2^40) = **27487790**               |
|          `_numFpBits`           |           InFp in numFpBits           |                              \_numFpBits = **40**                              |
|        `_maxCapBuyInWei`        |         max buy cap \* 10^18          |           \_maxCapBuyInWei = (5 \* 10^18) = **5000000000000000000**            |
|       `_maxCapSellInWei`        |         max sell cap \* 10^18         |           \_maxCapSellInWei = (5 \* 10^18) = **5000000000000000000**           |
|           `_feeInBps`           |         fee percentage in BPS         |                              \_feeInBps = **10**                               |
| `_maxTokenToEthRateInPrecision` | pMax \* initial price of token \* 10^18 | \_maxTokenToEthRateInPrecision = (2.0 \* 0.00005 \* 10^18) = **100000000000000** |
| `_minTokenToEthRateInPrecision` | pMin \* initial price of token \* 10^18 | \_minTokenToEthRateInPrecision = (0.5 \* 0.00005 \* 10^18) = **25000000000000**  |

#### Using get_liquidity_params.py Python script

A Python script, located in `scripts/get_liquidity_params.py` in the `smart-contracts` repository, will help you calculate the liquidity parameters. Edit the input file `liquidity_input_params.json`, and specify the inputs similar to the considerations in the example above.

```json
{
  "liquidity_rate": 0.007,
  "initial_ether_amount": 100.0,
  "initial_token_amount": 2000000,
  "initial_price": 0.00005,
  "min_supported_price_factor": 0.5,
  "max_supported_price_factor": 2.0,
  "max_tx_buy_amount_eth": 5.0,
  "max_tx_sell_amount_eth": 5.0,
  "fee_percent": 0.10,
  "formula_precision_bits": 40
}
```

Please note that the `formula_precision_bits` refers to `_numFpBits`, 40 should be used.

Afterwards, just execute the Python script, using the following command:

```sh
python3 get_liquidity_params.py --input liquidity_input_params.json --get params
```

It should give the following output:

```sh
_rInFp: 7696581394
_pMinInFp: 27487790
_numFpBits: 40
_maxCapBuyInWei: 5000000000000000000
_maxCapSellInWei: 5000000000000000000
_feeInBps: 10
_maxTokenToEthRateInPrecision: 100000000000000
_minTokenToEthRateInPrecision: 25000000000000
```

To finalize this step, deposit exact amount of Ether and tokens (in our example above, it is 100 ETH and 2,000,000 tokens), and finally invoke the `setLiquidityParams()` using web3, Etherescan's write contract feature, or MyEtherWallet, passing in the calculated parameters above.

### `Step 5: Get your reserve authorized and running`

Once you have completed the above steps, you can let any network operator know so that they can approve your reserve and list your token to the network. Kyber Network is currently the only network operator.

Once approved, you can test your reserve on [KyberSwap](https://ropsten.kyber.network) Ropsten site! Please note that if there are other reserves listing same swap pair as you, your swap may not get matched with your reserve, because only the reserve that offers best rate will be matched. We can disable other reserves on the testnet to make sure you will swap with your reserve.

## Maintaining your APR

This section walks you through the necessary steps involved in case you want to rebalance the APR or withdraw fees collected. You will also need to perform the same activities in the event that:
- the reserve is depleted of tokens or ETH;
- you want to rebalance your reserve;
- you want to withdraw fees from the reserve;
- when you want to change any of the liquidity parameters such as maximum buy/sell amount, initial price, etc.

#### Note : **It is highly recommended to follow the steps documented below to avoid incurring any loss of funds**

1. DISABLE trading in the reserve : The alerter can do this by calling `disableTrade()` function in the reserve contract.
2. Rebalance the reserve : After and only when the reserve is disabled, the reserve manager can deposit or withdraw Ether/Tokens to the reserve.
3. Recompute liquidity params : Calculate the new parameters by taking note of the new ETH and token inventory and the latest market price. The admin of the pricing contract can then set these new params by invoking `setLiquidityParams()` in the pricing contract.
4. Enabling trading back : The admin can enable trades back by invoking the `enableTrade()` function in the reserve contract.

## Price Discovery Algorithm

How is the price be set, given a list of trades? Assuming the price (ETH/Token) will be given by *P(E)* which will be a function of the current ETH reserve size. Then assuming we want a change in the price to be proportional to the amount traded we will have:

![AprFormula1](/uploads/apr_1.png "AprFormula1")

where *r* is the proportion factor. When *∆E* is very small we'll have

![AprFormula2](/uploads/apr_2.png "AprFormula2")

integration gives

![AprFormula3](/uploads/apr_3.png "AprFormula3")

Where *e^A* is the minimal price given by *Pmin* , so we have

![AprFormula4](/uploads/apr_4.png "AprFormula4")

The amount of tokens *Tmax* that will be sold until reaching *Pmax* , is related to the maximal price on our platform *P(Emax)* in the following way

![AprFormula5](/uploads/apr_5.png "AprFormula5")

where *Emax* is given from *Pmax* itself,

![AprFormula6](/uploads/apr_6.png "AprFormula6")

carrying out the integration and plugging in *Emax* will give:

![AprFormula7](/uploads/apr_7.png "AprFormula7")

the initial amount of tokens *T0* will be given by calculating *Tmax* at *E0* , which
finally gives

![AprFormula8](/uploads/apr_8.png "AprFormula8")

similarly, the initial amount of ETH, E 0 , can be deduced from the initial
price P 0 as

![AprFormula9](/uploads/apr_9.png "AprFormula9")

So given *Pmin*, *Pmax*, *P0*, *r* we can find *E0*, *T0*, *Emax*.

### Trading ∆E Ethers

*∆E* can be positive (increasing the amount of ethers in the reserve and selling
tokens to the trader), or negative. Solving the following integral

![AprFormula10](/uploads/apr_10.png "AprFormula10")

will give the result for *∆T*

![AprFormula11](/uploads/apr_11.png "AprFormula11")

### Trading ∆T Tokens

*∆T* can be positive (increasing the amount of tokens in the reserve and selling
ethers to the trader), or negative. Integrating the following

![AprFormula12](/uploads/apr_12.png "AprFormula12")

and solving with respect to *∆E* gives

![AprFormula13](/uploads/apr_13.png "AprFormula13")

![AprChart](/uploads/aprchart.png "AprChart")

The above figure shows the price function, with relevant parameters. *T0* cannot be shown since its the area under *1/P*, not the area under *P*.

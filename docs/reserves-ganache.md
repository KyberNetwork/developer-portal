---
id: Reserves-Ganache
title: Testing Using Ganache
---
## Overview

[Ganache](https://truffleframework.com/ganache) enables you to create a private Ethereum blockchain on your local machine for running tests, executing commands, and inspecting its state while controlling how the chain operates. You can also refer to the [Workshop repository](https://github.com/KyberNetwork/workshop) for the same instructions.

## Prerequisites

1. Node and NPM latest LTS versions. Download from [nodejs.org](https://nodejs.org/en/download/)

2. Ganache

Install the Ganache AppImage by downloading here https://truffleframework.com/ganache.
To use the provided Ganache snapshot, install `ganache-cli`.

```
sudo npm install -g ganache-cli
```

3. Truffle

Install the latest Truffle v5.

```
sudo npm install -g truffle@latest
```

Truffle v5.0 is needed in order to take advantage of new features, such as using async/await in the migration scripts. You can read more about the new features in the [Truffle release page](https://github.com/trufflesuite/truffle/releases/tag/v5.0.0)

4. Install the rest of the NPM packages

```
npm install
```

5. Clone the Kyber Workshop repository

Visit https://github.com/KyberNetwork/workshop and clone the repository to your local machine.

```
git clone git@github.com:KyberNetwork/workshop.git
```

## Workshop Repository

### Overview

workshop<br />
├── config<br />
│   ├── network.json<br />
│   └── tokens.json<br />
├── contracts<br />
│   ├── ConversionRatesInterface.sol<br />
│   ├── ConversionRates.sol<br />
│   ├── ERC20Interface.sol<br />
│   ├── examples<br />
│   │   ├── SwapEtherToToken.sol<br />
│   │   ├── SwapTokenToEther.sol<br />
│   │   └── SwapTokenToToken.sol<br />
│   │   └── Trade.sol<br />
│   ├── ExpectedRateInterface.sol<br />
│   ├── ExpectedRate.sol<br />
│   ├── FeeBurnerInterface.sol<br />
│   ├── FeeBurner.sol<br />
│   ├── KyberAutomatedReserve.sol<br />
│   ├── KyberNetworkInterface.sol<br />
│   ├── KyberNetworkProxyInterface.sol<br />
│   ├── KyberNetworkProxy.sol<br />
│   ├── KyberNetwork.sol<br />
│   ├── KyberOrderbookReserve.sol<br />
│   ├── KyberReserveInterface.sol<br />
│   ├── KyberReserve.sol<br />
│   ├── LiquidityConversionRates.sol<br />
│   ├── LiquidityFormula.sol<br />
│   ├── Migrations.sol<br />
│   ├── mockTokens<br />
│   │   ├── KyberGenesisToken.sol<br />
│   │   ├── KyberNetworkCrystal.sol<br />
│   │   ├── Mana.sol<br />
│   │   ├── OmiseGo.sol<br />
│   │   ├── Polymath.sol<br />
│   │   ├── Salt.sol<br />
│   │   ├── Status.sol<br />
│   │   └── Zilliqa.sol<br />
│   ├── PermissionGroups.sol<br />
│   ├── permissionless<br />
│   │   ├── OrderbookReserveInterface.sol<br />
│   │   ├── OrderbookReserve.sol<br />
│   │   ├── OrderIdManager.sol<br />
│   │   ├── OrderListFactoryInterface.sol<br />
│   │   ├── OrderListFactory.sol<br />
│   │   ├── OrderListInterface.sol<br />
│   │   ├── OrderList.sol<br />
│   │   └── PermissionlessOrderbookReserveLister.sol<br />
│   ├── SanityRatesInterface.sol<br />
│   ├── SanityRates.sol<br />
│   ├── SimpleNetworkInterface.sol<br />
│   ├── Utils2.sol<br />
│   ├── Utils.sol<br />
│   ├── VolumeImbalanceRecorder.sol<br />
│   ├── WhiteListInterface.sol<br />
│   ├── WhiteList.sol<br />
│   └── Withdrawable.sol<br />
├── db<br />
├── examples<br />
│   ├── solidity<br />
│   │   ├── SwapEtherToToken.sol -> ../../contracts/examples/SwapEtherToToken.sol<br />
│   │   ├── SwapTokenToEther.sol -> ../../contracts/examples/SwapTokenToEther.sol<br />
│   │   └── SwapTokenToToken.sol -> ../../contracts/examples/SwapTokenToToken.sol<br />
│   │   └── Trade.sol -> ../../contracts/examples/Trade.sol<br />
│   ├── truffle<br />
│   │   ├── getExpectedRate.js<br />
│   │   ├── swapEtherToToken.js<br />
│   │   ├── swapTokenToEther.js<br />
│   │   ├── swapTokenToToken.js<br />
│   │   └── trade.js<br />
│   └── web3<br />
│       ├── abi<br />
│       │   ├── KyberNetworkProxy.abi<br />
│       │   ├── KNC.abi<br />
│       │   ├── OMG.abi<br />
│       │   ├── MANA.abi<br />
│       │   ├── SALT.abi<br />
│       │   └── ZIL.abi<br />
│       ├── getExpectedRate.js<br />
│       ├── swapEtherToToken.js<br />
│       ├── swapTokenToEther.js<br />
│       └── swapTokenToToken.js<br />
├── LICENSE<br />
├── migrations<br />
│   ├── 1_initial_migration.js<br />
│   ├── 2_deploy_tokens.js<br />
│   ├── 3_deploy_contracts.js<br />
│   ├── 4_setup_permissions.js<br />
│   ├── 5_setup_KyberNetworkProxy.js<br />
│   ├── 6_setup_KyberReserve.js<br />
│   ├── 7_setup_KyberAutomatedReserve.js<br />
│   ├── 8_setup_KyberOrderbookReserve.js<br />
│   ├── 9_setup_FeeBurner.js<br />
│   ├── 10_setup_ExpectedRate.js<br />
│   ├── 11_setup_ConversionRates.js<br />
│   ├── 12_setup_LiquidityConversionRates.js<br />
│   ├── 13_setup_SanityRates.js<br />
│   ├── 14_setup_WhiteList.js<br />
│   ├── 15_setup_KyberNetwork.js<br />
│   ├── 16_add_PermissionlessOrderbookReserve.js<br />
│   ├── 17_transfer_tokens.js<br />
│   └──  18_deployment_summary.js<br />
├── package.json<br />
├── README.md<br />
├── scripts<br />
│   ├── get_liquidity_params.py<br />
│   └── liquidity_input_params.json<br />
└── truffle.js<br />

### Directory Details

**config** - contains JSON files that hold configuration details of the Kyber contracts used for migrations<br />
**contracts** - contains all the Kyber contracts, plus some mock tokens and solidity examples for testing<br />
**examples** - contains truffle and web3 example scripts to interact with Kyber's smart contracts, and also contains solidity examples for Kyber contract interactions<br />
**migrations** - contains the truffle migration scripts to deploy and setup the Kyber contracts in a test environment

## Interacting with the Kyber contracts locally

### 1A. Run Ganache with local snapshot

A Ganache snapshot has already been pre-made with the Kyber contracts deployed. You can immediately interact with the contracts without having to do migrations. The snapshot is stored in `db` folder.

We use the mnemonic `gesture rather obey video awake genuine patient base soon parrot upset lounge` for the accounts. The user wallet (`0x47a793D7D0AA5727095c3Fe132a6c1A46804c8D2`) already contains some ETH and test ERC20 tokens.

**NOTE:** The mnemonic provided is used only for testing. DO NOT use the accounts generated for your own personal use in mainnet, as you can potentially lose those funds.

To run the snapshot locally, run the command:

```sh
cd <PATH>/workshop
ganache-cli --db db --accounts 10 --defaultBalanceEther 1000 --mnemonic 'gesture rather obey video awake genuine patient base soon parrot upset lounge' --networkId 5777 --debug
```

### 1B. Run Ganache and deploy the Kyber contracts from scratch

If you wish to deploy the Kyber contracts yourself, you can run the following commands:

Run ganache-cli in one terminal session
```
ganache-cli --accounts 10 --defaultBalanceEther 1000 --mnemonic 'gesture rather obey video awake genuine patient base soon parrot upset lounge' --networkId 5777 --debug
```

In a new terminal session, connect to the ganache network, and run the truffle migration scripts
```
truffle migrate --network development
```

### 2. Running the example scripts

You can directly interact with the Kyber contracts on the Ganache network. We have provided some example scripts in the `example` directory.

For the Truffle examples:
```
truffle exec examples/truffle/<SCRIPT>
```

e.g.
```
truffle exec examples/truffle/swapEtherToToken.js
```

For the Web3 examples:
```
cd examples/web3
node <SCRIPT>
```

e.g.
```
cd examples/web3/
node swapEtherToToken.js
```

For the Solidity examples, they are already deployed in the Ganache network using the Truffle migration scripts. You can interact with the Solidity examples using `truffle console`, or write your own Truffle/Web3 scripts to interact with the Solidity example contracts.

### Ganache network details

Network
==================
development


Permissions
==================
| ENTITY       | ADDRESS                                    |
| :----------: | :----------------------------------------: |
| **admin**    | 0x2B522cABE9950D1153c26C1b399B293CaA99FcF9 |
| **operator** | 0x3644B986B3F5Ba3cb8D5627A22465942f8E06d09 |
| **alerter**  | 0x9e8f633D0C46ED7170EF3B30E291c64a91a49C7E |


Wallets
==================
| WALLET      | ADDRESS                                    |
| :---------: | :----------------------------------------: |
| **user**    | 0x47a793D7D0AA5727095c3Fe132a6c1A46804c8D2 |
| **reserve** | 0x0d95EBB4874f17157e40635C19dBC6E9b0BFdb03 |
| **tax**     | 0x5243B5970f327c328B2739dEc88abC46FaE8931A |
| **bob**     | 0xe1a1d3637eE02391ac4035e72456Ca7448c73FD4 |
| **alice**   | 0x1cF1919d91cebAb2E56a5c0cC7180bB54eD4f3F6 |


Tokens
==================
| TOKEN    | ADDRESS                                    |
| :------: | :----------------------------------------: |
| **KNC**  | 0x8c13AFB7815f10A8333955854E6ec7503eD841B7 |
| **OMG**  | 0x3750bE154260872270EbA56eEf89E78E6E21C1D9 |
| **SALT** | 0x7ADc6456776Ed1e9661B3CEdF028f41BD319Ea52 |
| **ZIL**  | 0x400DB523AA93053879b20F10F56023b2076aC852 |
| **MANA** | 0xe19Ec968c15f487E96f631Ad9AA54fAE09A67C8c |
| **POLY** | 0x58A21f7aA3D9D83D0BD8D4aDF589626D13b94b45 |
| **SNT**  | 0xA46E01606f9252fa833131648f4D855549BcE9D9 |


Contracts
==================
| CONTRACT                                 | ADDRESS                                    |
| :--------------------------------------: | :----------------------------------------: |
| **KyberNetwork**                         | 0xd44B9352e4Db6d0640449ed653983827BD882885 |
| **KyberNetworkProxy**                    | 0xd3add19ee7e5287148a5866784aE3C55bd4E375A |
| **ConversionRates**                      | 0x6E9b241Eec2C4a80485c1D2dF750231AFaf1A167 |
| **LiquidityConversionRates**             | 0x8b3BdEcEac3d23A215300A3df19e1bEe43A0Ac9C |
| **SanityRates**                          | 0xf71D305142eC1aC03896526D52F743959db01624 |
| **KyberReserve**                         | 0x19F18bde9896890f161DeD31B05b58dc0ffD911b |
| **KyberAutomatedReserve**                | 0xdE4e2118f45f1b27699B25004563819B57f5E3b2 |
| **KyberOrderbookReserve**                | 0x586F3cDCe25E76B69efD1C6Eb6104FAa0760A6a8 |
| **PermissionlessOrderbookReserveLister** | 0x295631209354194B6453921bfFeFEe79cD42BdB9 |
| **FeeBurner**                            | 0x63D556067eDbCD97ACc3356314398F70d4CcF948 |
| **WhiteList**                            | 0x5a8665AbbDe3986687494176e22d38B169EA1eab |
| **ExpectedRate**                         | 0xB4c927fC102547e4089b02caE5E92d866F63bFE6 |
| **SwapEtherToToken**                     | 0x47bC234Bf1F1436A794DF0a9FcA2935ea384629E |
| **SwapTokenToEther**                     | 0x6aBd125bcc68012197D81a92B4A56307177e0DBD |
| **SwapTokenToToken**                     | 0xB31b6edd85c386C259FB5488dae8Be4ed82C0778 |
| **Trade**                                | 0x3f21DD3b2Aca23e495290a8dcb9A934984D93a6c |

**NOTE:** The `KyberReserve` and `KyberAutomatedReserve` as well as the `KyberOrderbookReserve` and `OrderbookReserve` are the same contracts. A duplicate was made as a workaround due to a limitation of Truffle where only one instance of a contract can be migrated. Kyber has three types of reserves, the Fed Price Reserve, Automated Price Reserve, and Orderbook Reserve, which you can read more about [here](reserves-types.md).

## How to add a new ERC20 token with rates for initial migration

### Fed Price Reserve

#### 1. Create your ERC20 token contract

Create your ERC20 token contract in `contracts/mockTokens`. You can duplicate any of the existing mock tokens and modify the token name, symbol, and total supply

#### 2. Set the minimalRecordResolution, maxPerBlockImbalance, and maxTotalImbalance of each defined token in the tokens.json config file

In `config/tokens.json`, under the `FedPriceReserve` section, define the `minimalRecordResolution`, `maxPerBlockImbalance` and `maxTotalImbalance` of each defined token (replace NEW with the token symbol).

These 3 fields are explained below:

| Input Field               | Explanation  | Example |
| ------------------------- | ------------ | ------- |
| `minimalRecordResolution` | Per trade imbalance values are recorded and stored in the contract. Since this storage of data is an expensive operation, the data is squeezed into one bytes32 object. To prevent overflow while squeezing data, a resolution unit exists. Recommended value is the token wei equivalent of $0.001 - $0.01. | Assume 1 OMG = $1.<br>$0.001 = 0.001 OMG<br>Now OMG has 18 decimals, so `0.001*(10**18) = 10000000000000` |
| `maxPerBlockImbalance`    | The maximum wei amount of net absolute (+/-) change for a token in an ethereum block. We recommend this value to be larger than the maximum allowed tradeable token amount for a whitelisted user. Suppose we want the maximum change in 1 block to be 439.79 OMG, then we use `439.79 * (10 ** 18) = 439790000000000000000` | Suppose we have 2 users Alice and Bob. Alice tries to buy 200 OMG and Bob tries to buy 300 OMG. Assuming both transactions are included in the same block and Alice's transaction gets processed first, Bob's transaction will **fail** because the resulting net change of -500 OMG would exceed the limit of 439.79 OMG. However, if Bob decides to sell instead of buy, then the net change becomes +100 OMG, which means an additional 539.79 OMG can be bought, or 339.79 OMG sold. |
| `maxTotalImbalance`       | Has to be `>= maxPerBlockImbalance`. Represents the amount in wei for the net token change that happens between 2 price updates. This number is reset everytime `setBaseRate()` is called in `ConversionRates.sol`.  This acts as a safeguard measure to prevent reserve depletion from unexpected events between price updates. | If we want the maximum total imbalance to be 922.36 OMG, we will use: `922.36 * (10 ** 18) = 922360000000000000000` |

```json
"FedPriceReserve": {
  "NEW": {
    "minimalRecordResolution" : "1000000000000000",
    "maxPerBlockImbalance" : "9078768104330450960384",
    "maxTotalImbalance" : "57896044618658097711785492504343953926634992332820282019728792003956564819968"
  }
}
```

Next, add the desired conversion rates of each defined token with respect to ETH, defined with `baseBuy` and `baseSell`. Conversion rate sets the basic rate per token, and is set separately for buy and sell values.

For `bytes14Buy` and `bytes14Sell`, for simplicity, assume that we want to modify the base buy rates. The logic for modifying base sell rates is the same.

Suppose the reserve supports 3 tokens: DAI, BAT, and DGX.
We want to make the following modifications to their base buy rates:
* +2.5% (+25 pts) to DAI_BASE_BUY_RATE
* +1% (+10 pts) to BAT_BASE_BUY_RATE
* -3% (-30 pts) to DGX_BASE_BUY_RATE

Note:

One pt here means a 0.1% change, as compared to basis points used in step functions where 1 basis point = 0.01%.
The range which compact data can handle is from -12.8% to 12.7%.
This gives us the buy array [25,10,-30]. Encoding this to hex yields [0x190ae2]. But for simplicity sake, we can set this to 0x0000000000000000000000000000.

```json
"FedPriceReserve": {
  "NEW": {
    "minimalRecordResolution" : "1000000000000000",
    "maxPerBlockImbalance" : "9078768104330450960384",
    "maxTotalImbalance" : "57896044618658097711785492504343953926634992332820282019728792003956564819968",
    "baseBuy": "549000000000000000000",
    "baseSell": "1813123931381047",
    "bytes14Buy": "0x0000000000000000000000000000",
    "bytes14Sell": "0x0000000000000000000000000000"
  }
}
```

Lastly, add the sanity rate for each token you define. The sanity rates defined protect your reserve from large inconsistencies between the sanity rates and the actual rates.

You should have the final definition of a token below:

```json
"FedPriceReserve": {
  "NEW": {
    "minimalRecordResolution" : "1000000000000000",
    "maxPerBlockImbalance" : "9078768104330450960384",
    "maxTotalImbalance" : "57896044618658097711785492504343953926634992332820282019728792003956564819968",
    "baseBuy": "549000000000000000000",
    "baseSell": "1813123931381047",
    "bytes14Buy": "0x0000000000000000000000000000",
    "bytes14Sell": "0x0000000000000000000000000000",
    "sanityRate": "1840144285714286"
  }
}
```

You can read more about these fields in the [Fed Price Reserve guide](https://developer.kyber.network/docs/FedPriceReservesGuide/).

#### 3. Run the Truffle migration

With Ganache running, execute:

```
truffle migrate --network development --reset
```

### Automated Price Reserve

#### 1. Create your ERC20 token contract

Create your ERC20 token contract in `contracts/mockTokens`. You can duplicate any of the existing mock tokens and modify the token name, symbol, and total supply.

#### 2. Defining the liquidity parameters of the token

Modify the file `config/tokens.json` and add the new token section (replace NEW with the token symbol) for the different properties.

```json
{
  "AutomatedReserve": {
    "NEW": {
      "_rInFp": "10995116277",
      "_pMinInFp": "27487790",
      "_numFpBits": "40",
      "_maxCapBuyInWei": "5000000000000000000",
      "_maxCapSellInWei": "5000000000000000000",
      "_feeInBps": "25",
      "_maxTokenToEthRateInPrecision": "100000000000000",
      "_minTokenToEthRateInPrecision": "25000000000000",
      "Ether": "100",
      "Tokens": "2000000",
    }
  }
}
```

**AutomatedReserve.Token**

| Property    | Explanation |
| :---------: | :---------: |
| `_rInFp`    | r in formula precision, calculated as r * InFp. |
| `_pMinInFp` | Minimum supported price factor in formula precision, calculated as min price factor * initial price of your token * InFp. |
| `_numFpBits` | The formula precision in bits, therefore for formula precision of 2^40, _numFpBits is 40. |
| `_maxCapBuyInWei` | The allowed quantity for one BUY trade in ETH. |
| `_maxCapSellInWei` | The allowed quantity for one SELL trade in ETH. |
| `_feeInBps` | The fee amount in basis points (1 bp = 0.01%) that should be calculated in the price. |
| `_maxTokenToEthRateInPrecision` | The maximum allowed price taking into consideration the maximum supported price factor and must be in 10^18. |
| `_minTokenToEthRateInPrecision` | The minimum allowed price taking into consideration the minimum supported price factor and must be in 10^18. |
| `Ether` | The amount of initial ETH inventory to be deposited into the automated reserve. It is recommended to allocate at least 100 ETH. |
| `Tokens` | The amount of initial token inventory to be deposited into the automated reserve. It is recommended to allocate at least 100 ETH worth of tokens. |
<br />

The function that will be invoked to set liquidity parameters is:

function __setLiquidityParams__(uint \_rInFp, uint \_pMinInFp, uint \_numFpBits, uint \_maxCapBuyInWei, uint \_maxCapSellInWei, uint \_feeInBps, uint \_maxTokenToEthRateInPrecision, uint \_minTokenToEthRateInPrecision) public onlyAdmin

| Type      | Parameter                     |
| :-------: | :---------------------------: |
| `uint`    | _rInFp                        |
| `uint`    | _pMinInFp                     |
| `uint`    | _numFpBits                    |
| `uint`    | _maxCapBuyInWei               |
| `uint`    | _maxCapSellInWei              |
| `uint`    | _feeInBps                     |
| `uint`    | _maxTokenToEthRateInPrecision |
| `uint`    | _minTokenToEthRateInPrecision |

The reserve manager needs to only decide on the initial liquidity parameters of the automated reserve. Specifically, the following information need to be considered and to calculate the parameters above:

1. Liquidity Rate
2. Initial Token Price
3. Initial Ether Amount
4. Initial Token Amount
5. Minimum and Maximum Supported Price Factor
6. Maximum Buy and Maximum Sell Amount in a Trade
7. Fee Percentage

There are several things to take note of in the list of parameters.

First, notice that some parameters will have the **InFp** suffix. InFp refers to formula precision. While this is configurable, 2^40 is the recommended value.

Second, **r** is liquidity the rate in basis points or units of 100 which the price should move each time the ETH/token inventory changes in 1 ETH worth of quantity. For an r of 0.01, the price will move 1%. r is calculated taking into account the amount of initial ETH and tokens deposited into the contract, and the desired minimum/maximum price factor ratio. A smaller r also means more ETH and token inventory is needed to facilitate the liquidity.

For the **minimum/maximum supported price factor ratio**, it is recommended to start with a ratio of 0.5:2.0. This indicates that the inventory will suffice for up to 100% increase or 50% decrease in token price with respect to ETH.


##### Example

Now, Let's assume we want to list a token with the following considerations:

1. Liquidity Rate – 0.01 (1%)
2. Initial Token Price – 1 token = 0.00005 ETH
3. Initial Ether Amount – 100 ETH
4. Initial Token Amount – 2,000,000 tokens (100 ETH worth)
5. Minimum (pMin) and Maximum (pMax) Supported Price Factor – 0.5:2.0
6. Maximum Buy and Maximum Sell Amount in a Trade – 5 ETH max buy and sell cap
7. Fee Percentage – 0.25%

Below, we will calculate the different parameters.

| Parameter          | Formula                                   | Example Value                                            |
| :----------------: | :---------------------------------------: | :------------------------------------------------------: |
| `_rInFp`           | r * InFp                                  | _rInFp = (0.01 * 2^40) = **10995116277**                 |
| `_pMinInFp`        | pMin * initial price of token * InFp      | _pMinInFp = (0.5 * 0.00005 * 2^40) = **27487790**        |
| `_numFpBits`       | InFp in numFpBits                         | _numFpBits = **40**                                      |
| `_maxCapBuyInWei`  | max buy cap * 10^18                       | _maxCapBuyInWei = (5 * 10^18) = **5000000000000000000**  |
| `_maxCapSellInWei` | max sell cap * 10^18                      | _maxCapSellInWei = (5 * 10^18) = **5000000000000000000** |
| `_feeInBps`        | fee percentage in BPS                     | _feeInBps = **25**                                       |
| `_maxTokenToEthRateInPrecision` | pMax * initial price of token * 10^18 | _maxTokenToEthRateInPrecision = (2.0 * 0.00005 * 10^18) = **100000000000000** |
| `_minTokenToEthRateInPrecision` | pMin * initial price of token * 10^18 | _minTokenToEthRateInPrecision = (0.5 * 0.00005 * 10^18) = **25000000000000** |

#### Using get_liquidity_params.py Python script

A Python script, located in `scripts/get_liquidity_params.py` in the `smart-contracts` repository, will help you calculate the liquidity parameters. Edit the input file `liquidity_input_params.json`, and specify the inputs similar to the considerations in the example above.

```json
{
  "liquidity_rate": 0.01,
  "initial_ether_amount": 100.0,
  "initial_token_amount": 2000000,
  "initial_price":  0.00005,
  "min_supported_price_factor": 0.5,
  "max_supported_price_factor" : 2.0,
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
_pMinInFp: 27487790
_numFpBits: 40
_maxCapBuyInWei: 5000000000000000000
_maxCapSellInWei: 5000000000000000000
_feeInBps: 25
_maxTokenToEthRateInPrecision: 100000000000000
_minTokenToEthRateInPrecision: 25000000000000
```

#### 3. Run the Truffle migration

With Ganache running, execute:

```
truffle migrate --network development --reset
```

### Orderbook Reserve

#### 1. Create your ERC20 token contract

Create your ERC20 token contract in `contracts/mockTokens`. You can duplicate any of the existing mock tokens and modify the token name, symbol, and total supply.

#### 2. Set the price of USD per ETH

In `config/network.json`, under the `MockMedianizer` section, add the USD price per ETH.

```json
"MockMedianizer": {
  "DollarPerETH": 150
}
```

#### 3. Set the minimum USD price for new orders, maximum orders to traverse per trade, and fees

In `config/tokens.json`, under the `PermissionedOrderbookReserve` section, add the new token section (replace NEW with the token symbol) for the different properties.

```json
"PermissionedOrderbookReserve": {
  "NEW": {
    "minNewOrderUsd": 1000,
    "maxOrdersPerTrade": 5,
    "burnFeeBps": 25,
    (...)
  }
}
```

These 3 fields are explained below:

| Property            | Explanation                                                                              |
| :-----------------: | :--------------------------------------------------------------------------------------: |
| `minNewOrderUsd`    | The minimum limit order size in USD. Creating orders below this limit will be reverted.  |
| `maxOrdersPerTrade` | The maximum number of orders to traverse (and therefore use) to fulfill 1 trade request. |
| `burnFeeBps`        | The fee amount in basis points (1 bp = 0.01%) that should be calculated in the price.    |
<br />

#### 3. Set the initial limit order to the Orderbook Reserve

In `config/tokens.json`, under the `PermissionedOrderbookReserve` section, modify the new token section (replace NEW with the token symbol), as specified in Step 2 above, and indicate the different properties.

```json
"PermissionedOrderbookReserve": {
  "NEW": {
    (...)
    "KNCStake": "1000",
    "ETHDeposit": "25",
    "TokenDeposit": "150000",
    "ETHSell": "10",
    "TokenBuy": "12450",
    "ETHBuy": "10",
    "TokenSell": "12400"
  }
}
```

These 7 fields are explained below:

| Property       | Explanation                                                      |
| :------------: | :--------------------------------------------------------------: |
| `KNCStake`     | The amount of KNC to deposit and stake in the Orderbook Reserve. |
| `ETHDeposit`   | The amount of ETH to deposit to the Orderbook Reserve.           |
| `TokenDeposit` | The amount of tokens to deposit to the Orderbook Reserve.        |
| `ETHSell`      | The amount of ETH to sell in a BID order.                        |
| `TokenBuy`     | The amount of tokens to buy in a BID order.                      |
| `ETHBuy`       | The amount of ETH to buy in an ASK order.                        |
| `TokenSell`    | The amount of tokens to sell in an ASK order.                    |
<br />

#### 4. Run the Truffle migration

With Ganache running, execute:

```
truffle migrate --network development --reset
```

## Disclaimer
Code snippets in this guide are just examples and you
should always do your own testing. If you have questions, visit our
https://t.me/KyberDeveloper.

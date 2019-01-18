---
id: AutomatedReservesGuide
title: Automated Price Reserve Setup
---
## Objective
In this guide, we will learn how to configure and deploy an Automated Price Reserve either locally via ganache or to the Ropsten testnet.

## Introduction


## Points to Note
Like Kyber's manual reserves, automated reserves represent decentralized liquidity powered by the community.

In the classic manual reserve model, you maintain a reserve by interacting with your reserve smart contracts to maintain your inventory and rates. In this model, you have full control over your algorithm but comes with a cost: gas, server, and development costs. The traditional model is also able to support multiple tokens for one reserve.

Unlike the classic manual reserves, the automated reserve was created with ease of maintenance as a top consideration. For the automated market maker reserve model, you rely on the smart contract and its predefined algorithm to automatically provide rates for the token being served liquidity for. In this model, you don't have gas, server, or development costs, but there is a learning curve and inability to control the rates in creative ways. This automated model only supports one token for one reserve. If you need to list another token using this model, then another automated reserve must be deployed.

Moreover, the automated reserve was also designed to help discover the price of a newly created token that is previously not available in any centralized or decentralized exchange. Through the interaction of buyers and sellers, an estimated market price is discovered based on the market's sentiment at a point in time.

The automated reserve consists of only one component: an on-chain component of your reserve smart contracts that manages prices based on inventory.
​
The on-chain component has smart contracts that store your tokens, provide conversion rates, and swap your tokens with users. Since the smart contracts uses a pre-defined trading strategy based on initial parameters, the automated reserve automatically calculates conversion rate. As a reserve manager, your primary purpose is to make sure that your automated reserve's ETH and token inventory is replenished when depleted. In the event of reserve depletion, you will need to deposit more ETH or tokens, and to set the parameters once again.
​
With this in mind, the automated reserve was designed with various parameters to help secure your funds.
* Prices are automatically updated based on a pre-defined algorithm as trades occur.
* A single buy or sell trade in ETH quantity does not go beyond the allowed max quantity cap parameter.
* Limited list of destination withdrawal addresses will prevent the operator account (hot wallet) from withdrawing funds to any destination address (if this account is compromised).
## How to set up your own reserve
### Local testnet deployment
Here, we will walk you through an example on running the deployment script on [Truffle's Ganache](https://truffleframework.com/ganache).

#### Before you begin
Check that you have the following:
1. [node.js](https://nodejs.org/en/download/)
2. [web3 1.0.0-beta.34](https://www.npmjs.com/package/web3)
3. [Ganache CLI)](https://github.com/trufflesuite/ganache-cli)

#### Prerequisites

1. Node and NPM LTS versions `10.14.1` and `6.4.1` respectively. Download from [nodejs.org](https://nodejs.org/en/download/)

2. Ganache

Install the Ganache AppImage by downloading here https://truffleframework.com/ganache.
To use the provided Ganache snapshot, install `ganache-cli`.

```sh
sudo npm install -g ganache-cli
```

3. Truffle

Install the latest Truffle v5.

```sh
sudo npm install -g truffle@latest
```

Truffle v5.0 is needed in order to take advantage of new features, such as using async/await in the migration scripts. You can read more about the new features in the [Truffle release page](https://github.com/trufflesuite/truffle/releases/tag/v5.0.0)


#### Notes
1. The sequence of migrating to Ganache can be seen in the migration scripts under `workshop/migrations`.
2. The migration scripts or Ganache snapshot uses test tokens. New test tokens can be configured in `workshop/contracts/mockTokens`.
3. For more information on how to change/add the set rates functionality, refer to [this section](guide-automatedreserves.md#step-2-deploying-contracts).


#### `Step 1: Cloning the repository`

Create a local directory and clone the `automated_reserve` branch from our [workshop repo](https://github.com/KyberNetwork/workshop) on GitHub.

```sh
git clone -b automated_reserve https://github.com/KyberNetwork/workshop.git
```

Install the the NPM packages

```sh
npm install
```

#### `Step 2: Defining the network address, permissions, and withdrawal wallet`

Modify the file `config/network.json` and specify the addresses for the different properties.

```json
{
  "KyberNetwork": {
    "address": "0x738d8Ef6AcaE15660E467AB2B2cF3a488e40FF64"
  },
  "KyberReserve": {
    "admin": "0x2B522cABE9950D1153c26C1b399B293CaA99FcF9",
    "alerter": "0x9e8f633D0C46ED7170EF3B30E291c64a91a49C7E",
    "operator": "0x3644B986B3F5Ba3cb8D5627A22465942f8E06d09",
    "withdrawWallet": "0x2B522cABE9950D1153c26C1b399B293CaA99FcF9"
  }
}
```

**KyberNetwork**
| Property  | Explanation |
| :-------: | :---------: |
| `address` | Address of the core KyberNetwork contract. |

**KyberReserve**
| Property  | Explanation |
| :-------: | :---------: |
| `admin`   | Wallet address (usually a cold wallet) that handles infrequent, manual operations like calling `setLiquidityParams().` |
| `alerter` | The alerter account is used to halt the operation of the reserve on alerting conditions (e.g. strange conversion rates). In such cases, the reserve operation can be resumed only by the admin account. |
| `operator` | The operator account is used for withdrawing funds from the reserve to certain destinations (e.g. when selling excess tokens in the open market). |
| `withdrawWallet` | Wallet address where the ETH or tokens will be withdrawn to when initiated by the operator. |

We recommend that you use different addresses for the admin, alerter, and operator roles. It is highly recommended that for sensitive contracts like the reserve, a cold wallet is used as the admin wallet. Notice: It is possible to have multiple operators and alerters, but there can only be 1 admin.

The withdrawal wallet address is defined for the token by the admin. Additional withdrawal addresses can be defined using the contract function `approveWithdrawAddress()`. Note that the **token you wish to support must have withdraw addresses**.


#### `Step 3: Defining the liquidity parameters of the token`

Modify the file `config/tokens.json` and specify the information for the different properties.

```json
{
  "AutomatedReserve": {
    "Token": {
      "address": "0xe19Ec968c15f487E96f631Ad9AA54fAE09A67C8c",
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
      "ABI": [{"constant":true,"inputs":[],"name":"mintingFinished","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x05d2035b"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x06fdde03"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x095ea7b3"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x18160ddd"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x23b872dd"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x313ce567"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x40c10f19"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x42966c68"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x66188463"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x70a08231"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x715018a6"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_value","type":"uint256"}],"name":"burnFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x79cc6790"},{"constant":false,"inputs":[],"name":"finishMinting","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x7d64bcb4"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x8da5cb5b"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x95d89b41"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xa9059cbb"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xd73dd623"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xdd62ed3e"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xf2fde38b"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor","signature":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Mint","type":"event","signature":"0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885"},{"anonymous":false,"inputs":[],"name":"MintFinished","type":"event","signature":"0xae5184fba832cb2b1f702aca6117b8d265eaf03ad33eb133f19dde0f5920fa08"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event","signature":"0xf8df31144d9c2f0f6b59d69b8b98abd5459d07f2742c4df920b25aae33c64820"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event","signature":"0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0"},{"anonymous":false,"inputs":[{"indexed":true,"name":"burner","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Burn","type":"event","signature":"0xcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event","signature":"0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event","signature":"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"}]
    }
  }
}
```


**AutomatedReserve.Token**
| Property    | Explanation |
| :---------: | :---------: |
| `address`   | ERC20 token address that will be supported by the automated reserve. |
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
| `ABI` | The ERC20 token's ABI. |
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


#### `Step 4A: Running the Truffle migration scripts with Ganache with local snapshot`

A Ganache snapshot has already been pre-made with the Kyber contracts deployed. You can immediately interact with the contracts without having to do migrations. The snapshot is stored in `db` folder.

We use the mnemonic `gesture rather obey video awake genuine patient base soon parrot upset lounge` for the accounts. The user wallet (`0x47a793D7D0AA5727095c3Fe132a6c1A46804c8D2`) already contains some ETH and test ERC20 tokens.

**NOTE:** The mnemonic provided is used only for testing. DO NOT use the accounts generated for your own personal use in mainnet, as you can potentially lose those funds.

To run the snapshot locally, run the command:

```sh
ganache-cli --db db --accounts 10 --defaultBalanceEther 500 --mnemonic 'gesture rather obey video awake genuine patient base soon parrot upset lounge' --networkId 5777 --debug
```

Afterwards, as you've already set the configuration in [Step 3](guide-automatedreserves.md#step-3-defining-the-liquidity-parameters-of-the-token), run the Truffle migration scripts. Make sure you are in the `automated_reserve` git branch.

```sh
truffle migrate --network development
```

#### `Step 4B: Running the Truffle migration scripts with new Ganache instance`

If you wish to deploy the Kyber contracts yourself, you can run the following commands:

Switch to `master` branch in git.

```sh
git checkout master
```

Run ganache-cli in one terminal session
```
ganache-cli --accounts 10 --defaultBalanceEther 500 --mnemonic 'gesture rather obey video awake genuine patient base soon parrot upset lounge' --networkId 5777 --debug
```

In a new terminal session, connect to the Fanache, and run the truffle migration scripts
```
truffle migrate --network development
```

Switch back to the `automated_reserve` branch.

```sh
git checkout automated_reserve
```

Make sure you have completed the configuration as in [Step 3](guide-automatedreserves.md#step-3-defining-the-liquidity-parameters-of-the-token). Afterwards, run the Truffle migration scripts.

```sh
truffle migrate --network development
```


#### `Step 5: Test getting rates or doing a trade using the example scripts`

In the directory `examples`, there are several Truffle and web3 scripts that can be used. For Truffle scripts, use the following command to test it out:

```sh
truffle exec examples/truffle/<script>.js
```

For the web3 scripts, do the following:
```sh
cd examples/web3
node <script>.js
```

### Public testnet deployment
Here, we will walk you through an example to set up an automated reserve on the Ropsten testnet.
​
#### Before you begin
Check that you have the following:
1. [node.js](https://nodejs.org/en/download/)
2. [web3 v1.0.0](https://www.npmjs.com/package/web3)
3. An ETH account. You can easily create one on [MEW](https://www.myetherwallet.com/), [MyCrypto](https://mycrypto.com/), or [MetaMask](https://metamask.io/).
4. Ropsten ETH. You may get some from the [MetaMask faucet](https://faucet.metamask.io/) or [Ropsten faucet](http://faucet.ropsten.be:3001/).
​
#### `Step 1: Setting up the reserve`

Create a local directory and clone the `master` branch of our [smart contracts repo](https://github.com/KyberNetwork/smart-contracts) on GitHub.
​
```
git clone https://github.com/KyberNetwork/smart-contracts.git
```

##### Specifying the supported token
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

The most important properties are `symbol`, `name`, `decimals`, and `address`. The rest can be ignored. So you can specify your token details, filling in these fields.

In essence, an example of the first part of `ropsten.json` would be:

```json
{
  "tokens": {
    "XYZ": {
      "symbol": "XYZ",
      "name": "TokenXYZ",
      "decimals": 18,
      "address": "0xB2f3dD487708ca7794f633D9Df57Fdb9347a7afF"
    },
    ...
  }
}
```

##### Defining withdrawal addresses
Since withdrawing funds from the reserve contract might be needed in the future, we assume the withdraw operation will be done from a hot wallet address. That is why the withdraw permissions are granted to the operator addresses of the reserve contract. As hot wallets are in greater risk of being compromised, a limited list of withdrawal addresses is defined per token by the admin address. In the JSON file, a few withdrawal addresses can be defined per token and at least one address per exchange.

Let's take a look at the `exchanges` dictionary in `ropsten.json`. Fill in your ETH and XYZ token withdraw addresses. Note that the `binance` string is just an example. Also note that the **token you wish to support must have withdraw addresses**.

```json
  "exchanges": {
		"binance" : {
			"ETH" : "0x1234567890ABCDEF1234567890ABCDEF1111111",
			"XYZ" : "0x1234567890ABCDEF1234567890ABCDEF1111111"
		}
  },
```

##### Setting permissions
In the `permission` dictionary, you will fill in the addresses for admin, operator, and alerter. We recommend that you use different addresses for each of the 3 roles. It is highly recommended that for sensitive contracts like the reserve, a cold wallet is used as the admin wallet. Notice: It is possible to have multiple operators and alerters, but there can only be 1 admin.

```json
"permission" : {
	"KyberReserve" : {
		"admin" : "0x1234567890ABCDEF1234567890ABCDEF1111111",
		"operator" : ["0x9876543210FDECBA9876543210FDECBA2222222"],
		"alerter" : ["0x1234567890ABCDEF9876543210FDECBA3333333"]
	}
},
```

**KyberReserve**
| Property  | Explanation |
| :-------: | :---------: |
| `admin`   | Wallet address (usually a cold wallet) that handles infrequent, manual operations like calling `setLiquidityParams().` |
| `alerter` | The alerter account is used to halt the operation of the reserve on alerting conditions (e.g. strange conversion rates). In such cases, the reserve operation can be resumed only by the admin account. |
| `operator` | The operator account is used for withdrawing funds from the reserve to certain destinations (e.g. when selling excess tokens in the open market). |


#### `Step 2: Deploying the contracts`

The relevant contracts to deploy are the following:

* `KyberReserve.sol`: The contract has no direct interaction with the end users (the only interaction with them is via the network platform). Its main interaction is with the reserve operator who manages the token inventory and feeds conversion rates to Kyber Network's contract.
* `LiquidityConversionRates.sol`: Provides the interface to set the liquidity parameters and the logic to maintain on-chain adjustment to the prices.

Run the command below in your terminal to install all required dependencies. Ensure that you are in the `/web3deployment` directory.

```
npm install
```

Then run the command

```
node liquidityReserveDeployer.js --config-path ropsten.json --gas-price-gwei 30 ----rpc-url https://ropsten.infura.io --print-private-key true --network-address "0x91a502C678605fbCe581eae053319747482276b9"

```
* `--gas-price-gwei`: The gas price in gwei
* `--rpc-url`: The URL of your geth, parity or infura node. Here we use infura's node, `https://ropsten.infura.io`.
* `--print-private-key`: The script generates a random and one-time ETH account that will send transactions to deploy and setup your contracts. The `true` value reveals the private key of this generated account to you (you may want to set it to `false` when deploying onto the mainnet).
* `--network-address`: `KyberNetwork.sol` contract address (the address above is Ropsten testnet address).

You should see something similar to the image below while the script is running.

![Waitforbalance](/uploads/waitforbalance.jpg "Waitforbalance")

The generated ETH account is waiting for some ETH to be deposited so that it can send transactions to deploy and setup your contracts. Send around 0.3 ETH to the address. The console will eventually show

![Ethsent](/uploads/ethsent.jpg "Ethsent")

* `reserve` shows the address of your deployed `KyberReserve.sol` contract.
* `pricing` shows the address of your deployed `ConversionRates.sol` contract.
* `network` should be the same as that of `--network-address`

Congratulations, you have successfully deployed contracts on the Ropsten testnet!


#### `Step 3: Deposit tokens to and withdraw tokens from your reserve`

A reserve can’t operate without tokens. A reserve that supports ETH-KNC swap pair will need to hold both ETH and KNC so that users can sell and buy KNC from your reserve.

Filling up your reserve is easy. You can transfer tokens to your reserve contract from any address.

However, only authorized accounts have the right to withdraw tokens from the reserve.
* `admin` can call `withdrawEther` and `withdrawToken` of `KyberReserve.sol` to withdraw tokens to any address
* `operator` can only withdraw tokens to whitelisted addresses by calling `withdraw`
* `admin` can add withdraw/whitelisted address by calling `approveWithdrawAddress` of `KyberReserve.sol`.


#### `Step 4: Setting the liquidity parameters`

Before calling `setLiquidityParameters()`, make sure to deposit the ETH and token inventory into the reserve. You can calculate the liquidity parameters as in [Step 3](guide-automatedreserves.md#step-3-defining-the-liquidity-parameters-of-the-token) above.


#### `Step 5: Get your reserve authorized and running`

Once you have completed the above steps, you can let any network operator know so that they can approve your reserve and every specific pair you are allowed to list. Kyber Network is currently the only network operator.

Once approved, you can test your reserve on [KyberSwap](https://ropsten.kyber.network) Ropsten site! Please note that if there are other reserves listing same swap pair as you, your swap may not get matched with your reserve, because only the reserve that offer best rate will be matched. We can disable other reserves on the testnet to make sure you will swap with your reserve.

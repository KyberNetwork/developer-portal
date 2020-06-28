---
id: Integrations-PlatformFees
title: Platform Fees
---
[//]: # (tagline)
## What is the platform fee?

For each trade that originates from your DApp, wallet or payment gateway, you are able to specify a percentage that can taken as commission. It is collected in ETH (and stablecoins in the future).

## How do I specify the platform fee percentage and wallet address?

The platform fee is defined in basis points (bps). 1 basis point = 0.01%. As an example, a platform fee of 25 basis points would mean 0.25% is to be charged. The fee amount is calculated by `platformFeeBps * srcQty / 10000`. Kindly refer to the [example](#example) below. 

## Is there a max cap to the platform fee?

While there is no strict upper bound to the platform fee, there are checks in place to ensure that the total fees (platform and network fees) charged to the user do not exceed 100% of the trade amount.

## Do the fees go automatically to the fee wallet I specified?

No. You will have to claim them manually through the KyberFeeHandler contract(s).

## How do I view the fee amount claimable?

Call the `feePerPlatformWallet` method of the KyberFeeHandler contract(s). Note that for gas optimizations, 1 ether wei is kept inside the contract, so the claimable amount has to be subtract by 1.

Kindly refer to the example below.

## How do I claim fees?

Call the `claimPlatformFee` method of the KyberFeeHandler contract(s).

Kindly refer to the example below.

## What about the fee sharing program prior to Katalyst?
The Fee Sharing Program has been **deprecated**. The new APIs will have to be used in order to get commissions for trades.

## Example

Suppose a user has successfully made a KNC -> WBTC trade transaction of 10 ETH in value (ie. `X KNC -> 10 ETH -> Y WBTC`). A platform fee of 0.25% (25 bps) is specified.

| Description                    | Amount              | Calculation            | % of Transaction Value |
| ------------------------------ | ------------------- | ---------------------- | ---------------------- |
| Trasaction Value               | 10 ETH              | na                     | 100%                   |
| Platform Fee                   | 0.025 ETH           | `0.025 = 10 * 0.25%`   | 0.25%                  |

### Checking Fees Claimable

#### Etherscan

1. Navigate to the "Read Contract" tab of the Kyber Fee Handler contract in Etherscan. Example: https://ropsten.etherscan.io/address/0xe57B2c3b4E44730805358131a6Fc244C57178Da7#readContract

![Get Platform Fees Step 1](/uploads/getFeesClaimable.jpg "Get Platform Fees Step 1")

2. Go to the `feePerPlatformWallet` function, input your platform wallet address, then click on the "Query" button.

![Get Platform Fees Step 2](/uploads/getPlatformFees-1.jpg "Get Platform Fees Step 2")

1. You should be able to see the amount claimable. This is in ETH wei. Note that you have to subtract this amount by 1 wei. Example: In the image below, the amount claimable is `50000000000000000 - 1` = 0.05 ETH - 1 ether wei. 

![Get Platform Fees Step 3](/uploads/getPlatformFees-2.jpg "Get Platform Fees Step 3")

#### ethers.js (Web3)

1. Change `PLATFORM_WALLET_ADDRESS` to be the desired wallet address for which you would like to check the fees claimable.
2. Change `FEE_HANDLER_ADDRESS` to the KyberFeeHandler contract address.

```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const ethers = require('ethers');
const BN = ethers.BigNumber;
const NETWORK = "ropsten";
const provider = new ethers.getDefaultProvider(NETWORK);

// Replace the addresses below
const PLATFORM_WALLET_ADDRESS = "PLATFORM_WALLET_ADDRESS"; // Eg. "0x8640d5a5c11782ea9cc63833843a7b8f8911d568"
const FEE_HANDLER_ADDRESS = "FEE_HANDLER_ADDRESS"; // Eg. "0xe57B2c3b4E44730805358131a6Fc244C57178Da7"

const KyberFeeHandlerABI = [{"inputs":[{"internalType":"address","name":"_daoSetter","type":"address"},{"internalType":"contract IKyberProxy","name":"_kyberProxy","type":"address"},{"internalType":"address","name":"_kyberNetwork","type":"address"},{"internalType":"contract IERC20","name":"_knc","type":"address"},{"internalType":"uint256","name":"_burnBlockInterval","type":"uint256"},{"internalType":"address","name":"_daoOperator","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"rewardBps","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rebateBps","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"burnBps","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expiryTimestamp","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"epoch","type":"uint256"}],"name":"BRRUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"contract ISanityRate","name":"sanityRate","type":"address"},{"indexed":false,"internalType":"uint256","name":"weiToBurn","type":"uint256"}],"name":"BurnConfigSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EthReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"platformWallet","type":"address"},{"indexed":false,"internalType":"uint256","name":"platformFeeWei","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rewardWei","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rebateWei","type":"uint256"},{"indexed":false,"internalType":"address[]","name":"rebateWallets","type":"address[]"},{"indexed":false,"internalType":"uint256[]","name":"rebatePercentBpsPerWallet","type":"uint256[]"},{"indexed":false,"internalType":"uint256","name":"burnAmtWei","type":"uint256"}],"name":"FeeDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"kncTWei","type":"uint256"},{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"KncBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"contract IKyberDao","name":"kyberDao","type":"address"}],"name":"KyberDaoAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"kyberNetwork","type":"address"}],"name":"KyberNetworkUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"contract IKyberProxy","name":"kyberProxy","type":"address"}],"name":"KyberProxyUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"platformWallet","type":"address"},{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PlatformFeePaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"rebateWallet","type":"address"},{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RebatePaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":true,"internalType":"uint256","name":"epoch","type":"uint256"},{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardPaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"epoch","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rewardsWei","type":"uint256"}],"name":"RewardsRemovedToBurn","type":"event"},{"inputs":[],"name":"brrAndEpochData","outputs":[{"internalType":"uint64","name":"expiryTimestamp","type":"uint64"},{"internalType":"uint32","name":"epoch","type":"uint32"},{"internalType":"uint16","name":"rewardBps","type":"uint16"},{"internalType":"uint16","name":"rebateBps","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"burnBlockInterval","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"burnKnc","outputs":[{"internalType":"uint256","name":"kncBurnAmount","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"platformWallet","type":"address"}],"name":"claimPlatformFee","outputs":[{"internalType":"uint256","name":"amountWei","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"rebateWallet","type":"address"}],"name":"claimReserveRebate","outputs":[{"internalType":"uint256","name":"amountWei","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"},{"internalType":"uint256","name":"epoch","type":"uint256"}],"name":"claimStakerReward","outputs":[{"internalType":"uint256","name":"amountWei","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"daoOperator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"daoSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"feePerPlatformWallet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getBRR","outputs":[{"internalType":"uint256","name":"rewardBps","type":"uint256"},{"internalType":"uint256","name":"rebateBps","type":"uint256"},{"internalType":"uint256","name":"epoch","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getLatestSanityRate","outputs":[{"internalType":"uint256","name":"kncToEthSanityRate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSanityRateContracts","outputs":[{"internalType":"contract ISanityRate[]","name":"sanityRates","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address[]","name":"rebateWallets","type":"address[]"},{"internalType":"uint256[]","name":"rebateBpsPerWallet","type":"uint256[]"},{"internalType":"address","name":"platformWallet","type":"address"},{"internalType":"uint256","name":"platformFee","type":"uint256"},{"internalType":"uint256","name":"networkFee","type":"uint256"}],"name":"handleFees","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"hasClaimedReward","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"knc","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"kyberDao","outputs":[{"internalType":"contract IKyberDao","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"kyberNetwork","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"kyberProxy","outputs":[{"internalType":"contract IKyberProxy","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastBurnBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"epoch","type":"uint256"}],"name":"makeEpochRewardBurnable","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"readBRRData","outputs":[{"internalType":"uint256","name":"rewardBps","type":"uint256"},{"internalType":"uint256","name":"rebateBps","type":"uint256"},{"internalType":"uint256","name":"expiryTimestamp","type":"uint256"},{"internalType":"uint256","name":"epoch","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"rebatePerWallet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rewardsPaidPerEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rewardsPerEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISanityRate","name":"_sanityRate","type":"address"},{"internalType":"uint256","name":"_weiToBurn","type":"uint256"}],"name":"setBurnConfigParams","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IKyberDao","name":"_kyberDao","type":"address"}],"name":"setDaoContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IKyberProxy","name":"_newProxy","type":"address"}],"name":"setKyberProxy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_kyberNetwork","type":"address"}],"name":"setNetworkContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalPayoutBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"weiToBurn","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];

async function main() {
  KyberFeeHandlerContract = new ethers.Contract(
    FEE_HANDLER_ADDRESS,
    KyberFeeHandlerABI,
    provider
  );

  let feesClaimable = await KyberFeeHandlerContract.feePerPlatformWallet(PLATFORM_WALLET_ADDRESS);
  if feesClaimable.gt(BN.from(0)) {
    feesClaimable = feesClaimable.sub(BN.from(1));
  }
}

main();
```

### Claiming Fees

#### Etherscan

**Note:** This method requires your wallet address to be imported into Metamask. You will have to use other methods (Eg. MyCrypto / MyEtherWallet) otherwise.

1. Navigate to the "Write Contract" tab of the Kyber Fee Handler contract in Etherscan. Example: https://ropsten.etherscan.io/address/0xe57B2c3b4E44730805358131a6Fc244C57178Da7#writeContract

![Claim Platform Fees Step 1](/uploads/claimFees-1.jpg "Claim Platform Fees Step 1")

2. Click on the "Connect to Web3" button.

![Claim Platform Fees Step 2](/uploads/claimFees-2.jpg "Claim Platform Fees Step 2")

3. Go to the `claimPlatformFee` function, input your platform wallet address, then click on the "Write" button. Confirm the transaction details in Metamask.

![Claim Platform Fees Step 3](/uploads/claimPlatformFees.jpg "Claim Platform Fees Step 3")

#### ethers.js (Web3)

1. Change `PLATFORM_WALLET_ADDRESS` to be the desired wallet address for which fees can be claimed from.
2. Change `FEE_HANDLER_ADDRESS` to the KyberFeeHandler contract address.
3. Change `SENDER_ADDRESS_PRIVATE_KEY` to the private key of an ETH address to send the transaction. This can be the private key of any wallet address (ie. does not necessarily have to be `PLATFORM_WALLET_ADDRESS`). Kindly ensure that this address **has sufficient funds** to send the transaction.


```js
// DISCLAIMER: Code snippets in this guide are just examples and you
// should always do your own testing. If you have questions, visit our
// https://t.me/KyberDeveloper.

const ethers = require("ethers");
const BN = ethers.BigNumber;
const NETWORK = "ropsten";
const provider = new ethers.getDefaultProvider(NETWORK);

// Replace the addresses below
const PLATFORM_WALLET_ADDRESS = "PLATFORM_WALLET_ADDRESS"; // Eg. "0x8640d5a5c11782ea9cc63833843a7b8f8911d568"
const FEE_HANDLER_ADDRESS = "FEE_HANDLER_ADDRESS"; // Eg. "0xe57B2c3b4E44730805358131a6Fc244C57178Da7"
const SENDER_ADDRESS_PRIVATE_KEY = "SENDER_ADDRESS_PRIVATE_KEY";
const signer = new ethers.Wallet(SENDER_ADDRESS_PRIVATE_KEY, provider);

const KyberFeeHandlerABI = [{"inputs":[{"internalType":"address","name":"_daoSetter","type":"address"},{"internalType":"contract IKyberProxy","name":"_kyberProxy","type":"address"},{"internalType":"address","name":"_kyberNetwork","type":"address"},{"internalType":"contract IERC20","name":"_knc","type":"address"},{"internalType":"uint256","name":"_burnBlockInterval","type":"uint256"},{"internalType":"address","name":"_daoOperator","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"rewardBps","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rebateBps","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"burnBps","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expiryTimestamp","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"epoch","type":"uint256"}],"name":"BRRUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"contract ISanityRate","name":"sanityRate","type":"address"},{"indexed":false,"internalType":"uint256","name":"weiToBurn","type":"uint256"}],"name":"BurnConfigSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EthReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"platformWallet","type":"address"},{"indexed":false,"internalType":"uint256","name":"platformFeeWei","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rewardWei","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rebateWei","type":"uint256"},{"indexed":false,"internalType":"address[]","name":"rebateWallets","type":"address[]"},{"indexed":false,"internalType":"uint256[]","name":"rebatePercentBpsPerWallet","type":"uint256[]"},{"indexed":false,"internalType":"uint256","name":"burnAmtWei","type":"uint256"}],"name":"FeeDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"kncTWei","type":"uint256"},{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"KncBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"contract IKyberDao","name":"kyberDao","type":"address"}],"name":"KyberDaoAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"kyberNetwork","type":"address"}],"name":"KyberNetworkUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"contract IKyberProxy","name":"kyberProxy","type":"address"}],"name":"KyberProxyUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"platformWallet","type":"address"},{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PlatformFeePaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"rebateWallet","type":"address"},{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RebatePaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":true,"internalType":"uint256","name":"epoch","type":"uint256"},{"indexed":true,"internalType":"contract IERC20","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardPaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"epoch","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rewardsWei","type":"uint256"}],"name":"RewardsRemovedToBurn","type":"event"},{"inputs":[],"name":"brrAndEpochData","outputs":[{"internalType":"uint64","name":"expiryTimestamp","type":"uint64"},{"internalType":"uint32","name":"epoch","type":"uint32"},{"internalType":"uint16","name":"rewardBps","type":"uint16"},{"internalType":"uint16","name":"rebateBps","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"burnBlockInterval","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"burnKnc","outputs":[{"internalType":"uint256","name":"kncBurnAmount","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"platformWallet","type":"address"}],"name":"claimPlatformFee","outputs":[{"internalType":"uint256","name":"amountWei","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"rebateWallet","type":"address"}],"name":"claimReserveRebate","outputs":[{"internalType":"uint256","name":"amountWei","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"},{"internalType":"uint256","name":"epoch","type":"uint256"}],"name":"claimStakerReward","outputs":[{"internalType":"uint256","name":"amountWei","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"daoOperator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"daoSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"feePerPlatformWallet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getBRR","outputs":[{"internalType":"uint256","name":"rewardBps","type":"uint256"},{"internalType":"uint256","name":"rebateBps","type":"uint256"},{"internalType":"uint256","name":"epoch","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getLatestSanityRate","outputs":[{"internalType":"uint256","name":"kncToEthSanityRate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSanityRateContracts","outputs":[{"internalType":"contract ISanityRate[]","name":"sanityRates","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"address[]","name":"rebateWallets","type":"address[]"},{"internalType":"uint256[]","name":"rebateBpsPerWallet","type":"uint256[]"},{"internalType":"address","name":"platformWallet","type":"address"},{"internalType":"uint256","name":"platformFee","type":"uint256"},{"internalType":"uint256","name":"networkFee","type":"uint256"}],"name":"handleFees","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"hasClaimedReward","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"knc","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"kyberDao","outputs":[{"internalType":"contract IKyberDao","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"kyberNetwork","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"kyberProxy","outputs":[{"internalType":"contract IKyberProxy","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastBurnBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"epoch","type":"uint256"}],"name":"makeEpochRewardBurnable","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"readBRRData","outputs":[{"internalType":"uint256","name":"rewardBps","type":"uint256"},{"internalType":"uint256","name":"rebateBps","type":"uint256"},{"internalType":"uint256","name":"expiryTimestamp","type":"uint256"},{"internalType":"uint256","name":"epoch","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"rebatePerWallet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rewardsPaidPerEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rewardsPerEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISanityRate","name":"_sanityRate","type":"address"},{"internalType":"uint256","name":"_weiToBurn","type":"uint256"}],"name":"setBurnConfigParams","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IKyberDao","name":"_kyberDao","type":"address"}],"name":"setDaoContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IKyberProxy","name":"_newProxy","type":"address"}],"name":"setKyberProxy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_kyberNetwork","type":"address"}],"name":"setNetworkContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalPayoutBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"weiToBurn","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];

async function main() {
  KyberFeeHandlerContract = new ethers.Contract(
    FEE_HANDLER_ADDRESS,
    KyberFeeHandlerABI,
    signer
  );

  await KyberFeeHandlerContract.claimPlatformFee(PLATFORM_WALLET_ADDRESS);
}

main();
```

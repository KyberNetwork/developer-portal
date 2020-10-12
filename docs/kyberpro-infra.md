---
id: KyberPro-Infra
title: Infrastructure Details
---
[//]: # (tagline)

## Infrastructure For On-Chain MM

While market making on-chain, node infrastructure plays a very important role as everything and anything has to be done in sync with the nodes. Over the years of practice and expertise, we have a few suggestions on the structure we follow for market making 

## Important Infrastructure Aspects

A few important aspects to look at are the gas limit and block duration. Instead of a fixed limit, the ethereum block size is determined by how many units of gas can be spent per block. The miners determine what the maximum gas limit should be by signalling it to the network every block. Miners have this ability to modify / adjust this rate because changes to the gas limit affects the resources needed to mine the blocks. 

The average block time currently is `~13.3 secs`. How many transactions fit into each block depends on how much gas each transaction spends and not every transaction is the same size. For these reasons the param `validBlockDuration` is a check on the number of blocks the set rates are valid for. Rates are considered to have expired after exceeding this number of blocks, where the reserve will return 0 rates. This is to prevent users from taking advantage of stale prices. This means that rate updates have to be frequent and quick enough. Kyber Fed Price reserve helps minimize gas on rate updates for multiple tokens by using the compact data function.

## Node Provider Recommendations

### `Why?`

Quoting competitive pricing is highly important when all transitions are on-chain, In order to determine if the data from a node is trustworthy, the best practice is to specify the recent block number to avoid getting data from an unsynced node. To be extra cautious, you can read from different nodes at the same block number and see if the data is consistent. If they are, it is safe to use the data. 

### `Who?`

1. Alchemy 
- Pro: Stable, Suitable for production, very good customer support
- Con: Expensive

2. Infura 
- Pro: free/cheap
- Con: Inadequate customer support.

3. Kyber internal node (in beta, will be customized for reading kyber data)

### `When?`

For txs (set rate, deposit and withdraw to your reserve contract), broadcast them to all of the nodes as fast as you can (maybe parallelize them) to reduce the chance of the tx being dropped by a certain node.

Reliance on a single node or node provider for reading data smart contracts is discouraged, as it can return invalid data, thus resulting in inaccurate price calculations and updates.

## Understanding the Mempool

Price update txs are expected to be mined at a certain time. You don't want to:
* Have the pricing tx pending for a long time
* Set unncessarily high gas prices (ie. overpriced pricing updates)

In order to avoid or resolve those 2 issues, you need to understand a bit of how tx mempool of ethereum miners work. The following notes are worth being kept in mind:

1. The tx pool will drop txs if it is full. However, it is practically rare for this to happen. Once it is full, it will drop txs with low gas prices. Txs with nonce being a head of the next one (like the next nonce to be mined for a wallet is X and the tx is with a nonce higher than X)...
2. Ethereum miners are financially incentivised to include transactions with higher gas prices.

Websites like [ethgasstation](https://www.ethgasstation.info/) and [gasnow.org](https://www.gasnow.org/) provide real-time data on the average gas price of pending txns in the mempool. We recommend using these services for determining a suitable gas price to be used for pricing txs.

## Cancelling / Replacing A Tx

### `What & when?` 

Please note that once a transaction has been mined and is included in a block, it cannot be canceled or replaced. However, in times of high volatility for token prices you are market making for, you would want your price updates to reflect at the earliest block to avoid users taking advantage of the price difference.

The ethereum network can very quickly become congested, which results in very sudden gas price spikes in a matter of minutes. As a result, resonably priced price txs become underpriced, leaving them to be pending for a longer than expected duration.

It is in these cases that pricing txns be replaced or cancelled.

### `How?`

Send another pricing update tx with the same data and nonce, but with a higher gas price. It has a higher probability of being included in the next mined block. If it is included, then the earlier tx of lower gas price is dropped (and thus replaced).

However, there is no guarantee that this second pricing update txn will actually replace the first one. More pricing update txns may have to be sent.

In cases of extreme network congestion, it might be better to disable the reserve entirely temporarily until the congestion clears.

## Recommendations on Wallets and Accounts

* For admin accounts that can transfer funds to any address, we recommend the use of multisig wallets such as the Gnosis multisig, or a cold wallet like the Trezor or Ledger wallets.

* For operations like setting the price and doing withdrawals to whitelisted addresses and so on, a hot wallet is recommended, like a JSON keystore or mnemonic phrase generated account. This is because the operator will frequently perform actions like sending price update txs, which is probably run on a server.

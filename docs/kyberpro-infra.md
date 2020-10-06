---
id: KyberPro-Infra
title: Infrastructure Details
---
[//]: # (tagline)

## Infrastructure For On-ChainMM

While market making on-chain, node infrastructure plays a very important role as everything and anything has to be done in sync with the nodes. Over the years of practice and expertise we have a few suggestions on the structure we follow for Market making 

## Important aspects of infrastructure

A few important aspects to look at are the gas limit and block duration. Instead of a fixed limit, Ethereum block size is determined by how many units of gas can be spent per block. The miners determine what the maximum gas limit should be by signalling it to the network every block. Miners have this ability to modify/adjust this rate because changes to the gas limit affects the resources needed to mine the blocks. 

The average block time currently is `~13.3 secs`. How many transactions fit into each block depends on how much gas each transaction spends and not every transaction is the same size.For these reasons the param validBlockDuration is a check on the number of blocks the set rates are valid for. Rates are considered to have expired after exceeding this number of blocks, where the reserve will return 0 rates. This is to prevent users from taking advantage of stale prices. This means that rate updates have to be frequent and quick enough. Kyber Fed price reserve helps minimize gas on rate updates for multiple tokens- using compact data function.

# Node Provider Recommendations:

`Why?`
Quoting competitive pricing is highly important when all transitions are on-chain, In order to determine if the data from a node is trustworthy, best practice is to specify the recent block number to avoid getting data from an unsynced node. To be extra cautious, you can read from different nodes at the same block number and see if the data is consistent. If they are, it is safe to use the data. 

`Who?`
1. Alchemy 
- Pro: Stable, Suitable for production, very good customer support
- Con: Expensive

2. Infura 
- Pro: free/cheap
- Con: Inadequate customer support.

3. Kyber internal node (in beta, will be customized for reading kyber data)

`When?`

For txs (set rate, deposit and withdraw to your reserve contract), broadcast them to all of the nodes as fast as you can (maybe parallelize them) to reduce the chance the tx is dropped by a certain node
For reading data from smart contracts, should not rely solely on one node as it can return invalid data resulting wrong price calculation or tx drop

# Importance of mempool

Your pricing tx is very important to be mined at an expected mining time, you don't want to:
* Wait for the pricing tx to be pending for a long time
* Use too high gas price that costs you a lot of gas cost

In order to avoid or resolve those 2 issues, you need to understand a bit of how tx mempool of ethereum miners work. The following notes are worth being kept in mind:

1. The tx pool will drop txs if it is full, however, it is practically rare for this to happen. Once it is full, it will drop txs with low gas price, txs with nonce being a head of the next one (like the next nonce to be mined for a wallet is X and the tx is with a nonce higher than X)...
2. The tx pool will replace a PENDING tx with a tx of the same nonce, from the same wallet but with a higher gas price (usually the increment of gas price should be >= 1gwei)The tx pool usually selects high gas price first, then lower gas price txs

With those information, in order for you to fix #1 issue, you can use a recommended gas price from ethgasstation to do your pricing tx, if the tx is still pending for too long, you can replace that tx with a different pricing tx of the same nonce and higher gas price.

# Cancel or Replace a transaction 

`What & when?` 
Please note that once a transaction has been mined and is included in a block, it cannot be canceled or replaced. However , during high price volatility, you would want your price updates to reflect at the earliest block, to avoid users taking advantage of the price difference. In order to replace/cancel the transaction ensure that the tx is not yet mined.

`How?`

What we mean by cancellations is that sending the price update tx with the same nonce but a higher gas price for the miner to drop the one with lower gas price and pick the higher latest one - this is essentially replacing the earlier transaction. Please note that it is not guaranteed your second transaction will actually replace the first transaction.

# Recommendations on Wallets and accounts

* For admin accounts that can transfer funds to any address you might want to use a multisig like gnosis multisig or a hardware wallet.

* For operations like setting the price and doing withdrawals to whitelisted addresses and so on, preferably a hot wallets,a keystore with a key stored and decrypted.
It's not kyber specific rather than ethereum, since hot wallets will perform constant actions best to be run from a server that one person has access to and the decryption key protected. 

# xKNC: KyberDAO ERC20 Token 

Developer: [Michael Cohen](https://github.com/michaelcohen716)

## Description

Create an ERC20 wrapper for the KNC that allows investors to participate in KyberDAO governance without minding the day-to-day process. Each xKNC contract has a Mandate that express a governance position. xKNC holders can buy the ERC20 token that best represents their positions on governance and earn rewards without actively management. 

## Motivation
Many KNC investors believe in Kyber Protocol and want to participate in governance but may not have the time or technical expertise to stay on top of KyberDAO governance. xKNC allows investors to buy a token once to earn rewards and make sure their voices are heard.

Additionally, certain KNC investors may not want to manage the tax consequences of biweekly rewards to their account (KyberDAO pays out ETH once per epoch). xKNC allows investors to earn upside by owning only a single token and invoking a tax event only on the sale of xKNC, instead of every other week. 

## How It Works:

- Every pool operator using this SC will generate a unique ERC20 token, for example xKNC (you can name it whatever you want). 
- This token can start w a certain fixed rate decided by the pool operator, for example 1 KNC can locked to mint 10xKNC
- Users will stake into this pool by converting their KNC and getting xKNC in return (they can swap it with any token as well)
- It is the responsibility of the pool operator to use the KNC in pool to vote regularly
- The rewards will be in ETH. After the pool operator fees are deducted, the rest will be automatically converted to KNC and restaked, which means that the amount of KNC in the pool has increased. 
- For example, now there will be 1.1KNC for every 10xKNC, hence an xKNC holder can redeem their xKNC for more KNC than previously 
- xKNC holders can gain liquidity either by converting it back to KNC or selling it in liquid markets

## Expected Timeline 

- Testnet and audit ready (End May)
- Mainnet ready (Mid June)
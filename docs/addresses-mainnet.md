---
id: Addresses-Mainnet
title: Mainnet
---
[//]: # (tagline)
Please note that `KyberReserve`, `ConversionRates`, `SanityRates`, `OrderbookReserve` and `LiquidityConversionRates` contracts below are example reserve addresses. Your reserve will have different addresses for these contracts.

## Supported Token Pairs
https://api.kyber.network/currencies <br><br>
Read more [here](api_abi-restfulapi.md#currencies)

## Contract Addresses
### `KyberNetworkProxy`
- Main endpoint for trades <br>
- ``

### `KyberStorage`
- Obtain reserve IDs that support a token trade <br>
- ``

### `KyberHintHandler (KyberMatchingEngine)`
- Build / parse hints <br>
- ``

### `KyberFeeHandler (ETH)`
- Claim reserve rebates, platform fees and staker rewards <br>
- ``

### `KyberNetwork`
- Core network contract
- ``

### `KyberReserve`
`0x63825c174ab367968EC60f061753D3bbD36A0D8F`

### `ConversionRates`
`0x798AbDA6Cc246D0EDbA912092A2a3dBd3d11191B`

### `LiquidityConversionRates`
`0x97D7126b6FF7C4D95601912f4Cdf790a3Cd1edaB`

### `KyberNetworkENSResolver`
`0x1982131C7D6959ff7768EE39c023Ad002d8c9759`

## Token Addresses
Please use https://api.kyber.network/currencies for the list of supported tokens and their addresses. <br><br>
Read more [here](api_abi-restfulapi.md#currencies)

We recommend using a JSON formatter extension or plugin of your choice. For Google Chrome, we recommend [this JSON formatter](https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa).


### Ether
`0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`

### DAI (Multi-Collateral)
`0x6b175474e89094c44da98b954eedeac495271d0f`

### KNC (KyberNetworkCrystal)
`0xdd974d5c2e2928dea5f71b9825b8b646686bd200`

### PBTC (Provable BTC)
`0x5228a22e72ccc52d415ecfd199f99d0665e7733b`

### SUSD (sUSD)
`0x57ab1ec28d129707052df4df418d58a2d46d5f51`

### TUSD (TrueUSD)
`0x8dd5fbce2f6a956c3022ba3663759011dd51e73e`

### USDC (USD Coin)
`0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`

### USDS (StableUSD)
`0xa4bdb11dc0a2bec88d24a3aa1e6bb17201112ebe`

### USDT (Tether)
`0xdac17f958d2ee523a2206206994597c13d831ec7`

### WBTC (Wrapped Bitcoin)
`0x2260fac5e5542a773aa44fbcfedf7c193bc2c599`

### WETH (Wrapped Ether)
`0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2`
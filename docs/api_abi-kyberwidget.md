---
id: API_ABI-KyberWidget
title: KyberWidget
---
[//]: # (tagline)
## Overview
The KyberWidget can be implemented via HTML/JS. There is a [widget generator](integrations-widgetgenerator.md) that provides a user interface for configuration of the parameters described below.

## KyberWidget
### Widget URL Components
#### Base URL
`https://widget.kyber.network/`

#### Path
The widget version to be used.
#### Examples
`v0.3/?`<br>
`v0.6/?`

#### Path Parameters
| Parameter  | Type | Description   | Default | Example |
| ------------ | ----- | ------------------ | -------- | --------- |
| `type`                  | string     |  Widget type. Either `pay`, `swap`, or `buy` | `pay` | `pay` |
| `mode`                  | string     | Behavior of how the widget will appear to the user. Either `tab`, `popup`, or `iframe` | `popup` | `popup` |
| `receiveAddr`   | address | Destination wallet address which will receive the destination tokens. | N.A | `0xFDF28Bf25779ED4cA74e958d54653260af604C20` |
| `receiveToken` | string    | Token symbol of destination token. Has to be a token supported by Kyber. | N.A | ETH<br>DAI |
| `receiveAmount` | float    | Amount of `receiveToken` | User gets to specify value | 1.2<br>25 |
| `callback` | string | Callback URL that will be called after the tx has been broadcasted to the blockchain. It includes tx hash as a param and must return HTTP status code of 200 for the success. If not, the callback will be fired another 5 times at most | - | https://yourwebsite.com/kybercallback |
| `network` | string | ETH network that widget will run in | `ropsten` | 1 of the following values:<br>`test`<br>`ropsten`<br>`production`<br>`mainnet`|
| `paramForwarding` | boolean | If `true`, all params that were passed to the widget will be submitted via the `callback`. Can be used to prevent malicious behaviour by giving your customer a OTP secret token and validating it in the `callback` | - | - |
|`commissionId` | address | Wallet address that gets fees from the trade. Read more about platform fees [here](integrations-platformfees.md) | - | `0xFDF28Bf25779ED4cA74e958d54653260af604C20` |
|`commissionFee` | integer | Platform fee to be charged, in basis points. Read more about platform fees [here](integrations-platformfees.md) | - | `25` (0.25%) |
|`pinnedTokens` | string | Tokens that are pinned at the top of your token selector. Tokens are separated by an underscore. | `ETH_KNC_DAI` | `ETH_KNC_DAI` |
|`defaultPair ` | string | This param only takes effect when type=swap, it indicates default token pair will show in swap layout. | `ETHKNC` | `ETHKNC` |
| `signer` | string | Concatenated list of Ethereum addresses which the user must make the payment from, separated by underscore. | N.A | `0xFDF28Bf25779ED4cA74e958d54653260af604C20_0xFDF28Bf25779ED4cA74e958d54653260af604C20` |
| `productName` | string | Name of the product bought. You can push multiple `productName` instances to the URL for multiple product names\* | N.A | `A%20Cat%20Picture` |
| `productQty`\* | string | Amount of `productName` product. Multiple instances of `productQty` can be pushed into the URL\* | N.A | `7` |
| `productImage`\* | string | Public URL of an image of `productName`.  Multiple instances of `productImage` can be pushed into the URL\* | N.A. | `https://images.unsplash.com/photo-1518791841217-8f162f1e1131` |
| `paymentData` | string | Auxiliary data attached to payment after the tx is broadcasted | N.A | N.A |

### Things to note
#### `network`
- `test` and `ropsten` runs on the Ethereum Ropsten network (ie. they are equivalent)
- `production` and `mainnet` runs on the Ethereum mainnet.

#### `productName`
- Multiple product instances are only supported on v0.6+

#### `productQty`
- If this field is used, there must be a corresponding `productName` parameter preceding it. Otherwise, it will be ignored.

#### `productImage`
- `productAvatar` is an alias for `productImage` in older versions (< v0.6)
- If this field is used, there must be a corresponding `productName` parameter preceding it. Otherwise, it will be ignored.

### Widget URL Examples
Test out the links below by copying, pasting and opening them in a new tab!

#### Pay Mode with Multiple Products
```
https://widget.kyber.network/v0.6/?type=pay&mode=tab&receiveAddr=0x63B42a7662538A1dA732488c252433313396eade&receiveToken=KNC&callback=https%3A%2F%2Fkyberpay-sample.knstats.com%2Fcallback&paramForwarding=true&network=ropsten&receiveAmount=0.5&theme=theme-emerald&productName=A%20Cat%20Picture&productQty=7&productImage=https://images.unsplash.com/photo-1518791841217-8f162f1e1131&productName=Falling%20Autumn%20Leaves&productQty=24&productImage=https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/fabdf38b-1811-49e8-8eeb-4c5632076c3e/dczgthc-076fcdf7-4932-4672-8d94-f3b6ed07d100.png&commissionId=0x90A21dbB74D7684B7AF747963D7ac7A8086b82B6
```

#### Swap Mode with Sunset Theme
```
https://widget.kyber.network/v0.6/?type=swap&mode=tab&callback=https%3A%2F%2Fkyberpay-sample.knstats.com%2Fcallback&paramForwarding=true&network=ropsten&pinnedTokens=KNC_DAI&theme=theme-sunset
```

#### Buy Mode
```
https://widget.kyber.network/v0.6/?type=buy&mode=tab&receiveToken=ETH&receiveAmount=0.001&callback=https%3A%2F%2Fkyberpay-sample.knstats.com%2Fcallback&paramForwarding=true&network=ropsten&pinnedTokens=KNC_DAI&theme=theme-emerald`
```

### FAQ

1. Even though I specified the popup / iframe mode, why does the browser open the widget in a new tab when the user clicks on the payment button?

**Answer:**

If your buttons do not have the ‘kyber-widget-button’ class, or they are generated on the fly when the page is already loaded, you need to manually activate the buttons as such:

```javascript
window.kyberWidgetOptions.register(‘your buttons CSS selector here’);
```
If you don’t provide the CSS selector, it defaults to ‘kyber-widget-button’.

2. How do I track or monitor the payment status?

**Answer:**
Kindly refer to [this monitoring PHP library](https://github.com/KyberNetwork/widget-monitor-php). More monitoring tools may be built by Kyber and the community in the future. Alternatively, vendors can choose to implement and run their own monitoring logic to get the payment status from the Ethereum network.

## License
KyberWidget is available under MIT License, see [LICENSE](https://github.com/KyberNetwork/widget-swift/blob/master/LICENSE)  file for more information.

## Bugs/Features report
Please feel free to submit bugs report or any features you want to have in our KyberWidget by opening a [Github issue here](https://github.com/KyberNetwork/widget-swift/issues).

---
id: API_ABI-KyberWidget
title: KyberWidget
---
## Disclaimer
**All code snippets in this document have not been audited and should not be used in production. If so, it is done at your own risk.**

## Overview
The KyberWidget can be implemented via HTML/JS or iOS. The HTML / JS option has a [widget generator](integrations-widgetgenerator.md) that provides a user interface for configuration of the parameters described below.

## KyberWidget (HTML/JS)
### Widget Types
![Widget Types](/uploads/widgettypes.png "Widget Types")

### Widget Modes
![Widget Modes](/uploads/widgetmodes.png "Widget Modes")

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
|`commissionId` | address | Registered ETH address that is part of the [fee sharing program](integrations-feesharing.md) | - | `0xFDF28Bf25779ED4cA74e958d54653260af604C20` |
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

## KyberWidget (iOS)
### Valid use cases

#### Pay Widget
- **receiveAddr** - **required**: must be a valid ETH address with 0x prefix
- **receiveToken** - **required**: must be a supported token symbol by KyberNetwork

#### Swap Widget
- **receiveAddr**, **receiveToken** and **receiveAmount** are all ignored

#### Buy Widget
- **receiveToken** - **required**:  must be a supported token symbol by KyberNetwork

Other parameters are optional.

NOTE:
  - In any cases, **receiveAmount** will be ignored if **receiveToken** is empty.
  - `func coordinatorDidFailed(with error: KWError)` will be immediately called after you `start` the coordinator if any parameters are invalid.

### Supported tokens
See all supported tokens [here](https://api.kyber.network/currencies)

### KWCoordinator Sub-classes Parameters
Note that if any of the parameters are invalid, an error will be thrown via delegation.

***Parameter details:***

- ***baseViewController*** (UIViewController) - **required** - This is the base view controller, used to present the navigation controller of the widget.

- ***receiveAddr*** (String) - **required** - For _payment_ use case, this is the vendor's Ethereum wallet address with 0x prefix which user's payment will be sent there. **_Must double check this param very carefully_**. For _swap_ or _buy_, please don't set this parameter.

- ***receiveToken*** (String) - **required** for _payment_, it is the token that you (vendor) want to receive, for _swap_ or _buy_, it is the token that you want to receive/buy. It can be one of supported tokens (such as ETH, DAI, KNC...).

- ***receiveAmount*** (Double) - the amount of `receiveToken` you (vendor) want your user to pay (for _pay_ widget) or amount you want to buy (for _buy_ widget), not support for _swap_ widget. If you leave it blank or missing, the users can specify it in the widget interface. It could be useful for undetermined payment or pay-as-you-go payment like a charity, ICO or anything else. This param is ignored if you do not specify `receiveToken`. To make a transaction, amount must *NOT* be less than (equivalent) 0.001ETH.

- ***pinnedTokens*** (String) - default: "ETH_KNC_DAI". This param help to show priority tokens in list select tokens.

- ***defaultPair*** (string) - default: "ETH_KNC". This param only take effect for *Swap*, it indicates default token pair will show in swap layout.

- ***network*** (KWEnvironment - default `ropsten`) - Ethereum network that the widget will run. Possible value: `mainnet, production, test, ropsten, rinkeby`. `test` and `ropsten` will run on Ropsten network, `rinkeby` will run on Rinkeby network, `production`, `mainnet` will run on Mainnet ethereum. Be carefull for this param!

- ***signer*** (String) - concatenation of a list of Ethereum address by underscore `_`, eg. 0xFDF28Bf25779ED4cA74e958d54653260af604C20_0xFDF28Bf25779ED4cA74e958d54653260af604C20 - If you pass this param, the user will be forced to pay from one of those addresses. If you ignore or pass `nil` value, all addresses are accepted.

- ***commissionId*** - (String - Ethereum address) - your Ethereum wallet to get commission of the fees for the transaction. Your wallet must be whitelisted by KyberNetwork (the permissionless registration will be available soon) in order to get the commission, otherwise it will be ignored.

- ***productName*** - (String?) - your product name you want to display (only for _pay_ widget).

- ***productQty*** - (Int?) - your product quantity you want to buy (only for pay widget).

- ***productAvatar*** - (String?) - url string to your product avatar (only for _pay_ widget).

- ***productAvatarImage*** - (UIImage?) - image for your product avatar (only for _pay_ widget). You should either provide `productAvatar` or `productAvatarImage` (prefer `productAvatarImage` for faster displaying). If you provide both, `productAvatar` will be ignored.

- ***paymentData*** - (String) - A piece of additional information attached to the payment after broadcasted on the blockchain (*Note*: This param only takes effect when type=pay)

### Error cases to be handled
These are some error / edge cases that should be handled in the **coordinatorDidFailed** function.

- `unsupportedToken`: the token you set is not supported by Kyber, or you are performing _payment_ but not set the `receiveToken` value.
- `invalidAddress(errorMessage: String)`: the receive address is not set as `self` or a valid ETH address, check `errorMessage` for more details.
- `invalidToken(errorMessage: String)`: the receive token symbol is not set for *Pay* or *Buy*. Or receive token is not supported by Kyber. Check `errorMessage` for more information.
- `invalidPinnedToken(errorMessage: String)`: One of pinned token symbol is invalid (not supported by Kyber Network), or `pinnedTokens` is not in a correct format TOKEN_TOKEN_TOKEN. Check `errorMessage` for more information.
- `invalidAmount(errorMessage: String)`: the receive amount is not valid (negative, zero, ...), or if you are performing _swap_, the receive amount must be empty.
- `invalidDefaultPair(errorMessage: String)`: `defaultPair` param for *Swap* is not set correctly. It should contain exactly 2 supported token symbols by Kyber Network with format A_B in uppercased. E.g: ETH_KNC. Check `errorMessage` for more information.
- `invalidSignerAddress(errorMessage: String)`: Invalid signer address. Either it is not in a correct format address_address.. or address is not a valid ETH address. Check `errorMessage` for more information.
- `invalidCommisionAddress(errrorMessage: String)`: Invalid commission ID address: Not a correct ETH address.
- `invalidProductAvatarURL(errorMessage: String)`: Invalid product avatar (for *Pay* use case). It is not a correct URL format.
- `failedToLoadSupportedToken(errorMessage: String)`: something went wrong and we could not load supported tokens by Kyber.
- `failedToSendTransaction(errorMessage: String)`: Could not send the transaction request. Check `errorMessage` for more information.

In most cases, we will provide a meaningful error message for you to either display it to user directly, or use the message to test/debug.

## Acknowledgement
The KyberWidget iOS uses the following open source software:

- [Moya](https://github.com/Moya/Moya)
- [BigInt](https://github.com/attaswift/BigInt)
- [APIKit](https://github.com/ishkawa/APIKit)
- [MBProgressHUD](https://github.com/jdg/MBProgressHUD)
- [TrustKeystore](https://github.com/TrustWallet/trust-keystore)
- [TrustCore](https://github.com/TrustWallet/trust-core)
- [JSONRPCKit](https://github.com/bricklife/JSONRPCKit.git)
- [IQKeyboardManager](https://github.com/hackiftekhar/IQKeyboardManager)
- [KeychainSwift](https://github.com/evgenyneu/keychain-swift)
- [QRCodeReaderViewController](https://github.com/yannickl/QRCodeReaderViewController.git)
- [JavaScriptKit](https://github.com/alexaubry/JavaScriptKit)

Special thanks to [TrustWallet](https://github.com/TrustWallet) team for their awesome work!

## License
KyberWidget is available under MIT License, see [LICENSE](https://github.com/KyberNetwork/widget-swift/blob/master/LICENSE)  file for more information.

## Bugs/Features report
Please feel free to submit bugs report or any features you want to have in our KyberWidget by opening a [Github issue here](https://github.com/KyberNetwork/widget-swift/issues).

## Swift 4.2, Xcode 10
Please upgrade your pod by using commands:

```swift
pod repo update
pod install
```

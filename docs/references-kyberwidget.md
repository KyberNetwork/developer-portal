---
id: References-KyberWidget
title: KyberWidget
---
## Widget Generator
Open https://developer.kyber.network/docs/WidgetGenerator in a new tab. You will see the following interface:

![Widget Generator](/uploads/widgetgenerator.png "Widgetgenerator")

Test out the widget for yourself by clicking on the "Preview" button!

### Things To Note:
- The button's text, title, and CSS style can be changed if desired
- You can add multiple buttons into a page for multiple functionalities

## Widget Types and Modes
### Widget Type
There are 3 different widget types. The use-case for each type is briefly described below.
#### Pay
This widget option caters to e-commerce sites and vendors who would like to receive cryptocurrencies as payment.

#### Swap
This widget option caters to parties who wish to provide a generic swap service on their websites, where users can swap from any supported ERC20 token to another.

#### Buy
This widget option caters to platforms who want to allow users to buy a specific token on their website.

### Widget Mode
#### Popup
The widget will open as an overlay popup. The widget will be inserted directly into the host page's DOM. Use this mode if you want to customize the widget appearance by overriding CSS rules.

#### New Tab
The widget will open in a new browser tab.

#### iFrame
The widget will open inside an iFrame on an overlay popup. Use this mode if you prefer the widget's UI and don't want to override its CSS.

## Widget URL Components
### Base URL
`https://widget.kyber.network/`

### Path
The widget version to be used.
#### Examples
`v0.3/?`<br>
`v0.6/?`

### Path Parameters
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

**Notes:**
#### `network`
- `test` and `ropsten` runs on the Ethereum Ropsten network (ie. they are equivalent)
- `production` and `mainnet` runs on the Ethereum mainnet.

#### `productName`
- Multiple product instances are only supported on v0.6+

#### `productQty`
- If this field is used, there must be a corresponding `productName` parameter preceding it. Otherwise, it will be ignored.

#### `productImage`
- Older versions (< v0.6) use `productAvatar` instead of `productImage`
- If this field is used, there must be a corresponding `productName` parameter preceding it. Otherwise, it will be ignored.

## Widget URL Examples
Test out the links below by copying, pasting and opening them in a new tab!

### Pay Mode with Multiple Products
```
https://widget.kyber.network/v0.6/?type=pay&mode=tab&receiveAddr=0x63B42a7662538A1dA732488c252433313396eade&receiveToken=KNC&callback=https%3A%2F%2Fkyberpay-sample.knstats.com%2Fcallback&paramForwarding=true&network=ropsten&receiveAmount=0.5&theme=theme-emerald&productName=A%20Cat%20Picture&productQty=7&productImage=https://images.unsplash.com/photo-1518791841217-8f162f1e1131&productName=Falling%20Autumn%20Leaves&productQty=24&productImage=https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/fabdf38b-1811-49e8-8eeb-4c5632076c3e/dczgthc-076fcdf7-4932-4672-8d94-f3b6ed07d100.png&commissionId=0x90A21dbB74D7684B7AF747963D7ac7A8086b82B6
```

### Swap Mode with Sunset Theme
```
https://widget.kyber.network/v0.6/?type=swap&mode=tab&callback=https%3A%2F%2Fkyberpay-sample.knstats.com%2Fcallback&paramForwarding=true&network=ropsten&pinnedTokens=KNC_DAI&theme=theme-sunset
```

### Buy Mode
```
https://widget.kyber.network/v0.6/?type=buy&mode=tab&receiveToken=ETH&receiveAmount=0.001&callback=https%3A%2F%2Fkyberpay-sample.knstats.com%2Fcallback&paramForwarding=true&network=ropsten&pinnedTokens=KNC_DAI&theme=theme-emerald`
```

## FAQ

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

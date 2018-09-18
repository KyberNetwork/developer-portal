---
id: WidgetGeneratorGuide
title: Widget Generator Guide
---
Go to https://developer.kyber.network/docs/WidgetGenerator. You will see the following interface:
![Widgetgenerator](/uploads/widgetgenerator.png "Widgetgenerator")
 
Test out the widget for yourself by clicking on the button!

**Note:**
Button's text, title, and CSS style can be changed if desired. You could add multiple buttons into a page.


## Widget Options
### Type
|     Type     |     Pay     |     Swap     |     Buy     |
| ---------- | ---------- | ----------- | ---------- |
| Recipient Address | **Required** | Not required | Not required |
| Receiving Token Symbol | **Required** | Not required | **Required** |
| Use Case | Vendor who wants to receive cryptocurrency as payment | Website that wants to provide a generic swap service | Platform who wants to allow users to buy their token on their website|

### Mode
#### Popup
The widget will open as an overlay popup. The widget will be inserted directly into the host page's DOM. Use this mode if you want to customize the widget appearance by overiding CSS rules.

#### New Tab
The widget will open in a new browser tab.

#### iFrame
The widget will open inside an iFrame on an overlay popup. Use this mode if you prefer the widget's UI and don't want to override its CSS.

## Parameters
Base URL: `https://widget.kyber.network/`

| Parameter  | Type | Description   | Default | Example |
| ------------ | ----- | -------------- | -------- | --------- |
| `type`                  | string     |  Widget type. Either `pay`, `swap`, or `buy` | `pay` | `pay` |
| `mode`                  | string     | Behavior of how the widget will appear to the user. Either `tab`, `popup`, or `iframe` | `tab` | `popup` |
| `receiveAddr`   | address | Destination wallet address which will receive the destination tokens. | N.A | `0xFDF28Bf25779ED4cA74e958d54653260af604C20` |
| `receiveToken` | string    | Token symbol of destination token. Has to be a token supported by Kyber. | N.A | ETH<br>DAI |
| `receiveAmount` | float    | Amount of `receiveToken` | User gets to specify value | 1.2<br>25 |
| `callback` | string | Callback URL | - | https://yourwebsite.com/kybercallback |
| `network` | string | ETH network that widget will run in | `ropsten` | 1 of the following values:<br>`test`<br>`ropsten`<br>`production`<br>`mainnet`|
| `paramForwarding` | boolean | If `true`, all params that were passed to the widget will be submitted via the `callback`. Can be used to prevent malicious behaviour by giving your customer a OTP secret token and validating it in the `callback` | - | - |
|`commissionId` | address | Registered ETH address that is part of the [fee sharing program](FeeSharingGuide) | - | `0xFDF28Bf25779ED4cA74e958d54653260af604C20` |
|`pinnedTokens` | string | Tokens that are pinned at the top of your token selector. 3 tokens at most and are separated by an underscore (_). | `ETH_KNC_DAI` | `ETH_KNC_DAI` |

## FAQ

1. I specify popup/iframe mode, but when user clicks payment button, the browser open the widget in new tab?

**Answer:**

If your buttons do not have ‘kyber-widget-button’ class, or they are generated on the fly when the page already loaded, you need to manually activate the buttons as following:

```javascript
window.kyberWidgetOptions.register(‘your buttons CSS selector here’);
```
If you don’t provide the CSS selector, it defaults to ‘kyber-widget-button’.

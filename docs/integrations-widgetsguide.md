---
id: Integrations-WidgetsGuide
title: Widgets
---
## Introduction
Widgets are a type of integration that websites and applications can easily leverage on to interact with our protocol implementation. There are currently 2 types of widgets; the KyberWidget that extends your platform's functionality with decentralised token swaps and the Sign In Widget that allows users who are registered with us to log into your platform.

## Overview
There are a total of 3 tutorials that will be covered in this guide; the first is a [HTML / JS KyberWidget](#kyberwidget-html-js) integration guide, the second is an [iOS KyberWidget](#kyberwidget-ios) integration guide and the last will be a guide on using the [Sign In Widget](#sign-in-widget). Please select the tutorial that is most appropriate for you.

### KyberWidget (HTML/JS)
In this guide, we will be implementing a `swap` pop up widget to enable the users of my platform with the ability to purchase any tokens.
#### Things to note
* The widget generator is not mandatory for use; it merely provides a quick way to specify the required parameters and settings.

#### Specify Parameters in KyberWidget Generator
1. Open https://developer.kyber.network/docs/WidgetGenerator/ in a new tab.
2. Select `Swap` under **Widget Type** and `Popup` under **Widget Mode** fields.
3. Enter your callback url into the **Callback URL** field which will be called after the transaction has been broadcasted. For example
```
https://kyberpay-sample.knstats.com/callback
```
4. Under the **Network** field, select the network to run the widget on. It is recommended to do some testing on one of the testnets first like `Ropsten` first prior to running it on `Mainnet`.
5. Enter the default pair in the **Default Pair** field. For example
```
ETH_DAI
```
6. If you have registered your wallet address via the [fee sharing program](integrations-feesharing.md), enter your wallet address in the **Commission-receiving Address** field to receive some of the fees as commission.
7. Lastly, if there are parameters to be passed into the callback function, input them into the **Extra Params** field.
8. Once that is completed, click on the **HTML Source** button.

#### Add the stylesheet used for the KyberWidget
In the <head> tag, add the stylesheet link that appears in the source code. For example
```HTML
<head>
    ... (some code in head)
    <link rel='stylesheet' href='https://widget.kyber.network/v0.6.1/widget.css'>
</head>
```

#### Add the javascript file used for the KyberWidget
Before the end of the <body> tag, add the script link that appears in the source code. For example
```HTML
<body>
    ... (some code in body)
    <script async src='https://widget.kyber.network/v0.6.1/widget.js'></script>
</body>
```

#### Add the code that represent the KyberWidget
Wherever you want to use the KyberWidget button, add the <a href></a> tag that appears in the source code. For example
```HTML
<body>
		... (some code in body)
    <div>
        <a href='https://widget.kyber.network/v0.6.1/?type=swap&mode=popup&callback=https%3A%2F%2Fkyberpay-sample.knstats.com%2Fcallback&paramForwarding=true&network=ropsten&defaultPair=ETH_DAI&commissionId=0x0000111122223333444455556666777788889999&productImage=https://images.unsplash.com/photo-1518791841217-8f162f1e1131&theme=theme-emerald'
class='kyber-widget-button theme-emerald theme-supported' name='KyberWidget - Powered by KyberNetwork' title='Pay with tokens'
target='_blank'>Swap tokens</a>
    </div>
<body>
```
Once this step is completed, you can refresh your website and the KyberWidget button should appear as implemented.

### KyberWidget (iOS)
In this guide, we will be learning how to add the KyberWidget into your iOS app. Currently, you have to manually add KyberWidget into your project. [Cocoapods](https://cocoapods.org/) will be available soon.

Additionally, we will also cover how you can customise the colour scheme and string of the widget and how you can create your own UI.
#### Things to note
* The guide uses ersion Swift 4 for APIKit framework.
* iCloud must be enabled in your capabilities as the framework is using document picker (for importing JSON file).

#### Download the KyberWidget source code
Download the zip file [here](https://github.com/KyberNetwork/widget-swift/tree/master/KyberWidget/KyberWidget.framework.zip) (then unzip to get `KyberWidget.framework`) or clone this repo to get `KyberWidget.framework` from KyberWidget or example project

#### Add KyberWidget into your project
Go to your project `General settings`, add KyberWidget into `Embedded Binaries`.

#### Add the dependency frameworks
Add these dependency frameworks below into your project via ([Cocoapods](https://cocoapods.org/)):
```swift
  pod 'Moya', '~> 10.0.1'
  pod 'BigInt', '~> 3.0'
  pod 'APIKit'
  pod 'MBProgressHUD'
  pod 'TrustKeystore', '~> 0.4.2'
  pod 'TrustCore', '~> 0.0.7'
  pod 'JSONRPCKit', :git=> 'https://github.com/bricklife/JSONRPCKit.git'
  pod 'IQKeyboardManager'
  pod 'KeychainSwift'
  pod 'QRCodeReaderViewController', :git=>'https://github.com/yannickl/QRCodeReaderViewController.git', :branch=>'master'
  pod 'JavaScriptKit', '~> 1.0'
```

NOTE: It is important to put the following codes into pod file as well:

```swift
post_install do |installer|
  installer.pods_project.targets.each do |target|
    if ['JSONRPCKit'].include? target.name
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_VERSION'] = '3.0'
      end
    end
    if ['TrustKeystore'].include? target.name
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_OPTIMIZATION_LEVEL'] = '-Owholemodule'
      end
    end
  end
end
```

#### Import KyberWidget into your code

```swift
import KyberWidget
```

#### Define KWCoodinator instance

```swift
fileprivate var coordinator: KWCoordinator?
```

#### Create KWCoordinator instance

First, you need to create and initialize the `KWCoordinator` instance.
There are 3 sub-classes `KWPayCoordinator`, `KWSwapCoordinator`, and `KWBuyCoordinator` corresponding to 3 use cases. You should only use these 3 classes depending on your purpose.

Please note that the values are **for example** only. For more details on the parameters used, please refer [here](references-kyberwidget.md).

To use the widget for `pay` use case:

```swift
do {
  self.coordinator = try KWPayCoordinator(
    baseViewController: self,
    receiveAddr: "0x2262d4f6312805851e3b27c40db2c7282e6e4a49",
    receiveToken: "ETH",
    receiveAmount: 0.001604,
    pinnedTokens: "ETH_KNC_DAI",
    network: KWEnvironment.ropsten, // ETH network, default ropsten
    signer: nil,
    commissionId: nil,
    productName: "",
    productAvatar: "https://pbs.twimg.com/media/DVgWFLTVwAAUarj.png",
    productAvatarImage: nil
  )
} catch {}
```

To use the widget for `swap` use case:

```swift
do {
  self.coordinator = try KWSwapCoordinator(
    baseViewController: self,
    pinnedTokens: "ETH_KNC_DAI",
    defaultPair: "ETH_KNC",
    network: KWEnvironment.ropsten, // ETH network, default ropsten
    signer: nil,
    commissionId: nil
  )
} catch {}
```

To use the widget for `buy` use case:

```swift
do {
  self.coordinator = try KWBuyCoordinator(
    baseViewController: self,
    receiveToken: "ETH",
    receiveAmount: 0.001604,
    pinnedTokens: "ETH_KNC_DAI",
    network: KWEnvironment.ropsten, // ETH network, default ropsten
    signer: nil,
    commissionId: nil
  )
} catch {}
```

#### Showing the Widget
Please ensure that your delegate class has implemented these 3 functions:
- coordinatorDidCancel()
- coordinatorDidFailed(with error: KWError)
- coordinatorDidBroadcastTransaction(with txHash: String)

Once done, set `delegate` and show the widget.
```swift
// set delegate to receive transaction data
self.coordinator?.delegate = self

// show the widget
self.coordinator?.start()
```

#### Customize color theme and string
##### Theme
Get current `KWThemeConfig` instance.
```swift
let config = KWThemeConfig.current
```
From here you could config the color by your own choice. Go to `KWThemeConfig` class to see all available attributes that you could change the color.

##### String
Similar to `KWThemeConfig`, using `KWStringConfig` to config the string.

```swift
let config = KWStringConfig.current
config.youAreAboutToPay = "You are going to buy"
```

The string "*You are about to pay*" should be changed to "*You are going to buy*"

#### Create your own UIs
You could also create your own UIs and use our helper functions to get list of supported tokens, get expected rate between tokens, get balance of ETH/token given the address, sign the transaction and send transfer/trade functions.

**Supported Tokens**
To get Kyber supported tokens, call:
```swift
KWSupportedToken.shared.fetchTrackerSupportedTokens(network: KWEnvironment, completion: @escaping (Result<[KWTokenObject], AnyError>) -> Void)
```

Return list of supported tokens by Kyber or error otherwise.

**Current gas price**
Get current fast/standard/slow gas price using our server cache

`func performFetchRequest(service: KWNetworkProvider, completion: @escaping (Result<JSONDictionary, AnyError>) -> Void)`
Use `_KWNetworkProvider.gasGasPrice_` as service.

**Keystore**
Create a `KWKeystore` instance to help import wallet, get current account, sign transaction, etc

```swift
let keystore = try KWKeystore()
```
Available functions in `KWKeystore`:

```swift
var accounts: [Account] // list of accounts imported
var account: Account? // return first imported account
func removeAllAccounts(completion: @escaping () -> Void)//  remove all imported accounts
func importWallet(type: KWImportType, completion: @escaping (Result<Account, KWKeystoreError>) -> Void) // import an account of `KWImportType` (Check this file)
func delete(account: Account, completion: @escaping (Result<Void, KWKeystoreError>) -> Void) // delete an account
func signTransaction(transaction: KWDraftTransaction) -> Result<Data, KWKeystoreError> // sign a transaction
```

**External Provider**

`let externalProvider = KWExternalProvider(keystore: keystore, network: network)`: init `KWExternalProvider` with an instance of keystore and network.

External Provider provides all functions needed to perform a payment, or to use KyberSwap.

Some useful functions:

```swift
func getETHBalance(address: String, completion: @escaping (Result<BigInt, AnyError>) -> Void)
func getTokenBalance(for contract: Address, address: Address, completion: @escaping (Result<BigInt, AnyError>) -> Void)
func getTransactionCount(for address: String, completion: @escaping (Result<Int, AnyError>) -> Void)
func transfer(transaction: KWTransaction, completion: @escaping (Result<String, AnyError>) -> Void)
func exchange(exchange: KWTransaction, completion: @escaping (Result<String, AnyError>) -> Void)
func pay(transaction: KWTransaction, completion: @escaping (Result<String, AnyError>) -> Void)
func getAllowance(token: KWTokenObject, address: Address, isPay: Bool, completion: @escaping (Result<BigInt, AnyError>) -> Void)
func sendApproveERC20Token(exchangeTransaction: KWTransaction, isPay: Bool, completion: @escaping (Result<Bool, AnyError>) -> Void)
func getExpectedRate(from: KWTokenObject, to: KWTokenObject, amount: BigInt, completion: @escaping (Result<(BigInt, BigInt), AnyError>) -> Void)
func getTransferEstimateGasLimit(for transaction: KWTransaction, completion: @escaping (Result<BigInt, AnyError>) -> Void)
func getSwapEstimateGasLimit(for transaction: KWTransaction, completion: @escaping (Result<BigInt, AnyError>) -> Void)
func getPayEstimateGasLimit(for transaction: KWTransaction, completion: @escaping (Result<BigInt, AnyError>) -> Void)
func estimateGasLimit(from: String, to: String?, gasPrice: BigInt, value: BigInt, data: Data, defaultGasLimit: BigInt, completion: @escaping (Result<BigInt, AnyError>) -> Void)
```

Please check `KWExternalProvider` and `KWGeneralProvider` for more details.


### Sign In Widget
#### Things to note
* The Kyber Sign-in Widget conforms with the OAuth 2.0 specs, so it can be used with existing oauth2.0-support libraries/frameworks.
* The widget is under development, and is provided to partners for early testing.

#### Prerequisites
* A KYCed account with KyberSwap is required for testing. You can do so at https://kyberswap.com/users/sign_up?normal=true.
* Your `APP_ID` and `APP_SECRET`. This is given upon registration of a Kyber developer account. Find out more [in this section](#developer-registration).

#### Scenario 1: Create Sign-In Widget for Users
#### Configure Sign-In Widget Parameters
The widget URL format is <br>
`https://kyberswap.com/oauth/authorize?client_id=APP_ID&redirect_uri=REDIRECT_URI&response_type=code&state=CUSTOM_TOKEN` where
* `client_id` must be your `APP_ID`.
* `redirect_uri` must be a redirect URI associated with `APP_ID` used for registration.
* `request_type` should be “code”, meaning that you request an AUTH_CODE.
* `state` may be anything of your choice. Any value parsed in will be forwarded in `REDIRECT_URI`. We recommend using a `CUSTOM_TOKEN` for server-side authentication of user approval.

For example `https://kyberswap.com/oauth/authorize?client_id=MYAPP123&redirect_uri=https://example.com/callback&response_type=code&state=CUSTOM_TOKEN`

#### Add Widget Into A Website
You may incorporate the link into a button, as shown [in this sample button style](https://codepen.io/thith/full/qYQOpX).
`<a href=“see below”>Sign-in with Kyber</a>`

![Signinwidget](/uploads/signinwidget.png "Signinwidget")

The user will be asked to sign-in with his Kyber account if he has not already done so. Please use your KYCed account with KyberSwap to sign-in.

#### Implement Server Side Logic
1. User Denial
If the user denies authorization, Kyber's servers will send a GET request to `REDIRECT_URI?error=access_denied&error_description=The+resource+owner+or+authorization+server+denied+the+request`.

2. User Approval
If the user approves authorization, Kyber's servers will send a GET request to
`REDIRECT_URI/callback?code=AUTH_CODE&state=CUSTOM_TOKEN`.

Before proceeding with the authentication, a check can be performed on `CUSTOM_TOKEN` to verify that it is the same as the one provided in the callback URI.

#### Obtain an `ACCESS_TOKEN`
Upon user approval, you can make a POST request with the `AUTH_CODE` provided in the callback URI to query for an `ACCESS_TOKEN`.
```
POST https://kyberswap.com/oauth/token
grant_type=authorization_code&
code=AUTH_CODE&
redirect_uri=REDIRECT_URI&
client_id=APP_ID&
client_secret=APP_SECRET
```

**Note:**
* In order to keep `APP_SECRET` private, this code should **only** be executed server-side.
* `REDIRECT_URI` must be the same one previously used to obtain the `AUTH_CODE`.

The server will reply with an `ACCESS_TOKEN` and expiration time (in seconds):
```json
{
	"token_type": "bearer",
	"access_token": "ACCESS_TOKEN",
	"expires_in": 3600,
	"refresh_token": "xxx"
}
```
or if there is an error:
```json
{
	"error": "invalid_request"
}
```

#### Obtain User Information
`ACCESS_TOKEN` can be used to call Kyber's APIs using 1 of the following 2 methods:
1. Add request header authorization: Bearer `ACCESS_TOKEN` (recommended)
2. Include `access_token=ACCESS_TOKEN` as a GET or POST parameter

For simplicity, we will call the `/user_info` API using the second method.
```
https://kyber.network/api/user_info?access_token=ACCESS_TOKEN
```

Example Output
```json
{
	"name": "Satoshi Nakamoto",
	"uid": 42,
	"contact_type": "telegram",
	"contact_id": "250735569",
	"active_wallets": [
		"0x8fa07f46353a2b17e92645592a94a0fc1ceb783f",
		"0x8fa07f46353a2b17e92645592a94a0fc1ceb7833",
	],
	"kyc_status": "approved",
	"avatar_url": "https://t.me/i/userpic/320/satoshi.jpg"
}
```

**Note:**
* `contact_type` should be email or telegram. For Telegram users, `contact_id` is his/her telegram ID (number, not the @username).
* `kyc_status`: Either `pending`, `approved` or `none`. If a user has not yet submitted KYC, or his/her KYC was rejected, none is returned.
* One user could have up to 3 addresses. If no address registered, an empty array is returned.

If `ACCESS_TOKEN` is invalid, HTTP status code 401 is returned. In that case, it is likely that the token has expired. You should use the refresh token provided to renew the token (see [https://auth0.com/learn/refresh-tokens/](https://auth0.com/learn/refresh-tokens)).

Other errors will return:
```json
{
	"error": "reason"
}
```

#### Scenario 2: Obtaining list of authorized users
Suppose you want to obtain all Kyber users who have authorized your application. Users who had authorized your application, but subsequently revoked the authorization, will not be included.

#### Obtain an `ACCESS_TOKEN`
As we will be calling an application-access API, an application token should be obtained instead of a user token. Application-access APIs are APIs designed for applications, and are not bound to a specific user.
```
POST https://kyberswap.com/oauth/token
grant_type=client_credentials&
client_id=APP_ID&
client_secret=APP_SECRET
```

The server will reply with an `ACCESS_TOKEN` and expiration time (in seconds):
```json
{
	"token_type": "bearer",
	"access_token": "ACCESS_TOKEN",
	"expires_in": 3600,
	"refresh_token": "xxx"
}
```
or if there is an error:
```json
{
	"error": "invalid_request"
}
```

#### Call `/authorized_users` endpoint
`ACCESS_TOKEN` can be used to call Kyber's APIs using 1 of the following 2 methods:
1. Add request header authorization: Bearer `ACCESS_TOKEN` (recommended)
2. Include `access_token=ACCESS_TOKEN` as a GET or POST parameter

For simplicity, we will call the `/authorized_users` API using the second method. Refer to [this section](#authorized-users) for possible path parameters to parse.
```
https://kyberswap.com/api/authorized_users&access_token=ACCESS_TOKEN
```
Example Output
```json
{
	"name": "Satoshi Nakamoto",
	"uid": 42,
	"contact_type": "telegram",
	"contact_id": "250735569",
	"active_wallets": [
		"0x8fa07f46353a2b17e92645592a94a0fc1ceb783f",
		"0x8fa07f46353a2b17e92645592a94a0fc1ceb7833",
	],
	"kyc_status": "approved",
	"avatar_url": "https://t.me/i/userpic/320/satoshi.jpg"
}
```

**Note:**
* `contact_type` should be email or telegram. For Telegram users, `contact_id` is his/her telegram ID (number, not the @username).
* `kyc_status`: Either `pending`, `approved` or `none`. If a user has not yet submitted KYC, or his/her KYC was rejected, `none` is returned.
* One user could have up to 3 addresses. If no address registered, an empty array is returned.

If `ACCESS_TOKEN` is invalid, HTTP status code 401 is returned. In that case, it is likely that the token has expired. You should use the refresh token provided to renew the token (see [https://auth0.com/learn/refresh-tokens/](https://auth0.com/learn/refresh-tokens)).

Other errors will return:
```json
{
	"error": "reason"
}
```

## Fee Sharing Program
Wallets have the opportunity to join our *Fee Sharing Program*, which allows fee sharing on each swap that originates from your wallet. Learn more about the program [here](integrations-feesharing.md)!

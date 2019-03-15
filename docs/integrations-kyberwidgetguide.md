---
id: Integrations-KyberWidgetGuide
title: KyberWidget Guide
---
## Introduction
This guide will walk you through on how you can interact with our protocol implementation using our KyberWidget. The most common group of users that can benefit from this guide are vendors and websites.

## Overview
We will be going through 2 scenarios. The first scenario teaches you how to implement a **swap** pop up widget to enable the users of your platform with the ability to purchase any tokens. The second scenario teaches you how you can add KyberWidget into your iOS application and even customise it to fit your app's theme.

## KyberWidget (HTML/JS)
### Things to note
* The widget generator is not mandatory for use; it merely provides a quick way to specify the required parameters and settings.
* The button's text, title, and CSS style can be changed if desired
* You can add multiple buttons into a page for multiple functionalities

### Configuring the KyberWidget
1. Open https://developer.kyber.network/docs/WidgetGenerator/ in a new tab.
2. Select `Swap` under **Widget Type** and `Popup` under **Widget Mode** fields.
3. Enter your callback url into the **Callback URL** field which will be called after the transaction has been broadcasted, like the example below.
```
https://kyberpay-sample.knstats.com/callback
```
4. Under the **Network** field, select the network to run the widget on. It is recommended to do some testing on one of the testnets first like `Ropsten` first prior to running it on `Mainnet`.
5. Enter the default pair in the **Default Pair** field, like the example below.
```
ETH_DAI
```
6. If you have registered your wallet address via the [fee sharing program](integrations-feesharing.md), enter your wallet address in the **Commission-receiving Address** field to receive some of the fees as commission.
7. Lastly, if there are parameters to be passed into the callback function, input them into the **Extra Params** field.
8. Once that is completed, click on the **HTML Source** button.

### Add the stylesheet
In the <head> tag, add the <link> tag as shown in the source code. Refer to the example below.
```HTML
<head>
    ... (some code in head)
    <link rel='stylesheet' href='https://widget.kyber.network/v0.6.2/widget.css'>
</head>
```

### Add the js script file
Before the end of the <body> tag, add the <script></script> tag as shown in the source code. Refer to the example below.
```HTML
<body>
    ... (some code in body)
    <script async src='https://widget.kyber.network/v0.6.2/widget.js'></script>
</body>
```

### Add the KyberWidget code
Wherever you want to use the KyberWidget button, add the <a href></a> tag as shown in the source code. Refer to the example below.
```HTML
<body>
		... (some code in body)
    <div>
        <a href='https://widget.kyber.network/v0.6.2/?type=swap&mode=popup&callback=https%3A%2F%2Fkyberpay-sample.knstats.com%2Fcallback&paramForwarding=true&network=ropsten&defaultPair=ETH_DAI&commissionId=0x0000111122223333444455556666777788889999&productImage=https://images.unsplash.com/photo-1518791841217-8f162f1e1131&theme=theme-emerald'
class='kyber-widget-button theme-emerald theme-supported' name='KyberWidget - Powered by KyberNetwork' title='Pay with tokens'
target='_blank'>Swap tokens</a>
    </div>
<body>
```
Once this step is completed, you can serve up your website and the KyberWidget button should appear as implemented.

## KyberWidget (iOS)
### Things to note
* You have to manually add KyberWidget into your project. [Cocoapods](https://cocoapods.org/) will be available soon.
* The guide uses version Swift 4 for APIKit framework.
* iCloud must be enabled in your capabilities as the framework is using document picker (for importing JSON files).

### Download the source code
Download the zip file [here](https://github.com/KyberNetwork/widget-swift/tree/master/KyberWidget/KyberWidget.framework.zip) (then unzip to get `KyberWidget.framework`) or clone this repo to get `KyberWidget.framework` from KyberWidget or example project

#### Add KyberWidget into your project
Go to your project `General settings` and add KyberWidget into `Embedded Binaries`.

### Add the dependency frameworks
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

### Import KyberWidget into your code
```swift
import KyberWidget
```

### Define KWCoordinator instance
```swift
fileprivate var coordinator: KWCoordinator?
```

### Create KWCoordinator instance
First, you need to create and initialize the `KWCoordinator` instance.
There are 3 sub-classes `KWPayCoordinator`, `KWSwapCoordinator`, and `KWBuyCoordinator` corresponding to 3 use cases. You should only use these 3 classes depending on your purpose. You may find more information about the different use cases [here](references-kyberwidget.md).

Please note that the values are **for illustration purposes** only.

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

**Note:** Should any parameter be invalid, an error will be thrown via delegation.

### Delegation - `KWCoordinatorDelegate`
Please ensure that your delegate class (`KWCoordinatorDelegate`) has implemented these 3 functions:
#### 1. `coordinatorDidCancel()`
This function is called when the user cancels the action.

#### 2. `coordinatorDidFailed(with error: KWError)`
This function is called in the event of an error. Refer to [this section](references-kyberwidget.md#error-cases-to-be-handled) for the error / edge cases to be handled by the `coordinatorDidFailed()` function.

#### 3. `coordinatorDidBroadcastTransaction(with txHash: String)`
This function is called when the transaction has been broadcasted to the blockchain. Refer to [this page](https://github.com/KyberNetwork/KyberWidget/blob/master/README.md#how-to-get-payment-status) on checking and confirming the payment status.

### Showing the Widget
Once done, set `delegate` and show the widget.
```swift
// set delegate to receive transaction data
self.coordinator?.delegate = self

// show the widget
self.coordinator?.start()
```

### Customize color theme and string
#### Theme
Get current `KWThemeConfig` instance.
```swift
let config = KWThemeConfig.current
```
You can configure the color here. Go to `KWThemeConfig` class to see all available attributes for changing the color.

#### String
Similar to `KWThemeConfig`, use `KWStringConfig` to configure the text shown in the widget.

```swift
let config = KWStringConfig.current
config.youAreAboutToPay = "You are going to buy"
```

The string "*You are about to pay*" will be changed to "*You are going to buy*"

### Create your own UIs
You can also create your own UIs and use our helper functions to get the list of supported tokens, get expected rate between tokens, get balance of ETH/token given the address, sign the transaction and send transfer/trade functions.

#### Supported Tokens
To get Kyber supported tokens, call:
```swift
KWSupportedToken.shared.fetchTrackerSupportedTokens(network: KWEnvironment, completion: @escaping (Result<[KWTokenObject], AnyError>) -> Void)
```

Returns a list of supported tokens by Kyber or error otherwise.

#### Current gas price
Get current slow / standard / fast gas price using our server cache

```
func performFetchRequest(service: KWNetworkProvider, completion: @escaping (Result<JSONDictionary, AnyError>) -> Void)
```

Use `_KWNetworkProvider.gasGasPrice_` as service.

#### Keystore
Create a `KWKeystore` instance to help import a wallet, get current account, sign transactions, etc

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
Initialize `KWExternalProvider` with an instance of keystore and network.
```
let externalProvider = KWExternalProvider(keystore: keystore, network: network)
```

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

## Fee Sharing Program
You have the opportunity to join our *Fee Sharing Program*, which allows fee sharing on each swap that originates from your platform. Learn more about the program [here](integrations-feesharing.md)!

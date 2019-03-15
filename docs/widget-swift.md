---
id: WidgetSwift
title: KyberWidget iOS Library
---
The KyberWidget iOS library allows developers to easily add crytocurrency payment and swapping features to iOS apps.

## What It Does

The library enables 3 use cases:

- **Pay**: Allow users to buy goods or services in your app, paying with any supported tokens
- **Swap**: Allow users to swap between supported token pairs
- **Buy**: Allow users to buy a given token within your app with any supported token they wish.

The library comes with a standard, ready-to-use UI. It also lets developers customize many UI aspects to fit their needs.

## How to add KyberWidget into your project.
Currently, you have to manually add KyberWidget into your project. [Cocoapods](https://cocoapods.org/) will be available soon.

Download the zip file [here](https://github.com/KyberNetwork/widget-swift/tree/master/KyberWidget/KyberWidget.framework.zip) (then unzip to get `KyberWidget.framework`) or clone this repo to get `KyberWidget.framework` from KyberWidget or example project and add it into your project.

Go to your project `General settings`, add KyberWidget into `Embedded Binaries`.

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

NOTE:
- Please select version Swift 4 for APIKit framework.
- Please enable iCloud in your Capabilities as the framework is using document picker (for importing JSON file).

## Usage

#### Import KyberWidget

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

To use the widget for _pay_ use case:

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
    productQty: nil, // quantity/number of products
    productAvatar: "https://pbs.twimg.com/media/DVgWFLTVwAAUarj.png",
    productAvatarImage: nil,
    paymentData: "PERM" // put empty string if you don't want to pass any value
  )
} catch {}
```

To use the widget for _swap_ use case:

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

To use the widget for _buy_ use case:

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

NOTE: The values are for example only, check out the parameter details below.

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

An error will be throw via delegation if parameters are invalid.

Check our **_Valid use cases_** for more details.

If you want to customize the widget UI, please check **_Customize color theme and string_** section later on this page.

After that, set `delegate` and show the widget.

```swift
// set delegate to receive transaction data
self.coordinator?.delegate = self

// show the widget
self.coordinator?.start()
```

#### Delegation - KWCoordinatorDelegate

The delegate class should implement the following 3 functions.

```swift
func coordinatorDidCancel() {
  // TODO: handle user cancellation
}
```
This function is called when user cancelled the action.

```swift
func coordinatorDidFailed(with error: KWError) {
  // TODO: handle errors
}
```
This function is called when something went wrong, some possible errors (please check our *Valid Use cases* below for more details)
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

In most cases, we provide a meaningful error message for you to either display it to user directly, or use the message to test/debug.

```swift
func coordinatorDidBroadcastTransaction(with txHash: String) {
  // TODO: poll blockchain to check for transaction's status and validity
}
```
This function is called when the transaction was broadcasted to Ethereum network. [Read here](https://github.com/KyberNetwork/KyberWidget/blob/master/README.md#how-to-get-payment-status) for How to check and confirm payment status.


### Customize color theme and string
#### Theme

Get current `KWThemeConfig` instance.
```swift
let config = KWThemeConfig.current
```
From here you could config the color by your own choice. Go to `KWThemeConfig` class to see all available attributes that you could change the color.

#### String

Similar to `KWThemeConfig`, using `KWStringConfig` to config the string.

```swift
let config = KWStringConfig.current
config.youAreAboutToPay = "You are going to buy"
```

The string "*You are about to pay*" should be changed to "*You are going to buy*"

### Create your own UIs

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
func func sendApproveERC20Token(exchangeTransaction: KWTransaction, isPay: Bool, completion: @escaping (Result<Bool, AnyError>) -> Void)
func getExpectedRate(from: KWTokenObject, to: KWTokenObject, amount: BigInt, completion: @escaping (Result<(BigInt, BigInt), AnyError>) -> Void)
func getTransferEstimateGasLimit(for transaction: KWTransaction, completion: @escaping (Result<BigInt, AnyError>) -> Void)
func getSwapEstimateGasLimit(for transaction: KWTransaction, completion: @escaping (Result<BigInt, AnyError>) -> Void)
func getPayEstimateGasLimit(for transaction: KWTransaction, completion: @escaping (Result<BigInt, AnyError>) -> Void)
func estimateGasLimit(from: String, to: String?, gasPrice: BigInt, value: BigInt, data: Data, defaultGasLimit: BigInt, completion: @escaping (Result<BigInt, AnyError>) -> Void)
```

Please check `KWExternalProvider` and `KWGeneralProvider` for more details.

## Valid use cases

##### Pay Widget

- **receiveAddr** - **required**: must be a valid ETH address with 0x prefix
- **receiveToken** - **required**: must be a supported token symbol by KyberNetwork

##### Swap Widget
- **receiveAddr**, **receiveToken** and **receiveAmount** are all ignored

##### Buy Widget
- **receiveToken** - **required**:  must be a supported token symbol by KyberNetwork

Other parameters are optional.

NOTE:
  - In any cases, **receiveAmount** will be ignored if **receiveToken** is empty.
  - `func coordinatorDidFailed(with error: KWError)` will be immediately called after you `start` the coordinator if any parameters are invalid.

## Supported tokens
See all supported tokens [here](https://tracker.kyber.network/#/tokens)

## Acknowledgement
The KyberWidget iOS uses following open source softwares:

- [Moya](https://github.com/Moya/Moya)
- [BigInt](https://github.com/attaswift/BigInt)
- [APIKit](https://github.com/ishkawa/APIKit)
- [MBProgressHUD](https://github.com/jdg/MBProgressHUD)
- [TrustKeystore'](https://github.com/TrustWallet/trust-keystore)
- [TrustCore](https://github.com/TrustWallet/trust-core)
- [JSONRPCKit](https://github.com/bricklife/JSONRPCKit.git)
- [IQKeyboardManager](https://github.com/hackiftekhar/IQKeyboardManager)
- [KeychainSwift](https://github.com/evgenyneu/keychain-swift)
- [QRCodeReaderViewController](https://github.com/yannickl/QRCodeReaderViewController.git)
- [JavaScriptKit](https://github.com/alexaubry/JavaScriptKit)

Special thank to [TrustWallet](https://github.com/TrustWallet) team for their awesome works

## License

KyberWidget is available under MIT License, see [LICENSE](https://github.com/KyberNetwork/widget-swift/blob/master/LICENSE)  file for more information.

## Bugs/Features report

Please feel free to submit bugs report or any features you want to have in our KyberWidget by opening a Github issue.

## Swift 4.2, Xcode 10

Please upgrade your pod by using commands:

```swift
pod repo update
pod install
```

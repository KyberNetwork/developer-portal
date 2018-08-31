---
id: WidgetSwift
title: KyberWidget iOS Library
---
The KyberWidget iOS library allows developers to easily add cryptocurrency payments and swapping features to iOS apps.

## What does it do

The library enables 2 use cases:

- **Payment**: Allow users to buy goods or services from within your app,  paying with any tokens supported by KyberNetwork
- **Swap**: Allow users to swap between token pairs supported by KyberNetwork

The library shipped with a standard, ready-to-use UI. It also lets developers customize many aspects of UI to fit their needs.

## How to add KyberWidget into your project.

Currently you have to manually add KyberWidget into your project (will be available soon in [Cocoapods](https://cocoapods.org/)).

Download the zip file [here](https://github.com/KyberNetwork/widget-swift/tree/master/KyberWidget/KyberWidget.framework.zip) (then unzip to get `KyberWidget.framework`) or clone this repo to get `KyberWidget.framework` from KyberWidget or example project and add it into your project. 

Go to your project `General settings`, add KyberWidget into `Embedded Binaries`.

Add these dependency frameworks below into your project via ([Cocoapods](https://cocoapods.org/):
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

First, you need to create and initialize the `KWCoordinator` instance. There are 2 sub-classes `KWPaymentCoordinator` and `KWSwapCoordinator` and you should use these 2 classes depend on your purpose.

To use the widget for _swap_ use case:

```swift
do {
  self.coordinator = try KWSwapCoordinator(
    baseViewController: UIViewController,
    receiveToken: String?,
    network: KWEnvironment,
    signer: String?,
    commissionID: String?
  )
 } catch {}
```

To use the widget for _payment_ use case:

```swift
  do {
      self.coordinator = try KWPaymentCoordinator(
        baseViewController: UIViewController,
        receiveAddr: String?,
        receiveToken: String?,
        receiveAmount: Double?,
        network: KWEnvironment,
        signer: String?,
        commissionID: String?
      )
  } catch {}
```

***Parameter details:***

- ***baseViewController*** (UIViewController) - **required** - This is the base view controller, used to present the navigation controller of the _swap_ or _payment_ widget.

- ***receiveAddr*** (String) - **required** - For _payment_ use case, this is the vendor's Ethereum wallet address with 0x prefix which user's payment will be sent there. *Must double check this param very carefully*. For _swap_ use case, please set this parameter as *self*.

- ***receiveToken*** (String) - **required for _payment_ use case** - token that you (vendor) want to receive, it can be one of supported tokens (such as ETH, DAI, KNC...).

- ***receiveAmount*** (Double) - the amount of `receiveToken` you (vendor) want your user to pay. If you leave it blank or missing, the users can specify it in the widget interface. It could be useful for undetermined payment or pay-as-you-go payment like a charity, ICO or anything else. This param is ignored if you do not specify `receiveToken`.

- ***network*** (KWEnvironment - default `ropsten`) - ethereum network that the widget will run. Possible value: `mainnetTest, production, staging, ropsten, kovan`.

- ***signer*** (String) - concatenation of a list of ethereum address by underscore `_`, eg. 0xFDF28Bf25779ED4cA74e958d54653260af604C20_0xFDF28Bf25779ED4cA74e958d54653260af604C20 - If you pass this param, the user will be forced to pay from one of those addresses.

- ***commissionID*** - (String - Ethereum address) - your Ethereum wallet to get commission of the fees for the transaction. Your wallet must be whitelisted by KyberNetwork (the permissionless registration will be available soon) in order to get the commission, otherwise it will be ignored.

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
- `invalidAmount(errorMessage: String)`: the receive amount is not valid (negative, zero, ...), or if you are performing _swap_, the receive amount must be empty.
- `failedToLoadSupportedToken(errorMessage: String)`: something went wrong and we could not load supported tokens by Kyber.
- `failedToSendPayment(errorMessage: String)`: Could not send payment request.

In most cases, we provide a meaningful error message for you to either display it to user directly, or use the message to test/debug.

```swift
func coordinatorDidBroadcastTransaction(with txHash: String) {
  // TODO: poll blockchain to check for transaction's status and validity
}
```
This function is called when the transaction was broadcasted to Ethereum network. [Read here](https://github.com/KyberNetwork/KyberWidget/blob/master/README.md#how-to-get-payment-status) for How to check and confirm payment status.


### Customize color theme and string
#### Theme

Get current `KWThemeConfig` intance.
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

The string *You are about to pay* should be changed to *You are going to buy*

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
func transfer(transaction: KWPayment, completion: @escaping (Result<String, AnyError>) -> Void)
func exchange(exchange: KWPayment, completion: @escaping (Result<String, AnyError>) -> Void)
func getAllowance(token: KWTokenObject, address: Address, completion: @escaping (Result<Bool, AnyError>) -> Void)
func sendApproveERC20Token(exchangeTransaction: KWPayment, completion: @escaping (Result<Bool, AnyError>) -> Void)
func getExpectedRate(from: KWTokenObject, to: KWTokenObject, amount: BigInt, completion: @escaping (Result<(BigInt, BigInt), AnyError>) -> Void)
func getTransferEstimateGasLimit(for transaction: KWPayment, completion: @escaping (Result<BigInt, AnyError>) -> Void)
func getSwapEstimateGasLimit(for transaction: KWPayment, completion: @escaping (Result<BigInt, AnyError>) -> Void)
func estimateGasLimit(from: String, to: String?, gasPrice: BigInt, value: BigInt, data: Data, defaultGasLimit: BigInt, completion: @escaping (Result<BigInt, AnyError>) -> Void)
```

## Valid use cases

##### Payment Widget

- **receiveAddr**: must be a valid ETH address with 0x prefix
- **receiveToken**: must be a supported token symbol by Kyber
- **receiveAmount**: an optional value

##### Swap Widget
- **receiveAddr**: must be set to `self`. If you use `KWSwapCoordinator`, you can see that there is no field for `receiveAddr` as we will set it as `self` for you.
- **receiveToken**: an optional value to allow your users to choose the receive token as it is swapping.
- **receiveAmount**: must be empty since we are not supporting swapping tokens with fixed receive amount.

NOTE: 
  - In any cases, **receiveAmount** will be ignored if **receiveToken** is empty.
  - `func coordinatorDidFailed(with error: KWError)` will be immediately called after you `start` the coordinator if any parameters are invalid.

## Supported tokens
See all supported tokens [here](https://tracker.kyber.network/#/tokens)

## Acknowledgement
The KyberWidget iOS uses the ollowing open source softwares:

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
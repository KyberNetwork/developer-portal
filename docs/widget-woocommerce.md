---
id: WidgetWooCommerce
title: WooCommerce Plugin
---

## Introduction

KyberWidget WooCommerce plugin allows developers to easily add a cryptocurrency payment gateway to Wordpress sites.


## Pre-requisites

* PHP version 5.6+
* WordPress 3.8+
* WooCommerce 3.0+


## Installation

### From Source
1. Clone code repo to your `/wp-content/plugins/`

```sh
cd <PATH>/wp-content/plugins/
git clone https://github.com/KyberNetwork/widget-woocommerce
```

2. Install required components

```sh
composer install
```

3. Activate the plugin

### From ZIP file
1. Download the plugin zip file from [here](https://github.com/KyberNetwork/widget-woocommerce/releases/)

2. Unzip to your WordPress folder `/wp-content/plugins`

3. Activate plugin in `/wp-admin/plugins.php`

## Usage

After activation, you will find plugin settings in your WordPress Dashboard under WooCommerce->Payment. Enabling the plugin will add an option to pay by tokens on your checkout page.


## Configuration

The configuration in this plugin are based on the widget configuration from the [Widget Generator](https://developer.kyber.network/docs/WidgetGenerator/) and modified to fit the WooCommerce model. Plugin settings include:

![WooCommerce Config](/uploads/woocommerce-1.png "Woocommerce Config")

| Parameter                                  | Description                                                                                                                       | Example |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------ |
| `Title`                                    | The title to be displayed for the KyberWidget WooCommerce payment option for users in the checkout pages.          | Kyber Payment Gateway |
| `Description`                       | Describe what payment gateway is for, and will be displayed under the payment options.                             | Pay with tokens |
| `Receive Address`              | Wallet address where you want to receive the payment. This address is required. Without this address payment will not be processed | 0xf6d420FAB01826386e39664770299eADD68617da |
| `Receive Token Symbol`   | Token symbol of the token you want to receive from payments. The token must be supported by Kyber Network.         | KNC |
| `Network`                               | ETH network that the payment gateway will run in. Options are: `Ropsten` (for testing), `Mainnet` (for production) | Ropsten |
| `Mode`                                      | Behavior of how the widget will appear to the user. Either `tab`, `popup`, or `iframe`                             | popup |
| `Network Node Endpoint` | Node endpoint to check tx status. If you do not have one, create one using [Infura](https://infura.io/)            | https://ropsten.infura.io/v3/fb1b33 |
| `Block Confirmation`       | Number of block confirmations to finalize tx                                                                       | 40 |
| `Commission ID`                  | Registered ETH address that is part of the [fee sharing program](guide-feesharing.md)                              | 0x2B522cABE9950D1153c26C1b399B293CaA99FcF9 |


These parameters are defined in the widget as payment gateway settings in Woocommerce and also defined in the source file `kyber-settings.php`.

The main logic of handling payments through the widget is defined in the source file `class-woo-kyber-payment-gateway.php`.


## Sample Walkthrough

This plugin allows an e-commerce website using WooCommerce to accept payments with any token. Below is a sample walkthrough to use this plugin after installation and activation.

1. Configure plugin settings.

![WooCommerce Config](/uploads/woocommerce-1.png "Woocommerce Config")

2. Set item prices in fiat.

![Woocommerce Prices](/uploads/woocommerce-2.png "Woocommerce Prices")

3. Item prices will be displayed in fiat.

![Woocommerce Display](/uploads/woocommerce-3.png "Woocommerce Display")

4. When checking out, pay your shopping cart using any token by selecting the Kyber Payment Gateway option.

![Woocommerce Checkout](/uploads/woocommerce-4.png "Woocommerce Checkout")

5. When the user pays for his shopping cart using the Kyber Payment Gateway, the KyberWidget will handle the rest. With the KyberWidget, user can pay using any tokens (supported by Kyber) and you (the vendor) will receive the token of your choice.

![Woocommerce Widget](/uploads/woocommerce-5.png "Woocommerce Widget")

6. The widget will return the transaction hash for the payment. The plugin will use this transaction hash for checking the transaction status.

![Woocommerce Broadcasted](/uploads/woocommerce-6.png "Woocommerce Broadcasted")

7. When the transaction succeeds, the order status will change from `On-Hold` to `Processing`. At this stage, the website admin or vendor will receive a notification about the successful payment of the cart, and will start processing the shipment of the products.

![Woocommerce Status](/uploads/woocommerce-7.png "Woocommerce Status")

8. When the transaction fails, the order status will change from `On-Hold` to `Failed`.


## Orders

### Status
The order's status follows the [Managing Orders](https://docs.woocommerce.com/document/managing-orders/) flow from WooCommerce. However, when the order is in `On-Hold` status, this plugin will monitor the transaction hash using the [monitor-eth-tx](https://packagist.org/packages/tranbaohuy/monitor-eth-tx/) library.

### Flow
`Order created` -> `Pending payment` -> `On-Hold` (payment broadcasted & mornitored) -> `Processing` (successful payment) OR `Failed` (failed payment)


## Contribution Guidelines

If you are a developer and want to contribute, please check out the following guidelines for contributing to the Woocommerce Kyber Widget repository.

* [Reporting Bugs](https://github.com/KyberNetwork/widget-woocommerce/blob/master/bug_report.md/)
* [Featured Requests](https://github.com/KyberNetwork/widget-woocommerce/blob/master/feature_request.md/)

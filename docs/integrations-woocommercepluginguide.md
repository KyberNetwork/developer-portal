---
id: Integrations-WooCommercePluginGuide
title: WooCommerce Plugin Guide
---
## DISCLAIMER
**All code snippets in this guide have not been audited and should not be used in production. If so, it is done at your own risk.**

## Introduction
This guide will walk you through on how you can interact with our protocol implementation using our WooCommerce plugin. The most common group of user that can benefit from this guide are vendors that use WordPress for their e-commerce websites.

## Prerequisites
* PHP version 7.2+
* WordPress 3.8+
* WooCommerce 3.0+

## Installing the plugin
### Option A: Clone Github Repo Source
1. Clone the code repo to your `/wp-content/plugins/` directory

```sh
cd <PATH>/wp-content/plugins/
git clone https://github.com/KyberNetwork/widget-woocommerce
```

2. Install the required components
```sh
composer install
```

### Option B: ZIP file
1. Download the plugin zip file [here](https://github.com/KyberNetwork/widget-woocommerce/releases/)

2. Unzip to your WordPress folder `/wp-content/plugins`


## Activating the plugin
Activate the plugin in `/wp-admin/plugins.php`. After activation, you will find the plugin settings in your WordPress Dashboard under the WooCommerce->Payment section. Enabling the plugin will add an option to pay with tokens on the checkout page.


## Configure the plugin
The configuration in this plugin is based on the widget configuration from the [Widget Generator](integrations-widgetgenerator.md), and is modified to fit the WooCommerce model. Information about the plugin settings can be found [here](api_abi-woocommerceplugin.md#plugin-parameters).

For this guide, we use the following settings shown below. You may configure them as you wish.
| Parameter | Example |
| --------- | --------------- |
| `Title`                  | Kyber payment gateway |
| `Description`            | Pay with your coins, tokens supported by Kyber |
| `Receive Address`        | `0xf6d420FAB01826386e39664770299eADD68617da` |
| `Receive Token Symbol`   | KNC |
| `Network`                | Ropsten |
| `Mode`                   | popup |
| `Block Confirmation`     | 40 |
| `Commission ID`          | 0x2B522cABE9950D1153c26C1b399B293CaA99FcF9 |

## Checkout items
When the user pays for his shopping cart using the Kyber Payment Gateway option, the KyberWidget will handle the rest of the process. The user will be able to pay using any tokens supported by Kyber, while you (the vendor) will receive the payment in the token of your choice.

![Woocommerce Widget](/uploads/woocommerce-5.png "Woocommerce Widget")

The widget returns the transaction hash for the payment, which is used by the plugin for checking the transaction status.

![Woocommerce Broadcasted](/uploads/woocommerce-6.png "Woocommerce Broadcasted")

## Check status of transaction
When the transaction succeeds, the order status will change from `On-Hold` to `Processing`. At this stage, the website admin or vendor will receive a notification about the successful payment of the cart, and will start processing the shipment of the products.

![Woocommerce Status](/uploads/woocommerce-7.png "Woocommerce Status")

Should the transaction fail, the order status changes from `On-Hold` to `Failed`.

## Order status and flow
The order's status follows the [Managing Orders](https://docs.woocommerce.com/document/managing-orders/) flow from WooCommerce. However, when the order is in `On-Hold` status, this plugin will monitor the transaction hash using the [monitor-eth-tx](https://packagist.org/packages/tranbaohuy/monitor-eth-tx/) library.

The order status flow is summarised below.
`Order created` -> `Pending payment` -> `On-Hold` (payment broadcasted & mornitored) -> `Processing` (successful payment) OR `Failed` (failed payment)

## Advanced options
Visit the [WooCommerce Plugin API Page](api_abi-woocommerceplugin.md) for more information.

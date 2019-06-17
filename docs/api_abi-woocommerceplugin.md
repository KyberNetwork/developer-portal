---
id: API_ABI-WooCommercePlugin
title: WooCommerce Plugin
---
[//]: # (tagline)
The plugin parameters are defined in the widget as payment gateway settings in Woocommerce and also defined in the source file `kyber-settings.php`. The main logic of handling payments through the widget is defined in the source file `class-woo-kyber-payment-gateway.php`.

## Plugin Parameters
| Parameter |          Description          |     Example     |
| --------- | ----------------------------- | --------------- |
| `Title`   | Title to be displayed for the KyberWidget WooCommerce payment option for users in the checkout pages. | Kyber Payment Gateway |
| `Description` | Describe what the payment gateway is for. It will be displayed under the payment options. | Pay with tokens |
| `Receive Address` | Wallet address to receive the payment. This address is <b>required</b>. Without this address, payment will not be processed | `0xf6d420FAB01826386e39664770299eADD68617da` |
| `Receive Token Symbol`   | Token symbol of the token you want to receive from payments. The token must be supported by Kyber Network. | KNC |
| `Network` | ETH network that the payment gateway will run in. Either `Ropsten` (for testing) or `Mainnet` (for production) | Ropsten |
| `Mode` | Behavior of how the widget will appear to the user. Find out more [here](api_abi-kyberwidget.md#widget-mode). Either `tab`, `popup`, or `iframe` | popup |
| `Block Confirmation` | Number of block confirmations to finalize the transaction. Larger block confirmations mean longer confirmation times, but are more secure | 40 |
| `Commission ID` | Registered ETH address that is part of the [fee sharing program](integrations-feesharing.md) | 0x2B522cABE9950D1153c26C1b399B293CaA99FcF9 |

## Transaction Monitoring
In order to check if the payment is successful, we use the [widget-monitor-php](https://github.com/KyberNetwork/widget-monitor-php) library to monitor the transaction.

This plugin will retrieve the transaction receipt from the blockchain and return its status as well as validate the payment. It provides 2 modes for monitoring the tx status: `useIntervalLoop` or none. The `useIntervalLoop` plugin will continuously query a node to get the tx receipt until it reaches the desired block confirmation number. Note that this approach will consume a lot of server resources if there are many orders on-hold and block confirmation numbers are large.

We recommend using a cronjob to check the order tx status periodically. We are already using wp_cron to monitor every 30 seconds. You can install and use WP Crontrol to view and edit that job.

![Woocommerce Cron](/uploads/woocommerce-8.png "Woocommerce Cron")

### Advanced Options
The cron jobs above will run upon every page load. This approach has 2 main issues:
1) As with any heavy job, it will slow down the page for users
2) It is dependent on the user request to run the cronjob. Therefore, it is recommended to disable the WordPress default cronjob and setup a Linux (server) cronjob using crontab.

Here is a guide on how to do this:

1. Install crontab (if your server does not have it as default). You may need to search for instructions for your distro (Centos, RHEL, etc).

2. Setup crontab.

```sh
crontab -e
```

3. Add the following line in order to run every minute to check the tx status.

```sh
curl http://example.com/wp-cron.php?doing_wp_cron > /dev/null 2>&1
```

Please make sure you use the correct path to wp-cron.php.

Alternatively, you can use WP-cli

```sh
cd /var/www/example.com/htdocs; wp cron event run --due-now > /dev/null 2>&1
```

4. You will need to disable WordPress default wp-cron. Add following to wp-config.php.
```php
define('DISABLE_WP_CRON', true);
```

5. Finally, restart crontab service so the new job can run.
```sh
sudo service cron restart
```

## Contribution Guidelines
If you are a developer and want to contribute, please check out the following guidelines for contributing to the Woocommerce Kyber Widget repository.

* [Reporting Bugs](https://github.com/KyberNetwork/widget-woocommerce/blob/master/bug_report.md/)
* [Featured Requests](https://github.com/KyberNetwork/widget-woocommerce/blob/master/feature_request.md/)

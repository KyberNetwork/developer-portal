---
id: Integrations-KyberWidgetGuide
title: KyberWidget Guide
---
[//]: # (tagline)
## Introduction
This guide will walk you through on how you can interact with our protocol implementation using our KyberWidget. The most common group of users that can benefit from this guide are vendors and websites.

## Overview
This guide teaches you how to implement a **swap** pop up widget to enable the users of your platform with the ability to purchase any tokens.

## KyberWidget
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

### Unlocking Wallet in Widget
If your application has its own wallet, it is recommended for the `New Tab` or `Popup` option to be used as the widget mode, so that the widget is able to detect the web3 instance.

## Fee Sharing Program
You have the opportunity to join our *Fee Sharing Program*, which allows fee sharing on each swap that originates from your platform. Learn more about the program [here](integrations-feesharing.md)!

---
id: Integrations-WidgetsGuide
title: Widget
---
## Introduction
The KyberWidget is a straightforward approach that websites can leverage on to setup a friendly stock user interface; thus expanding the functionality of their platforms by allowing their users to interact with our smart contract implementation.

## Overview
In this guide, we will be covering how you can integrate your website with the KyberWidget.

There are 2 guides; html / js and swift.



## Things to note
1) There are 3 different widget types:

- `Pay` caters to e-commerce sites and vendors who would like to receive cryptocurrencies as payment.
- `Swap` targets parties who wish to provide swapping services on their websites.
- `Buy` is used by platforms who want to allow users to buy a specific token on their website.

2) There are also 3 different display modes that are supported:

- `Popup` will open the widget as an overlay popup. The widget will be inserted directly into the host page's DOM. Use this mode if you want to customize the widget appearance by overriding CSS rules.
- `New Tab` will open the widget in a new browser tab.
- `iFrame` will open the widget inside an iFrame on an overlay popup. Use this mode if you prefer the widget's UI and don't want to override its CSS.

3) The widget generator used in this guide is not mandatory; it merely provides a quick way to specify the required parameters and settings.
4) The button's text, title, and CSS style can be changed if desired.
5) You can add multiple buttons into a page for multiple functionalities.























## Introduction
We explain the widget URL components to be configured below, coupled with a few examples. We also have a [widget generator](integrations-widgetgenerator.md) for ease of configuration.

## Widget Generator
Open https://developer.kyber.network/docs/WidgetGenerator in a new tab. You will see the following interface:

![Widget Generator](/uploads/widgetgenerator.png "Widgetgenerator")

Test out the widget for yourself by clicking on the "Preview" button!

### Things To Note:
- The widget generator is not mandatory for use; it merely provides a quick way to specify the required parameters and settings
- The button's text, title, and CSS style can be changed if desired
- You can add multiple buttons into a page for multiple functionalities

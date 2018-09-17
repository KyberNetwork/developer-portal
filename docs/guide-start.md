---
id: Start
title: Introduction to Kyber Developer Platform
---
<!-- Platforms and applications of all sizes can tap into Kyber's decentralized liquidity network to power their liquidity needs, ranging from inter-token payments to portfolio rebalancing. -->

## Overview

Kyber is building the decentralized liquidity network that allows open contribution of liquidity from token holders. Our Developer Platform enables a whole new class of decentralized applications, including [payments in multiple tokens](usecases-vendors.md), [transparent portfolio rebalancing](usecases-dapps.md), [in-wallet token swap](usecases-wallets.md) and many more.

![How others can work with Kyber Network](/uploads/kyberusecases.png "Use Cases")

Kyber's design offers 3 important properties that are essential to the feasibilities of consumer facing applications.
* Instant confirmation. A transaction happens with instant confirmation if it's sent from on-chain entities like smart contracts. Otherwise, once the transaction is included on the blockchain, the execution triggered by the transaction is immediately confirmed.
* Operation certainty, no transactional risk. Users know the rate and how much liquidity is available before they commit their transaction. There is no settlement uncertainty or counterparty risk.
* Global and diverse pool of different tokens. Kyber welcomes token holders to contribute their token to the liquidity pool. By having their token made available to the liquidity pool, the token will be available in all services integrated with KyberDeveloper.

Our design principle is to focus on the ease of integration, security and transparency for both liquidity providers and projects that want to tap into the liquidity pool to utilise it for their own need. The platform runs entirely on-chain, powered by Ethereum smart contracts. Reserves also keep and contribute liquidity for their token via smart contracts that they control (source code prepared, tested and provided by us). At no point does Kyber controls users’ funds. Hence, users' funds will not be affected, even in hacking incidents. All operations happening in Kyber Network can be publicly verified on the blockchain.

In order to integrate, projects only need to send transaction or message calls to our smart contracts via the public APIs. This makes the integration to on-chain entities like smart contracts seamless and hassle-free, compared to other off-chain or hybrid solutions. In addition, there is no trusted third party introduced in the integration process.

![Overview](/uploads/overview.png "Overview")

At Kyber, we believe in working together with other players in the ecosystem. Hence, the Kyber Developer Platform is built to be application agnostic. Developers can build their own protocol and implement their own application logics, yet easily leverage our liquidity pool by calling to the smart contract using our APIs.

The details about platform specification and integration documentation are available in this website. Should you have any question, feel free to join our telegram group at https://t.me/KyberDeveloper or shoot us an email at hello@kyber.network.

Happy building!

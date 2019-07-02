---
id: Home-TrustModel
title: Trust and Security Model
---
[//]: # (tagline)
## Who should the users trust?

The users are not required to trust anyone because the protocol does not hold their funds (only when a trade is being executed). Additionally, being entirely on-chain allows users to freely verify and audit the smart contracts. For added security, a multisig wallet is used for executing admin actions. Users can also specify a minimum conversion rate to prevent a trade from executing in the event slippage causes the conversion rate of a trading pair to fall below the minimum rate specified.

## Who should the reserves trust?

The reserves are required to trust the Kyber Network administrators. While reserves' funds are not at risk, Kyber Network operators have the ability to halt a reserve's operations within the platform. In addition, the reserve managers should be aware that their reserves could be affected by extreme market conditions like flash crashes or from sub-optimal inventory management (e.g. setting wrong prices or from large exposure to risky tokens).

---
id: Home-TrustModel
title: Trust and Security Model
---
[//]: # (tagline)
## Who should the users trust?

The users are not required to trust anyone because the protocol does not hold their funds (only when a trade is being executed). Additionally, being entirely on-chain allows users to freely verify and audit the smart contracts. For added security, a multisig wallet is used for executing admin actions. 

Users can also specify a minimum conversion rate to prevent a trade from executing in the event slippage causes the conversion rate of a trading pair to fall below the minimum rate specified.

If users trade with Kyber via an affiliate’s interface, they have to check the transaction parameters, especially the *platform fee* charged, because there are no safeguards or sanity checks in the proxy contract.

## Who should reserve managers trust?

The reserves are required to trust the Kyber Network administrators not to perform malicious actions such as:
- Disabling trades without good rationale
- Change the MatchingEngine contract code such that the fairness in the selection of reserves for trades is affected
- Setting reserve rebates to zero without clear communication and coordination.

In addition, the reserve managers should be aware that their reserves could be affected by extreme market conditions like flash crashes or from sub-optimal inventory management (e.g. setting wrong prices or from large exposure to risky tokens).

## Who should Kyber trust?

Kyber Network administrators need to read smart contracts of the reserves and tokens in order to list them on the network contract. They need to ensure that the token contract is not malicious, for example.

## Who should affiliates trust?

Affiliates have to trust Kyber not to set a malicious Kyber Network. For example, a network that doesn’t send the platform fees to the FeeHandler.

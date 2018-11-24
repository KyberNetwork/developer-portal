---
id: TrustModelOverview
title: Trust and Security Model
---
## Who should the user trust?

As the Kyber protocol does not hold the users' funds, there is no need for the user to trust us. Additionally, since our protocol is also entirely on-chain, users are able to freely verify and audit our smart contracts. 

## Who should Kyber Network trust?

For the Kyber protocol to be fully functional, there needs to be at least one reserve offering liquidity at all times. Kyber Network operates a reserve of its own, so one can safely assume smooth, uninterrupted operations. The network operators should also verify the code of KyberReserve.sol and the listed ERC20 tokens.

## Who should the reserves trust?

The reserves are required to trust the Kyber Network administrators. While reserves' funds are not at risk, Kyber Network operators have the ability to halt a reserve's operations within the platform. In addition, the reserve managers should be aware that their reserves could be affected by extreme market conditions like flash crashes or from sub-optimal inventory management (e.g. setting wrong prices or from large exposure to risky tokens).
---
id: TrustModelOverview
title: Trust and Security Model
---
## Who should the user trust?

In general, the user need not trust Kyber Network with their funds. They can provide a minimal conversion rate, which guarantees that their exchange is either executed at this specified rate or at a better one. Otherwise, the entire transaction is reverted. While user funds are not at risk in such cases, they could lose some gas fees due to dishonest behaviors of reserves. For example, large, frequent changes in offered rates, could potentially increase gas fee losses for the user.

## Who should Kyber Network trust?

At this point, for Kyber Network to be fully functional, there needs to be at least one reserve offering liquidity at all times. Kyber Network already operates a reserve of its own, so one can safely assume smooth, uninterrupted operations. The network operator should trust (i.e. read) the code of KyberReserve.sol and the listed ERC20 tokens.

## Who should the reserves trust?

The reserves must trust the honest behavior of Kyber Network administrators. While reserve funds are not at risk, Kyber Network operator has the ability to halt the reserve operations within the platform. In addition, the reserve managers should be aware that their reserves could be affected by extreme market conditions like flash crashes or from sub-optimal inventory management (e.g. setting wrong prices or from large exposure to risky tokens).
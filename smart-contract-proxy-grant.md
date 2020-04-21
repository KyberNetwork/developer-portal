## Title: Smart Contract Proxy For Pool Masters

We are looking for talented developers to build an important extension for the KyberDAO system, a smart contract proxy to allow pool masters to trustlessly operate their pool without the need for deploying additional smart contracts.

This proxy should be audited (audit cost excluded from grant) and ready to be mainnet deployment.

## Description:

Create an KyberDAO proxy that allows pool masters to let pool members claim their designated rewards trustlessly and update fees with sufficient notice times while maintaining full trustlessness.

## Motivation:

The current KyberDAO delegation model allows for non-custodial delegation of KNC, but requires pool masters to have a mechanism for storing, tracking and distributing the rewards for members. 

This smart contract proxy will allow pool masters to settle the above in a trustless manner without deploying any smart contracts of their own.

## Functionality:

- Store the rewards trustlessly in the smart contract
- Allow the users to claim his rewards from the smart contracts
- Track the rewards that has been claimed by the users

## Additional Information:

- See the more detailed [specification doc](https://docs.google.com/document/d/1kKH2RXZDffyLrqORynMNAJ3TJb9Yb2fNYKaNkybZ9E4/edit) for a full 
- The author of this document is [StakeWith.Us](stakewith.us), who will also be advising on the development of this proxy contract. 

## Grant Amount:

- $15K USD in KNC
- Kyber will collaborate with the grantee for the auditing
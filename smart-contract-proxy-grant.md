# Smart Contract Proxy For Pool Master

Developer: [Protofire.io](https://protofire.io/)

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

- See the detailed [specification doc](https://docs.google.com/document/d/1kKH2RXZDffyLrqORynMNAJ3TJb9Yb2fNYKaNkybZ9E4/edit) for a full list of the required functionalities and APIs. 
- The author of this document is [StakeWith.Us](https://stakewith.us/), who will also be advising on the development of this proxy contract. 

## Expected Timeline 

- Testnet and audit ready (End May)
- Mainnet ready (Mid June)
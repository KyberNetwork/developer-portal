# Staking, Voting, Withdrawing Examples 

This document explains the basics of staking and voting, staking more KNC, and withdrawing KNC with 3 examples.

## Basic Staking And Voting

Staking and voting are done in epochs, which sounds scary, but it really just means fixed periods of time, denominated in Ethereum block times. One KyberDAO epoch will be around once every 2 weeks. The exact block number will be determined at a later stage. 

*   Epoch 10: Tom stakes 10,000 KNC. He cannot vote with this stake in this epoch.
*   Epoch 11: He will be able to vote with his 10,000 KNC 
*   Epoch 12:  He will be able to claim his participation reward from the last epoch. There is no need to restake, he can continue to vote. Any unclaimed rewards can be claimed at any moment. 

<img width="841" alt="Screenshot 2020-03-16 at 2 22 50 PM" src="https://user-images.githubusercontent.com/173707/76728444-ab4b9e80-6791-11ea-906a-caa47c50a021.png">

## Staking More KNC

Assuming Tom loves Kyber and decides to play a bigger role in voting:

*   Epoch 13: He buys 5,000 more KNC and stakes it as well. His voting power for this epoch is still the amount staked at the beginning of the epoch, which is 10,000 KNC. 
*   Epoch 14: He can claim rewards for the 10,000 KNC voting power in the previous epoch. Starting from this epoch, he will be voting with 15,000 KNC.
*   Epoch 15: He can claim rewards for the 15,000 KNC that he voted with in the previous epoch


<img width="828" alt="Screenshot 2020-03-16 at 2 22 45 PM" src="https://user-images.githubusercontent.com/173707/76728442-aab30800-6791-11ea-8543-2092170ebedb.png">


## Withdrawing Stakes

If Tom withdraws his stake at any point during the epoch, his voting power (and hence rewards) for that epoch will be counted as the** lowest amount he had after voting**.

For example, in epoch 16, Tom voted while having 15K KNC, then midway through the epoch he withdrew 3K KNC. Although he voted while having 15K KNC, his voting power will only be counted as 12K KNC. So in Epoch 17, he will receive rewards only for 12K KNC. 

<img width="601" alt="Screenshot 2020-03-16 at 2 22 32 PM" src="https://user-images.githubusercontent.com/173707/76728433-a555bd80-6791-11ea-8759-1efcab3e3ea3.png">

If he re-stakes back his 3K KNC to bring his total stake to 15K KNC again, in epoch 17 he will still receive rewards only for 12K KNC.

<img width="612" alt="Screenshot 2020-03-16 at 2 22 36 PM" src="https://user-images.githubusercontent.com/173707/76728441-a981db00-6791-11ea-9461-23078cff0469.png">

In other words, even after voting in epoch 16, Tom needs to voluntarily keep his 15K KNC staked throughout epoch 16 (without withdrawing any amount), in order to claim his full rewards in epoch 17. 

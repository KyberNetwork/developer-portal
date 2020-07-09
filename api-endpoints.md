# Kyber DAO stats

## Overview

This project fetches information from the KyberDAO contracts and shares it through API endpoints

## DAO Smart Contract Events

- KyberDAO contract
```js
event NewCampaignCreated(
    CampaignType campType, uint campID,
    uint startBlock, uint endBlock,
    uint minPercentageInPrecision, uint cInPrecision, uinttInPrecision,
    uint[] options, bytes link
);
event CancelledCampaign(uint campID);
event Voted(address staker, uint epoch, uint campID, uintoption);
event RewardClaimed(address staker, uint epoch, uintperInPrecision);
```

- KyberStaking contract
```js
event Deposited(uint curEpoch, address staker, uint amount);
event Withdraw(uint curEpoch, address staker, uint amount);
event Delegated(address staker, address dAddr, uint epoch, bool isDelegated);
```

- KyberFeeHandler contract
```js
event RewardPaid(address staker, uint amountWei);
```

## Network URL

| Network    | URL                            |
|:----------:|:------------------------------:|
| Mainnet    | https://api.kyber.org          |
| Ropsten    | https://ropsten-api.kyber.org  |

## Index

- [`/dao-info`](#dao-info): General DAO information
- [`/epoch_stats`](#epoch_stats): General epoch information
- [`/campaigns`](#campaigns): All campaigns' information
- [`/campaigns/:id`](#campaignsid): A specific campaign's information
- [`/stakers/:wallet?epoch=[epoch]`](#stakerswalletepochepoch): `wallet`'s information for a specific epoch
- [`/stakers/:wallet/actions`](#stakerswalletactions): All staking, claiming and voting actions executed by `wallet`
- [`/stakers/:wallet/rewards`[(#stakerswalletrewards): `wallet`'s rewards
- [`/stakers/:wallet/votes`](#stakerswalletvotes): `wallet`'s votes
- [`/wallet_info/:address`](#wallet_infoaddress): `wallet`'s information (if any)

## API

### `/dao-info`

(GET) Returns general DAO information, such as the epoch period, no. of stakers, etc.

**Response:**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `epoch_period_in_seconds` | Epoch duration in seconds |
| `first_epoch_start_timestamp` | UNIX timestamp of epoch 1 |
| `total_staker` | Total no. of stakers |
| `total_staked` | Total KNC staked |
| `total_burn` | Total ETH burnt (converted to KNC for burning) |
| `total_rebate` | Total ETH rewarded to reserve for rebates |
| `total_reward` | Total ETH rewarded to stakers |
| `current_epoch` | Current epoch number |
| `current_epoch_voter` | Total no. of voters eligible for voting in current epoch |
| `current_epoch_voted` | Total no. of ppl who voted in current epoch |
| `current_epoch_burn` | ETH allocated for burning for current epoch |
| `current_epoch_rebate` | ETH allocated for reserve rebates for current epoch |
| `current_epoch_reward` | ETH allocated for staker rewards for current epoch |

#### Example

```json
> curl "https://ropsten-api.kyber.org/dao-info"
{
  "success": true,
  "data": {
    "epoch_period_in_seconds": 2700,
    "first_epoch_start_timestamp": 1593424406,
    "total_staker": 44,
    "total_staked": 70163.9152281193,
    "total_burn": 0.287314239983705,
    "total_rebate": 0.118501317485456,
    "total_reward": 0.40581555746916,
    "current_epoch": 280,
    "current_epoch_voter": 0,
    "current_epoch_voted": 0,
    "current_epoch_burn": 0.000055781868819261,
    "current_epoch_rebate": 0,
    "current_epoch_reward": 0.00005578186881926
  }
}
```

### `/epoch_stats`

(GET) Returns general information regarding the current epoch

**Response:**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `epoch` | Current epoch number |
| `total_staked` | Total KNC staked |
| `burn` | ETH allocated for burning for current epoch |
| `rebate` | ETH allocated for reserve rebates for current epoch |
| `reward` | ETH allocated for staker rewards for current epoch |

#### Example

```json
> curl "https://ropsten-api.kyber.org/epoch_stats"
{
  "success": true,
  "data": [
    {
      "epoch": 280,
      "burn": 0.000055781868819261,
      "rebate": 0,
      "reward": 0.00005578186881926,
      "total_staked": 70223.9152281193
    },
    {
    "epoch": 279,
    "burn": 0.000176059308291119,
    "rebate": 0,
    "reward": 0.000176059308291118,
    "total_staked": 69563.9152281192
    },
    ...
  ]
}
```

### `/campaigns`

(GET) Returns information of all campaigns

**Response:**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `campaign_id` | Campaign ID number |
| `campaign_type` | Network, BRR, or general campaign |
| `start_timestamp` | Starting time of the campaign |
| `end_timestamp` | Ending time of the campaign |
| `options` | List of vote options for the campaign |
| `link` | Campaign URL |
| `title` | Campaign Title |
| `desc` | Campaign Description |
| `cancelled` | Whether campaign was cancelled |
| `status` | Campaign status |
| `vote_stats` | JSON of vote statistics (parameters explained below) |

**`vote_status` JSON**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `total_vote_count` | Total vote amount for this campaign |
| `total_address_count` | Total no. of voters for this campaign |
| `options` | Array of vote counts for each option |
| `votes` | Array of voters' statistics (parameters explained below) |

**`votes` array**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `staker` | Voter's wallet address |
| `epoch` | Epoch number of vote |
| `campaign_id` | Same as parent `campaign_id` |
| `option` | Voter's option |
| `power` | Voter's power |
| `staker_name` | Name of voter (if available) |

#### Example

```json
> curl "https://ropsten-api.kyber.org/campaigns"
{
  "success": true,
  "data": [
    {
      "campaign_id": 15,
      "campaign_type": "Fee",
      "start_timestamp": 1593525171,
      "end_timestamp": 1593526705,
      "options": [
        "10",
        "35",
        "25",
        "45"
      ],
      "link": "",
      "title": "",
      "desc": "",
      "cancelled": false,
      "status": "Ended",
      "vote_stats": {
        "total_vote_count": 7.60826672275885,
        "total_address_count": 1,
        "options": [
          {
            "option": 1,
            "vote_count": 7.60826672275885
          }
        ],
        "votes": [
          {
            "staker": "0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A",
            "epoch": 38,
            "campaign_id": 15,
            "option": 1,
            "power": "7608266722758852851",
            "staker_name": "no one"
          }
        ]
      }
    },
    ...
  ]
}
```

### `/campaigns/:id`

(GET) Returns information of a specific campaign

**Response:**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `campaign_id` | Campaign ID number |
| `campaign_type` | Network, BRR, or general campaign |
| `start_timestamp` | Starting time of the campaign |
| `end_timestamp` | Ending time of the campaign |
| `options` | List of vote options for the campaign |
| `link` | Campaign URL |
| `title` | Campaign Title |
| `desc` | Campaign Description |
| `cancelled` | Whether campaign was cancelled |
| `status` | Campaign status |
| `vote_stats` | JSON of vote statistics (parameters explained below) |

**`vote_status` JSON**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `total_vote_count` | Total vote amount for this campaign |
| `total_address_count` | Total no. of voters for this campaign |
| `options` | Array of vote counts for each option |
| `votes` | Array of voters' statistics (parameters explained below) |

**`votes` array**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `staker` | Voter's wallet address |
| `epoch` | Epoch number of vote |
| `campaign_id` | Same as parent `campaign_id` |
| `option` | Voter's option |
| `power` | Voter's power |
| `staker_name` | Name of voter (if available) |

#### Example

Get information about campaign number 15.

```json
> curl "https://ropsten-api.kyber.org/campaigns/15"
{
  "success": true,
  "data": [
    {
      "campaign_id": 15,
      "campaign_type": "Fee",
      "start_timestamp": 1593525171,
      "end_timestamp": 1593526705,
      "options": [
        "10",
        "35",
        "25",
        "45"
      ],
      "link": "",
      "title": "",
      "desc": "",
      "cancelled": false,
      "status": "Ended",
      "vote_stats": {
        "total_vote_count": 7.60826672275885,
        "total_address_count": 1,
        "options": [
          {
            "option": 1,
            "vote_count": 7.60826672275885
          }
        ],
        "votes": [
          {
            "staker": "0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A",
            "epoch": 38,
            "campaign_id": 15,
            "option": 1,
            "power": "7608266722758852851",
            "staker_name": "no one"
          }
        ]
      }
    },
    ...
  ]
}
```

### `/stakers/:wallet?epoch=[epoch]`

(GET) Staker information for a specific epoch

**Response:**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `stake_amount` | KNC stake amount for specified epoch |
| `delegated_stake_amount` | KNC stake amount delegated to staker for specified epoch |
| `pending_stake_amount` | KNC stake amount for the next epoch w.r.t specificed epoch |
| `delegate` | Staker's delegate's address |

#### Example

Get staker `0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A` information for epoch 182

```json
> curl "https://ropsten-api.kyber.org/stakers/0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A?epoch=182"
{
  "success": true,
  "data": {
    "stake_amount": 26.6395789783713,
    "delegated_stake_amount": 0,
    "pending_stake_amount": 0,
    "delegate": "0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A"
  },
}
```

### `/stakers/:wallet/actions`

(GET) All staking, voting and claiming actions executed by a staker

**Response:**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `timestamp` | UNIX time of action executed |
| `epoch` | Epoch number |
| `type` | Action executed |
| `tx_hash` | Transaction hash of action |
| `meta` | More details about the action |

#### Example

Get all actions perfromed by staker `0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A`

```json
> curl "https://ropsten-api.kyber.org/stakers/0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A/actions"
{
  "success": true,
  "data": [
    {
      "timestamp": 1593644065,
      "epoch": 82,
      "type": "Withdraw",
      "tx_hash": "0x80229bd63a2819f83177a0d930d9d644fa4ef5a8425824c9bc64f5780d9610b2",
      "meta": {
        "amount": 3.3164457612878753
      }
    },
    {
      "timestamp": 1593527159,
      "epoch": 39,
      "type": "Deposit",
      "tx_hash": "0xa72a1e9d19a6e7bd3666b0726390511f54ddb94aad1a11625d9ad59c7a8ecac1",
      "meta": {
        "amount": 0.03791628434453804
      }
    },
    {
      "timestamp": 1593525253,
      "epoch": 38,
      "type": "VoteCampaign",
      "tx_hash": "0x66ca9cb517ad21adff95ad4d86541341639ae38614ba26be499d880d02d53798",
      "meta": {
        "campaign_id": 15,
        "campaign_type": "Fee",
        "option": "10"
      }
    },
    {
      "timestamp": 1593527159,
      "epoch": 38,
      "type": "ClaimReward",
      "tx_hash": "0xa72a1e9d19a6e7bd3666b0726390511f54ddb94aad1a11625d9ad59c7a8ecac1",
      "meta": {
        "amount": 0.000101703636969974
      }
    },
    ...
  ]
}
```

### `/stakers/:wallet/rewards`

(GET) Staker's Reward Information

**Response:**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `epoch` | Epoch number |
| `amount` | ETH reward claimable / claimed for staker and his pool members |
| `claimed` | Whether reward has been claimed |
| `tx_hash` | Transaction hash of reward claim |
| `total_stake` | Total KNC stake of staker and his pool members |
| `total_reward` | Total ETH reward claimable by all stakers for `epoch` |
| `total_voted` | Total vote amount by all stakers for `epoch` |

#### Example

Get all reward information for staker `0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A`

```json
> curl "https://ropsten-api.kyber.org/stakers/0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A/rewards"
{
  "success": true,
  "data": [
    {
      "epoch": 38,
      "amount": 0.000101703636969974,
      "claimed": true,
      "tx_hash": "0xa72a1e9d19a6e7bd3666b0726390511f54ddb94aad1a11625d9ad59c7a8ecac1",
      "total_stake": 7.60826672275885,
      "total_reward": 0.000101703636969974,
      "total_voted": 7.60826672275885
    },
    {
      "epoch": 37,
      "amount": 0,
      "claimed": false,
      "tx_hash": "",
      "total_stake": 0,
      "total_reward": 0.000249518706445655,
      "total_voted": 0
    }
  ]
}
```

### `/stakers/:wallet/votes`

(GET) Staker's voting information

**Response:**
| Parameter | Description |
|:---------:|:-------------------------------:|
| `staker` | Staker's address |
| `epoch` | Epoch number |
| `campaign_id` | Campaign ID number |
| `option` | Voted option by staker |
| `power` | Voting power of staker (delegations accounted for) |

#### Example

Get all voting information for staker `0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A`

```json
> curl "https://ropsten-api.kyber.org/stakers/0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A/votes"
{
  "success": true,
  "data": [
    {
      "staker": "0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A",
      "epoch": 38,
      "campaign_id": 15,
      "option": 1,
      "power": "7608266722758852851"
    },
    {
    "staker": "0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A",
    "epoch": 37,
    "campaign_id": 14,
    "option": 1,
    "power": "0"
    }
  ]
}
```

### `/wallet_info/:address`

(GET) Miscellaneous staker information

```json
> curl "https://ropsten-api.kyber.org/wallet_info/0x1375355fEcCB15e0DBedd7dcF3c496E2b1a25f6A"
{
  "success": true,
  "data": {
    "name": "No Name",
    "image": "/some/path",      
  }
}
```

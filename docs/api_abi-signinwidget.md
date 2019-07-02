---
id: API_ABI-SignInWidget
title: Sign In Widget
---
[//]: # (tagline)
## Developer Registration
Contact one of our Kyber developers in the KyberDeveloper group at https://t.me/KyberDeveloper to get a developer account. The following information is required:
| Parameter            | Description |
| -------------------  |:--------------------------------------------------------------------:|
| Name                 | Application name that will be displayed to the user when asked for login permissions |
| Redirect URI         | The URI that Kyber's servers will redirect the users to and that will handle the data that Kyber passes; you can possibly provide multiple URIs, but they must be HTTPS (You can use ngrok or localtunel to create https uris for testing) |
| Icon                 | An icon in SVG format with 1024x1024 resolution |

You will then be provided with 2 items:
1. `APP_ID`, which is considered public and will be used in your public-facing code.
2. `APP_SECRET` to be kept secret and used only on the server side.

## `/authorized-users`

### Path Parameters
| Parameter    | Required | Description             |
| ------------ |:--------:|:-----------------------:|
| `uid`        | No       | User ID                 |
| `kyc_status` | No       | Either `pending`, `approved` or `none`. a user has not yet submitted KYC, or his/her KYC was rejected, `none` is returned. |

### Examples
#### Using `uid`
`https://kyberswap.com/api/authorized_users&access_token=ACCESS_TOKEN&uid=42`

#### Using `kyc_status`
`https://kyberswap.com/api/authorized_users&access_token=ACCESS_TOKEN&kyc_status=pending`
`https://kyberswap.com/api/authorized_users&access_token=ACCESS_TOKEN&kyc_status=none`

## About auth 2.0
Refer to https://aaronparecki.com/oauth-2-simplified/ for more information.

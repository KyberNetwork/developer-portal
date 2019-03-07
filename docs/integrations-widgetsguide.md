---
id: Integrations-WidgetsGuide
title: Widgets
---
## Introduction
Widgets are a type of integration that websites and applications can easily leverage on to interact with our protocol implementation. There are currently 2 types of widgets; the KyberWidget that extends your platform's functionality with decentralised token swaps and the Sign In Widget that allows users who are registered with us to log into your platform.

## Overview
There are a total of 3 tutorials that will be covered in this guide; the first is a [HTML / JS KyberWidget](#kyberwidget-html-js) integration guide, the second is an [iOS KyberWidget](#kyberwidget-ios) integration guide and the last will be a guide on using the [Sign In Widget](#sign-in-widget). Please select the tutorial that is most appropriate for you.

### KyberWidget (HTML/JS)
#### Things to note
* The widget generator is not mandatory for use; it merely provides a quick way to specify the required parameters and settings.

##### S


### KyberWidget (iOS)

### Sign In Widget
#### Things to note
* The Kyber Sign-in Widget conforms with the OAuth 2.0 specs, so it can be used with existing oauth2.0-support libraries/frameworks.
* The widget is under development, and is provided to partners for early testing.

#### Prerequisites
* A KYCed account with KyberSwap is required for testing. You can do so at https://kyberswap.com/users/sign_up?normal=true.
* Your `APP_ID` and `APP_SECRET`. This is given upon registration of a Kyber developer account. Find out more [in this section](#developer-registration).

#### Scenario 1: Create Sign-In Widget for Users
##### Configure Sign-In Widget Parameters
The widget URL format is <br>
`https://kyberswap.com/oauth/authorize?client_id=APP_ID&redirect_uri=REDIRECT_URI&response_type=code&state=CUSTOM_TOKEN` where
* `client_id` must be your `APP_ID`.
* `redirect_uri` must be a redirect URI associated with `APP_ID` used for registration.
* `request_type` should be “code”, meaning that you request an AUTH_CODE.
* `state` may be anything of your choice. Any value parsed in will be forwarded in `REDIRECT_URI`. We recommend using a `CUSTOM_TOKEN` for server-side authentication of user approval.

For example `https://kyberswap.com/oauth/authorize?client_id=MYAPP123&redirect_uri=https://example.com/callback&response_type=code&state=CUSTOM_TOKEN`

##### Add Widget Into A Website
You may incorporate the link into a button, as shown [in this sample button style](https://codepen.io/thith/full/qYQOpX).
`<a href=“see below”>Sign-in with Kyber</a>`

![Signinwidget](/uploads/signinwidget.png "Signinwidget")

The user will be asked to sign-in with his Kyber account if he has not already done so. Please use your KYCed account with KyberSwap to sign-in.

##### Implement Server Side Logic
1. User Denial
If the user denies authorization, Kyber's servers will send a GET request to `REDIRECT_URI?error=access_denied&error_description=The+resource+owner+or+authorization+server+denied+the+request`.

2. User Approval
If the user approves authorization, Kyber's servers will send a GET request to
`REDIRECT_URI/callback?code=AUTH_CODE&state=CUSTOM_TOKEN`.

Before proceeding with the authentication, a check can be performed on `CUSTOM_TOKEN` to verify that it is the same as the one provided in the callback URI.

##### Obtain an `ACCESS_TOKEN`
Upon user approval, you can make a POST request with the `AUTH_CODE` provided in the callback URI to query for an `ACCESS_TOKEN`.
```
POST https://kyberswap.com/oauth/token
grant_type=authorization_code&
code=AUTH_CODE&
redirect_uri=REDIRECT_URI&
client_id=APP_ID&
client_secret=APP_SECRET
```

**Note:**
* In order to keep `APP_SECRET` private, this code should **only** be executed server-side.
* `REDIRECT_URI` must be the same one previously used to obtain the `AUTH_CODE`.

The server will reply with an `ACCESS_TOKEN` and expiration time (in seconds):
```json
{
	"token_type": "bearer",
	"access_token": "ACCESS_TOKEN",
	"expires_in": 3600,
	"refresh_token": "xxx"
}
```
or if there is an error:
```json
{
	"error": "invalid_request"
}
```

##### Obtain User Information
`ACCESS_TOKEN` can be used to call Kyber's APIs using 1 of the following 2 methods:
1. Add request header authorization: Bearer `ACCESS_TOKEN` (recommended)
2. Include `access_token=ACCESS_TOKEN` as a GET or POST parameter

For simplicity, we will call the `/user_info` API using the second method.
```
https://kyber.network/api/user_info?access_token=ACCESS_TOKEN
```

Example Output
```json
{
	"name": "Satoshi Nakamoto",
	"uid": 42,
	"contact_type": "telegram",
	"contact_id": "250735569",
	"active_wallets": [
		"0x8fa07f46353a2b17e92645592a94a0fc1ceb783f",
		"0x8fa07f46353a2b17e92645592a94a0fc1ceb7833",
	],
	"kyc_status": "approved",
	"avatar_url": "https://t.me/i/userpic/320/satoshi.jpg"
}
```

**Note:**
* `contact_type` should be email or telegram. For Telegram users, `contact_id` is his/her telegram ID (number, not the @username).
* `kyc_status`: Either `pending`, `approved` or `none`. If a user has not yet submitted KYC, or his/her KYC was rejected, none is returned.
* One user could have up to 3 addresses. If no address registered, an empty array is returned.

If `ACCESS_TOKEN` is invalid, HTTP status code 401 is returned. In that case, it is likely that the token has expired. You should use the refresh token provided to renew the token (see [https://auth0.com/learn/refresh-tokens/](https://auth0.com/learn/refresh-tokens)).

Other errors will return:
```json
{
	"error": "reason"
}
```

#### Scenario 2: Obtaining list of authorized users
Suppose you want to obtain all Kyber users who have authorized your application. Users who had authorized your application, but subsequently revoked the authorization, will not be included.

##### Obtain an `ACCESS_TOKEN`
As we will be calling an application-access API, an application token should be obtained instead of a user token. Application-access APIs are APIs designed for applications, and are not bound to a specific user.
```
POST https://kyberswap.com/oauth/token
grant_type=client_credentials&
client_id=APP_ID&
client_secret=APP_SECRET
```

The server will reply with an `ACCESS_TOKEN` and expiration time (in seconds):
```json
{
	"token_type": "bearer",
	"access_token": "ACCESS_TOKEN",
	"expires_in": 3600,
	"refresh_token": "xxx"
}
```
or if there is an error:
```json
{
	"error": "invalid_request"
}
```

##### Call `/authorized_users` endpoint
`ACCESS_TOKEN` can be used to call Kyber's APIs using 1 of the following 2 methods:
1. Add request header authorization: Bearer `ACCESS_TOKEN` (recommended)
2. Include `access_token=ACCESS_TOKEN` as a GET or POST parameter

For simplicity, we will call the `/authorized_users` API using the second method. Refer to [this section](#authorized-users) for possible path parameters to parse.
```
https://kyberswap.com/api/authorized_users&access_token=ACCESS_TOKEN
```
Example Output
```json
{
	"name": "Satoshi Nakamoto",
	"uid": 42,
	"contact_type": "telegram",
	"contact_id": "250735569",
	"active_wallets": [
		"0x8fa07f46353a2b17e92645592a94a0fc1ceb783f",
		"0x8fa07f46353a2b17e92645592a94a0fc1ceb7833",
	],
	"kyc_status": "approved",
	"avatar_url": "https://t.me/i/userpic/320/satoshi.jpg"
}
```

**Note:**
* `contact_type` should be email or telegram. For Telegram users, `contact_id` is his/her telegram ID (number, not the @username).
* `kyc_status`: Either `pending`, `approved` or `none`. If a user has not yet submitted KYC, or his/her KYC was rejected, `none` is returned.
* One user could have up to 3 addresses. If no address registered, an empty array is returned.

If `ACCESS_TOKEN` is invalid, HTTP status code 401 is returned. In that case, it is likely that the token has expired. You should use the refresh token provided to renew the token (see [https://auth0.com/learn/refresh-tokens/](https://auth0.com/learn/refresh-tokens)).

Other errors will return:
```json
{
	"error": "reason"
}
```

## Fee Sharing Program
Wallets have the opportunity to join our *Fee Sharing Program*, which allows fee sharing on each swap that originates from your wallet. Learn more about the program [here](integrations-feesharing.md)!

---
id: Integrations-WidgetOAuth
title: Sign-in Widget
---

The Kyber Sign-in Widget conforms with the Auth 2.0 specs, so you'll be able to use it with any of your existing auth2.0-support libraries/frameworks.

**Note:** This widget is under development, and is provided to partners for early testing.

Before you start, make sure you are already registered in https://kyber.network. You can register using https://kyber.network/users/sign_up?normal=true. Next, contact our KyberDeveloper group at https://t.me/KyberDeveloper to get a developer account.


## Step 1: Register your app

Sign-in to `https://kyber.network/oauth/applications/` with your developer account and create an app.

Enter these inputs:
* Name: name of your app
* Icon: PNG or JPGjpg square icon
* Callback URIs: You can possibly provide multiple URIs, but they must be HTTPS (could use ngrok or localtunel to create https urls for testing)
* Scope: Leave this field empty for now

After registration, save your `app ID` and `app secret` for later use.

`app ID` is considered public and will be used in your public-facing code. `app secret` must be kept secret and must only be used at server-side.

## Step 2: Add Kyber Signin Widget to your site

`<a href=“see below”>Sign-in with Kyber</a>`

Here's a [sample button style you can use.](https://codepen.io/thith/full/qYQOpX)

The HREF format should be:

`https://kyber.network/oauth/authorize?client_id=APP_ID&redirect_uri=CALLBACK_URI&response_type=code&state=STATE`

* `client_id` must be your app’s registered app ID.

* `redirect_uri` must be one of your app’s registered callback URIs.

* `request_type` should be “code”, meaning that you request an AUTH_CODE.

* `state` may be anything of your choice. If you provide one, this parameter will be included as is when calling your callback

User will be asked to sign-in with his Kyber account if he has not already done so. Please use the registered Kyber account to sign-in.

![Signinwidget](/uploads/signinwidget.png "Signinwidget")

## Step 3: Implement server-side callback logic

Kyber will call your callback URL when a user either denies or authorizes your app’s request to access his/her Kyber account.

For example, let’s assume your callback URL is https://example.com/callback.

If the user denies, Kyber's servers will send a GET to https://example.com/callback?error=access_denied&error_description=The+resource+owner+or+authorization+server+denied+the+request.

If user authorizes, Kyber's servers will send a GET request to https://example.com/callback?code=AUTH_CODE&state=CUSTOM_TOKEN.

Before proceeding with the authentication, you should check that the `CUSTOM_TOKEN` on your server-side logic is the same as the one provided in the callback URL, as specified above.

You then use the `AUTH_CODE` provided to query our site for an `ACCESS_TOKEN`.

	POST https://kyber.network/oauth/token
	grant_type=authorization_code&
	code=AUTH_CODE&
	redirect_uri=REDIRECT_URI&
	client_id=APP_ID&
	client_secret=APP_SECRET

In order to keep `APP_SECRET` private, this code should be executed server-side. `REDIRECT_URL` must be one you previously used to get the `AUTH_CODE`.

The server will reply with an access token and expiration time (in seconds):
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

## Step 4: Call Kyber API

With `ACCESS_TOKEN`, you can call Kyber Account APIs using one of these 2 methods:

1. Add request header authorization: Bearer ACCESS_TOKEN (recommended)
2. Include access_token=ACCESS_TOKEN as a GET or POST parameter

## Currently Supported APIs

### Get User Info
Endpoint: https://kyber.network/api/user_info

It would return something like this:
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

* `contact_type` should be email or telegram. For Telegram users, `contact_id` is his/her telegram ID (number, not the @username).
* `kyc_status`: Either `pending`, `approved` or `none`. If user not yet submitted KYC, or his/her KYC was rejected, none is returned.
* One user could have up to 3 addresses. If no address registered, an empty array is returned.

If `ACCESS_TOKEN` is invalid, HTTP status code 401 is returned. In that case, it is likely that the token has expired. You should use the refresh token provided to renew the token (see [https://auth0.com/learn/refresh-tokens/](https://auth0.com/learn/refresh-tokens).

For other errors, it will return:
```json
{
	"error": "some reason"
}
```

### Application-access APIs
Application-access APIs are APIs designed for applications, and are not bound to a specific user. To call application-access API, you need to first obtain an application token instead of user token.

	POST https://kyber.network/oauth/token
	grant_type=client_credentials&
	client_id=APP_ID&

Possible returned values are the same as when getting user token mentioned in the previous section. Use the returned application token to call application-access APIs.

### Supported Application-access APIs
#### Get Authorized User List
Get an array of all Kyber users who authorized your app. Users who had authorized but later revoked will not be included.
Endpoint: https://kyber.network/api/authorized_users

Input:
1. `uid` (optional, used for filtering results)
2. `kyc_status` (optional, used for filtering results)

##### Returns:
An array of user info object.

See [Get User Info](#get-user-info) for more detailed remarks about input and return values.

## Further Information
For more information on auth 2.0, please refer to https://aaronparecki.com/oauth-2-simplified/

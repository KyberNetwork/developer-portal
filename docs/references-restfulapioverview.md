---
id: References-RESTfulAPIOverview
title: RESTful API Overview
---
## Introduction

The RESTful API can be used to perform trades on the Kyber Network platform.

### NETWORK URL

| Network    | URL                          |
|:----------:|:----------------------------:|
| Mainnet    | https://api.kyber.network    |
| Ropsten    | https://ropsten-api.kyber.network |
| Rinkeby    | https://rinkeby-api.kyber.network |

## Things to note

If for any reason there is an error in the response, you will receive the following response message:

```json
{
	“error”:True,
	”reason”:””,
	”additional_data”:””
}
```

The `reason` can be one of the following:

`**request_limit**`:  indicates that the user exceeded the requests limit
`**param_error**`: indicates that the user has passed an unknown parameter, a wrong type for that parameter, or has not passed a required parameter
`**server_error**`: indicates internal API error, which should not be present most of the time

`additional_data` can contain more information on the error, such as indicating when the user can request again in case of “request_limit”, or indicating bad or missing parameters for `param_error`.

### REST Limitations

There is a current limitation of **60 requests per minute per IP address**. If you exceed this you will get the following reply:

```json
{
	“error”: True,
	”reason”: “request_limit”,
	”additional_data”: “Retry in 60 seconds”
}
```

If requests are still continually sent after receiving this error, then the requests sent from your IP will be silently blocked. It will take approximately an one hour of not sending a request from the blocked IP to be removed from the blocked list.

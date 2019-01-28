---
id: Reserves-Web3
title: Web3 Injection
---
## Web3 Injection
### Adding web3
You may add `web3` to your project using 1 of the following methods:
* npm: `npm install web3`
* bower: `bower install web3`
* meteor: `meteor add ethereum:web3`
* vanilla: link the `dist./web3.min.js`

### Requesting for web3 instance
Metamask and other dapp browsers will no longer automatically inject an Ethereum provider or a Web3 instance at a website's page load time.  As a result, one has to asynchronously request a provider. Find out more [in this article](https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8). The code below shows how you may go about doing so:
```
window.addEventListener('load', () => {
    // If web3 is not injected (modern browsers)...
    if (typeof web3 === 'undefined') {
        // Listen for provider injection
        window.addEventListener('message', ({ data }) => {
            if (data && data.type && data.type === 'ETHEREUM_PROVIDER_SUCCESS') {
                // Use injected provider, start dapp...
                web3 = new Web3(ethereum);
            }
        });
        // Request provider
        window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST' }, '*');
    }
    // If web3 is injected (legacy browsers)...
    else {
        // Use injected provider, start dapp
        web3 = new Web3(web3.currentProvider);
    }
});
```

For convenience, a Web3 instance *can* be injected by passing a web3 flag when requesting a provider:
```
//Request web3 provider
window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST', web3: true }, '*');
```
There is no guarantee about what version of web3 will be injected in response to this request, so it should only be used for convenience in development and debugging.
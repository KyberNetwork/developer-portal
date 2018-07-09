---
id: CodesAppendix
title: Code Snippets
---
# Code Snippets

## Web3
Refer to the [Web3 documentation](https://web3js.readthedocs.io/en/1.0/web3-eth.html) for more information.

### `Broadcasting Transactions`
```js
const Web3 = require('web3');
const BN = require('bignumber.js');
const web3 = new Web3(new Web3.providers.HttpProvider('<PROVIDER>'));
const account = web3.eth.accounts.privateKeyToAccount('<PRIVATE KEY>');

async function main() {
	const contractABI = '[<ABI>]';
	const contractAddress = '<CONTRACT ADDRESS>';
	const myContract = new web3.eth.Contract(contractABI, contractAddress);
	
	let sampleTx = myContract.methods.myMethod(param1, param2, otherParams);
	let txResult = await broadcastTx(sampleTx);
}

async function broadcastTx(txObject) {
  const gasLimit = await txObject.estimateGas();
  const gasPrice = BN(50).mul(10 ** 9); // 50 Gwei
  const nonce = await web3.eth.getTransactionCount(account.address);
  const chainId = await web3.eth.net.getId();
  const txTo = txObject._parent.options.address;
  const txData = txObject.encodeABI();
  const txFrom = account.address;
  const txKey = account.privateKey;

  const tx = {
    from : txFrom,
    to : txTo,
    nonce : nonce,
    data : txData,
    gas : gasLimit,
    chainId : chainId,
    gasPrice : gasPrice
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, txKey);
  web3.eth.sendSignedTransaction(signedTx.rawTransaction, { from: account.address });
}

main()
```

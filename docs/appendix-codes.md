---
id: CodesAppendix
title: Code Snippets
---
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
  const gasPrice = new BN(50).times(10 ** 9); // 50 Gwei
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
  web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}

main()
```

## Token Amount Conversion
Since `getExpectedRate` returns a rate, not the amount, the following code snippets show how to convert to both source and destination token amounts, taking their decimals into account.

### `calcSrcQty`
More information regarding the input parameters of the `calcSrcQty` function can be found in [reference](api-utils.md#calcsrcqty).
<!--| Parameter           | Type    | Description                                   |
| ------------------- |:-------:|:------------------------------------:|
| `dstQty`     | Number | ERC20 destination token amount in its decimals |
| `srcDecimals`    | Number | ERC20 source token decimals |
| `dstDecimals`  | Number | ERC20 destination token decimals |
| `rate`  | Number | src->dst conversion rate, independent of token decimals |
**Returns:**\
ERC20 source token amount in its decimals.-->

#### Example

```js
function calcSrcQty(dstQty, srcDecimals, dstDecimals, rate) {
  const PRECISION = (10 ** 18);
  //source quantity is rounded up. to avoid dest quantity being too low.
  if (srcDecimals >= dstDecimals) {
    numerator = (PRECISION * dstQty * (10**(srcDecimals - dstDecimals)));
    denominator = rate;
  } else {
    numerator = (PRECISION * dstQty);
    denominator = (rate * (10**(dstDecimals - srcDecimals)));
  }
  return (numerator + denominator - 1) / denominator; //avoid rounding down errors
}
```

### `calcDstQty`
More information regarding the input parameters of the `calcDstQty` function can be found in [reference](api-utils.md#calcdstqty).
<!--| Parameter           | Type    | Description                                   |
| ------------------- |:-------:|:------------------------------------:|
| `srcQty`     | Number | ERC20 source token amount in its decimals |
| `srcDecimals`    | Number | ERC20 source token decimals |
| `dstDecimals`  | Number | ERC20 destination token decimals |
| `rate`  | Number | src->dst conversion rate, independent of token decimals |
**Returns:**\
ERC20 destination token amount in its decimals.-->

#### Example

```js
function calcDstQty(srcQty, srcDecimals, dstDecimals, rate) {
  const PRECISION = (10 ** 18);
  if (dstDecimals >= srcDecimals) {
    return (srcQty * rate * (10**(dstDecimals - srcDecimals))) / PRECISION;
  } else {
    return (srcQty * rate) / (PRECISION * (10**(srcDecimals - dstDecimals)));
  }
}
```
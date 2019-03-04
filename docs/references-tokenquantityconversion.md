---
id: References-TokenQuantityConversion
title: Token Quantity Conversion
---
## Token Amount Conversion
Since `getExpectedRate` returns a rate, not the amount, the following code snippets show how to convert to both source and destination token amounts, taking their decimals into account.

### `calcSrcQty`
| Parameter           | Description                          |
| ------------------- |:------------------------------------:|
| `dstQty`     | ERC20 destination token amount in its decimals |
| `srcDecimals`    | ERC20 source token decimals |
| `dstDecimals`  | ERC20 destination token decimals |
| `rate`  | src -> dst conversion rate, independent of token decimals |
**Returns:**<br>
ERC20 source token amount in its decimals.

#### Javascript
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

#### Solidity
Refer to the [Utils contract](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/Utils.sol#L47-L64).


### `calcDstQty`
| Parameter           | Description                          |
| ------------------- |:------------------------------------:|
| `srcQty`     |  ERC20 source token amount in its decimals |
| `srcDecimals`    | ERC20 source token decimals |
| `dstDecimals`  | ERC20 destination token decimals |
| `rate`  | src -> dst conversion rate, independent of token decimals |
**Returns:**<br>
ERC20 destination token amount in its decimals.

#### Javascript
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

#### Solidity
Refer to the [Utils contract](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/Utils.sol#L34-L45).


### `calcRateFromQty`
| Parameter           | Type    | Description                                   |
| ------------------- |:-------:|:------------------------------------:|
| `srcAmount`     | Number | ERC20 source token amount in its decimals |
| `destAmount`    | Number | ERC20 source token decimals |
| `srcDecimals`  | Number | ERC20 destination token decimals |
| `dstDecimals`  | Number | src -> dst conversion rate, independent of token decimals |
**Returns:**<br>
Token conversion rate independent of token decimals

#### Javascript
```js
function calcRateFromQty(srcAmount, destAmount, srcDecimals, dstDecimals) {
  const PRECISION = (10 ** 18);
  if (dstDecimals >= srcDecimals) {
    return (destAmount * PRECISION / ((10 ** (dstDecimals - srcDecimals)) * srcAmount));
  } else {
    return (destAmount * PRECISION * (10 ** (srcDecimals - dstDecimals)) / srcAmount);
  }
}
```

#### Solidity
Refer to the [Utils2 contract](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/Utils2.sol#L36-L49).

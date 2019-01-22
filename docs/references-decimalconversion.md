---
id: References-DecimalConversion
title: Decimal Conversion
---
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
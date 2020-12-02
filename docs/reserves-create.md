---
id: Reserves-Create
title: Create New Reserve Model
---
[//]: # (tagline)
### Overview

We believe there are a lot more reserve models that have yet to be created for unique use cases, which will benefit the whole DeFi space, such as new AMM models. As such, there is no restriction on the type of reserves that can be developed, as long as they follow the *following guidelines*:

![Reserve Models](/uploads/reservemodels.png "Reserve Models")

1. Implement The KyberReserveInterface 
![Reserve Interface](/uploads/reserveinterface.png "Reserve Interface")
For the exact functions and inputs to implement, refer to the [KyberReserveInterface](api_abi-ikyberreserve.md) contract.
2. For `getConversionRate`, require statements should be avoided. Returning zero rate is suggested as the alternative.
3. Developers must ensure that they are not using the same liquidity source for multiple reserves, i.e., must have unique liquidity sources for each reserve
4. Coders should not exploit taker’s gas, and be gas efficient.

We believe there are many possibilities for new reserve types. Some potential ideas could be: 

- Bridge Reserves for connecting one or more external on-chain sources to Kyber
- Yield Farming Reserves that keeps a portion of the funds in yield generating farms and the rest for small volume MM
- New AMM models
- OTC style reserves, where traders request big size trades, and makers authorize the takers to trade after awhile while they prepare inventory for the trades
- IEO / IDO model for new token launches 


## Guide To Creating A New Reserve Model

This section below lists some guidelines on creating a new reserve model.

**Implement the Reserve Interface**

The reserve interface provides a generic template of the contract functions one should implement in their smart contract. This interface may be tweaked depending on the needs and features of each blockchain. All existing reserve types, like the ones covered in the developer portal (e.g. Fed Price Reserve), as well as integrated reserves (e.g. Bridge Reserve), implement this interface.

All Kyber reserves that enable liquidity provision have to use KyberReserveInterface. The example below, a snippet of kyber [WETH Reserve](https://github.com/KyberNetwork/kyber_reserves_sc/blob/master/contracts/sol4/weth/KyberWethReserve.sol), illustrates how to implement the 2 functions of the reserve interface.




**Implement getConversionRate function**

```js
  function getConversionRate(ERC20 src, ERC20 dest, uint srcQty, uint blockNumber) public view returns(uint) {
        srcQty;
        blockNumber;

        if (!tradeEnabled) return 0;
        if ((wethToken != src) && (wethToken != dest)) return 0;
        if ((ETH_TOKEN_ADDRESS != src) && (ETH_TOKEN_ADDRESS != dest)) return 0;

        return 1 * PRECISION;
    }
```

**Implement doTrade function**

```js
function doTrade(
        ERC20 srcToken,
        uint srcAmount,
        ERC20 destToken,
        address destAddress,
        uint conversionRate,
        bool validate
    )
        internal
        returns(bool)
    {
        require((ETH_TOKEN_ADDRESS == srcToken) || (ETH_TOKEN_ADDRESS == destToken));
        require((wethToken == srcToken) || (wethToken == destToken));

        // can skip validation if done at kyber network level
        if (validate) {
            require(conversionRate > 0);
            if (srcToken == ETH_TOKEN_ADDRESS)
                require(msg.value == srcAmount);
            else
                require(msg.value == 0);
        }

        uint dstAmount = calcDstQty(srcAmount, COMMON_DECIMALS, COMMON_DECIMALS, conversionRate);
        require(dstAmount > 0); // sanity check

        if (srcToken == ETH_TOKEN_ADDRESS) {
            wethToken.deposit.value(srcAmount)();
            require(wethToken.transfer(destAddress, dstAmount));
        } else {
            require(srcToken.transferFrom(msg.sender, this, srcAmount));
            wethToken.withdraw(dstAmount);
            destAddress.transfer(dstAmount); 
        }

        TradeExecute(msg.sender, srcToken, srcAmount, destToken, dstAmount, destAddress);

        return true;
    }
}
```
You can refer to the reserve contract for detailed code [here](https://github.com/KyberNetwork/kyber_reserves_sc/blob/master/contracts/sol4/weth/KyberWethReserve.sol) .

**Deploying the new reserve model**

You may refer to the [guide here](reserves-requirements.md) for how to deploy a new reserve model.

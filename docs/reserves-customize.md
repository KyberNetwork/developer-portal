---
id: Reserves-Customize
title: Customize Existing Reserve Models
---
[//]: # (tagline)

## Customising or Extending Existing Reserve Models

This section includes discussion on customizing and extending reserve models to suit specific requirements. Customization will largely be to use the contracts already developed by Kyber but change or override some key functions. By changing one or more of the functions in this contract, the developer can leverage much of the infrastructure already built up, however insert their own logic. 

Extensions can be done with custom smart contracts, allowing for more flexibility and capital efficiency. This will not entail any changes to the existing smart contracts, but involves inserting optional steps into the trade flow. 

**Sample Guide To Customizing The APR/FPR**

In Kyber’s FPR & APR architecture there are 2 main smart contracts to take note of: Kyber Reserve Contract and Conversion Rates Contract. When trade is requested, the protocol scans the entire network to find the reserve with the best price. The reserve smart contract will then interact with conversionRates contract to fetch the prices. 

The Reserve contract handles inventory, enabling / disabling of trades, validation checks, whereas conversionRates or the Pricing contract handles the rate calculation based on certain parameters given by the reserve contract. One can create new models by tweaking either or both of these contracts.

One way of customization for the conversionRates Contract would be to redesign the `getRate` function, depending on what the strategy would be.
```js
 function getRate(
IERC20Ext token,
 	uint currentBlockNumber,
 bool buy, 
uint qty)

 public view returns(uint) 
{
// custom code 
}
```

Another way would be to tweak the Reserve contract and re-construct the `trade`, `getConversionRate` function or both.
```js
function trade(
        IERC20Ext srcToken,
        uint256 srcAmount,
        IERC20Ext destToken,
        address payable destAddress,
        uint256 conversionRate,
        bool validate
    ) external payable returns (bool);

function getConversionRate(
        IERC20Ext src,
        IERC20Ext dest,
        uint256 srcQty,
        uint256 blockNumber
    ) external view returns (uint256);
```

**Deploying Your New Reserve Model To Production**

You may refer to the [guide here](reserves-requirements.md) for how to deploy a new reserve model.

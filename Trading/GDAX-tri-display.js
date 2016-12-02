var HandlerGDAX = require('../DataHandling/MktDataHandlerGDAX');
var OrderBookMgrGDAX = require('../Trading/OrderBookMgrGDAX');

var handlerBTC = new HandlerGDAX('BTC-USD');
var handlerETH = new HandlerGDAX('ETH-USD');
var handlerETHBTC = new HandlerGDAX('ETH-BTC');
var orderBookMgrBTC = new OrderBookMgrGDAX(handlerBTC);
var orderBookMgrETH = new OrderBookMgrGDAX(handlerETH);
var orderBookMgrETHBTC = new OrderBookMgrGDAX(handlerETHBTC);

var bidBTC = 0;
var askBTC = 0;
var bidETH = 0;
var askETH = 0;
var bidBTCETH = 0;
var askBTCETH = 0;

var innerMkt = 0;
var outerMkt = 0;

function recalc(){
//  innerMkt = askETH / bidBTC;
//  outerMkt = bidBTC / askETH;
//  console.log('bBTC:',bidBTC,'aBTC:',askBTC,'bETH:',bidETH,'aETH:',askETH,'in:',Number(innerMkt).toFixed(2),'out:',Number(outerMkt).toFixed(2));
  console.log(bidBTC,askBTC);
}

orderBookMgrBTC.on('bidUpdate',function(data){
  bidBTC = data;
  recalc();
});

orderBookMgrBTC.on('askUpdate',function(data){
  askBTC = data;
  recalc();
});

//orderBookMgrETH.on('bidUpdate',function(data){
//  bidETH = data;
//  recalc();
//});

//orderBookMgrETH.on('askUpdate',function(data){
//  askETH = data;
//  recalc();
//});

handlerBTC.run();
//handlerETH.run();

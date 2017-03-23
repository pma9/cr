var HandlerBFNX = require('../DataHandling/MktDataHandlerBFNX');
var handlerBFNX = new HandlerBFNX('BTCUSD');
var OrderBookMgrBFNX = require('../Trading/OrderBookMgrBFNX');
var orderBookMgrBFNX = new OrderBookMgrBFNX(handlerBFNX);

var HandlerGDAX = require('../DataHandling/MktDataHandlerGDAX');
var handlerGDAX = new HandlerGDAX('BTC-USD');
var OrderBookMgrGDAX = require('../Trading/OrderBookMgrGDAX');
var orderBookMgrGDAX = new OrderBookMgrGDAX(handlerGDAX);

var bidPriceBFNX = 0;
var askPriceBFNX = 0;
var bidPriceGDAX = 0;
var askPriceGDAX = 0;
var bidSizeBFNX = 0;
var askSizeBFNX = 0;
var bidSizeGDAX = 0;
var askSizeGDAX = 0;

function recalc(){
  console.log(bidPriceGDAX,bidSizeGDAX,askPriceGDAX,askSizeGDAX);
}

orderBookMgrBFNX.on('bidUpdate',function(data){
  bidPriceBFNX = data;
  recalc();
});

orderBookMgrBFNX.on('askUpdate',function(data){
  askPriceBFNX = data;
  recalc();
});

orderBookMgrGDAX.on('bidUpdate',function(price,size){
    bidPriceGDAX = price;
    bidSizeGDAX = size;
    recalc();
});

orderBookMgrGDAX.on('askUpdate',function(price,size){
    askPriceGDAX = price;
    askSizeGDAX = size
    recalc();
});

handlerBFNX.run();
handlerGDAX.run();

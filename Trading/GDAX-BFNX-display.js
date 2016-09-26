var HandlerBFNX = require('../DataHandling/MktDataHandlerBFNX');
var handlerBFNX = new HandlerBFNX('BTCUSD');
var OrderBookMgrBFNX = require('../Trading/OrderBookMgrBFNX');
var orderBookMgrBFNX = new OrderBookMgrBFNX(handlerBFNX);

var HandlerGDAX = require('../DataHandling/MktDataHandlerGDAX');
var handlerGDAX = new HandlerGDAX('BTC-USD');
var OrderBookMgrGDAX = require('../Trading/OrderBookMgrGDAX');
var orderBookMgrGDAX = new OrderBookMgrGDAX(handlerGDAX);

var bidBFNX = 0;
var askBFNX = 0;
var bidGDAX = 0;
var askGDAX = 0;
var innerMkt = 0;
var outerMkt = 0;

function recalc(){
  innerMkt = askGDAX - bidBFNX;
  outerMkt = bidGDAX - askBFNX;
  console.log('bG:',bidGDAX,'aG:',askGDAX,'bB:',bidBFNX,'aB:',askBFNX,'in:',Number(innerMkt).toFixed(2),'out:',Number(outerMkt).toFixed(2));
}

orderBookMgrBFNX.on('bidUpdate',function(data){
  bidBFNX = data;
  recalc();
});

orderBookMgrBFNX.on('askUpdate',function(data){
  askBFNX = data;
  recalc();
});

orderBookMgrGDAX.on('bidUpdate',function(data){
  bidGDAX = data;
  recalc();
});

orderBookMgrGDAX.on('askUpdate',function(data){
  askGDAX = data;
  recalc();
});

handlerBFNX.run();
handlerGDAX.run();

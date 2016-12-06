var HandlerBFNX = require('../DataHandling/MktDataHandlerBFNX');
var handlerBFNX = new HandlerBFNX('ETHUSD');
var OrderBookMgrBFNX = require('../Trading/OrderBookMgrBFNX');
var orderBookMgrBFNX = new OrderBookMgrBFNX(handlerBFNX);

var HandlerGDAX = require('../DataHandling/TriMktDataHandlerGDAX');
var handlerGDAXBTC = new HandlerGDAX('BTC-USD');
var handlerGDAXETH = new HandlerGDAX('ETH-USD');
var handlerGDAXETHBTC = new HandlerGDAX('ETH-BTC');
var OrderBookMgrGDAX = require('../Trading/TriOrderBookMgrGDAX');
var orderBookMgrGDAXBTC = new OrderBookMgrGDAX(handlerGDAXBTC,'BTC-USD');
var orderBookMgrGDAXETH = new OrderBookMgrGDAX(handlerGDAXETH,'ETH-USD');
var orderBookMgrGDAXETHBTC = new OrderBookMgrGDAX(handlerGDAXETHBTC,'ETH-BTC');

var bidBFNX = 0;
var askBFNX = 0;
var bidGDAXBTC = 0;
var askGDAXBTC = 0;
var bidGDAXETH = 0;
var askGDAXETH = 0;
var bidGDAXETHBTC = 0;
var askGDAXETHBTC = 0;
var innerMkt = 0;
var outerMkt = 0;
var impBid = 0;
var impAsk = 0;

function bidETHBTC(BTCshort,USDlong,BTClong){
  return (USDlong / BTClong) - BTCshort;
}

function askETHBTC(BTClong,USDlong,ETHlong){
  return (BTClong * USDlong) - ETHlong;
}

function recalc(){
  outerMkt = askGDAXETH / bidGDAXBTC;
  innerMkt = bidGDAXETH / askGDAXBTC;
  impBid = bidETHBTC(bidGDAXETHBTC,bidGDAXETH,askGDAXBTC);
  impAsk = askETHBTC(askGDAXETHBTC,bidGDAXBTC,askGDAXETH);

  console.log(bidGDAXBTC,askGDAXBTC,bidGDAXETH,askGDAXETH,Number(innerMkt).toFixed(6),Number(outerMkt).toFixed(6),
Number(bidGDAXETHBTC).toFixed(6),Number(askGDAXETHBTC),impBid,impAsk);
}

orderBookMgrBFNX.on('bidUpdate',function(data){
  bidBFNX = data;
  recalc();
});

orderBookMgrBFNX.on('askUpdate',function(data){
  askBFNX = data;
  recalc();
});

orderBookMgrGDAXBTC.on('bidUpdate',function(data,security){
  if(security == 'BTC-USD'){
    bidGDAXBTC = data;
    recalc();
  }
});

orderBookMgrGDAXBTC.on('askUpdate',function(data,security){
  if(security == 'BTC-USD'){
    askGDAXBTC = data;
    recalc();
  }
});

orderBookMgrGDAXETH.on('bidUpdate',function(data,security){
  if(security == 'ETH-USD'){
    bidGDAXETH = data;
    recalc();
  }
});

orderBookMgrGDAXETH.on('askUpdate',function(data,security){
 if(security == 'ETH-USD'){
   askGDAXETH = data;
   recalc();
 }
});

orderBookMgrGDAXETHBTC.on('bidUpdate',function(data,security){
  if(security == 'ETH-BTC'){
    bidGDAXETHBTC = data;
    recalc();
  }
});

orderBookMgrGDAXETHBTC.on('askUpdate',function(data,security){
  if(security == 'ETH-BTC'){
    askGDAXETHBTC = data;
    recalc();
  }
});

handlerGDAXBTC.run();
handlerGDAXETH.run();
//handlerBFNX.run();
handlerGDAXETHBTC.run();

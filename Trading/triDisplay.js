var HandlerBFNX = require('../DataHandling/MktDataHandlerBFNX');
var handlerBFNX = new HandlerBFNX('ETHUSD');
var OrderBookMgrBFNX = require('../Trading/OrderBookMgrBFNX');
var orderBookMgrBFNX = new OrderBookMgrBFNX(handlerBFNX);

var HandlerGDAX = require('../DataHandling/TriMktDataHandlerGDAX');
var handlerGDAXBTC = new HandlerGDAX('BTC-USD');
var handlerGDAXETH = new HandlerGDAX('ETH-USD');
var OrderBookMgrGDAX = require('../Trading/TriOrderBookMgrGDAX');
var orderBookMgrGDAXBTC = new OrderBookMgrGDAX(handlerGDAXBTC,'BTC-USD');
var orderBookMgrGDAXETH = new OrderBookMgrGDAX(handlerGDAXETH,'ETH-USD');

var bidBFNX = 0;
var askBFNX = 0;
var bidGDAXBTC = 0;
var askGDAXBTC = 0;
var bidGDAXETH = 0;
var askGDAXETH = 0;
var innerMkt = 0;
var outerMkt = 0;

function recalc(){
//  outerMkt = askBFNX / bidGDAX;
//  innerMkt = bidBFNX / askGDAX;
//  console.log('bG:',bidGDAX,'aG:',askGDAX,'bB:',bidBFNX,'aB:',askBFNX,'in:',Number(innerMkt).toFixed(5),'out:',Number(outerMkt).toFixed(5));
  console.log(bidGDAXBTC,askGDAXBTC,bidGDAXETH,askGDAXETH);
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

handlerGDAXBTC.run();
handlerGDAXETH.run();
//handlerBFNX.run();


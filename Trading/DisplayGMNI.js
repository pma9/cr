var DataHandler = require('../DataHandling/MktDataHandlerGMNI');
var dataHandler = new DataHandler('btcusd');
var OrderBookMgr = require('../Trading/OrderBookMgrGMNI');
var orderBookMgr = new OrderBookMgr(dataHandler);

var bid = {price:0,size:0,length:0};
var ask = {price:0,size:0,length:0};
var askBook = [0,0,0]

function recalc(){
  console.log(bid.price,ask.price);
}

orderBookMgr.on('bidUpdate',function(data){
  bid.price = data;
  recalc();
});

orderBookMgr.on('askUpdate',function(data){
  ask.price = data;
  recalc();
});

dataHandler.run();

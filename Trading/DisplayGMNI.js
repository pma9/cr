var DataHandler = require('../DataHandling/MktDataHandlerGMNI');
var dataHandler = new DataHandler('btcusd');
var OrderBookMgr = require('../Trading/OrderBookMgrGMNI');
var orderBookMgr = new OrderBookMgr(dataHandler);

var bid = {price:0,size:0,length:0};
var ask = {price:0,size:0,length:0};

function recalc(){
  console.log(bid.length,bid.size,bid.price,ask.price,ask.size,ask.length);
}

orderBookMgr.on('bidUpdate',function(data,length){
  bid = {price:data.price,size:data.size,length:length}
  recalc();
});

orderBookMgr.on('askUpdate',function(data,length){
  ask = {price:data.price,size:data.size,length:length}
  recalc();
});

dataHandler.run();

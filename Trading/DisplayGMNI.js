var DataHandler = require('../DataHandling/MktDataHandlerGMNI');
var dataHandler = new DataHandler('btcusd');
var OrderBookMgr = require('../Trading/OrderBookMgrGMNI');
var orderBookMgr = new OrderBookMgr(dataHandler);

var bid = {price:0,size:0,length:0};
var ask = {price:0,size:0,length:0};
var askBook = [0,0,0]

function recalc(){
  console.log(askBook[0],askBook[1],askBook[2],askBook[3],askBook[4]);
}

orderBookMgr.on('bidUpdate',function(data){
  bid.price = data;
  recalc();
});

orderBookMgr.on('askUpdate',function(data){
  if(data.length > 4){
  askBook[0] = data[0].price;
  askBook[1] = data[1].price;
  askBook[2] = data[2].price;
  askBook[3] = data[3].price;
  askBook[4] = data[4].price;
  }
  recalc();
});

dataHandler.run();

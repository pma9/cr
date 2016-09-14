var Level = require('../Trading/Level');
var bids= [];
var asks= [];

function MktMakeAlgo(properties,orderBookMgr,orderHandler,dataHandler,product,server){
  //assign properties
  var distance = properties.get('distance').split(",");
  var amount = properties.get('amount').split(",");
  var takeProfit = properties.get('takeProfit').split(",");
  var stopOut = properties.get('stopOut').split(",");
  var stopOutTime = properties.get('stopOutTime').split(",");
  var state = properties.get('state');
  var sens = properties.get('sens').split(",");
  //create levels
  for(var i = 0;i<distance.length;i++){
    bids.push(new Level(i,product,"buy",-distance[i],Number(amount[i]),Number(takeProfit[i]),Number(stopOut[i]),orderHandler,state,Number(sens[i]),Number(stopOutTime[i]),dataHandler));
  }
//  for(var i = 0;i<distance.length;i++){
//    asks.push(new Level(product,"sell",Number(distance[i]),Number(amount[i]),Number(takeProfit[i]),Number(stopOut[i]),orderHandler,state,Number(sens[i]),Number(stopOutTime[i]),dataHandler));
//  }

  //update levels
//  orderBookMgr.on('askUpdate',function(data){
//    for(var i = 0;i<asks.length;i++){
//      asks[i].updateTOB(data);
//    }
//  });

  server.register(bids,asks);

  orderBookMgr.on('bidUpdate',function(data){
    for(var i = 0;i<bids.length;i++){
      bids[i].updateTOB(data);
    }
  });

  orderBookMgr.on('lastUpdate',function(data){
//    for(var i = 0;i<asks.length;i++){
//      asks[i].updateLastTrade(data);
//    }
    for(var i = 0;i<bids.length;i++){
      bids[i].updateLastTrade(data);
    }
  });

  orderBookMgr.on('seq gap',function(){
    for(var i = 0;i<bids.length;i++){
      bids[i].cancelAll();
    }
//    for(var i = 0;i<asks.length;i++){
//      asks[i].cancelAll();
//    }
  });

  orderBookMgr.on('disconnect',function(){
    for(var i = 0;i<bids.length;i++){
      bids[i].cancelAll();
    }
//    for(var i = 0;i<asks.length;i++){
//      asks[i].cancelAll();
//    }
  });

}

function printWorkingOrders(){
  console.log(bids[0].entryOrder.price,"   ",asks[0].entryOrder.price);
}


module.exports = MktMakeAlgo;

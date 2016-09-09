var Level = require('../Trading/Level');
var bids= [];
var asks= [];

function MktMakeAlgo(properties,orderBookMgr, orderMgr){
  //assign properties
  var distance = properties.get('distance').split(",");
  var amount = properties.get('amount').split(",");
  var takeProfit = properties.get('takeProfit').split(",");
  var stopOut = properties.get('stopOut').split(",");
  var state = properties.get('state');
  var sens = properties.get('sens').split(",");

  //create levels
  for(var i = 0;i<distance.length;i++){
    bids.push(new Level("buy",-distance[i],Number(amount[i]),Number(takeProfit[i]),Number(stopOut[i]),orderMgr,state,Number(sens[i])));
  }

  for(var i = 0;i<distance.length;i++){
    asks.push(new Level("sell",Number(distance[i]),Number(amount[i]),Number(takeProfit[i]),Number(stopOut[i]),orderMgr,state,Number(sens[i])));
  }

  //update levels
  orderBookMgr.on('askUpdate',function(data){
    for(var i = 0;i<asks.length;i++){
      asks[i].updateTOB(data);
    }
  });

  orderBookMgr.on('bidUpdate',function(data){
    for(var i = 0;i<bids.length;i++){
      bids[i].updateTOB(data);
    }
  });

  orderBookMgr.on('seq gap',function(){
     //cancel entry orders
  });

  orderBookMgr.on('disconnect',function(){
    //cancel entry orders
  });

}

function printWorkingOrders(){
  console.log(bids[0].entryOrder.rate,"   ",asks[0].entryOrder.rate);
}


module.exports = MktMakeAlgo;

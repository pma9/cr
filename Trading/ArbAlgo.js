var Level = require('../Trading/ArbLevel');
var bids= [];
var asks= [];
var pos = 0;
var msg = 0;

function ArbAlgo(properties,orderBookMgr,orderHandler,dataHandler,product,server,profitMgr){
  //assign properties
  var distance = properties.get('distance').split(",");
  var amount = properties.get('amount').split(",");
  var takeProfit = properties.get('takeProfit').split(",");
  var stopOut = properties.get('stopOut').split(",");
  var stopOutTime = properties.get('stopOutTime').split(",");
  var state = properties.get('state');
  var sens = properties.get('sens').split(",");
  var minIncrement = properties.get('minIncrement');

  var greaterThan = function(a,b){
    if(a>b){
      return true;
    }
    return false;
  }

  var lessThan = function(a,b){
    if(a<b){
      return true;
    }
    return false;
  }

  //create levels
  for(var i = 0;i<distance.length;i++){
    bids.push(new Level(i,product,"buy",-distance[i],Number(amount[i]),orderHandler,state,Number(sens[i]),dataHandler,lessThan,minIncrement));
  }

  server.register(bids,asks);

  orderBookMgr.on('bidUpdate',function(data){
    for(var i = 0;i<bids.length;i++){
      bids[i].updateTOB(data);
    }
  });

  orderBookMgr.on('seq gap',function(){
    for(var i = 0;i<bids.length;i++){
      bids[i].cancelAll();
    }
  });

  orderBookMgr.on('disconnect',function(){
    for(var i = 0;i<bids.length;i++){
      bids[i].cancelAll();
    }
  });

  for(var i = 0;i<bids.length;i++){
    bids[i].on('entryFill',function(fill){
      pos = pos + fill.size;
      profitMgr.updateLong(fill);
      server.updatePos(pos);
      server.updateRealized(profitMgr.getRealized());
    });
    bids[i].on('exitFill',function(fill){
      pos = pos - fill.size;
      profitMgr.updateShort(fill);
      server.updatePos(pos);
      server.updateRealized(profitMgr.getRealized());
    });
  } 

  for(var i = 0;i<asks.length;i++){
    asks[i].on('entryFill',function(fill){
      pos = pos - fill.size;
      profitMgr.updateShort(fill);
      server.updatePos(pos);
      server.updateRealized(profitMgr.getRealized());
    });
    asks[i].on('exitFill',function(fill){
      pos = pos + fill.size;
      profitMgr.updateLong(fill);
      server.updatePos(pos);
      server.updateRealized(profitMgr.getRealized());
    });
  } 
  orderHandler.on('new_ack',function(data){
    msg++;
    server.updateMsgCount(msg);
  });

  orderHandler.on('cancel_ack',function(data){
    msg++;
    server.updateMsgCount(msg);
  });
}

//algo must aggregate levels for overall position and P&L

function printWorkingOrders(){
  console.log(bids[0].entryOrder.price,"   ",asks[0].entryOrder.price);
}


module.exports = ArbAlgo;

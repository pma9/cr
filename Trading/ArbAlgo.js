var MktMakeAlgo = require('../Trading/MktMakeAlgo');
var inherits = require('util').inherits;

var ArbAlgo = function(properties,orderBookMgr,orderHandler,dataHandler,product,server,profitMgr,exitOrderHandler,exitProduct){

  MktMakeAlgo.call(this,properties,orderBookMgr,orderHandler,dataHandler,product,server,profitMgr);

  this.exitOrderHandler = exitOrderHandler;
  this.exitProduct = exitProduct;

}
inherits(ArbAlgo,MktMakeAlgo);

ArbAlgo.prototype.generateLevels = function(){
  var Level = require('../Trading/ArbLevel');

  for(var i = 0;i<this.distance.length;i++){
    this.bids.push(new Level(i,this.product,"buy",-this.distance[i],Number(this.amount[i]),Number(this.takeProfit[i]),Number(this.stopOut[i]),this.orderHandler,this.state,Number(this.sens[i]),Number(this.stopOutTime[i]),this.dataHandler,this.lessThan,this.minIncrement,this.exitOrderHandler,this.exitProduct));
  }
  for(var i = 0;i<this.distance.length;i++){
    this.asks.push(new Level(i,this.product,"sell",Number(this.distance[i]),Number(this.amount[i]),Number(this.takeProfit[i]),Number(this.stopOut[i]),this.orderHandler,this.state,Number(this.sens[i]),Number(this.stopOutTime[i]),this.dataHandler,this.greaterThan,this.minIncrement,this.exitOrderHandler,this.exitProduct));
  }

  this.server.register(this.bids,this.asks);
}

module.exports = ArbAlgo;

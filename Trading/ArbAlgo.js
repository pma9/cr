var MktMakeAlgo = require('../Trading/MktMakeAlgo');
var inherits = require('util').inherits;
var bidTOB;
var askTOB;

var ArbAlgo = function(properties,orderBookMgrQuote,orderBookMgrHedge,orderHandler,dataHandler,product,server,profitMgr,exitOrderHandler,exitProduct){

  MktMakeAlgo.call(this,properties,orderBookMgrHedge,orderHandler,dataHandler,product,server,profitMgr);
  this.orderBookMgrQuote = orderBookMgrQuote;
  this.orderBookMgrHedge = orderBookMgrHedge;
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

ArbAlgo.prototype.registerListeners = function(){
  var self = this;

  this.orderBookMgrQuote.on('bidUpdate',function(data){
    this.bidTOB = data;
  });

  this.orderBookMgrQuote.on('askUpdate',function(data){
    this.askTOB = data;
  });

  this.orderBookMgrHedge.on('bidUpdate',function(data){
    for(var i = 0;i<self.bids.length;i++){
      self.bids[i].updateTOB(data,askTOB);
    }
  });

  this.orderBookMgrHedge.on('askUpdate',function(data){
    for(var i = 0;i<self.asks.length;i++){
      self.asks[i].updateTOB(data,bidTOB);
    }
  });

  this.orderBookMgrHedge.on('lastUpdate',function(data){
    for(var i = 0;i<self.asks.length;i++){
      self.asks[i].updateLastTrade(data);
    }
    for(var i = 0;i<self.bids.length;i++){
      self.bids[i].updateLastTrade(data);
    }
  });

  this.orderBookMgrQuote.on('seq gap',function(){
    for(var i = 0;i<self.bids.length;i++){
      self.bids[i].cancelAll();
    }
    for(var i = 0;i<self.asks.length;i++){
      self.asks[i].cancelAll();
    }
  });

  this.orderBookMgrQuote.on('disconnect',function(){
    for(var i = 0;i<self.bids.length;i++){
      self.bids[i].cancelAll();
    }
    for(var i = 0;i<self.asks.length;i++){
      self.asks[i].cancelAll();
    }
  });
  
  var updateState = function(book,state){
    for(var i = 0;i<book.length;i++){
      book[i].changeState(state);
    }
  }

  for(var i = 0;i<this.bids.length;i++){
    this.bids[i].on('entryFill',function(fill){
      self.pos = self.pos + fill.size;
      self.profitMgr.updateLong(fill);
      self.server.updatePos(self.pos);
      self.server.updateRealized(self.profitMgr.getRealized());
      updateState(self.asks,'closing');
    });
    this.bids[i].on('exitFill',function(fill){
      self.pos = self.pos - fill.size;
      self.profitMgr.updateShort(fill);
      self.server.updatePos(self.pos);
      self.server.updateRealized(self.profitMgr.getRealized());
      updateState(self.asks,'on');
    });
  } 

  for(var i = 0;i<this.asks.length;i++){
    this.asks[i].on('entryFill',function(fill){
      self.pos = self.pos - fill.size;
      self.profitMgr.updateShort(fill);
      self.server.updatePos(self.pos);
      self.server.updateRealized(self.profitMgr.getRealized());
      updateState(self.bids,'closing');
    });
    this.asks[i].on('exitFill',function(fill){
      self.pos = self.pos + fill.size;
      self.profitMgr.updateLong(fill);
      self.server.updatePos(self.pos);
      self.server.updateRealized(self.profitMgr.getRealized());
      updateState(self.bids,'on');
    });
  } 
  this.orderHandler.on('new_ack',function(data){
    self.msg++;
    self.server.updateMsgCount(self.msg);
  });

  this.orderHandler.on('cancel_ack',function(data){
    self.msg++;
    self.server.updateMsgCount(self.msg);
  });
}

module.exports = ArbAlgo;

var Level = require('../Trading/Level');
var inherits = require('util').inherits;

var ArbLevel = function(index,product,action,distance,amount,takeProfit,stopOut,orderHandler,state,sens,stopOutTime,dataHandler,comparator,minIncrement,exitOrderHandler,exitProduct){
  Level.call(this,index,product,action,distance,amount,takeProfit,stopOut,orderHandler,state,sens,stopOutTime,dataHandler,comparator,minIncrement);

  this.exitOrderHandler = exitOrderHandler;
  this.exitOrder.product = exitProduct;

  this.exitOrderHandler.on('orderUpdate',function(data){
//how to differentiate which order belongs to which level?
    if(data[1] == 'on'){
      self.exitOrder.orderID = data[2][0];
      self.exitOrder.state = 'open';
      self.emit('exitUpdate',self.index,self.exitOrder);
      console.log('incremental exit',data);
    }else if(data[1] == 'ou'){
      self.exitOrder.price = data[2][6];
      self.exitOrder.size = data[2][2];
      self.emit('exitUpdate',self.index,self.exitOrder);
      console.log('incremental exit',data);
    }else if(data[1] == 'oc'){
      self.exitOrder.state = 'done';
      self.emit('exitUpdate',self.index,self.exitOrder);
      console.log('incremental exit',data);
    }
  });

  this.exitOrderHandler.on('tradeUpdate',function(data){
    self.position = self.position - Math.abs(data[2][6]);
    self.remainder = self.amount - self.position;
    self.emit('exitFill',data);
    console.log('fill',data);
  });

}
inherits(ArbLevel,Level);

ArbLevel.prototype.newExitOrder = function(tob){
  this.exitOrder.price = Number(Number(tob) + Number(this.takeProfit));
  this.exitOrder.size = this.position;
  this.exitOrder.state = 'pending';
  this.exitOrder.clientID = this.uuid.v1();
  this.exitOrderHandler.newOrder(this.exitOrder);
}

ArbLevel.prototype.updateExitOrder = function(tob){
  if(this.stopOutCheck(tob)){
    var price = Number(Number(tob) + Number(this.takeProfit));
    if(Number(price) > Number(this.exitOrder.price) + .0001 || Number(price) < Number(this.exitOrder.price)-.0001){
      console.log('stop out',Number(price),Number(this.exitOrder.price));
      this.exitOrder.price = price;
      this.exitOrder.size = this.position;
      this.exitOrder.state = 'pending';
      this.exitOrderHandler.modifyOrder(this.exitOrder);
    }
  }
}





module.exports = ArbLevel;



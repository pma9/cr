var Order = require('../Trading/Order');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

function Level(index,product,action,distance,amount,takeProfit,stopOut,orderHandler,state,sens,stopOutTime,dataHandler,comparator,minIncrement){
  this.index = index;
  this.side = action;
  this.exitSide = 'sell';
  this.minIncrement = minIncrement;
  if(this.side == 'sell'){
    this.exitSide = 'buy';
    this.minIncrement = -this.minIncrement;
  }
  this.distance = Number(distance);
  this.amount = Number(amount);
  this.takeProfit = Number(takeProfit);
  this.stopOut = Number(stopOut);
  this.orderHandler = orderHandler;
  this.entryOrder = new Order(product,this.side,'done',0,0,0,0);
  this.exitOrder = new Order(product,this.exitSide,'done',0,0,0,0);
  this.levelState = state;
  this.sens = Number(sens);
  this.stopOutTime = Number(stopOutTime);
  this.tob = Number(0);
  this.refTob = Number(0);
  this.position = Number(0);
  this.remainder = this.amount;
  this.sweepStart = 0;
  this.sweepEnd = 0;
  this.sweepTime = 0;
  this.trailingStopMax = 0;
  this.uuid = require('uuid');
  this.dataHandler = dataHandler;
  this.comparator = comparator;
  var self = this;
  EventEmitter.call(this);

this.dataHandler.on('incremental',function(update){
  if(update.type == 'received'){
    if(update.client_oid == self.entryOrder.clientID){
       self.entryOrder.orderID = update.order_id;
       self.emit('entryUpdate',self.index, self.entryOrder);
    }else if(update.client_oid == self.exitOrder.clientID){
      self.exitOrder.orderID = update.order_id;
      self.emit('exitUpdate',self.index,self.exitOrder);
      console.log(update,self.exitOrder.orderID);
    }
  }else if(update.type == 'match'){
    if(update.maker_order_id == self.entryOrder.orderID || update.taker_order_id == self.entryOrder.orderID){
      console.log('fill',update,new Date().toISOString());
      self.emit('entryFill',update);
      if(self.position == 0){
        self.sweepStart = self.refTob;
        self.sweepEnd = update.price;
        self.sweepTime = Date.now();
      }
      self.position = self.position + update.size;
      self.remainder = self.amount - self.position;
    }else if(update.maker_order_id == self.exitOrder.orderID || update.taker_order_id == self.exitOrder.orderID){
      self.position = self.position - update.size;
      self.remainder = self.amount - self.position;
      self.emit('exitFill',update);
    }
  }else{
    if(self.entryOrder.orderID != 0){
      if(update.order_id == self.entryOrder.orderID){
      self.refTob = self.tob; //at this point you know order is cancelled or open
      self.entryOrder.state = update.type;
      self.entryOrder.size = update.remaining_size;
      self.emit('entryUpdate',self.index,self.entryOrder);
      console.log('incremental entry ',update);
      //if partial or complete fill, will get subsequent match msg
      }
    }
    if(self.exitOrder.orderID !=0){ 
     if(update.order_id == self.exitOrder.orderID){
      self.exitOrder.state = update.type;
      self.exitOrder.size = update.remaining_size;
      self.emit('exitUpdate',self.index,self.exitOrder);
      console.log('incremental exit ',update);
     }
    }
  }
});

this.orderHandler.on('new_ack',function(data){
  if(data.side == this.side){
    if(data.status == 'rejected'){
      this.entryOrder.state = 'done';
      console.log('entry order rejected',data.reject_reason);
    }
  }else if(data.side = this.exitSide){
    if(data.status == 'rejected'){
      this.exitOrder.state = 'done';
      console.log('exit order rejected',data.reject_reason);
    }
  }
});

}
inherits(Level,EventEmitter);

Level.prototype.updateSweepEnd = function(last){
  if(this.side == 'buy'){
    if(last < this.sweepEnd){
      this.sweepEnd = last;
    }
  }else{
    if(last > this.sweepEnd){
      this.sweepEnd = last;
    }
  }
}

Level.prototype.calcTakeProfitPrice = function(){
  var sweepSize = Number(this.sweepStart - this.sweepEnd);
  var offSet = Number(sweepSize * this.takeProfit);
  var takeProfitPrice = Number(Number(this.sweepEnd) + Number(offSet)).toFixed(2);
  return takeProfitPrice;
}

Level.prototype.stopOutCheck = function(tob){
  if(Date.now() > this.sweepTime + this.stopOutTime){
    if(this.trailingStopMax == 0){
       this.trailingStopMax = tob;
    }else if(this.side == 'buy'){
      if(tob > this.trailingStopMax){
        this.trailingStopMax = tob;
      }else if(tob < this.trailingStopMax - this.stopOut){
        return true;
      }
    }else{
      if(tob < this.trailingStopMax){
        this.trailingStopMax = tob;
      }else if(tob > this.trailingStopMax + this.stopOut){
        return true;
      }
    }    
  }
}

Level.prototype.newEntryOrder = function(tob){
  this.entryOrder.price = (tob + this.distance).toFixed(2);
  this.entryOrder.size = this.remainder;
  this.entryOrder.state = 'pending';
  this.entryOrder.clientID = this.uuid.v4();
  this.tob = tob;
  this.refTob = tob;
  this.orderHandler.newOrder(this.entryOrder);
}

Level.prototype.newExitOrder = function(tob){
  this.exitOrder.price = this.calcTakeProfitPrice();
  if(this.comparator(Number(this.exitOrder.price),Number(tob))){
    this.exitOrder.price = Number(Number(tob) + Number(this.minIncrement)).toFixed(2);
  }
  this.exitOrder.size = this.position;
  this.exitOrder.state = 'pending';
  this.exitOrder.clientID = this.uuid.v1();
  this.orderHandler.newOrder(this.exitOrder);
}

Level.prototype.updateExitOrder = function(tob){
  if(this.stopOutCheck(tob)){
    var price = Number(Number(tob) + Number(this.minIncrement));
    if(Number(price) > Number(this.exitOrder.price) + .0001 || Number(price) < Number(this.exitOrder.price)-.0001){
      console.log('stop out',Number(price),Number(this.exitOrder.price));
      this.exitOrder.price = price;
      this.exitOrder.size = this.position;
      this.exitOrder.state = 'pending';
      this.orderHandler.modifyOrder(this.exitOrder);
    }
  }else{
    var price = this.calcTakeProfitPrice();
    if(this.comparator(Number(price),Number(tob))){
      price = Number(Number(tob) + Number(this.minIncrement)).toFixed(2);
    }
    if(Number(price) > Number(this.exitOrder.price) || Number(price) < Number(this.exitOrder.price)){
      this.exitOrder.price = price;
      this.exitOrder.size = this.position;
      this.exitOrder.state = 'pending';
      this.orderHandler.modifyOrder(this.exitOrder);
    }
  }
}

Level.prototype.updateEntryOrder = function(tob){
  var upSens = Number(this.tob + this.sens);
  var downSens = Number(this.tob - this.sens);
  this.entryOrder.size = this.remainder;

  if(tob > upSens || tob < downSens){
    this.tob = tob;
    this.entryOrder.price = (tob + this.distance).toFixed(2);
    this.entryOrder.state = 'pending';
    this.orderHandler.modifyOrder(this.entryOrder);
  }
}


Level.prototype.updateLastTrade = function updateLastTrade(last){
  if(this.position !=0){
    this.updateSweepEnd(last);
  }
}

Level.prototype.updateTOB = function updateTOB(tob){

  if(this.position == 0){
    this.sweepStart = 0;
    this.sweepEnd = 0;
    this.trailingStopMax = 0;
    this.sweepTime = 0;
  }
  var TOB = Number(tob);
  switch(this.levelState){
    case "monitor":
      if(this.entryOrder.state == 'open'){
        this.orderHandler.cancelOrder(this.entryOrder.orderID);
      }
      if(this.exitOrder.state == 'open'){
        this.orderHandler.cancelOrder(this.exitOrder.orderID);
      }
      break;
    case "closing":
      if(this.position != 0){
        if(this.exitOrder.state == 'done'){
          this.newExitOrder(tob);
        }else if(this.exitOrder.state == 'open'){
          this.updateExitOrder(TOB);
        }
      }
      if(this.entryOrder.state == 'open'){
        this.orderHandler.cancelOrder(this.entryOrder.orderID);
      }
      break;
    case "on":
     if(this.position != 0){
         if(this.entryOrder.state == 'open'){
           this.updateEntryOrder(TOB);
         }
         if(this.exitOrder.state == 'done'){
           this.newExitOrder(tob);
         }else if(this.exitOrder.state == 'open'){
           this.updateExitOrder(TOB);
         }
      }else{
        if(this.entryOrder.state == 'done'){
          this.newEntryOrder(TOB);
        }else if(this.entryOrder.state == 'open'){
          this.updateEntryOrder(TOB);
        }
      }
      break;
    default:
      console.log("unrecognized state");
  }
}

Level.prototype.changeState = function changeState(state){
  this.levelState = state;
  console.log("Level " + this.index + "state to " + this.levelState);
}


//in case of disconnection, or manual override
Level.prototype.cancelAll = function cancelAll(){
  if(this.entryOrder.state == 'open'){
    this.orderHandler.cancelOrder(this.entryOrder.orderID);
  }
  if(this.exitOrder.state == 'open'){
    this.orderHandler.cancelOrder(this.exitOrder.orderID);
  }
}
module.exports = Level;

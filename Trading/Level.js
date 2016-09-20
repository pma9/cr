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
  var uuid = require('uuid');
  this.dataHandler = dataHandler;
  this.comparator = comparator;
  var self = this;
  EventEmitter.call(this);

this.updateSweepEnd = function(last){
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

this.calcTakeProfitPrice = function(){
  var sweepSize = sweepStart - sweepEnd;
  var offSet = sweepSize * this.takeProfit;
  return this.sweepEnd + offSet;
}

this.stopOutCheck = function(tob){
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

this.newEntryOrder = function(tob){
  this.entryOrder.price = (tob + this.distance).toFixed(8);
  this.entryOrder.size = this.remainder;
  this.entryOrder.state = 'pending';
  this.entryOrder.clientID = uuid.v4();
  this.tob = tob;
  this.refTob = tob;
  this.orderHandler.newOrder(this.entryOrder);
}

this.newExitOrder = function(tob){
  this.exitOrder.price = calcTakeProfitPrice();
  if(this.comparator(this.exitOrder.price,tob)){
    this.exitOrder.price = (tob + this.minIncrement).toFixed(8);
  }
  this.exitOrder.state = 'pending';
  this.exitOrder.clientID = uuid.v1();
  this.orderHandler.newOrder(this.exitOrder);
}

this.updateExitOrder = function(tob){
  if(this.stopOutCheck(tob)){
    this.exitOrder.price = tob;
    this.exitOrder.state = 'pending';
    this.orderHandler.modifyOrder(this.exitOrder);
  }else{
    var price = this.calcTakeProfitPrice();
    if(this.comparator(price,tob)){
      price = (tob + this.minIncrement).toFixed(8);
    }
    if(price > this.exitOrder.price && price < this.exitOrder.price){
      this.exitOrder.price = price;
      this.exitOrder.state = 'pending';
      this.orderHandler.modifyOrder(this.exitOrder);
    }
  }
}

this.updateEntryOrder = function(tob){
  var upSens = Number(this.tob + this.sens);
  var downSens = Number(this.tob - this.sens);
  this.entryOrder.size = this.remainder;

  if(tob > upSens || tob < downSens){
    this.tob = tob;
    this.entryOrder.price = (tob + this.distance).toFixed(8);
    this.entryOrder.state = 'pending';
    this.orderHandler.modifyOrder(this.entryOrder);
  }
}

this.dataHandler.on('incremental',function(update){
  if(update.type == 'received'){
    if(update.client_oid == self.entryOrder.clientID){
       self.entryOrder.orderID = update.order_id;
       self.emit('entryUpdate',self.index, self.entryOrder);
    }else if(update.client_oid == self.exitOrder.clientID){
      self.exitOrder.orderID = update.order_id;
      self.emit('exitUpdate',self.index,self.exitOrder);
    }
  }else if(update.type == 'match'){
    if(update.maker_order_id == self.entryOrder.orderID || update.taker_order_id == self.entryOrder.orderID){
      console.log('fill',update); //testing
      self.emit('entryFill',update);
      if(self.position == 0){
        self.sweepStart = self.refTob; //start recorded after initial fill
        self.sweepEnd = update.price;
        self.sweepTime = Date.now();
      }
      self.position = self.position + update.size;
      self.remainder = self.amount - self.position;
      console.log('sweep',self.sweepStart,self.sweepEnd,self.position,self.remainder);
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
      console.log(update);
      //if partial or complete fill, will get subsequent match msg
      }
    }else if(self.exitOrder.orderID !=0){ 
     if(update.order_id = self.exitOrder.orderID){
      self.exitOrder.state = update.type;
      self.exitOrder.size = update.remaining_size;
      self.emit('exitUpate',self.index,self.exitOrder);
     }
    }
  }
});

}
inherits(Level,EventEmitter);

Level.prototype.updateLastTrade = function updateLastTrade(last){
  if(this.position !=0){
    this.updateSweepSize(last);
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

var Order = require('../Trading/Order');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

function Level(index,product,action,distance,amount,orderHandler,state,sens,dataHandler,comparator,minIncrement){
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
  this.orderHandler = orderHandler;
  this.entryOrder = new Order(product,this.side,'done',0,0,0,0);
  this.levelState = state;
  this.sens = Number(sens);
  this.tob = Number(0);
  this.refTob = Number(0);
  this.position = Number(0);
  this.remainder = this.amount;
  this.sweepStart = 0;
  this.sweepEnd = 0;
  this.sweepTime = 0;
  var uuid = require('uuid');
  this.dataHandler = dataHandler;
  this.comparator = comparator;
  var self = this;
  EventEmitter.call(this);

this.newEntryOrder = function(tob){
  this.entryOrder.price = (tob + this.distance).toFixed(8);
  this.entryOrder.size = this.remainder;
  this.entryOrder.state = 'pending';
  this.entryOrder.clientID = uuid.v4();
  this.tob = tob;
  this.refTob = tob;
  this.orderHandler.newOrder(this.entryOrder);
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
  }
});

}
inherits(Level,EventEmitter);

Level.prototype.updateTOB = function updateTOB(tob){
  var TOB = Number(tob);
  switch(this.levelState){
    case "monitor":
      if(this.entryOrder.state == 'open'){
        this.orderHandler.cancelOrder(this.entryOrder.orderID);
      }
      break;
    case "closing":
      if(this.entryOrder.state == 'open'){
        this.orderHandler.cancelOrder(this.entryOrder.orderID);
      }
      break;
    case "on":
     if(this.position != 0){
         if(this.entryOrder.state == 'open'){
           this.updateEntryOrder(TOB);
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
}
module.exports = Level;

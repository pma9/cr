var Order = require('../Trading/Order');

function Level(product,action,distance,amount,takeProfit,stopOut,orderHandler,state,sens,stopOutTime,dataHandler){
  this.side = action;
  this.exitSide = 'sell';
  if(this.side == 'sell'){
    this.exitSide = 'buy';
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
  var self = this;

function updateSweepEnd(last){
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

function calcTakeProfitPrice(){
  var sweepSize = sweepStart - sweepEnd;
  var offSet = sweepSize * this.takeProfit;
  return this.sweepEnd + offSet;
}

function stopOutCheck(tob){
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
  this.entryOrder.clientID = uuid.v1();
  this.tob = tob;
  this.refTob = tob;
  this.orderHandler.newOrder(this.entryOrder);
}

function newExitOrder(){
  this.exitOrder.price = calcTakeProfitPrice();
  this.exitOrder.state = 'pending';
  this.exitOrder.clientID = uuid.v1();
  this.orderHandler.newOrder(this.exitOrder);
}

function updateExitOrder(tob){
  if(stopOutCheck(tob)){
    this.exitOrder.price = tob;
    this.exitOrder.state = 'pending';
    this.orderHandler.modifyOrder(this.exitOrder);
  }else{
    var price = calcTakeProfitPrice();
    if(price > this.exitOrder.price && price < this.exitOrder.price){
      this.exitOrder.price = price;
      this.exitOrder.state = 'pending';
      this.orderHandler.modifyOrder(this.exitOrder);
    }
  }
}

function updateEntryOrder(tob){
  var upSens = Number(this.tob + this.sens);
  var downSens = Number(this.tob + this.sens);
  this.entryOrder.size = this.remainder;

  if(tob > upSens || tob < downSens){
    this.tob = tob;
    this.entryOrder.price = (tob + this.distance).toFixed(8);
    this.entryOrder.state = 'pending';
    this.orderHandler.modifyOrder(this.entryOrder);
  }
}

this.assignClientID = function(update){
  if(update.client_oid == this.entryOrder.clientID){
     this.entryOrder.orderID = update.order_id;
  }else if(update.client_oid == this.exitOrder.clientID){
    this.exitOrder.orderID = update.order_id;
  }
}

this.dataHandler.on('incremental',function(update){
  if(update.type == 'received'){
    self.assignClientID(update);
  }else if(update.type == 'match'){
    if(update.maker_order_id == self.entryOrder.orderID || update.taker_order_id == self.entryOrder.orderID){
      if(self.position == 0){
        self.sweepStart = self.refTob; //start recorded after initial fill
        self.sweepEnd = update.price;
        self.sweepTime = Date.now();
      }
      self.position = self.position + update.size;
      self.remainder = self.amount - self.position;
    }else if(update.maker_order_id == self.exitOrder.orderID || update.taker_order_id == self.exitOrder.orderID){
      self.position = self.position - update.size;
      self.remainder = self.amount - self.position;
    }
  }else{
    if(update.order_id = self.entryOrder.orderID){
      self.refTob = self.tob; //at this point you know order is cancelled or open
      self.entryOrder.state = update.type;
      self.entryOrder.size = update.remaining_size;
      //if partial or complete fill, will get subsequent match msg
    }else if(update.order_id = self.exitOrder.orderID){
      self.exitOrder.state = update.type;
      self.exitOrder.size = update.remaining_size;
    }
  }
});

this.orderHandler.on('new_ack',function(data){
  self.assignClientID(data);
  console.log(self.entryOrder);
});

this.orderHandler.on('cancel_ack',function(update){
  if(update == self.entryOrder.orderID){
     self.entryOrder.state = 'done';
  }else if(update == self.exitOrder.orderID){
    self.exitOrder.state = 'done';
  }
});

}

Level.prototype.updateLastTrade = function updateLastTrade(last){
  if(this.position !=0){
    updateSweepSize(last);
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
      if(this.entryOrder.state = 'open'){
        this.orderHandler.cancelOrder(this.entryOrder.orderID);
      }
      if(this.exitOrder.state = 'open'){
        this.orderHandler.cancelOrder(this.exitOrder.orderID);
      }
      break;
    case "closing":
      if(this.position != 0){
        if(this.exitOrder.state = 'done'){
          newExitOrder();
        }else if(this.exitOrder.state = 'open'){
          updateExitOrder(TOB);
        }
      }
      if(this.entryOrder.state = 'open'){
        this.orderHandler.cancelOrder(this.entryOrder.orderID);
      }
      break;
    case "on":
      if(this.position != 0){
         if(this.entryOrder.state == 'open'){
           updateEntryOrder(TOB);
         }
         if(this.exitOrder.state == 'done'){
           newExitOrder();
         }else if(this.exitOrder.state == 'open'){
           updateExitOrder();
         }
      }else{
        if(this.entryOrder.state == 'done'){
          this.newEntryOrder(TOB);
        }else if(this.entryOrder.state == 'open'){
          updateEntryOrder(TOB);
        }
      }
      break;
    default:
      console.log("unrecognized state");
  }
}

Level.prototype.changeState = function changeState(state){
  this.state = state;
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

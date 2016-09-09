
function Level(product,action,distance,amount,takeProfit,stopOut,orderMgr,state,sens,stopOutTime){
  this.side = action;
  this.exitSide = 'sell';
  if(this.side == 'sell'){
    this.exitSide = 'buy';
  }
  this.distance = Number(distance);
  this.amount = Number(amount);
  this.takeProfit = Number(takeProfit);
  this.stopOut = Number(stopOut);
  this.orderMgr = orderMgr;
  this.entryOrder = new Order(product,side,'done',0,0,0,0);
  this.exitOrder = new Order(product,exitSide,'done',0,0,0,0);
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
}

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

function newEntryOrder(tob){
  this.entryOrder.price = (tob + this.distance).toFixed(8);
  this.entryOrder.size = this.remainder;
  this.entryOrder.state = 'pending';
  this.tob = tob;
  this.refTob = tob;
  this.orderMgr.requestNewOrder(this,this.entryOrder);
}

function newExitOrder(){
  this.exitOrder.price = calcTakeProfitPrice();
  this.exitOrder.state = 'pending';
  this.orderMgr.requestNewOrder(this,this.exitOrder);
}

function updateExitOrder(tob){
  if(stopOutCheck(tob)){
    this.exitOrder.price = tob;
    this.exitOrder.state = 'pending';
    this.orderMgr.modifyOrder(this,this.exitOrder);
  }else{
    var price = calcTakeProfitPrice();
    if(price > this.exitOrder.price && price < this.exitOrder.price){
      this.exitOrder.price = price;
      this.exitOrder.state = 'pending';
      this.orderMgr.modifyOrder(this,this.exitOrder);
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
    this.orderMgr.modifyOrder(this,this.entryOrder);
  }
}

Level.prototype.updateLastTrade(last){
  if(position !=0){
    updateSweepSize(last);
  }
}

//updates order price and quantity
Level.prototype.updateTOB = function updateTOB(tob){
  if(position == 0){
    this.sweepStart = 0;
    this.sweepEnd = 0;
    this.trailingStopMax = 0;
    this.sweepTime = 0;
  }
  var TOB = Number(tob);
  switch(this.state){
    case "monitor":
      if(this.entryOrder.state = 'open'){
        this.orderMgr.cancelOrder(this.entryOrder.orderID);
      }
      if(this.exitOrder.state = 'open'){
        this.orderMgr.cancelOrder(this.exitOrder.orderID);
      }
      break;
    case "closing":
      if(this.position != 0){
        if(this.exitOrder.state = 'done'){
          //request new exit order
        }else if(this.exitOrder.state = 'open'){
          //update exit order
          //do nothing on pending
        }
      }
      if(this.entryOrder.state = 'open'){
        this.orderMgr.cancelOrder(this.entryOrder.orderID);
      }
      break;
    case "on":
      if(this.position != 0){
         if(this.entryOrder.state == 'open'){
           //continue updating
         }
         if(this.exitOrder.state == 'done'){
           //request new exit order
         }else if(this.exitOrder.state == 'open'){
           //continue updating
         }
      }else{
        if(this.entryOrder.state == 'done'){
          newEntryOrder(TOB);
        }else if(this.entryOrder.state == 'open'){
          //update entry order
          //do nothing on pending
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

Level.prototype.updateOrder(update){
  if(update.type == 'received'){
    if(update.client_oid == this.entryOrder.clientID){
      this.entryOrder.orderID = update.order_id;
    }else if(update.client_oid == this.exitOrder.clientID){
      this.exitOrder.orderID = update.order_id;
    }
  }else{
    if(update.order_id = this.entryOrder.orderID){
      this.refTob = this.tob; //at this point you know order is cancelled or open
      this.entryOrder.state = update.type;
      this.entryOrder.size = update.remaining_size;
      //if partial or complete fill, will get subsequent match msg
    }else if(update.order_id = this.exitOrder.orderID){
      this.exitOrder.state = update.type;
      this.exitOrder.size = update.remaining_size;
    }
  }
}

Level.prototype.updatePosition(update){
  if(update.maker_order_id == this.entryOrder.orderID || update.taker_order_id == this.entryOrder.orderID){
    if(this.position == 0){
      this.sweepStart = this.refTob; //start recorded after initial fill
      this.sweepEnd = update.price;
      this.sweepTime = Date.now();
    }
    this.position = this.position + update.size;
    this.remainder = this.amount - this.position;
  }else if(update.maker_order_id == this.exitOrder.orderID || update.taker_order_id == this.exitOrder.orderID){
    this.position = this.position - update.size;
    this.remainder = this.amount - this.position;
  }
}

//in case of disconnection, or manual override
Level.prototype.cancelAll(){
  if(this.entryOrder.state == 'open'){
    this.orderMgr.cancelOrder(this.entryOrder.orderID);
  }
  if(this.exitOrder.state == 'open'){
    this.orderMgr.cancelOrder(this.exitOrder.orderID);
  }
}
module.exports = Level;

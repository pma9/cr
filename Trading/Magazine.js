var Level = require('../Trading/Level');
var inherits = require('util').inherits;

var Magazine = function (index,product,action,distance,amount,takeProfit,stopOut,orderHandler,state,sens,stopOutTime,dataHandler,comparator,minIncrement,clipSize,minSpread){
  Level.call(this,index,product,action,distance,amount,takeProfit,stopOut,orderHandler,state,sens,stopOutTime,dataHandler,comparator,minIncrement);
  this.clipSize = clipSize;
  this.minSpread = minSpread;
}
inherits(Magazine,Level);

Magazine.prototype.newEntryOrder = function(tob,opposite){
  this.entryOrder.price = Number(tob + this.distance).toFixed(2);
  if(this.comparator(Number(opposite),Number(this.entryOrder.price))){
    this.entryOrder.price = tob;
  }
  this.entryOrder.size = this.clipSize;
  if(this.remainder < this.entryOrder.size){
    this.entryOrder.size = this.remainder;
  }
  if(this.entryOrder.size >Number(0)){
    console.log('newEntry','remainder:',this.remainder,'orderSize:',this.entryOrder.size);
    this.entryOrder.state = 'pending';
    this.entryOrder.clientID = this.uuid.v4();
    this.tob = tob;
    this.refTob = tob;
    this.orderHandler.newOrder(this.entryOrder);
  }
}

Magazine.prototype.updateEntryOrder = function(tob,opposite){
  var upSens = Number(this.tob + this.sens);
  var downSens = Number(this.tob - this.sens);
  this.entryOrder.size = this.clipSize;
  if(this.remainder < this.entryOrder.size){
    this.entryOrder.size = this.remainder;
  }

  if(tob > upSens || tob < downSens){
    this.tob = tob;
    this.entryOrder.price = Number(tob + this.distance).toFixed(2);
    if(this.comparator(Number(opposite),Number(this.entryOrder.price))){
      this.entryOrder.price = tob;
    }
    if(this.entryOrder.size > Number(0)){
      console.log('adjEntry','remainder:',this.remainder,'orderSize:',this.entryOrder.size);
      this.entryOrder.state = 'pending';
      this.orderHandler.modifyOrder(this.entryOrder);
    }
  }
}

Level.prototype.newExitOrder = function(tob,opposite){
  this.exitOrder.price = Number(tob + this.takeProfit).toFixed(2);
  if(this.comparator(Number(this.exitOrder.price),Number(opposite))){
    this.exitOrder.price = Number(Number(opposite) + Number(this.minIncrement)).toFixed(2);
  }
  this.exitOrder.size = this.position;
  if(this.exitOrder.size > this.clipSize){
    this.exitOrder.size = this.clipSize;
  }
  this.exitOrder.state = 'pending';
  this.exitOrder.clientID = this.uuid.v1();
  this.orderHandler.newOrder(this.exitOrder);
}

Level.prototype.updateExitOrder = function(tob,opposite){
  var price = Number(tob + this.takeProfit).toFixed(2);
  var upSens = Number(Number(this.exitOrder.price) + Number(this.minIncrement));
  var downSens = Number(Number(this.exitOrder.price) - Number(this.minIncrement));

  if(this.comparator(Number(price),Number(opposite))){
    price = Number(Number(opposite) + Number(this.minIncrement)).toFixed(2);
  }

  if(Number(price) > upSens || Number(price) < downSens ){
    console.log('exitmodify',downSens,price,upSens);
    this.exitOrder.price = price;
    this.exitOrder.size = this.position;
    if(this.exitOrder.size > this.clipSize){
      this.exitOrder.size = this.clipSize;
    }
    this.exitOrder.state = 'pending';
    this.orderHandler.modifyOrder(this.exitOrder);
  }
}

Magazine.prototype.updateTOB = function updateTOB(tob,tobQuote){
  if(this.position == 0){
    this.sweepStart = 0;
    this.sweepEnd = 0;
    this.trailingStopMax = 0;
    this.sweepTime = 0;
    this.stopOutState = false;
  }
  var TOB = Number(tob);
  var TOBQUOTE = Number(tobQuote);
  var spread = Number(Math.abs(tob - tobQuote));
  switch(this.levelState){
    case "monitor":
      if(this.entryOrder.state == 'open'){
        this.orderHandler.cancelOrder(this.entryOrder.orderID);
      }
      if(this.exitOrder.state == 'open'){
        this.orderHandler.cancelOrder(this.exitOrder.orderID);
      }
      break;
    case "neutral":
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
          this.newExitOrder(TOBQUOTE,TOB);
        }else if(this.exitOrder.state == 'open'){
          this.updateExitOrder(TOBQUOTE,TOB);
        }
      }
      if(this.entryOrder.state == 'open'){
        this.orderHandler.cancelOrder(this.entryOrder.orderID);
      }
      break;
    case "on":
//     if(this.position != 0){
//should only send exit order if "closing", imbalance will be flipped
//         if(this.entryOrder.state == 'open'){
//           this.updateEntryOrder(TOB,TOBQUOTE);
//         }
//         if(this.exitOrder.state == 'done'){
//           this.newExitOrder(TOBQUOTE,TOB);
//         }else if(this.exitOrder.state == 'open'){
//           this.updateExitOrder(TOBQUOTE,TOB);
//         }
//      }else{
        if(this.entryOrder.state == 'done'){
          if(spread > this.minSpread){
            this.newEntryOrder(TOB,TOBQUOTE);
          }
        }else if(this.entryOrder.state == 'open'){
          this.updateEntryOrder(TOB,TOBQUOTE);
        }
 //     }
      break;
    default:
      console.log("unrecognized state");
  }
}


module.exports = Magazine;

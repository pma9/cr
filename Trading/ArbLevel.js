var Level = require('../Trading/Level');
var inherits = require('util').inherits;

var ArbLevel = function(index,product,action,distance,amount,takeProfit,stopOut,orderHandler,state,sens,stopOutTime,dataHandler,comparator,minIncrement,exitOrderHandler,exitProduct){
  Level.call(this,index,product,action,distance,amount,takeProfit,stopOut,orderHandler,state,sens,stopOutTime,dataHandler,comparator,minIncrement);

  this.exitOrderHandler = exitOrderHandler;
  this.exitOrder.product = exitProduct;
  var self = this;

  this.exitOrderHandler.on('orderUpdate',function(data){

    if(data[1] == 'on'){
      //initial identification by side and size
      var amount = self.exitOrder.size;
      if(self.exitSide == 'sell'){
        amount = -amount;
      }
      if(data[2][3] == amount){
        self.exitOrder.orderID = data[2][0];
        self.exitOrder.state = 'open';
        self.emit('exitUpdate',self.index,self.exitOrder);
        console.log('incremental exit',data);
      }
//    }else if(data[1] == 'ou'){
//      //subsequent identification by id
//      if(data[2][0] == self.exitOrder.orderID){
//        self.exitOrder.price = data[2][6];
//        self.exitOrder.size = data[2][2];
//        self.emit('exitUpdate',self.index,self.exitOrder);
//        console.log('incremental exit',data);
//      }
//    }else if(data[1] == 'oc'){
//      if(data[2][0] == self.exitOrder.orderID){
//        self.exitOrder.state = 'done';
//        self.emit('exitUpdate',self.index,self.exitOrder);
//        console.log('incremental exit',data);
//      }
    }
  });

  this.exitOrderHandler.on('tradeUpdate',function(data){
    if(data[2][4] == self.exitOrder.orderID){
      console.log('orderID',data[2][4]);
      self.position = self.position - Math.abs(data[2][5]);
      console.log('pos after exit:',self.position,'fill:',Math.abs(data[2][5]));
      self.remainder = self.amount - self.position;
      if(self.position == 0){
        self.exitOrder.state = 'done';
      }
      console.log('remainder',self.remainder,'amount',self.amount,'pos',self.position);
      var side = 'buy';
      if(data[2][5] < 0){
        side = 'sell';
      }
      var fill = {trade_id:data[2][1],side:side,price:data[2][6],size:Math.abs(data[2][5]),time:data[2][3]};
      self.emit('exitFill',fill);
      console.log('fill',data);
    }
  });

}
inherits(ArbLevel,Level);

ArbLevel.prototype.newEntryOrder = function(tob,tobQuote){
  this.entryOrder.price = (tob + this.distance).toFixed(2);
  if(this.comparator(Number(tobQuote),Number(this.entryOrder.price))){
    console.log('adjust entry: ',this.entryOrder.price,tobQuote,this.minIncrement);
    this.entryOrder.price = Number(Number(tobQuote) - Number(this.minIncrement)).toFixed(2);
    console.log('adjusted to: ',this.entryOrder.price);
  }
  this.entryOrder.size = this.remainder;
  this.entryOrder.state = 'pending';
  this.entryOrder.clientID = this.uuid.v4();
  this.tob = tob;
  this.refTob = tob;
  this.orderHandler.newOrder(this.entryOrder);
}

ArbLevel.prototype.newExitOrder = function(tob){
  console.log('arbLevel: calc new exit',this.side,this.index,this.position,new Date().toISOString());
  this.exitOrder.price = Number(Number(tob) + Number(this.takeProfit)).toFixed(2);
  this.exitOrder.size = this.position;
  this.exitOrder.state = 'pending';
  this.exitOrder.clientID = this.uuid.v1();
  this.exitOrderHandler.newOrder(this.exitOrder);
}

ArbLevel.prototype.updateExitOrder = function(tob){
  console.log('arbLevel: updating exit');
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

ArbLevel.prototype.updateTOB = function updateTOB(tob,tobQuote){
  if(this.position == 0){
    this.sweepStart = 0;
    this.sweepEnd = 0;
    this.trailingStopMax = 0;
    this.sweepTime = 0;
    this.stopOutState = false;
  }
  var TOB = Number(tob);
  var TOBQUOTE = Number(tobQuote);
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
          this.newEntryOrder(TOB,TOBQUOTE);
        }else if(this.entryOrder.state == 'open'){
          this.updateEntryOrder(TOB);
        }
      }
      break;
    default:
      console.log("unrecognized state");
  }
}

module.exports = ArbLevel;



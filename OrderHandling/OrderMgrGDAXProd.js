var inherits = require('utils').inherits;
var EventEmitter = require('events').EventEmitter;
var uuid = require('uuid');
var unacked = [];
var pending = [];
var open = [];
var filled = []; //includes partials
var done = []; //filled and cancelled
console.log(
function OrderMgrGDAXProd(currencyPair,orderHandler,dataHandler){
  this.currencyPair = currencyPair;
  this.orderHandler = orderHandler;
  this.dataHandler = dataHandler;
  EventEmitter.call(this);
}
inherits(OrderMgrGDAXProd,EventEmitter);

OrderMgrGDAXPRod.prototype.requestNewOrder = function requestNewOrder(level,order){
//this class should just be a register for order IDs
//is there speed improvement with a single register? simpler to have each Level track own orderID
//most of these requests can be passed directly to handler
//3 handler functions: new order, cancels, status

//can entire level be passed to this function?
  this.orderHandler.request(msg);
  unacked.push({level:level,oid:oid});
}


OrderMgrGDAXPRod.prototype.cancelOrder = function cancelOrder(orderNumber){
  var msg = {currencyPair:this.currencyPair,action:'cancel',orderNumber:orderNumber};
  this.orderHandler.request(msg);
}


OrderMgrGDAXPRod.prototype.modifyOrder = function modifyOrder(orderNumber,rate,amount){
  //this is not supported on GDAX?
  //could simply route to cancel, then algo will resubmit new
  this.cancelOrder(orderNumber);
}

this.dataHandler.on('incremental',function(update){
  var self = this;
  if(update.type == 'received'){
    for(var i = 0;i<unacked.length;i++){
      if(unacked[i].oid == update.client_oid){
        var level = unacked[i].level;
        pending.push(level:level,order:update);
        unacked.splice(i,1);
        level.updateOrder(update);
        break;
      }
    }
  }else if(update.type == 'open'){
    for(var i = 0;i<pending.length;i++){
      if(pending[i].order.orderID == update.order_id){
        var level = pending[i].level;
        open.push({level:level,order:update);
        pending.splice(i,1);
        level.updateOrder(update);
        break;
    }
  }else if(update.type == 'match'){
    for(var i = 0;i<open.length;i++){
      if(open[i].order.orderID == update.maker_order_id){
        var level = open[i].level;
        filled.push(update);
        level.updatePosition(update);
        break;
      }
    }
  }else if(update.type == 'done'){
    for(var i = 0;i<open.length;i++){
      if(open[i].order.orderID == update.order_id){
        var level = open[i].level;
        done.push(level:level,order:update);
        open.splice(i,1);
        level.updateOrder(update);
        break;
      }
    }
  }
});

module.exports = OrderMgrGDAXProd;

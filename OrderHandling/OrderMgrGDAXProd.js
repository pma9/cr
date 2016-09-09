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

OrderMgrGDAXPRod.prototype.requestNewOrder = function requestNewOrder(level,action,rate,amount){
  var oid = uuid.v1();
  var msg = {currencyPair:this.currencyPair,action:action,rate:rate,amount:amount,client_oid:oid}
  this.orderHandler.request(msg);
  unacked.push({level:level,oid:oid});
}


OrderMgrGDAXPRod.prototype.cancelOrder = function cancelOrder(orderNumber){
  var msg = {currencyPair:this.currencyPair,action:'cancel',orderNumber:orderNumber};
  this.orderHandler.request(msg);
}


OrderMgrGDAXPRod.prototype.modifyOrder = function modifyOrder(orderNumber,rate,amount){
  //this is not supported on GDAX?
  //cancel
  //new
}

this.dataHandler.on('incremental',function(update){
  var self = this;
  if(update.type == 'received'){
    for(var i = 0;i<unacked.length;i++){
      if(unacked[i].oid == update.client_oid){
        var order = {level:unacked[i].level,orderID:update.order_id};
        pending.push(order);
        unacked.splice(i,1);
        self.emit('pending',order);
        break;
      }
    }
  }else if(update.type == 'open'){
    for(var i = 0;i<pending.length;i++){
      if(pending[i].orderID == update.order_id){
        var order = {level:pending[i].level,orderID:pending[i].orderID,amount:update.remaining_size};
        open.push(order);
        //possible portion filled immediately, level must resolve
        pending.splice(i,1);
        self.emit('open',order);
        break;
    }
  }else if(update.type == 'match'){
    for(var i = 0;i<open.length;i++){
      if(open[i].orderID == update.maker_order_id){
        var order = {level:open[i].level,orderID:open[i].orderID,amount:update.size,price:update.price,time:update.time};
        filled.push(order);
        self.emit('fill',order);
        break;
      }
    }
  }else if(update.type == 'done'){
    for(var i = 0;i<open.length;i++){
      if(open[i].orderID == update.order_id){
        var order = {level:open[i].level,orderID:open[i].orderID};
        done.push(order);
        open.splice(i,1);
        self.emit('done',order);
        break;
      }
    }
  }
});

module.exports = OrderMgrGDAXProd;

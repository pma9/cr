var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var uuid = require('uuid');

function OrderHandlerGDAXHist(){
  EventEmitter.call(this);
}
inherits(OrderHandlerGDAXHist,EventEmitter);

OrderHandlerGDAXHist.prototype.newOrder = function newOrder(msg){
  var self = this;
  msg.order_id = uuid.v1();
  self.emit('new_ack',msg); 
} 
OrderHandlerGDAXHist.prototype.cancelOrder = function cancelOrder(msg){
  var self = this;
  self.emit('cancel_ack',msg.orderID);    
}
OrderHandlerGDAXHist.prototype.modifyOrder = function modifyOrder(msg){
  this.cancelOrder(msg);
}

OrderHandlerGDAXHist.prototype.query = function query(msg){
}


module.exports = OrderHandlerGDAXHist;

var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('/home/jeff/api/apiSettings.ini');
var key = properties.get('data.keyGMNI');
var secret = properties.get('data.secretGMNI');
var Gemini = require('gemini');
var gemini = new Gemini(key,secret);
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var uuid = require('uuid');

function OrderHandlerGMNI(){
  EventEmitter.call(this);
}
inherits(OrderHandlerGMNI,EventEmitter);

OrderHandlerGMNI.prototype.newOrder = function(msg){
  var self = this;
  gemini.new_order(msg.product,msg.size,msg.price,'all',msg.side,'limit',function(err,res,order_id){
    console.log('response:',res,'orderID:',order_id);
    self.emit('new_ack',res);
  });
}

OrderHandlerGMNI.prototype.cancelOrder = function(msg){
  var self = this;
  gemini.cancel_order(msg.orderID,function(err,res,order_id){
    console.log('res:',res,order_id);
    self.emit('cancel_ack',res);
  });
}

OrderHandlerGMNI.prototype.cancelAll = function(msg){
  var self = this;
  gemini.cancel_all_orders(function(err,res,data){
    console.log(res,data);
    self.emit('cancel_all_ack',res,data);
  });
}

OrderhandlerGMNI.prototype.openOrders = function(msg){
  var self = this;
  gemini.active_orders(function(err,res,data){
    console.log(res,data);
    self.emit('ack',res,data);
  });
}

module.exports = OrderHandlerGMNI;

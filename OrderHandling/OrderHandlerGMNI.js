var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('/home/jeff/api/apiSettings.ini');
var key = properties.get('data.keyGMNI');
var secret = properties.get('data.secretGMNI');
var geminiApi = require('gemini-api');
var gemini = new geminiApi.default({key,secret,sandbox:false});
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var uuid = require('uuid');

function OrderHandlerGMNI(){
  EventEmitter.call(this);
}
inherits(OrderHandlerGMNI,EventEmitter);

OrderHandlerGMNI.prototype.newOrder = function(msg){
  var self = this;
  var params ={
    'symbol':msg.product,
    'amount':msg.size,
    'price':msg.price,
    'side':msg.side,
    'type':'exchange limit'
  }
  gemini.newOrder(params).then(function(data){
    console.log(data);
    self.emit('new_ack',data);
  });
}

OrderHandlerGMNI.prototype.cancelOrder = function(msg){
  var self = this;
  gemini.cancelOrder(msg.orderID).then(function(data){
    console.log('res:',data);
    self.emit('cancel_ack',data);
  });
}

OrderHandlerGMNI.prototype.cancelAll = function(msg){
  var self = this;
  gemini.cancelAllActiveOrders().then(function(data){
    console.log(data);
    self.emit('cancel_all_ack',data);
  });
}

OrderHandlerGMNI.prototype.openOrders = function(msg){
  var self = this;
  gemini.getMyActiveOrders().then(function(data){
    console.log(data);
    self.emit('ack',data);
  });
}

module.exports = OrderHandlerGMNI;

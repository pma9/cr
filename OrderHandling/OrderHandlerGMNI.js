var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('/home/jeff/api/apiSettings.ini');
var key = properties.get('data.keyGMNI');
var secret = properties.get('data.secretGMNI');
var geminiApi = require('gemini-api');
var gemini = new geminiApi.default({key,secret,sandbox:false});
var ws = new geminiApi.default.WebsocketClient({key,secret,sandbox:false});
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var uuid = require('uuid');

function OrderHandlerGMNI(product){
  EventEmitter.call(this);
  var self = this;

  ws.openOrderSocket(product,function(){});
  
  ws.addOrderMessageListener(function(data){
    if(Array.isArray(data) && data.length >0){
      if(data[0].type == 'accepted'){
        self.emit('orderUpdate',data[0]);
        console.log('ws orderUpdate:',data[0]);
      }else if(data[0].type == 'fill'){
         self.emit('tradeUpdate',data[0]);
        console.log('ws tradeUpdate:',data[0]);
      }    
    }
  });

}
inherits(OrderHandlerGMNI,EventEmitter);

OrderHandlerGMNI.prototype.newOrder = function(msg){
  var self = this;
  var params ={
    'symbol':msg.product,
    'amount':msg.size,
    'price':msg.price,
    'side':msg.side,
    'client_order_id':msg.clientID,
    'type':'exchange limit'
  }
  console.log('set order ID:',msg.clientID);
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

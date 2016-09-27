var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('/home/jeff/api/apiSettings.ini');
var key = properties.get('data.keyGDAX');
var secret = properties.get('data.secretGDAX');
var pass = properties.get('data.passPhraseGDAX');
var GDAX = require('gdax');
var gdax = new GDAX.AuthenticatedClient(key,secret,pass);
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var uuid = require('uuid');

function OrderHandlerGDAXProd(){
  EventEmitter.call(this);
}
inherits(OrderHandlerGDAXProd,EventEmitter);

OrderHandlerGDAXProd.prototype.newOrder = function newOrder(msg){
  var self = this;
  switch(msg.side){
    case 'buy':
      var buyParams = {
        'price': msg.price,
        'size': msg.size,
        'product_id': msg.product,
        'client_oid': msg.clientID,
        'post_only': 'true'
      }
      gdax.buy(buyParams,function(err,res,data){
        self.emit('new_ack',data);
      });
      break;
    case 'sell':
      var sellParams = {
        'price': msg.price,
        'size': msg.size,
        'product_id': msg.product,
        'client_oid': msg.clientID,
        'post_only': 'true'
      }
      gdax.sell(sellParams,function(err,res,data){
        console.log(err,data);
        self.emit('new_ack',data);
      });
      break;
  }
} 
OrderHandlerGDAXProd.prototype.cancelOrder = function cancelOrder(msg){
  var self = this;
      gdax.cancelOrder(msg.orderID,function(err,res,data){
        self.emit('cancel_ack',data);
      });
}
OrderHandlerGDAXProd.prototype.modifyOrder = function modifyOrder(msg){
  this.cancelOrder(msg);
}
OrderHandlerGDAXProd.prototype.cancelAll = function cancelAll(msg){
  var self = this;
  var params = {product_id:msg.product};
  gdax.cancelAllOrders(params,function(err,res,data){
    self.emit('ack',data);
  });
}

OrderHandlerGDAXProd.prototype.query = function query(msg){
  var self = this;
  var currencyPair = msg.currencyPair;

  switch(msg.action){
    case "fills":
      gdax.getFills(function(err,res,data){
        self.emit('fill_ack',data);
      });
      break;
    case "openOrders":
      gdax.getOrders(function(err,res,data){
        self.emit('ack',data);
      });
      break;
    case "getOrder":
      gdax.getOrder(msg.orderNumber,function(err,res,data){
        self.emit('ack',data);
      });
      break;
    case "time":
      gdax.getTime(function(err,res,data){
        self.emit('ack',data);
      });
      break;
    default:
      console.log('command not recognized');  
  }
}


module.exports = OrderHandlerGDAXProd;

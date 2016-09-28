var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('/home/jeff/api/apiSettings.ini');
var key = properties.get('data.keyBFNX');
var secret = properties.get('data.secretBFNX');
var BFNX_Rest = require('bitfinex-api-node').APIRest;
var bfnx = new BFNX_Rest(key,secret);
var BFNX_WS = require('bitfinex-api-node').WS;
var ws = new BFNX_WS(key,secret);
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var uuid = require('uuid');

function OrderHandlerBFNXProd(){
  EventEmitter.call(this);

  ws.on('open',function(){
    ws.auth();
  });

  ws.on('message',function(data){
    if(data.event == 'auth'){
      console.log(data);
    }
    if(data[1] == 'on' || data[1] == 'ou' || data[1] == 'oc'){
      self.emit('orderUpdate',data);
    }else if(data[1] == 'tu'){
      self.emit('tradeUpdate',data);
    }
  });

  ws.on('close',function(){
    console.log('BFNX auth ws connection lost');
  });
}
inherits(OrderHandlerBFNXProd,EventEmitter);

OrderHandlerBFNXProd.prototype.newOrder = function newOrder(msg){
  var self = this;
  switch(msg.side){
    case 'buy':
      bfnx.new_order(msg.product,msg.size,msg.price,'bitfinex','buy','exchange limit',function(err,res,data){
        self.emit('new_ack',res);
      });
      break;
    case 'sell':
      bfnx.new_order(msg.product,msg.size,msg.price,'bitfinex','sell','exchange limit',function(err,res,data){
        self.emit('new_ack',res);
      });
      break;
  }
} 
OrderHandlerBFNXProd.prototype.cancelOrder = function cancelOrder(msg){
  var self = this;
      bfnx.cancel_order(msg.orderID,function(err,res,data){
        self.emit('cancel_ack',res);
      });
}
OrderHandlerBFNXProd.prototype.modifyOrder = function modifyOrder(msg){
  var self = this; 
  bfnx.replace_order(msg.orderID,msg.product,msg.size,msg.price,'bitfinex',msg.side,'exchange limit',function(err,res,data){
    self.emit('replace_ack',err,res,data);
  });

}
OrderHandlerBFNXProd.prototype.cancelAll = function cancelAll(msg){
  var self = this;
  bfnx.cancel_all_orders(function(err,res,data){
    self.emit('ack',res);
  });
}

OrderHandlerBFNXProd.prototype.query = function query(msg){
  var self = this;

  switch(msg.action){
    case "fills":
      bfnx.past_trades(msg.product,function(err,res,data){
        self.emit('ack',res);
      });
      break;
    case "openOrders":
      bfnx.active_orders(function(err,res,data){
        self.emit('ack',res);
      });
      break;
    case "getOrder":
      bfnx.order_status(msg.orderID,function(err,res,data){
        self.emit('ack',res);
      });
      break;
    case "time":
      bfnx.getTime(function(err,res,data){
        self.emit('ack',res);
      });
      break;
    default:
      console.log('command not recognized');  
  }
}

module.exports = OrderHandlerBFNXProd;

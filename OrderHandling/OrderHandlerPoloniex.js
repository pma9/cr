var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('/home/jeff/api/apiSettings.ini');
var Poloniex = require('poloniex-unofficial');
var key = properties.get('data.key');
var secret = properties.get('data.secret');

var poloniex = new Poloniex.TradingWrapper(key,secret,function(){
  return Date.now()*1000;
});
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

function OrderHandlerPoloniex(orderManager){
  orderManager.on('message',function(msg){

    var action = msg.action;
    var currencyPair = msg.currencyPair;

    switch(action){
      case "openOrders":
        poloniex.returnOpenOrders(currencyPair,function(err,data){
          console.log(err,data);
        });
        break;
      case "tradeHistory":
        var start = 0;
        var end = msg.end;
        poloniex.returnTradeHistory(currencyPair,start,end,function(err,data){
          console.log(err,data);
        });
        break;
      case "cancel":  
        var orderNumber = msg.orderNumber;
        poloniex.cancelOrder(orderNumber,function(err,data){
          console.log(err,data);
        });
        break;
     case "buy":
        var rate = msg.rate;
        var amount = msg.amount;
        poloniex.buy(currencyPair,rate,amount,0,0,0,function(err,data){
          console.log(err,data);
        }); 
        break;
     case "sell":
        var rate = msg.rate;
        var amount = msg.amount;
        poloniex.sell(currencyPair,rate,amount,0,0,0,function(err,data){
          console.log(err,data);
        }); 
        break;
     default:
        console.log('command not recognized');
    }
  });
}
module.exports = OrderHandlerPoloniex;

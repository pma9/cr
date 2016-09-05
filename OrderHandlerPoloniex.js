var Poloniex = require('poloniex-unofficial');
var poloniex = new Poloniex.TradingWrapper('1Q0BJ6CX-QESJ00ND-3NOAYKKE-GLX6B8J3','9915a3cbcf751e3bb619c98cee19b3c448cfe76adae58248f849c1c78bc7f28d61852ba1d2cfba5734214eb5b12952606f56efe35fc2546dfd937a2027f62470',function(){
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

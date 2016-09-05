var Poloniex = require('poloniex-unofficial');
var poloniex = new Poloniex.TradingWrapper('1Q0BJ6CX-QESJ00ND-3NOAYKKE-GLX6B8J3','9915a3cbcf751e3bb619c98cee19b3c448cfe76adae58248f849c1c78bc7f28d61852ba1d2cfba5734214eb5b12952606f56efe35fc2546dfd937a2027f62470',function(){
  return Date.now()*1000;
});

var action = process.argv[2];
var currencyPair = process.argv[3];    

switch(action){
  case "openOrders":
    poloniex.returnOpenOrders(currencyPair,function(err,data){
      console.log(err,data);
    });
    break;
  case "tradeHistory":
    var start = 0;
    var end = process.argv[4];
    poloniex.returnTradeHistory(currencyPair,start,end,function(err,data){
      console.log(err,data);
    });
    break;
  case "cancel":  
    var orderNumber = process.argv[3];
    poloniex.cancelOrder(orderNumber,function(err,data){
      console.log(err,data);
    });
    break;
  case "buy":
    var rate = process.argv[4];
    var amount = process.argv[5];
    poloniex.buy(currencyPair,rate,amount,0,0,0,function(err,data){
      console.log(err,data);
    }); 
    break;
  case "sell":
    var rate = process.argv[4];
    var amount = process.argv[5];
    poloniex.sell(currencyPair,rate,amount,0,0,0,function(err,data){
      console.log(err,data);
    }); 
    break;
  default:
    console.log('command not recognized');
}


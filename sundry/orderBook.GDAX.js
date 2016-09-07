var gdax = require('gdax');
var orderBookSync = new gdax.OrderbookSync();
var webSocket = new gdax.WebsocketClient();

webSocket.on('message',function(data){
  if(orderBookSync.book._bids.size > 0 && orderBookSync.book._asks.size >0){
    var bid = Number(orderBookSync.book._bids.max().price);
    var ask = Number(orderBookSync.book._asks.min().price);
    console.log(bid,ask);
  }
});


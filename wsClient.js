var WebSocket = require('ws');
var ws = new WebSocket('wss://ws-feed.gdax.com');

ws.on('open',function open(){
    var subscribe = {
      "type": "subscribe",
      "product_id": "BTC-USD"
    };
    var heartbeat = {
      "type": "heartbeat",
      "on": true
    };
    ws.send(JSON.stringify(subscribe));
    ws.send(JSON.stringify(heartbeat));
});


ws.on('message',function(data){
  var parsed = JSON.parse(data);    
  if(parsed.type == 'heartbeat'){
    console.log(data);
  }
});

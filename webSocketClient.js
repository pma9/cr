var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        var data = message.data;
        console.log(data.toString());

    });
  if(connection.connected){
    var subscribe = {
      "type": "subscribe",
      "product_id": "BTC-USD"
    };
    var heartbeat = {
      "type": "hearbeat",
      "on": true
    };
    connection.sendUTF(JSON.stringify(subscribe));
    connection.sendUTF(JSON.stringify(heartbeat));
  }


});
 
client.connect('wss://ws-feed.gdax.com', 'echo-protocol');

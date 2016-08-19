var gdax = require('gdax');
var webSocket = new gdax.WebsocketClient();
var callback = function(data){
  console.log(data);
};

webSocket.on('message', callback);


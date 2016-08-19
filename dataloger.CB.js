var CoinBaseExchange = require('coinbase-exchange');
var fs = require('fs');

var webSocket = new CoinBaseExchange.WebsocketClient();
webSocket.on('message',function(data){
var output = new String();
  if(data.type == 'received'){
    output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.remaining_size + ',' + data.side + ',' + data.order_type;
  }else if(data.type == 'open'){
    output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.remaining_size + ',' + data.side;
  }else if(data.type == 'done'){
    output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.remaining_size + ',' + data.side + ',' + data.order_type + ',' + data.reason;
  }else if(data.type == 'match'){
    console.log(data.price);
    output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.trade_id + ',' + data.price + ',' + data.size + ',' + data.side;
  }else if(data.type == 'change'){
    output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.size + ',' + data.side;
  }
  
  var date = data.time;
  var filename = date.charAt(0) + date.charAt(1) + date.charAt(2) + date.charAt(3) + date.charAt(5) + date.charAt(6) + date.charAt(8) + date.charAt(9);

  fs.appendFile(filename,JSON.stringify(output).replace(/\"/g,"")+'\r\n');

});

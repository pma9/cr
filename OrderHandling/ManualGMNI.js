var OrderHandler = require('../OrderHandling/OrderHandlerGMNI');
var orderHandler = new OrderHandler('btcusd');
var msg = {}
msg.action = process.argv[2];
msg.product = process.argv[3];
var uuid = require('uuid');
msg.clientID = uuid.v1();

switch(msg.action){
  case "openOrders":
    orderHandler.openOrders(msg);
    break;
  case "cancel":
    msg.orderID = process.argv[3];
    orderHandler.cancelOrder(msg);
    break;
  case "buy":
    msg.price = process.argv[4];
    msg.size = process.argv[5];
    msg.side = 'buy';
    orderHandler.newOrder(msg);
    break;
  case "sell":
    msg.price = process.argv[4];
    msg.size = process.argv[5];
    msg.side = 'sell';
    orderHandler.newOrder(msg);
    break;
  case "cancelAll":
    orderHandler.cancelAll(msg);
    break;
  case "test":
    msg.price = Number(2300);
    msg.size = Number(0.01);
    msg.side = 'sell';
    msg.product = 'btcusd';
    setTimeout(function(){
      console.log('timeout reached');
      orderHandler.newOrder(msg);
    },5000);
    break;
  default:
    console.log('command not recognized');
}

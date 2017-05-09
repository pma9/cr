var OrderHandler = require('../OrderHandling/OrderHandlerGMNI');
var orderHandler = new OrderHandler();
var msg = {}
msg.action = process.argv[2];
msg.product = process.argv[3];
var uuid = require('uuid');

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
  default:
    console.log('command not recognized');
}

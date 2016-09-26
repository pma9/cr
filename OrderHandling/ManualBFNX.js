var OrderHandler = require('../OrderHandling/OrderHandlerBFNXProd');
var orderHandler = new OrderHandler();
//new order: node Manual action ccyPair price amount
//cancel: node Manual cancel orderID
//query: node Manual query
//modify: node Manual modify orderID action ccyPair price amount
var msg = {};
msg.action = process.argv[2];
msg.product = process.argv[3];
var uuid = require('uuid');
var client_oid = uuid.v4();

switch(msg.action){
  case "time":
    orderHandler.query(msg);
    break;
  case "openOrders":
    orderHandler.query(msg);
    break;
  case "getOrder":
    msg.orderNumber = process.argv[3];
    orderHandler.query(msg);
    break;
  case "fills":
    orderHandler.query(msg);
    break;
  case "cancel":
    msg.orderID = process.argv[3];
    orderHandler.cancelOrder(msg);
    break;
  case "buy":
    msg.price = process.argv[4];
    msg.size = process.argv[5];
    msg.clientID = client_oid;
    msg.side = 'buy';
    orderHandler.newOrder(msg);
    break;
  case "sell":
    msg.price = process.argv[4];
    msg.size = process.argv[5];
    msg.clientID = client_oid;
    msg.side = 'sell';
    orderHandler.newOrder(msg);
    break;
  case "modify":
    msg.orderID = process.argv[3];
    msg.side = process.argv[4];
    msg.product = process.argv[5];
    msg.price = process.argv[6];
    msg.size = process.argv[7];
    msg.clientID = client_oid;
    orderHandler.modifyOrder(msg);
    break; 
  case "cancelAll":
    orderHandler.cancelAll(msg);
    break;
  default:
    console.log('command not recognized');
}

orderHandler.on('new_ack',function(data){
  console.log(data);
});

orderHandler.on('cancel_ack',function(data){
  console.log(data);
});

orderHandler.on('fill_ack',function(data){
  console.log(data);
});

orderHandler.on('ack',function(data){
  console.log(data,new Date().toISOString());
});



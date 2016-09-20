var OrderHandler = require('../OrderHandling/OrderHandlerGDAXProd');
var orderHandler = new OrderHandler();
//new order: node ManualGDAX action ccyPair price amount
//cancel: node ManualGDAX cancel orderID
//query: node ManualGDAX query
var msg = {};
msg.action = process.argv[2];
msg.product = process.argv[3];
var uuid = require('uuid');
var client_oid = '48292d48-784f-11e6-8b77-86f30ca893d3';

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
    msg.orderNumber = process.argv[3];
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



var OrderHandler = require('../OrderHandling/OrderHandlerGDAXProd');
var orderHandler = new OrderHandler();

var msg = {};
msg.action = process.argv[2];
msg.currencyPair = process.argv[3];

switch(msg.action){
  case "openOrders":
    orderHandler.request(msg);
    break;
  case "getOrder":
    msg.orderNumber = process.argv[3];
    orderHandler.request(msg);
    break;
  case "fills":
    orderHandler.request(msg);
    break;
  case "cancel":
    msg.orderNumber = process.argv[3];
    orderHandler.request(msg);
    break;
  case "buy":
    msg.rate = process.argv[4];
    msg.amount = process.argv[5];
    msg.client_oid = 1;
    orderHandler.request(msg);
    break;
  case "sell":
    msg.rate = process.argv[4];
    msg.amount = process.argv[5];
    orderHandler.request(msg);
    break;
  case "cancelAll":
    orderHandler.request(msg);
    break;
  default:
    console.log('command not recognized');
}

orderHandler.on('new_ack',function(data,oid){
  console.log(data,oid);
});

orderHandler.on('cancel_ack',function(data){
  console.log(data);
});

orderHandler.on('fill_ack',function(data){
  console.log(data);
});

orderHandler.on('ack',function(data){
  console.log(data);
});



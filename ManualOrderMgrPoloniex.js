var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var OrderHandler = require('./OrderHandlerPoloniex');

function ManualOrderManagerPoloniex(){
  EventEmitter.call(this);
}
inherits(ManualOrderManagerPoloniex,EventEmitter);

orderManager = new ManualOrderManagerPoloniex();
orderHandler = new OrderHandler(orderManager);

var action = process.argv[2];
var msg = {};
msg.currencyPair = process.argv[3];
msg.action = action;

switch(action){
  case "openOrders":
    orderManager.emit('message',msg);
    break;
  case "tradeHistory":
    msg.start = 0;
    msg.end = process.argv[4];
    orderManager.emit('message',msg);
    break;
  case "cancel":
    msg.orderNumber = process.argv[3];
    orderManager.emit('message',msg);  
    break;
  case "buy":
    msg.rate = process.argv[4];
    msg.amount = process.argv[5];
    orderManager.emit('message',msg);
    break;
  case "sell":
    msg.rate = process.argv[4];
    msg.amount = process.argv[5];
    orderManager.emit('message',msg);
    break;
  default:
    console.log('command not recognized');
}
module.exports = ManualOrderManagerPoloniex;

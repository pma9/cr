var WebSocket = require('ws');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var bookChannel = 0;
var tradeChannel = 0;
var product;

var wsHost = 'wss://api2.bitfinex.com:3000/ws';
var ws = new WebSocket(wsHost);
function MktDataHandlerBFNX(Product){
  product = Product;
  EventEmitter.call(this);
}
inherits(MktDataHandlerBFNX,EventEmitter);

MktDataHandlerBFNX.prototype.run = function(){
  var self = this;

  ws.on('open', function(){
    var subscribeBook = {
      'event':'subscribe',
      'channel':'book',
      'pair':product,
      'prec':'P0',
    }
    var subscribeTrade = {
      'event':'subscribe',
      'channel':'trades',
      'pair':product
    }
    ws.send(JSON.stringify(subscribeBook));
    ws.send(JSON.stringify(subscribeTrade));
  });

  ws.on('close',function(){
    console.log('BFNX websocket connection lost: ',new Date().toISOString());
  });

  ws.on('error',function(data){
    console.log(data);
  });

  ws.on('message',function(data){
    var parsed = JSON.parse(data);
    if(parsed.event == 'info'){
      //handle disconnects here
      console.log(parsed);
    }else if(parsed.event == 'subscribed'){
      if(parsed.channel == 'book'){
        bookChannel = parsed.chanId;
      }else if(parsed.channel == 'trades'){
        tradeChannel = parsed.chanId;
      }
      console.log(parsed);
    }else{
      //normal processing
      if(parsed[0] == bookChannel && parsed[1] != 'hb'){
        if(parsed.length == 2){
          self.emit('snapshot',parsed);
        }else{
          self.emit('incremental',parsed);
        }
      }else if(parsed[0] == tradeChannel && parsed[1] != 'hb'){
        if(parsed.length > 2 && parsed[1] == 'tu'){
          self.emit('trade',parsed);
        }
        //else it is a book snapshot, not logging these
      }
    }
  });
}
module.exports = MktDataHandlerBFNX;

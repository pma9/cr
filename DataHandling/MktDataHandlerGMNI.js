var WebSocket = require('ws');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var WebSocket = require('ws');

var host = 'wss://api.gemini.com/v1/marketdata/';

function MktDataHandlerGMNI(product){
  this.product = product;
  var path = host + this.product;
  console.log(path);
  this.ws = new WebSocket(path);  
  EventEmitter.call(this);
} 
inherits(MktDataHandlerGMNI,EventEmitter);

MktDataHandlerGMNI.prototype.run = function run(){

  var self = this;

  this.ws.on('error',function(err){
    console.log(err);
  })

  this.ws.on('open',function(){
    console.log('ws open');
  })

  this.ws.on('close',function(){
    console.log('ws closed');
  });  

  this.ws.on('message',function(data){
    var sysTime = new Date().toISOString();
    var parsed = JSON.parse(data);
    if(parsed.type == 'update'){
      for(var i =0;i<parsed.events.length;i++){
        self.emit('update',parsed.events[i],sysTime);
      }
    }
    //else heartbeat
  })

}

module.exports = MktDataHandlerGMNI;

var WebSocket = require('ws');
var request = require('request');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var wshost = 'wss://ws-feed.gdax.com';
var resthost = 'https://api.gdax.com';

function TriMktDataHandlerGDAX(product){
  this.product = product;
  EventEmitter.call(this);
} 
inherits(TriMktDataHandlerGDAX,EventEmitter);

TriMktDataHandlerGDAX.prototype.run = function run(){
  var ws = new WebSocket(wshost);
  //subscribe
  var self = this;
  var product = this.product;
  var path = "/products/" + product + "/book?level=3"
  var resturl = resthost + path;
   ws.on('error',function(data){
     console.log(data);
   });

  ws.on('open',function open(){
    console.log('Mkt Data Handler Running', new Date().toISOString(),product);
      var subscribe = {
        "type": "subscribe",
        "product_id": product
      };
//      var heartbeat = {
//        "type": "heartbeat",
//        "on": true
//      };
      ws.send(JSON.stringify(subscribe));
//      ws.send(JSON.stringify(heartbeat));
  });

  ws.on('close',function(){
    var time = new Date().toISOString();
    console.log("GDAX websocket connection lost: ", time);
    self.emit('disconnect');
  });

  var seqNum = 0;
  var incrQueue = [];
  var ref_called = false;
  function refresh(systime){     
    var options = {
	url: resturl,
	headers: {
	  'User-Agent' : 'request'
	}
      };
   request.get(options)
     .on('response',function(res){
        var body = '';
        res.on('data',function(chunk){
	  body += chunk;
     }).on('end',function(){
        var orderBook = JSON.parse(body);
        self.emit('snapshot',orderBook,product,systime);
        seqNum = orderBook.sequence;
        for(var i = 0;i<incrQueue.length;i++){
	  if(incrQueue[i].sequence > seqNum){
            self.emit('incremental',incrQueue[i],product,systime);
            seqNum = incrQueue[i].sequence;
	  };
         };
      });
    });
    incrQueue = [];
    ref_called = false;
    console.log("Normal processing restarted");
  };
  //handle messages
  ws.on('message',function(data){
    var systime = new Date().toISOString();
    var parsed = JSON.parse(data);
    if(parsed.product_id == product){
    if(parsed.sequence > seqNum +1){
      incrQueue.push(parsed);
      if(!ref_called){
        console.log("Sequence Gap detected, retrieving snapshot");
        refresh(systime);
        ref_called = true;
      };
    }else{
//	if(product == 'BTC-USD'){
//	  console.log('md',parsed.time,product,parsed.product_id,parsed.price);
//	}
        self.emit('incremental',parsed,product,systime);
      seqNum = parsed.sequence;
    };
    }
  });
};
module.exports = TriMktDataHandlerGDAX;

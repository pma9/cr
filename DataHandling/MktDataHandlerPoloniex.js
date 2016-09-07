var autobahn = require('autobahn');
var wsuri = 'wss://api.poloniex.com';
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

function MktDataHandlerPoloniex(product){
  this.product = product;
  EventEmitter.call(this);
  this.connection = new autobahn.Connection({
    url: wsuri,
    realm: 'realm1'
  });
}
inherits(MktDataHandlerPoloniex,EventEmitter);

MktDataHandlerPoloniex.prototype.run = function run(){
  console.log('Mkt Data Handler Running');
  var self = this;
  var product = this.product;

  this.connection.onopen = function (session){
    function marketEvent(data,dict){
      var time = new Date().toISOString();
      self.emit('dict',dict);
      self.emit('data',data,time,product);
    }
    session.subscribe(product, marketEvent);
  }

  this.connection.onclose = function(){
    console.log("Websocket connection closed");
    self.emit('disconnect');
  }

  this.connection.open();

};
module.exports = MktDataHandlerPoloniex;

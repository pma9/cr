var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

function DataReaderPoloniexProd(handler){
  this.handler = handler;
  var self = this;
  EventEmitter.call(this);
  this.handler.on('data',function(data){
    for(var i = 0;i<data.length;i++){
      self.emit('update',data[i]);
    };
  });
};
inherits(DataReaderPoloniexProd,EventEmitter);

module.exports = DataReaderPoloniexProd;

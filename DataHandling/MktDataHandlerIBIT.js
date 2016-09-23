var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var request = require('request');
var product;
var host = 'https://api.itbit.com/v1/';

function MktDataHandlerIBIT(Product){
  product = Product;
  EventEmitter.call(this);
}
inherits(MktDataHandlerIBIT,EventEmitter);

MktDataHandlerIBIT.prototype.run = function run(){
  var self = this;
  console.log('Mkt Data Handler Running: ',new Date().toISOString());
  setInterval(function(){
  function req(URL,callback){
    request.get(URL)
    .on('response',function(res){
      var body = '';
      res.on('data',function(chunk){
        body += chunk;
      }).on('end',function(){
        var data = JSON.parse(body);
        callback(data);
      });
    });
  }
  var bookURL = host + 'markets/' + product + '/order_book';
  var tradeURL = host + 'markets/' + product + '/trades';

  function bookPrint(data){
    self.emit('book',data.bids[0],data.asks[0]);
  }

  function tradePrint(data){
    self.emit('trade',data.recentTrades[0]);
  }

  req(bookURL,bookPrint);
  req(tradeURL,tradePrint);
  },5000);
}

module.exports = MktDataHandlerIBIT;

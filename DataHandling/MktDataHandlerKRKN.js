var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('/home/jeff/api/apiSettings.ini');
var apiKey = properties.get('data.apiKraken');
var apiSecret = properties.get('data.signKraken');
var KrakenClient = require('kraken-api');
var kraken = new KrakenClient(apiKey,apiSecret);
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var product;

function MktDataHandlerKRKN(Product){
  product = Product;
  EventEmitter.call(this);
}
inherits(MktDataHandlerKRKN,EventEmitter);

MktDataHandlerKRKN.prototype.run = function run(){
  var self = this;
  console.log('Mkt Data Handler Running: ',new Date().toISOString());
  setInterval(function(){
    kraken.api('Depth', {"pair": product,"count":"1"}, function(error, data) {
        if(error) {
          console.log(error);
        }
        else {
          var output = data.result[Object.keys(data.result)[0]];
          self.emit('book',output);
        }
    });
  },5000);
}
module.exports = MktDataHandlerKRKN;

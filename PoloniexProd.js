var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('logSettings.ini');
var product = process.argv[2];
var Handler = require('./MktDataHandlerPoloniex');
var handler = new Handler(product);
var DataReader = require('./DataReaderPoloniexProd');
var reader = new DataReader(handler);
var OrderBookMgr = require('./OrderBookMgrPoloniex');
var orderBookMgr = new OrderBookMgr(reader);

orderBookMgr.on('askUpdate',function(data){
  console.log(data);
});

handler.run();

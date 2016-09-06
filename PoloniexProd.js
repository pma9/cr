var product = process.argv[2];
var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader(product+'.ini');
var Handler = require('./MktDataHandlerPoloniex');
var handler = new Handler(product);
var DataReader = require('./DataReaderPoloniexProd');
var reader = new DataReader(handler);
var OrderBookMgr = require('./OrderBookMgrPoloniex');
var orderBookMgr = new OrderBookMgr(reader);
var MktMakeAlgo = require('./MktMakeAlgo');
var orderMgr = {};
var algo = new MktMakeAlgo(properties,orderBookMgr, orderMgr);

handler.run();

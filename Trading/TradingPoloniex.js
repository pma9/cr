var product = process.argv[2];
var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader('../Settings/'+product+'.ini');
var Handler = require('../DataHandling/MktDataHandlerPoloniex');
var handler = new Handler(product);
var DataReader = require('../DataHandling/DataReaderPoloniexProd');
var reader = new DataReader(handler);
var OrderBookMgr = require('../Trading/OrderBookMgrPoloniex');
var orderBookMgr = new OrderBookMgr(reader);
var MktMakeAlgo = require('../Trading/MktMakeAlgo');
var OrderMgr = require('../OrderHandling/OrderMgrPoloniexHist');
var orderMgr = new OrderMgr(product);
//var OrderHandler = require('./OrderHandlerPoloniex');
//var orderHandler = new OrderHandler(orderMgr);
var algo = new MktMakeAlgo(properties,orderBookMgr, orderMgr);

handler.run();

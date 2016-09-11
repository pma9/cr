var product = process.argv[2];
var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader('../Settings/GDAX/'+product+'.ini');
var DataHandler = require('../DataHandling/MktDataHandlerGDAX');
var dataHandler = new DataHandler(product);
var OrderBookMgr = require('../Trading/OrderBookMgrGDAX');
var orderBookMgr = new OrderBookMgr(dataHandler);
var MktMakeAlgo = require('../Trading/MktMakeAlgo');
var OrderHandler = require('../OrderHandling/OrderHandlerGDAXProd');
var orderHandler = new OrderHandler();
var algo = new MktMakeAlgo(properties,orderBookMgr,orderHandler,dataHandler,product);

dataHandler.run();

var DataHandler = require('../DataHandling/MktDataHandlerGDAX');
var dataHandler = new DataHandler('BTC-USD');
var OrderBookMgr = require('./OrderBookMgrGDAX');
var orderBookMgr = new OrderBookMgr(dataHandler);
dataHandler.run();

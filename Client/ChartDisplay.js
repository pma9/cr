var product = process.argv[2];
var DataHandler = require('../DataHandling/MktDataHandlerGDAX');
var dataHandler = new DataHandler(product);
var OrderBookMgr = require('../Trading/OrderBookMgrGDAX');
var orderBookMgr = new OrderBookMgr(dataHandler);
var Server = require('../Client/ChartServer');
var server = new Server(orderBookMgr);

dataHandler.run();

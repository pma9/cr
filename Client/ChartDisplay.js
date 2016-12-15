var product = process.argv[2];
var productBFNX = process.argv[3];
var port = process.argv[4];
var DataHandler = require('../DataHandling/MktDataHandlerGDAX');
var dataHandler = new DataHandler(product);
var DataHandlerBFNX = require('../DataHandling/MktDataHandlerBFNX');
var dataHandlerBFNX = new DataHandlerBFNX(productBFNX);
var OrderBookMgr = require('../Trading/OrderBookMgrGDAX');
var orderBookMgr = new OrderBookMgr(dataHandler);
var OrderBookMgrBFNX = require('../Trading/OrderBookMgrBFNX');
var orderBookMgrBFNX = new OrderBookMgrBFNX(dataHandlerBFNX);
var Server = require('../Client/ChartServer');
var server = new Server(orderBookMgr,orderBookMgrBFNX,port);

dataHandler.run();
dataHandlerBFNX.run();

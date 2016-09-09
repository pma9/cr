var product = process.argv[2];
var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader('../Settings/GDAX/'+product+'.ini');
var Handler = require('../DataHandling/MktDataHandlerGDAX');
var handler = new Handler(product);
var OrderBookMgr = require('../Trading/OrderBookMgrGDAX');
var orderBookMgr = new OrderBookMgr(handler);
var MktMakeAlgo = require('../Trading/MktMakeAlgo');
var OrderMgr = require('../OrderHandling/OrderMgrPoloniexHist');
var orderMgr = new OrderMgr(product);
//create 2 order mgrs? one bid, one ask? simpler to seperate levels
var algo = new MktMakeAlgo(properties,orderBookMgr,orderMgr);

handler.run();

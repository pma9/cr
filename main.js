var MktDataHandlerGDAX = require('./MktDataHandlerGDAX');
var dataLoggerGDAX = require('./DataLoggerGDAX');
var handler = new MktDataHandlerGDAX('BTC-USD');

console.log("handler loaded");
dataLoggerGDAX.log(handler);
console.log("logger loaded");
handler.run();

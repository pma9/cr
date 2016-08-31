var MktDataHandlerGDAX = require('./MktDataHandlerGDAX');
var dataLogger = require('./DataLoggerGDAX');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('logSettings.ini');

var outputDir = properties.get('data.dir');
var product = process.argv[2];

var handler = new MktDataHandlerGDAX(product);
console.log("handler loaded");
dataLogger.log(handler,outputDir);  
handler.run();

handler.on('disconnect',function(){
  handler = new MktDataHandlerGDAX(product);
  console.log("handler loaded");
  dataLogger.log(handler,outputDir);
  handler.run();
});

var Handler = require('./MktDataHandlerPoloniex');
var DataLogger = require('./DataLoggerPoloniex');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('logSettings.ini');

var outputDir = properties.get('data.dir');
var product = process.argv[2];

var handler = new Handler(product);
console.log('handler loaded');
var logger = new DataLogger(handler,outputDir);
handler.run();

handler.on('disconnect',function(){
  handler = new Handler(product);
  console.log("handler loaded");
  logger = new DataLogger(handler,outputDir);
  handler.run();
});

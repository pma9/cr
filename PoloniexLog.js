var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader('logSettings.ini');
var outputDir = properties.get('data.dir');
var product = process.argv[2];
var Handler = require('./MktDataHandlerPoloniex');
var Printer = require('./PrinterPoloniex');
var handler = new Handler(product);
var printer = new Printer(handler,outputDir);

handler.on('disconnect',function(){
  handler = new Handler(product);
  printer = new Printer(handler,outputDir);
  handler.run();
});

handler.run();


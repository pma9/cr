var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader('../Settings/logSettings.ini');
var outputDir = properties.get('data.dir');
var product = process.argv[2];
var Handler = require('../DataHandling/MktDataHandlerPoloniex');
var Printer = require('../DataHandling/PrinterPoloniex');
var handler = new Handler(product);
var printer = new Printer(handler,outputDir);

handler.on('disconnect',function(){
  handler = new Handler(product);
  printer = new Printer(handler,outputDir);
  handler.run();
});

handler.run();


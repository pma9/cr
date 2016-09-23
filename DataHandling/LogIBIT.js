var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('../Settings/logSettings.ini');
var outputDir = properties.get('data.dir');
var product = process.argv[2];
var Handler = require('../DataHandling/MktDataHandlerIBIT');
var Printer = require('../DataHandling/PrinterIBIT');
var handler = new Handler(product);
var printer = new Printer(handler,outputDir,product);

handler.run();

handler.on('disconnect',function(){
  setTimeout(function(){
    handler = new Handler(product);
    printer = new Printer(handler,outputDir);
    handler.run();
  },30000);
});

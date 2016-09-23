var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('../Settings/logSettings.ini');
var outputDir = properties.get('data.dir');
var product = process.argv[2];
var Handler = require('../DataHandling/MktDataHandlerKRKN');
var Printer = require('../DataHandling/PrinterKRKN');
var handler = new Handler(product);
var printer = new Printer(handler,outputDir,product);
var self = this;

handler.run();

handler.on('disconnect',function(){
  setTimeout(function(){
    self.handler = new self.Handler(self.product);
    self.printer = new self.Printer(self.handler,self.outputDir);
    self.handler.run();
  },30000);
});


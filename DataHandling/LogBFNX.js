var Logger = require('../DataHandling/DataLogger');

var SubLogger = function(){
  Logger.apply(this);
  this.PropertiesReader = require('properties-reader');
  this.properties = this.PropertiesReader('../Settings/logSettings.ini');
  this.outputDir = this.properties.get('data.dir');
  this.product = process.argv[2];
  this.Handler = require('../DataHandling/MktDataHandlerBFNX');
  this.Printer = require('../DataHandling/PrinterBFNX');
  this.handler = new this.Handler(this.product);
  this.printer = new this.Printer(this.handler,this.outputDir,this.product);
} 

SubLogger.prototype = Logger.prototype;
SubLogger.prototype.constructor = SubLogger;

logger = new SubLogger();

logger.run();


function DataLogger(){
}

DataLogger.prototype.run = function run(){
  this.handler.run();

  this.handler.on('disconnect',function(){
    this.handler = new this.Handler(this.product);
    this.printer = new this.Printer(this.handler,this.outputDir);
    this.handler.run();
  });
};
module.exports = DataLogger;

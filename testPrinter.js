var Handler = require('./MktDataHandlerGDAX');
exports.run = function(input){
  var handler = input;
  handler.run();
  console.log("printer running");
  handler.on("data",function(data){
    console.log(data);
  });
};

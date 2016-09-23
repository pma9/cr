var fs = require('fs');
var product;
var dir;
function PrinterIBIT(handler,Dir,Product){
  product = Product;
  dir = Dir;
  function formatBook(data,side){
    var output = 'book' + ',' + product + ',' + data[0] + ',' + data[1] + ',' + side + ',' + new Date().toISOString();
    return output;
  }

  function formatTrade(data){
     //format trades here
  }

  function print(output){
      var date = new Date();
      var filename = dir + 'IBIT/' + product + '/' + date.getFullYear().toString() + (date.getMonth()+1).toString() + date.getDate().toString();
      fs.appendFile(filename,JSON.stringify(output).replace(/\"/g,"")+'\r\n');
  }

  handler.on('book',function(bid,ask){
      print(formatBook(bid,'buy'));
      print(formatBook(ask,'sell'));
  });

  handler.on('trade',function(data){
    //process trades here
  });
}
module.exports = PrinterIBIT;

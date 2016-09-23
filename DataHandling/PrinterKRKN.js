var fs = require('fs');
var product;
var dir;
function PrinterKRKN(handler,Dir,Product){
  product = Product;
  dir = Dir;
  function formatBook(data,side){
    var output = 'book' + ',' + product + ',' + data[0] + ',' + data[1] + ','  + side + ',' + data[2] + ',' + new Date().toISOString();
    return output;
  }

  function formatTrade(data){
     //format trades here
  }

  function print(output){
      var date = new Date();
      var filename = dir + 'KRKN/' + product + '/' + date.getFullYear().toString() + (date.getMonth()+1).toString() + date.getDate().toString();
      fs.appendFile(filename,JSON.stringify(output).replace(/\"/g,"")+'\r\n');
  }

  handler.on('book',function(data){
    for(var i = 0; i<data.asks.length;i++){
      print(formatBook(data.asks[i],'sell'));
    }

    for(var i = 0; i<data.bids.length;i++){
      print(formatBook(data.bids[i],'buy'));
    }
  });

  handler.on('trade',function(data){
    //process trades here
  });
}
module.exports = PrinterKRKN;

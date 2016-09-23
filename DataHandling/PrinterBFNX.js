var fs = require('fs');
var product;
var dir;
function PrinterBFNX(handler,Dir,Product){
  product = Product;
  dir = Dir;
  function formatBook(data){
    var side = 'buy';
    if(Number(data[3]) < 0){
      side = 'sell';
    }
    return 'book' + ',' + product + ',' + data[1] + ',' + Math.abs(data[3]) + ',' + side + ',' +data[2] + ',' + new Date().toISOString();
  }

  function formatTrade(data){
    var side = 'buy';
    if(Number(data[6]) <0){
      side = 'sell';
    }
    var output = 'trade' + ',' + data[4] + ',' + product + ',' + data[2] + ',' + data[3] + ',' + data[5] + ',' + data[6] + ',' + new Date().toISOString();
    return output;
  }

  function print(output){
      var date = new Date();
      var filename = dir + 'BFNX/' + product + '/' + date.getFullYear().toString() + (date.getMonth()+1).toString() + date.getDate().toString();
      fs.appendFile(filename,JSON.stringify(output).replace(/\"/g,"")+'\r\n');
  }

  handler.on('snapshot',function(data){
    for(var i = 0;i<data[1].length;i++){
      data[1][i].unshift(data[0]);
      print(formatBook(data[1][i]));
    }
  });

  handler.on('incremental',function(data){
    print(formatBook(data));
  });

  handler.on('trade',function(data){
    print(formatTrade(data));
  });
}

module.exports = PrinterBFNX;

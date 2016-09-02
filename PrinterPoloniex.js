var fs = require('fs');

function PrinterPoloniex(handler,dir){
  var seq;

  function format(data,time,product,seq){
    var output = new String();
    if(data.type == 'orderBookModify'){
      output = data.type + ',' + time + ',' + product + ',' + seq + ',' + data.data.rate + ',' + data.data.amount + ',' + data.data.type; 
    }else if(data.type == 'orderBookRemove'){
      output = data.type + ',' + time + ',' + product + ',' + seq + ',' + data.data.rate + ',' + data.data.type; 

    }else if(data.type == 'newTrade'){
      output = data.type + ',' + time + ',' + product + ',' + seq + ',' + data.data.tradeID + ',' + data.data.rate + ',' + data.data.amount + ',' + data.data.type + ',' + data.data.total + ',' + data.data.date; 
      console.log(data.data.rate);
    }    
    return output;
  } 

  function print(output,product_id,dir){
    var date = new Date();
    var filename = dir + 'Poloniex/' + product_id + '/' + date.getFullYear().toString() + (date.getMonth()+1).toString() + date.getDate().toString();
    fs.appendFile(filename,JSON.stringify(output).replace(/\"/g,"")+'\r\n');
  }

  handler.on('dict',function(data){
    seq = data.seq;
    //must apply messages in seq order
    //could queue messages > seq +1, but what if it never comes?
    //no snapshot
  });

  handler.on('data',function(data,time,product){
    for(var i = 0;i<data.length;i++){
      print(format(data[i],time,product,seq),product,dir);
    }
  });

}
module.exports = PrinterPoloniex;

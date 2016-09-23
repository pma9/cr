var fs = require('fs');

function PrinterGDAX(handler,dir){

function incremental(data,time){
    var output = new String();
    if(data.type == 'received'){
        output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.size + ',' + data.side + ',' + data.order_type + ',' + time;
    }else if(data.type == 'open'){
       output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.remaining_size + ',' + data.side + ',' + time;
   }else if(data.type == 'done'){
       output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.remaining_size + ',' + data.side + ',' + data.order_type + ',' + data.reason + ',' + time;
    }else if(data.type == 'match'){
       output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.trade_id + ',' + data.price + ',' + data.size + ',' + data.side + ',' + time;
    }else if(data.type == 'change'){
       output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.size + ',' + data.side + ',' + time;
    }else{
	output = data.type;
    }
    return output;
}

function snapshot(data,time,product_id,sequence,side){
  var output = new String();
  output = 'open' + ',' +  time + ',' + product_id + ',' + sequence + ',' + data[2] + ',' + data[0] + ',' + data[1] + ',' + side + ',' + time;
  return output;
}

function print(output,product_id,dir){
    var date = new Date();
    var filename = dir + 'GDAX/' + product_id + '/' + date.getFullYear().toString() + (date.getMonth()+1).toString() + date.getDate().toString();
    fs.appendFile(filename,JSON.stringify(output).replace(/\"/g,"")+'\r\n');
}

  handler.on('incremental',function(data,product_id,time){
    print(incremental(data,time),product_id,dir);
  });
  handler.on('snapshot',function(data,product_id,time){
    var seq = data.sequence;
    for(var i = 0;i<data.bids.length;i++){
      print(snapshot(data.bids[i],time,product_id,seq,"buy"),product_id,dir);
    };
    for(var i = 0;i<data.asks.length;i++){
      print(snapshot(data.asks[i],time,product_id,seq,"sell"),product_id,dir);
    };
  });
}
module.exports = PrinterGDAX;

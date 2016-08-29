var fs = require('fs');
function incremental(data){
    var output = new String();
    if(data.type == 'received'){
        output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.remaining_size + ',' + data.side + ',' + data.order_type;
    }else if(data.type == 'open'){
       output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.remaining_size + ',' + data.side;
   }else if(data.type == 'done'){
       output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.remaining_size + ',' + data.side + ',' + data.order_type + ',' + data.reason;
    }else if(data.type == 'match'){
       console.log(data.price);
       output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.trade_id + ',' + data.price + ',' + data.size + ',' + data.side;
    }else if(data.type == 'change'){
       output = data.type + ',' + data.time + ',' + data.product_id + ',' + data.sequence + ',' + data.order_id + ',' + data.price + ',' + data.size + ',' + data.side;
    }
    return output;
}

function snapshot(data,time,product_id,sequence,side){
  var output = new String();
  output = 'open' + ',' +  time + ',' + product_id + ',' + sequence + ',' + data[2] + ',' + data[0] + ',' + data[1] + ',' + side;
  return output;
}

function print(output){
    var date = new Date();
    var filename = date.getFullYear().toString() + (date.getMonth()+1).toString() + date.getDate().toString();
    fs.appendFile(filename,JSON.stringify(output).replace(/\"/g,"")+'\r\n');
}

exports.log = function(handler){
  handler.on('incremental',function(data){
    print(incremental(data));
  });
  handler.on('snapshot',function(data,product_id){
    var seq = data.sequence;
    var time = Date.now();
    for(var i = 0;i<data.bids.length;i++){
      print(snapshot(data.bids[i],time,product_id,seq,"buy"));
    };
    for(var i = 0;i<data.asks.length;i++){
      print(snapshot(data.asks[i],time,product_id,seq,"sell"));
    };
  });
};

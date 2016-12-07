var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;
var orderBookMgrGDAX;

function ChartServer(OrderBookMgrGDAX){
  orderBookMgrGDAX = OrderBookMgrGDAX;
}

app.get('/',function(req,res){
  res.sendFile('/home/jeff/crypto/Client/liveChart.html');
}); 

io.on('connection',function(socket){
  console.log('client connected');

  orderBookMgrGDAX.on('bidUpdate',function(data){
    var price = Number(data).toFixed(2);
    io.emit('bidUpdate','GDAX',price);
  });

  orderBookMgrGDAX.on('askUpdate',function(data){
    var price = Number(data).toFixed(2);
    io.emit('askUpdate','GDAX',price);
  });

  socket.on('disconnect',function(){
    console.log('client disconnected');
  });
});

server.listen(port,function(){
  console.log('server listening on port' + port);
}); 

module.exports = ChartServer;

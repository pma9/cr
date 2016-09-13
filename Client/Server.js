var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;
var product = "";
var exchange = "";
var bids = [];
var asks = [];

function Server(Port,orderBookMgr,Product,Exchange){
  port = Port;
  product = Product;
  exchange = Exchange;

  orderBookMgr.on('bidUpdate',function(data){
   io.emit('bidUpdate',data);
  });

  orderBookMgr.on('askUpdate',function(data){
    io.emit('askUpdate',data);
  });

  orderBookMgr.on('lastUpdate',function(data){
    io.emit('lastUpdate',data);
  });

}

Server.prototype.register = function(Bids,Asks){
  bids = Bids;
  asks = Asks;
}

app.get('/',function(req,res){
  res.sendFile('/home/jeff/crypto/Client/table.html');
});

io.on('connection',function(socket){
  console.log('client connected');

  io.emit('product',product);
  io.emit('exchange',exchange);
  var bidOrders = [];
  for(var i = 0;i<bids.length;i++){
    bidOrders.push(bids[i].entryOrder);
  }

  io.emit('orderInit',bidOrders);

//  for(var i = 0;i<bids.length;i++){
//    bids[i].on('orderUpdate',function(data){
//      io.emit('bidOrderUpdate',i,data);
//    });
//  }
//this is really ugly, but above always sends i = 2
  bids[0].on('orderUpdate',function(data){
    io.emit('bidOrderUpdate',1,data);
  });

  bids[1].on('orderUpdate',function(data){
    io.emit('bidOrderUpdate',2,data);
  });

  socket.on('disconnect',function(){
    console.log('client disconnected');
  });
});

server.listen(port,function(){
  console.log('server listening on port' + port);
});

module.exports = Server;

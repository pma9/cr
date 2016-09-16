var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;
var product = "";
var exchange = "";
var bids = [];
var asks = [];
var orderBookMgr;

function Server(Port,OrderBookMgr,Product,Exchange){
  port = Port;
  product = Product;
  exchange = Exchange;
  orderBookMgr = OrderBookMgr;
}

Server.prototype.register = function(Bids,Asks){
  bids = Bids;
  asks = Asks;
}

app.use(express.static(__dirname + '/style'));

app.get('/Overview',function(req,res){
  res.sendFile('/home/jeff/crypto/Client/overviewPage.html');
});

app.get('/',function(req,res){
  res.sendFile('/home/jeff/crypto/Client/productPage.html');
});

io.on('connection',function(socket){
  console.log('client connected');
  
  var bidOrders = [];
  for(var i = 0;i<bids.length;i++){
    bidOrders.push(bids[i].entryOrder);
  }
  
  io.emit('orderInit',bidOrders);

  orderBookMgr.on('bidUpdate',function(data){
   var price = Number(data).toFixed(2);
   io.emit('overviewUpdate','GDAX_BTC-USD','BidTOB',price);
  });

  orderBookMgr.on('askUpdate',function(data){
    var price = Number(data).toFixed(2);
    io.emit('overviewUpdate','GDAX_BTC-USD','AskTOB',price);
  });

  orderBookMgr.on('lastUpdate',function(data){
    io.emit('lastUpdate',data);
  });

  for(var i = 0;i<bids.length;i++){
    bids[i].on('orderUpdate',function(index,data){
      io.emit('bidOrderUpdate',index,data);
    });

    bids[i].on('entryFill',function(data){
      io.emit('bidFill',data);
    });

    bids[i].on('exitFill',function(data){
      io.emit('askFill',data);
    });
  }
  
  socket.on('updateState',function(state){
    for(var i = 0;i<bids.length;i++){
      bids[i].changeState(state);
    }
  });

  socket.on('disconnect',function(){
    console.log('client disconnected');
  });
});

server.listen(port,function(){
  console.log('server listening on port' + port);
});

module.exports = Server;

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

Server.prototype.updatePos = function(pos){
  io.emit('overviewUpdate','GDAX_BTC-USD','Position',pos);
}

Server.prototype.updateRealized = function(realized){
  io.emit('overviewUpdate','GDAX_BTC-USD','Realized',realized);
}
Server.prototype.updateMsgCount = function(msg){
  io.emit('overviewUpdate','GDAX_BTC-USD','Msg',msg);
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
  var askOrders = [];
  for(var i = 0;i<bids.length;i++){
    bidOrders.push(bids[i].entryOrder);
    askOrders.push(bids[i].exitOrder);
  }
  
  io.emit('orderInit',bidOrders,askOrders);

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
    bids[i].on('entryUpdate',function(index,data){
      io.emit('orderUpdate','bid',index,data);
    });

    bids[i].on('exitUpdate',function(index,data){
      io.emit('orderUpdate','ask',index,data);
    });

    bids[i].on('entryFill',function(data){
      io.emit('fill','bidFill',data);
    });

    bids[i].on('exitFill',function(data){
      io.emit('fill','askFill',data);
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

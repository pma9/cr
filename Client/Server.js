var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;
var product = "";
var exchange = "";

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

app.get('/',function(req,res){
  res.sendFile('/home/jeff/crypto/Client/table.html');
});

io.on('connection',function(socket){
  console.log('client connected');

  io.emit('product',product);
  io.emit('exchange',exchange);

  socket.on('disconnect',function(){
    console.log('client disconnected');
  });
});

server.listen(port,function(){
  console.log('server listening on port' + port);
});

module.exports = Server;

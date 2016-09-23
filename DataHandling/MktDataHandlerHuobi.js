var io = require('socket.io-client');
var options = {'force new connection':true,reconnection: true};
var socket = io.connect('hq.huobi.com:80',options);

socket.on('connect',function(){
  console.log('connection success');
  var data = {'symbolId':'btccny','version':1,'msgType':'reqMsgSubscribe','requestIndex':Date.now()};
  var json = JSON.parse(data);
  socket.emit('request',json);
});

socket.on('message',function(data){
  console.log(JSON.stringify(data));
});

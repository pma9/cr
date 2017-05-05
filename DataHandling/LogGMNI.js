var DataHandler = require('./MktDataHandlerGMNI');
var handler = new DataHandler('btcusd');

handler.on('update',function(data,time){
  console.log(data);
});

handler.run();

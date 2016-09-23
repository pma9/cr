var Handler = require('./MktDataHandlerKRKN');
var handler = new Handler('XBTUSD');
handler.run();

handler.on('book',function(data){
  console.log(data);
});

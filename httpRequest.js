var request = require('request');

//request('https://api.itbit.com/v1/markets/XBTUSD/ticker', function(err,res,body){
// console.log(body);
//});

request.get('https://api.itbit.com/v1/markets/XBTUSD/ticker')
.on('response',function(res){
  res.on('data',function(d){
//    process.stdout.write(d);
    console.log(d.toString());
  });
});

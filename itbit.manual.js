https = require('https');
//https.get('https://api.itbit.com/v1/markets/XBTUSD/ticker', function(res) {
//  res.on('data', (d) => {
//    process.stdout.write(d);
//  });
var options = {
  host: 'api.itbit.com',
  path: '/v1/markets/XBTUSD/ticker'
};

https.get(options, function(res) {
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});


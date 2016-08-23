https = require('https');

https.get('https://api.itbit.com/v1/markets/XBTUSD/ticker', function(res) {
  res.on('data', (d) => {
    process.stdout.write(d);
  });

}).on('error', (e) => {
  console.error(e);
});


var gdax = require('gdax');
var publicClient = new gdax.PublicClient();

publicClient.getProductTicker(function(err,res,data){
  console.log(data);
});

var Client = require('coinbase').Client;
var client = new Client({'apiKey': 'gOOfgtWRCa1whr9S', 'apiSecret': 'VXHa6PmQpAPS7pOd0fLmIePH97flqPvh'});

client.getAccount({},function(err, accounts){
  accounts.forEach(function(acct){
    console.log('my bal: ' + acct.balance.amount + 'for' + acct.name);
  });
});

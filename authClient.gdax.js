var gdax = require('gdax');
var authedClient = new gdax.AuthenticatedClient('597d80197535ba345725f7216509dbb7','5cedwNx36fMhcscDCf/Mqm7sZZRxYqcNkM/H11ka+drh2XNrvmtVrqWBDpDZzF8TSLiXG9NWNbLSO7le+PV/Jg==','LBnJk3?z');

//authedClient.getAccounts(function(err,res,data){
  //console.log(data);
//});

var btcID = 'e073cc11-61cc-4677-813d-0dba12f55bd0';
authedClient.getAccount(btcID,function(err,res,data){
  console.log(data.id);
  console.log(data.balance);
});

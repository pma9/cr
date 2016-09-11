var DataHandler = require('../DataHandling/MktDataHandlerGDAX');
var dataHandler = new DataHandler('BTC-USD');
dataHandler.run();

dataHandler.on('incremental',function(update){
  if(update.client_oid == '48292d48-784f-11e6-8b77-86f30ca893d3'){
    console.log(update);
  }

  if(update.order_id == 'ea4f9040-9618-4b96-86f4-08a3a541ee49'){
    console.log(update);
  }
});


var Level = require('./Level');

function MktMakeAlgo(properties,orderBookMgr, orderMgr){

  //import settings for levels
  console.log(properties.get('rate'));

  orderBookMgr.on('askUpdate',function(data){
    //check if asks array exists yet

    //update prices for ask array

  });


  orderBookMgr.on('bidUpdate',function(data){
  
    //bid stuff
  });

}
module.exports = MktMakeAlgo;

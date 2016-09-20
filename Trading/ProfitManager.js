var longs = [];
var shorts = [];

function ProfitManager(){

}

ProfitManager.prototype.updateLong = function(fill){
  longs.push(fill);
}

ProfitManager.prototype.updateShort = function(fill){
  shorts.push(fill);
}

ProfitManager.prototype.getRealized = function(){
  var cashOut = Number(0);
  var cashIn = Number(0);
  for(var i = 0; i<longs.length;i++){
    cashOut = Number(longs[i].price) * Number(longs[i].size);
  }

  for(var i = 0; i<shorts.length;i++){
    cashIn = Number(shorts[i].price) * Number(shorts[i].size);
  }

  var net = Number(cashIn - cashOut).toFixed(2);
  console.log(net);
  return net;

}

ProfitManager.prototype.getUnrealized = function(){

}

module.exports = ProfitManager;

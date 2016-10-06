
function ProfitManager(){
  this.longs = [];
  this.shorts = [];
}

ProfitManager.prototype.updateLong = function(fill){
  this.longs.push(fill);
}

ProfitManager.prototype.updateShort = function(fill){
  this.shorts.push(fill);
}

ProfitManager.prototype.getRealized = function(){
  var cashOut = Number(0);
  var cashIn = Number(0);
  for(var i = 0; i<this.longs.length;i++){
    cashOut = Number(this.longs[i].price) * Number(this.longs[i].size);
  }

  for(var i = 0; i<this.shorts.length;i++){
    cashIn = Number(this.shorts[i].price) * Number(this.shorts[i].size);
  }

  var net = Number(cashIn - cashOut).toFixed(4);
  console.log('profitManager: ','cash in: ',cashIn,'cash out: ',cashOut,'net: ',net);
  return net;

}

ProfitManager.prototype.getUnrealized = function(){

}

module.exports = ProfitManager;

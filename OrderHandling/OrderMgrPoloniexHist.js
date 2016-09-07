var OrderRecord = require('./OrderRecord');
function OrderMgrPoloniexHist(currencyPair){
  this.currencyPair = currencyPair;
  this.orderNumber = 0;
}

OrderMgrPoloniexHist.prototype.requestNewOrder = function requestNewOrder(action,rate,amount){
  this.orderNumber++;
  return new OrderRecord(this.currencyPair,action,rate,amount,this.orderNumber);
}

OrderMgrPoloniexHist.prototype.cancelOrder = function cancelOrder(orderNumber){

}

OrderMgrPoloniexHist.prototype.modifyOrder = function modifyOrder(orderNumber,rate,amount){
  return new OrderRecord(this.currencyPair,"default",rate,amount,orderNumber);
}

module.exports = OrderMgrPoloniexHist;

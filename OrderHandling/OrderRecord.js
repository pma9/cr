
function OrderRecord(currencyPair,action,rate,amount,orderNumber){
  this.currencyPair = currencyPair;
  this.action = action;
  this.rate = rate;
  this.amount = amount;
  this.orderNumber = orderNumber;
}
module.exports = OrderRecord;

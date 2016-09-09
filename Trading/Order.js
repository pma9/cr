function Order(product,side,state,price,size,clientID,orderID){
  this.product = product;
  this.side = side;
  this.state = state;
  this.price = price;
  this.size = size;
  this.clientID = clientID;
  this.orderID = orderID;
}
module.exports = Order;

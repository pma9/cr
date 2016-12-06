var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var uuid = require('uuid');

function greaterThan(a,b){
  if(a>b){
    return true;
  }
  return false;
}

function lessThan(a,b){
  if(a<b){
    return true;
  }
  return false;
}

function appendOrder(book,update){
  book.push({
    price:update.price,
    orders: [{
     orderID:update.order_id,
     size:update.remaining_size}]
  });
}

function OrderBookAdd(book,comparator,update){
  var newLevel = {
    price:Number(update.price),
    orders: [{
      orderID:update.order_id,
      size:update.remaining_size
    }]
  }
  var match = false;
  for(var i = 0;i<book.length;i++){
    if(comparator(Number(update.price),Number(book[i].price))){
      book.splice(i,0,newLevel);
      match = true;
      break;
    }else if(Number(newLevel.price) == Number(book[i].price)){
      book[i].orders.push({orderID:update.order_id, size:update.remaining_size});
      match = true;
      break;
    }
  }
  if(!match){
    book.push(newLevel);
  }
}

function OrderBookRemove(book,update){
  for(var i = 0;i<book.length;i++){
    if(Number(update.price) == Number(book[i].price)){
      for(var j = 0;j<book[i].orders.length;j++){
        if(update.order_id == book[i].orders[j].orderID){
          book[i].orders.splice(j,1);
          if(book[i].orders.length <1){
            book.splice(i,1);
          }
          break;
        }
      }
      break;
    }
  }
}

function OrderBookModify(book,update){

}

function TriOrderBookMgrGDAX(reader,security){
  EventEmitter.call(this);
  this.product = security;
  this.id = uuid.v4();
  this.bids = [];
  this.asks = [];
  var self = this;
  //every hist update considered incremental
  reader.on('incremental', function(update,security){
   if(security == self.product){
      if(update.type == 'match'){
        self.emit('lastUpdate',update.price);
      }else if(update.side == 'buy'){
        if(update.type == 'open'){
          OrderBookAdd(self.bids,greaterThan,update);
        }else if(update.type == 'done'){
          OrderBookRemove(self.bids,update);
        }
        if(self.bids.length>0 && self.asks.length >0){
          self.emit('bidUpdate',self.bids[0].price,self.product);
        }
      }else if(update.side == 'sell'){
        if(update.type == 'open'){
          OrderBookAdd(self.asks,lessThan,update);
        }else if(update.type == 'done'){
          OrderBookRemove(self.asks,update);
        }
        if(self.asks.length>0){
          self.emit('askUpdate',self.asks[0].price,self.product);
        }
      }
    }
  });

  reader.on('snapshot',function(orderBook,security){
    if(self.product == security){
     self.emit('seq gap');
      self.bids = [];
      self.asks = [];
      for(var i = 0;i<orderBook.bids.length;i++){
        OrderBookAdd(self.bids,greaterThan,{price:orderBook.bids[i][0],
          remaining_size:orderBook.bids[i][1],
          order_id:orderBook.bids[i][2]}
        );
      }
      for(var i = 0;i<orderBook.asks.length;i++){
        OrderBookAdd(self.asks,lessThan,{price:orderBook.asks[i][0],
          remaining_size:orderBook.asks[i][1],
          order_id:orderBook.asks[i][2]}
        );
      }
    }
  });
}
inherits(TriOrderBookMgrGDAX,EventEmitter);
module.exports = TriOrderBookMgrGDAX;

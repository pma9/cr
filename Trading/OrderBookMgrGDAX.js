var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var bids = [];
var asks = [];

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

function aggregateLevelSize(book,levels){
  //console.log(level.orders.length);
  var total = Number(0);
  for(var i =0;i<levels;i++){
    for(var j=0;j<book[i].orders.length;j++){
      total = total + Number(book[i].orders[j].size);
    }
  }
  return total;
}


function OrderBookMgrGDAX(reader){
  EventEmitter.call(this);
  var self = this;
  //every hist update considered incremental
  this.getSize = function(book,levels){
    if(book == "bid"){
      return aggregateLevelSize(bids,levels);
    }else if(book == "ask"){
      return aggregateLevelSize(asks,levels);
    }
      return "invalid book";
  }
  reader.on('incremental', function(update){
    if(update.type == 'match'){
      self.emit('lastUpdate',update.price);
    }else if(update.side == 'buy'){
      if(update.type == 'open'){
        OrderBookAdd(bids,greaterThan,update);
      }else if(update.type == 'done'){
        OrderBookRemove(bids,update);
      }
      if(bids.length>0){
        self.emit('bidUpdate',bids[0].price);
      }
    }else if(update.side == 'sell'){
      if(update.type == 'open'){
        OrderBookAdd(asks,lessThan,update);
      }else if(update.type == 'done'){
        OrderBookRemove(asks,update);
      }
      if(asks.length>0){
        self.emit('askUpdate',asks[0].price);
      }
    }
  });

  reader.on('snapshot',function(orderBook){
    self.emit('seq gap');
    bids = [];
    asks = [];
    for(var i = 0;i<orderBook.bids.length;i++){
      OrderBookAdd(bids,greaterThan,{price:orderBook.bids[i][0],
        remaining_size:orderBook.bids[i][1],
        order_id:orderBook.bids[i][2]}
      );
    }
    for(var i = 0;i<orderBook.asks.length;i++){
      OrderBookAdd(asks,lessThan,{price:orderBook.asks[i][0],
        remaining_size:orderBook.asks[i][1],
        order_id:orderBook.asks[i][2]}
      );
    }
  });
}
inherits(OrderBookMgrGDAX,EventEmitter);
module.exports = OrderBookMgrGDAX;

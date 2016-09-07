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

function OrderBookModify(book,comparator,update){
  var level = {price: update.data.rate, size: update.data.amount};
  if(book.length == 0){
    book.push(level);
  }else{
    var match = false;
    for(var i = 0;i<book.length;i++){
      if(comparator(level.price,book[i].price)){
        book.splice(i,0,level);
        match = true;
        break;
      }else if(level.price == book[i].price){
        book[i].size = level.size;
        match = true;
        break;
      }
    }
    if(!match){
     book.push(level)
    }
  }
}

function OrderBookRemove(book,update){
  for(var i = 0;i<book.length;i++){
    if(update.data.rate == book[i].price){
      book.splice(i,1);
      break;
    }
  }
}
function OrderBookMgrPoloniex(reader){
  EventEmitter.call(this);
  var self = this;
  reader.on('update', function(update){
    if(update.data.type == 'bid'){
      if(update.type == 'orderBookModify'){
        OrderBookModify(bids,greaterThan,update);
      }else if(update.type == 'orderBookRemove'){
        OrderBookRemove(bids,update);
      } 
      self.emit('bidUpdate',bids[0].price);   
    }else if(update.data.type == 'ask'){
      if(update.type == 'orderBookModify'){
        OrderBookModify(asks,lessThan,update);
      }else if(update.type == 'orderBookRemove'){
        OrderBookRemove(asks,update);
      }
      self.emit('askUpdate',asks[0].price);
    }
  });
}
inherits(OrderBookMgrPoloniex,EventEmitter);
module.exports = OrderBookMgrPoloniex;

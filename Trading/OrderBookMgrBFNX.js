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
  var level = {price: update[1],count: update[2], size: update[3]};
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
    if(update[1] == book[i].price){
      book.splice(i,1);
      break;
    }
  }
}
function OrderBookMgrBFNX(handler){
  EventEmitter.call(this);
  var self = this;
  handler.on('incremental', function(update){
    if(update[3]>0){
      if(update[2] >0){
        OrderBookModify(bids,greaterThan,update);
      }else{
        OrderBookRemove(bids,update);
      } 
      self.emit('bidUpdate',bids[0].price);   
    }else{
      if(update[2]>0){
        update[3] = Math.abs(update[3]);
        OrderBookModify(asks,lessThan,update);
      }else{
        OrderBookRemove(asks,update);
      }
      self.emit('askUpdate',asks[0].price);
    }
  });
  handler.on('snapshot',function(data){
    for(var i = 0;i<data[1].length;i++){
      var level = data[1][i];
      level.unshift(data[0]);
      if(level[3] <0){
        level[3] = Math.abs(level[3]);
        OrderBookModify(asks,lessThan,level);
      }else{
        OrderBookModify(bids,greaterThan,level);
      }
    }  
  });
  handler.on('trade',function(data){
    self.emit('lastUpdate',data[5]);
  });
}
inherits(OrderBookMgrBFNX,EventEmitter);
module.exports = OrderBookMgrBFNX;

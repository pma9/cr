var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var bids = [];
var asks = [];

function greaterThan(a,b){
  if(Number(a)>Number(b)){
    return true;
  }
  return false;
}

function lessThan(a,b){
  if(Number(a)<Number(b)){
    return true;
  }
  return false;
}

function OrderBookModify(book,comparator,update){
  var level = {price: Number(update.price), size: Number(update.remaining)};
  if(book.length == 0){
    book.push(level);
  }else{
    var match = false;
    for(var i = 0;i<book.length;i++){
      if(comparator(level.price,book[i].price)){
        book.splice(i,0,level);
        match = true;
        break;
      }else if(Number(level.price) == Number(book[i].price)){
        book[i].size = level.size;
        match = true;
	if(Number(book[i].size) <= Number(0)){
          book.splice(i,1);
        }
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
    if(Number(update.price) == Number(book[i].price)){
      book.splice(i,1);
      break;
    }
  }
}
function OrderBookMgrGMNI(reader){
  EventEmitter.call(this);
  var self = this;
  reader.on('update', function(update){
    if(update.type == 'trade'){
      //new trade
    }else if(update.side == 'bid'){
//      if(update.reason == 'cancel'){
//        OrderBookRemove(bids,update);
//      }else{
        OrderBookModify(bids,greaterThan,update);
//      } 
      self.emit('bidUpdate',bids[0].price);   
    }else if(update.side == 'ask'){
//      if(update.reason == 'cancel'){
//        OrderBookRemove(asks,update);
//      }else{
        OrderBookModify(asks,lessThan,update);
//      }
//      self.emit('askUpdate',asks[0].price);
      self.emit('askUpdate',asks[0].price);
    }
  });
}
inherits(OrderBookMgrGMNI,EventEmitter);
module.exports = OrderBookMgrGMNI;

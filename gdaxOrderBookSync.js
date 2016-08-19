var gdax = require('gdax');
var orderBookSync = new gdax.OrderbookSync();
console.log(orderBookSync.book.state());

var plnx = require('plnx');
var Key = '1Q0BJ6CX-QESJ00ND-3NOAYKKE-GLX6B8J3';
var Secret = '9915a3cbcf751e3bb619c98cee19b3c448cfe76adae58248f849c1c78bc7f28d61852ba1d2cfba5734214eb5b12952606f56efe35fc2546dfd937a2027f62470';

plnx.returnBalances({key: Key, secret: Secret},function(err,data){
  console.log(err,data);
});
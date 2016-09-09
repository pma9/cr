
function Level(action,distance,amount,takeProfit,stopOut,orderMgr,state,sens){
  this.action = action;
  this.distance = distance;
  this.amount = amount;
  this.takeProfit = takeProfit;
  this.stopOut = stopOut;
  this.orderMgr = orderMgr;
  this.entryOrder = {type:'done'};
  this.exitOrder = {};
  this.state = state;
  this.sens = Number(sens);
  this.tob = Number(0);
  this.position = 0;
  this.remaining_size = this.amount;
}

function updateExitOrders(){

}

Level.prototype.updateTOB = function updateTOB(tob){
  var TOB = Number(tob);
  var upSens = Number(this.tob + this.sens);
  var downSens = Number(this.tob - this.sens);
  this.rate = (Number(tob) + this.distance).toFixed(8);
  switch(this.state){
    case "monitor":
      //do nothing
      break;
    case "closing":
      updateExitOrders();
      break;
    case "on":
      if(this.entryOrder.type == 'done' && this.position == 0){
        this.orderMgr.requestNewOrder(this,this.action,this.rate,this.remaining_size);
        this.entryorder.type = 'pending';
      }else if(this.entryOrder.type == 'open' && TOB > upSens || TOB < downSens){
        this.tob = TOB;
        this.orderMgr.modifyOrder(this.entryOrder.orderNumber,this.rate,this.remaining_size);
        //update take profit orders
      }else if(this.position >0 || this.position <0){
        updateExitOrders();
      }
      break;
    default:
      console.log("unrecognized state");
  }
}

Level.prototype.changeState = function changeState(state){
  this.state = state;
  switch(state){
    case "monitor":
      //cancel all working
        this.orderMgr.cancelOrder(entryOrder.orderNumber);
        this.orderMgr.cancelOrder(exitOrder.orderNumber);
      break;
    case "closing":
      //cancel entry order
        this.orderMgr.cancelOrder(entryOrder.orderNumber);
      break;
    case "on":
      //do nothing
      break;
    default:
      console.log("unrecognized state");
  }
}

Level.prototype.updateOrder(order){

  if(order.action == this.action){
    if(order.type == 'match'){
      this.position = this.position + order.size;
      this.remainingSize = this.amount - position;
    }else{
      if(order.type == 'open'){
        var initialFill = this.remainingSize - order.remaining_size;
        this.position = this.position + initialFill;
        this.remaining_size = this.amount - position;
      }
      this.entryOrder = order;
    }
  }else{
    //update exit orders(s)?
  }

}


module.exports = Level;

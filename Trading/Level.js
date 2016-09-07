
function Level(action,distance,amount,takeProfit,stopOut,orderMgr,state,sens){
  this.action = action;
  this.distance = distance;
  this.amount = amount;
  this.takeProfit = takeProfit;
  this.stopOut = stopOut;
  this.orderMgr = orderMgr;
  this.entryOrder = {};
  this.exitOrder = {};
  this.state = state;
  this.sens = Number(sens);
  this.tob = Number(0);
}

Level.prototype.updateTOB = function updateTOB(tob){
  var TOB = Number(tob);
  var upSens = Number(this.tob + this.sens);
  var downSens = Number(this.tob - this.sens);
//  console.log(TOB,upSens,downSens);
  this.rate = (Number(tob) + this.distance).toFixed(8);
  switch(this.state){
    case "monitor":
      //do nothing
      break;
    case "closing":
      //update exit orders
      break;
    case "on":
      if(this.entryOrder.rate == null){
        this.entryOrder =this.orderMgr.requestNewOrder(this.action,this.rate,this.amount);
      }else if(TOB > upSens || TOB < downSens){
        this.tob = TOB;
        this.entryOrder = this.orderMgr.modifyOrder(this.entryOrder.orderNumber,this.rate,this.amount);
        //don't go back to original amount after partial
        //update take profit orders
      }
      //update entry orders
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

//fill notify

module.exports = Level;

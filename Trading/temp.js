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


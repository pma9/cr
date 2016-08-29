var keys = "keyboard";

function PrintModule(data){
  this.data = data;

  this.print = function(moreData){
    console.log(this.data,moreData);
  }
}

PrintModule.prototype.logger = function logger(moreData){
  console.log(keys,moreData);
};


function OtherModule(){
}
OtherModule.prototype.log = function log(data){
  console.log(data);
}
exports.PrintModule = PrintModule;
exports.OtherModule = OtherModule;

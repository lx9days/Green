
const {NgssParser} = require('./index');


module.exports= class SelecterParser{
    constructor(){
        this.parser=new NgssParser();
        this.parser.registerAttrEqualityMods('^','>','<','+','-','!','?');
    }
    
    parse(str){
        if(str){
            return this.parser.parse(str)
        }
        return null;
    }
}



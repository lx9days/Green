//const ngssSelectorParser = require("./ngss").NgssParser

import {NgssParser} from './index';

// const parser = new ngssSelectorParser()
// parser.registerAttrEqualityMods('^','>','<','+','-','!','?');

export default class SelecterParser{
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


//console.log(new SelecterParser().parse('node.mm'));


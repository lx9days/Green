import hexRgb from 'hex-rgb';
import { isFunction } from '../helper/util';
export default class RenderHierarchyLine{
    constructor({id,parentNodeId,source,target,tag=0}){
        this.parentNodeId=parentNodeId;
        this.source=source;
        this.target=target;
        this.id=id;
        this.tag=tag;
    }
    getSource(){
        return this.source;
    }
    getTarget(){
        return this.target;
    }
    updateSourcePos(sourceH){
        this.source.y+=sourceH;
    }
}
import hexRgb from 'hex-rgb';
import { isFunction } from '../helper/util';
export default class RenderHierarchyLine{
    constructor({id,parentNodeId,source,target}){
        this.parentNodeId=parentNodeId;
        this.source=source;
        this.target=target;
        this.id=id;
    }
    getSource(){
        return this.source;
    }
    getTarget(){
        return this.target;
    }
}
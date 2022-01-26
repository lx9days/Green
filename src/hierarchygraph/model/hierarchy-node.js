export default class HierarchyNode{
    constructor({data,depth,height,childrenVis},parent,fake=false){
        this.id=data.id;
        this.data=data;
        this._children=[];
        this.children=null;
        this.x=0;
        this.y=0;
        this.visible=false;
        this.parent=parent;
        this.isFake=fake
        this.depth=depth;
        this.height=height;
        this.childrenVisible=childrenVis;
        this.styles=new Array();
        this.status=2;//1未选中那个2选中
        
    }
    updateStatus(status){
        if(status==0||status==1){
            this.status=status;
        }
    }
    getStatus(){
        return this.status;
    }
    addStyle(style){
        this.styles.push(style);
    }
    getStyles(){
        return this.styles;
    }
    addChild(child){
        this._children.push(child);
    }
    updateChildrenVisible(){
        this.childrenVisible=!this.childrenVisible;
        if(this.childrenVisible){
            if(this.parent&&!this.parent.childrenVisible){
                this.childrenVisible=false;
            }
        }
    }
    setChildrenVisible(visible){
        this.childrenVisible=visible
    }
    visChildren(){
        this.children=this._children;
    }
    getChildren(){
        return this._children;
    }
    unVisChildren(){
        this.children=null;
    }
    setLocation(x,y){
        this.x=x;
        this.y=y;
    }
    getLocation(){
        return {
            x:this.x,
            y:this.y
        }
    }
    clearStyle(){
        this.styles=[];
    }
    getId(){
        return this.id;
    }
    hasHideChildren(){
        if(!this.childrenVisible&&this._children.length>0){
            return true;
        }
        return false;
    }
}
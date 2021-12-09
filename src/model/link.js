//link定义了系统中使用的link的结构
export default class Link {
    constructor(id, data) {
        this.id = id;
        this.data = data;
        this.classes = new Array();
        this.items = new Array();
        this.status = 2;//1未选中，2选中，3隐藏，4高亮
        this.isHover=false;
        this.styles=new Array();
        this.source={
            id:data.from,
            x:null,
            y:null
        };
        this.target={
            id:data.to,
            x:null,
            y:null
        };
        this.sourceNode=null;
        this.targetNode=null;

        this.useCustomStyle=false;
        this.customStyle={};
    }

    getId(){
        return this.id;
    }

    getStatus(){
        return this.status;
    }

    setStatus(status){
        this.status=status;
    }

    isNode() {
        return false;
    }
    isLink() {
        return true;
    }

    addStyle(style){
        this.styles.push(style);
    }
    addItems(items) {
        if (!items && items.length > 0) {
            items.forEach((v) => {
                this.items.push(v);
            })
        }
    }

    removeItems(ids = null) {
        if (ids && ids.length > 0) {
            ids.forEach(id => {
                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i].id === id) {
                        this.items.splice(i, 1);
                        break;
                    }
                }
            });
        } else {
            this.items = new Array();
        }
    }

    getItems() {
        return this.items;
    }

    addClasses(classes) {
        if (classes) {
            if (Array.isArray(classes)) {
                classes.forEach((cl) => {
                    this.classes.push(cl);
                })
            } else {
                this.classes.push(classes);
            }
        }
    }

    removeClasses(classes) {
        if (classes) {
            if (Array.isArray(classes)) {
                classes.forEach((cl) => {
                    const index = this.classes.indexOf(cl);
                    if (index > -1) {
                        this.classes.splice(index, 1);
                    }
                })
            } else {
                const index = this.classes.indexOf(classes);
                if (index > -1) {
                    this.classes.splice(index, 1);
                }
            }
        }else{
            this.classes=[];
        }
    }

    getClasses() {
        return this.classes;
    }

    getStyles(){
        return this.styles;
    }

    setTargetLocation({x,y}){
        this.target.x=x;
        this.target.y=y;
    }
    getTargetLocation(){
        //return {x:this.target.x,y:this.target.y};
        return {x:this.targetNode.x,y:this.targetNode.y}
    }

    setSourceLocation({x,y}){
        this.source.x=x;
        this.source.y=y;
    }
    getSourceLocation(){
        //return {x:this.source.x,y:this.source.y};
        return {x:this.sourceNode.x,y:this.sourceNode.y}
    }

    updateCustomStyle(customeStyle){
        this.useCustomStyle=true;
        this.customStyle=Object.assign(this.customStyle,customeStyle);
    }
    closeCustomStyle(){
        this.useCustomStyle=false;
        this.customStyle={};
    }

}
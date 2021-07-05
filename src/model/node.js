import Link from "./link";
//组件中使用的Node数据结构
export default class Node {
    
    constructor(id, data) {
        this.id = id;
        this.data = data;
        this.classes = new Array();
        this.items = new Array();
        this.styles=new Array();
        this.draggable = true;
        this.x=0;
        this.y=0;
        this.status = 2;//1未选中，2选中，3隐藏
        this.styles
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
        return true;
    }
    isLink() {
        return false;
    }

    setDraggable(bl) {
        this.draggable = bl;
    }
    getDraggable() {
        return this.draggable;
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

    addClasses(classes){
        if(classes&&classes.length>0){
            classes.forEach((cl)=>{
                this.classes.push(cl);
            })
        }
    }

    removeClasses(ids){
        if (ids && ids.length > 0) {
            ids.forEach(id => {
                for (let i = 0; i < this.classes.length; i++) {
                    if (this.classes[i].id === id) {
                        this.classes.splice(i, 1);
                        break;
                    }
                }
            });
        } else {
            this.classes = new Array();
        }
    }

    getClasses(){
        return this.classes;
    }

    getLocation(){
        return{
            x:this.x,
            y:this.y
        }
    }
    getStyles(){
        return this.styles;
    }

}
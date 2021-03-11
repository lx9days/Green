
export default class Link {
    constructor(id, data) {
        this.id = id;
        this.data = data;
        this.classes = new Array();
        this.items = new Array();
        this.status = 2;//1未选中，2选中，3隐藏
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

    getStyles(){
        return this.styles;
    }

    setTargetLocation({x,y}){
        this.target.x=x;
        this.target.y=y;
    }
    getTargetLocation(){
        return {x:this.target.x,y:this.target.y};
    }

    setSourceLocation({x,y}){
        this.source.x=x;
        this.source.y=y;
    }
    getSourceLocation(){
        return {x:this.source.x,y:this.source.y};
    }

}
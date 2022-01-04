
export default class SuperLink{
    constructor(id,data){
        this.id = id;
        this.data = data;
        this.status = 2;//1未选中，2选中
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
        this.styles=new Array();
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
    addStyle(style){
        this.styles.push(style);
    }
    getStyles(){
        return this.styles;
    }
}


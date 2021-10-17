export default class FlowBall{
    constructor(flowId,ballId,radius,link,direct,color){
        this.id=flowId+"_"+ballId;
        this.flowId=flowId;
        this.radius=radius;
        this.link=link;
        this.color=color;
        
        if(direct===1){
            this.startNode=link.sourceNode;
            this.endNode=link.targetNode;
        }else{
            this.endNode=link.sourceNode;
            this.startNode=link.targetNode;
        }
        this.currentPos=[this.startNode.x,this.startNode.y];
    }

    getStartNode(){
        return this.startNode;
    }
    getEndNode(){
        return this.endNode;
    }
    getDirect(){
        return this.direct
    }
   
}
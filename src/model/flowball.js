export default class FlowBall{
    constructor(flowId,ballId,radius,link,direct,color){
        this.id=flowId+"_"+ballId;
        this.flowId=flowId;
        this.radius=radius*30;
        this.link=link;
        this.color=color;
        if(direct===1){
            this.startNode=link.sourceNode;
            this.endNode=link.targetNode;
            // this.startPos=link._line.sourcePosition;
            // this.endPos=link._line.targetPosition;
        }else{
            this.endNode=link.sourceNode;
            this.startNode=link.targetNode;
            // this.startPos=link._line.targetPosition;
            // this.endPos=link._line.sourcePosition;
        }
        this.offset=link._line.offset;
        this.currentPos=[this.startNode.x+this.offset.sourceOffset.width/2,this.startNode.y+this.offset.sourceOffset.height/2];
    }

    getStartPos(){
        const startX=this.startNode.x+this.offset.sourceOffset.width/2;
        const startY=this.startNode.y+this.offset.sourceOffset.height/2;
        return [startX,startY];
    }
    getEndPos(){
        const endX=this.endNode.x+this.offset.targetOffset.width/2;
        const endY=this.endNode.y+this.offset.targetOffset.height/2;
        return [endX,endY];
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
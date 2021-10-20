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
            this.startPos=link._line.sourcePosition;
            this.endPos=link._line.targetPosition;
        }else{
            this.endNode=link.sourceNode;
            this.startNode=link.targetNode;
            this.startPos=link._line.targetPosition;
            this.endPos=link._line.sourcePosition;
        }
        this.currentPos=[this.startPos[0],this.startPos[1]];
    }

    getStartPos(){
        return this.startPos;
    }
    getEndPos(){
        return this.endPos;
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
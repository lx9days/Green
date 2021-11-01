import { v4 as uuidv4 } from 'uuid';
export default class FusionAnimation{
    constructor(params){
        this.id=uuidv4();
        this.speed=10;
        this.unitTime=10;
        this.timer=null;
        this.deleteNodes=params.deleteNodes;
        this.saveNode=params.saveNode;
        this.saveParams=params.saveParams;
        this.status="";
    }

    run(controller){
        if(this.status==="running"){
            return;
        }
        const startOnePos=[this.deleteNodes[0].x,this.deleteNodes[0].y];
        const startTwoPos=[this.deleteNodes[1].x,this.deleteNodes[1].y];
        const targetPosition=[(startOnePos[0]+startTwoPos[0])/2,(startOnePos[1]+startTwoPos[1])/2];
        function intervalFunc(){

        }
    }
}
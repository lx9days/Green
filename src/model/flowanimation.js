import FlowBall from "./flowball";

export default class FlowAnimation{
    constructor(params){
        this.id=params.id;
        this.order=params.order;
        this.color=params.color;
        this.name=params.name;
        this.time=params.speed*1000;
        this.unitTime=10;
        this.baseTime=300000;
        this.ballBaseSize=30;
        this.timer=null;
        this.mapFlowBalls=new Map();
    }

    addFlowBall(link,params){
        const flowBall=new FlowBall(this.id,params.id,this.ballBaseSize*params.size,link,params.direct,this.color);
        this.mapFlowBalls.set(params.id,flowBall);
    }

    closeInterval(){
        clearInterval(this.timer);
    }

    removeFlowBall(ballId){
        this.mapFlowBalls.delete(ballId);
    }

    clearFlowBall(){
        this.mapFlowBalls=new Map()
        clearInterval(this.timer);
    }
    
    setTimer(timer){
        this.timer=timer;
    }

    getTimer(){
        return this.timer
    }

    getFlowBalls(){
        return this.mapFlowBalls.values;
    }
}
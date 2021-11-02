import FlowAnimation from "../model/flowanimation";
import FlowBall from "../model/flowball";
import FusionAnimation from "../model/fusionanimation";

export default class AnimationController{
    constructor(controller){
        this.controller=controller;
        this.renderItems={
            balls:new Array()
        }
        this.animations={
            flow:[],
            idMapFlow:new Map()
        }
    }

    addFlowAnimation(flowArray){
        if(!Array.isArray(flowArray)){
            return
        }
        flowArray.forEach((animation,i)=>{
            const params={
                id:animation.id,
                name:animation.name,
                speed:animation.speed,
                color:animation.colour,
                order:animation.order
            }
            const balls=animation.balls;
            const flowAnimation=new FlowAnimation(params);
            for(const key in balls){
                const rawBall=balls[key];
                const link=this.controller.elementController.getLink(rawBall.link_id)
                if(!link){
                    continue
                }
                const ball=new FlowBall(flowAnimation.id,key,rawBall.size,link,rawBall.direct,flowAnimation.color);
                flowAnimation.addFlowBall(ball)
            }
            this.animations.idMapFlow.set(flowAnimation.id,flowAnimation);
            this.animations.flow.push(flowAnimation);
        });
        this.runFlowAnimation();
    }

    runFlowAnimation(){

        //待优化
        let flowBalls=[];
        this.animations.flow.forEach(animation=>{
            flowBalls=[...flowBalls,...animation.getFlowBalls()]
            const status=animation.getStatus();
            if(status==='ready'||status===''){
                animation.run(this.controller.canvasController);
            }
        });
        this.controller.canvasController.updateAnimationData(flowBalls)
    }

    removeFlowAnimation(flowIds){
        if(flowIds){
            flowIds.forEach((id)=>{
               if(this.animations.idMapFlow.has(id)){
                   this.animations.idMapFlow.get(id).stop();
                   this.animations.idMapFlow.delete(id);
               }
            });
            this.animations.flow=Array.from(this.animations.idMapFlow.values());
            this.runFlowAnimation()
        }else{
            this.animations.flow.forEach((flow)=>{
                flow.stop()
            });
            this.animations.flow=[];
            this.animations.idMapFlow=new Map();
            this.controller.canvasController.updateAnimationData([]);

        }
    }

    pauseFlowAnimation(flowIds){
        if(flowIds){
            flowIds.forEach(id=>{
                if(this.animations.idMapFlow.has(id)){
                    this.animations.idMapFlow.get(id).pause();
                }
            })
        }else{
            this.animations.flow.forEach(flow=>{
                flow.pause();
            })
        }
    }

    restartFlowAnimation(flowIds){
        if(flowIds){
            flowIds.forEach(id=>{
                if(this.animations.idMapFlow.has(id)){
                    const animation=this.animations.idMapFlow.get(id);
                    if(animation.getStatus()==='pause'){
                        animation.run(this.controller.canvasController)
                    }
                }
            })
        }else{
            this.animations.flow.forEach(animation=>{
                if(animation.getStatus()==='pause'){
                    animation.run(this.controller.canvasController)
                }
            })

        }
    }

    getAnimationIdByStatus(status){
        if(status){
            return this.animations.flow.reduce((pre,cur)=>{
                if(cur.getStatus()===status){
                    pre.push(cur.id);
                }
            },[])
        }else{
            return this.animations.flow.map(v=>v.id)
        }
        
    }

    addFusionAnimation(data){
        if(data.record&&data.record.length===2){
            let delRecord=null;
            let addRecord=null;
            data.record.forEach(record=>{
                if(record["method"]==="del_node"){
                    delRecord=record;
                }
                if(record["method"]==="add_node"){
                    addRecord=record;
                }
            });
            const deleteNodes=[];
            delRecord.params.forEach((id)=>{
                const node=this.controller.elementController.getNode(id);
                if(node){
                    deleteNodes.push(node);
                }else{
                    throw new Error("cannot find node id:"+id);
                }
            });
            const fusionAnimation=new FusionAnimation({deleteNodes,saveNode:addRecord.params[0].id,saveParams:addRecord.params[0]});
            fusionAnimation.run(this.controller.elementController);
        }
    }
}
import FlowAnimation from "../model/flowanimation";
import FlowBall from "../model/flowball";

export default class AnimationController{
    constructor(controller){
        this.controller=controller;
        this.renderItems={
            balls:new Array()
        }
        this.animations={
            flow:[]
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
            this.animations.flow.push(flowAnimation);
        });
        

    }

    runFlowAnimation(){
        const flowBalls=[];

        this.animations.flow.forEach(animation=>{
            flowBalls=[...flowBalls,...animation.getFlowBalls()]
            animation.run(this.controller.canvasController);
        });
    }

    removeFlowAnimation(){

    }


}
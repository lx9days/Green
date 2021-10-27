import hexRgb from 'hex-rgb';
import { isRGBA, rgbaStr2Array } from '../helper/util';
export default class FlowAnimation {
    constructor(params) {
        this.id = params.id;
        this.orderArrays = params.order;
        if (Array.isArray(params.color)) {
            this.color = params.color;
        } else {
            if(isRGBA(params.color)){
                this.color=rgbaStr2Array(params.color)
            }else{
                const colorRGB = hexRgb(params.color);
                this.color = [100, 111, 111, 255];
                this.color[0] = colorRGB.red;
                this.color[1] = colorRGB.green;
                this.color[2] = colorRGB.blue;
            }
           
        }
        this.name = params.name;
        this.time = params.speed * 1000;
        this.unitTime = 10;
        this.baseTime = 300000;
        this.ballBaseSize = 30;
        this.timer = [];
        this.mapFlowBalls = new Map();
        this.status ='';//''未初始化，'running','pause','ready'
    }

    addFlowBall(flowBall) {
        this.mapFlowBalls.set(flowBall.id, flowBall);
    }

    closeInterval() {
        this.timer.forEach(timer => {
            clearInterval(timer);
        })

    }

    removeFlowBall(ballId) {
        this.mapFlowBalls.delete(ballId);
    }

    clearFlowBall() {
        this.mapFlowBalls = new Map()
        clearInterval(this.timer);
    }

    getUnitTime() {
        return this.unitTime;
    }

    addTimer(timer) {
        this.timer.push(timer)
    }

    getTimer() {
        return this.timer
    }

    getFlowBalls() {
        return Array.from(this.mapFlowBalls.values());
    }

    getOrder() {
        return this.order
    }
    run(controller) {
        if (this.status === "running") {
            return
        }
        const num = this.baseTime / this.time;
        let p = 0;
        const mapFlowBalls = this.mapFlowBalls
        const animationId = this.id

        function intervalFunc(ballIds) {
            for (let j = ballIds.length - 1; j >= 0; j--) {
                const ballId = ballIds[j];
                const flowBall = mapFlowBalls.get(animationId + "_" + ballId);
                const startPos = flowBall.getStartPos();
                const endPos = flowBall.getEndPos();
                const dValueX = endPos[0] - startPos[0];
                const dValueY = endPos[1] - startPos[1]
                const dValueUnitX = dValueX / num;
                const dValueUnitY = dValueY / num;
                const pNum = p % num;
                flowBall.currentPos[0] = startPos[0] + pNum * dValueUnitX;
                flowBall.currentPos[1] = startPos[1] + pNum * dValueUnitY;
            }
            p++;
            controller.updateAmination();
        }
        this.orderArrays.forEach(ballIds => {
            this.timer.push(setInterval(intervalFunc, this.unitTime, ballIds))
        });
        this.status = "running"


    }
    pause() {
        this.closeInterval();
        this.timer = [];
        this.status = "pause"
    }
    stop(){
        this.closeInterval();
        this.timer = [];
        this.status = ""
        this.clearFlowBall();
    }
    getStatus(){
        return this.status;
    }
}
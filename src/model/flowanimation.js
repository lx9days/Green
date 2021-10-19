
export default class FlowAnimation {
    constructor(params) {
        this.id = params.id;
        this.orderArrays = params.order;
        this.color = params.color;
        this.name = params.name;
        this.time = params.speed * 1000;
        this.unitTime = 40;
        this.baseTime = 300000;
        this.ballBaseSize = 30;
        this.timer = [];
        this.mapFlowBalls = new Map();
        this.status = 'pause'
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
        if(this.status==="running"){
            return
        }
        const num = this.baseTime / this.time;
        let p = 0;
        const mapFlowBalls = this.mapFlowBalls

        function intervalFunc(ballIds) {
            for (let j = ballIds.length - 1; j >= 0; j--) {
                const ballId = ballIds[j];

                const flowBall = mapFlowBalls[ballId];
                const startNode = flowBall.getStartNode();
                const endNode = flowBall.getEndNode();
                const dValueX = endNode.x - startNode.x;
                const dValueY = endNode.y - startNode.y
                const dValueUnitX = dValueX / num;
                const dValueUnitY = dValueY / num;
                const pNum = p % num;
                flowBall.currentPos[0] = startNode.x + pNum * dValueUnitX;
                flowBall.currentPos[1] = startNode.y + pNum * dValueUnitY;
            }
            p++;
            controller.updateAmination();
        }
        this.orderArrays.forEach(ballIds => {
            this.timer.push(setInterval(intervalFunc,this.unitTime,ballIds))
        });
        this.status="running"


    }
    stop() {
        this.closeInterval();
        this.timer=[];
        this.status="pause"
    }
}
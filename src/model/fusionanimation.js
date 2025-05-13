export default class FusionAnimation {
    constructor(params) {
        this.time = 3000;
        this.baseTime = 300000;
        this.unitTime = 10;
        this.timer = null;
        this.deleteNodes = params.deleteNodes;
        this.saveNode = params.saveNode;
        this.deleteLinkIds=params.deleteLinkIds;
        this.addLinkData=params.addLinkData;
        this.status = "";
    }

    run(controller) {
        if (this.status === "running") {
            return;
        }
        const num = this.baseTime / this.time;
        const startOnePos = [this.deleteNodes[0].x, this.deleteNodes[0].y];
        const startTwoPos = [this.deleteNodes[1].x, this.deleteNodes[1].y];
        const targetPosition = [(startOnePos[0] + startTwoPos[0]) / 2, (startOnePos[1] + startTwoPos[1]) / 2];
        let p = 0;

        const fusionElements = () => {
            if (this.timer) {
                clearInterval(this.timer);
            }
            this.deleteNodes.forEach(node => {
                if (node.id === this.saveNode.id) {
                    node.data = this.saveNode;
                }
            });
            const fusionParams={
                deleteNodes:this.deleteNodes,
                saveNodeId:this.saveNode.id,
                deleteLinkIds:this.deleteLinkIds,
                addLinkData:this.addLinkData,
                addNodeData:this.saveNode
            }
            controller.fusionElements(fusionParams);
        }

        function intervalFunc(deleteNodes) {
            const d1ValueX = targetPosition[0] - startOnePos[0];
            const d1ValueY = targetPosition[1] - startOnePos[1];
            const d2ValueX = targetPosition[0] - startTwoPos[0];
            const d2Valuey = targetPosition[1] - startTwoPos[1];

            const d1ValueUnitX = d1ValueX / num;
            const d1ValueUnitY = d1ValueY / num;
            const d2ValueUnitX = d2ValueX / num;
            const d2ValueUnitY = d2Valuey / num;

            const pNum = p % num;
            deleteNodes[0].x = startOnePos[0] + pNum * d1ValueUnitX;
            deleteNodes[0].y = startOnePos[1] + pNum * d1ValueUnitY;

            deleteNodes[1].x = startTwoPos[0] + pNum * d2ValueUnitX;
            deleteNodes[1].y = startTwoPos[1] + pNum * d2ValueUnitY;

            if ((p + 1) % num === 0) {
                deleteNodes[0].x = targetPosition[0];
                deleteNodes[0].y = targetPosition[1];
                deleteNodes[1].x = targetPosition[0];
                deleteNodes[1].y = targetPosition[1];
                controller.updateEntityPosition(deleteNodes.map(v => v.id));
                fusionElements();
            } else {
                p++;
                controller.updateEntityPosition(deleteNodes.map(v => v.id));
            }


        }
        this.timer = setInterval(intervalFunc, this.unitTime, this.deleteNodes);
        this.status = "running";
    }
}
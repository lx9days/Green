
export default class BubbleRegion{
    constructor(id){
        this.id=id;
        this.childrenBubble=[];
    }

    addBubble(bubble){
        this.childrenBubble.push(bubble);
    }
    getBubbles(){
        return this.childrenBubble;
    }
}
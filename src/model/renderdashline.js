export default class RenderDashLine{
    constructor(dashLine,start,end){
        this.id=dashLine.id;
        this.sourcePosition=start;
        this.targetPosition=end;
        this.status=dashLine.status;
        this.style=dashLine.style;
    }

    reConstructor(dashLine,start,end){
        this.id=dashLine.id;
        this.sourcePosition=start;
        this.targetPosition=end;
        this.status=dashLine.status;
    }


}
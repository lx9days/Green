export default class SuperNode{
    constructor(id, data) {
        this.id = id;
        this.data = data;
        this._x = 0;
        this._y = 0;
        this.status = 2;//1未选中，2选中
        this.sourceLinks = new Array();
        this.targetLinks = new Array();
        this.styles = new Array();
    }
    get x(){
        return this._x;
    }
    get y(){
        return this._y
    }
    set x(val){
        this._x=val;
    }
    set y(val){
        this._y=val;
    }

    getId() {
        return this.id;
    }

    getStatus() {
        return this.status;
    }

    setStatus(status) {
        this.status = status;
    }

    getLocation() {
        return {
            x: this.x,
            y: this.y
        }
    }

    addSourceLink(link) {
        if (link) {
            this.sourceLinks.push(link);
        }

    }
    getSourceLinks() {
        return this.sourceLinks;
    }

    removeSourceLink(link) {
        if (link) {
            const index = this.sourceLinks.indexOf(link);
            if (index > -1) {
                this.sourceLinks.splice(index, 1);
            }
        }
    }


    addTargetLink(link) {
        if (link) {
            this.targetLinks.push(link)
        }

    }
    getTargetLinks() {
        return this.targetLinks;
    }

    removeTargetLink(link) {
        if (link) {
            const index = this.targetLinks.indexOf(link);
            if (index > -1) {
                this.targetLinks.splice(index, 1);
            }
        }
    }

    addStyle(style) {
        this.styles.push(style);
    }
    getStyles() {
        return this.styles;
    }
}
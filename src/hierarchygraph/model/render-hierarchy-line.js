import hexRgb from 'hex-rgb';
import { isFunction } from '../helper/util';
export default class RenderHierarchyLine {
    constructor({ id, parentNodeId, source, target, tag = 0 }) {
        this.parentNodeId = parentNodeId;
        this.source = source;
        this.target = target;
        this.id = id;
        this.tag = tag;
        this.style = {
            width: 2,
            "line-color": "#ff0000",
        }
    }
    getSource() {
        return this.source;
    }
    getTarget() {
        return this.target;
    }
    updateSourcePos(sourceH) {
        this.source.y += sourceH;
    }

    rebuild() {
        //this.fixCrossPoint();
        if (typeof this.style['line-color'] == "string") {
            let hex = this.style['line-color'];
            this.style['line-color'] = [];
            //console.log(this.style['line-color']);
            let rgb = hexRgb(hex);
            this.style['line-color'][0] = rgb.red;
            this.style['line-color'][1] = rgb.green;
            this.style['line-color'][2] = rgb.blue;
        }
    }
    fixCrossPoint() {
        console.log("fix");
        if (this.source.y == this.target.y) {
            this.source.x -= this.style.width / 2;
            this.target.y += this.style.width / 2;
        }
    }
}
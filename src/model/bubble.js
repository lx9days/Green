import { BubbleSet, PointPath, BSplineShapeGenerator, ShapeSimplifier } from '../helper/bubbleset';
import hexRgb from 'hex-rgb';
export default class Bubble {
    constructor(originNodes, renderBackgrounds, color, id) {
        this.id = id
        this.originNodes = originNodes;
        if (Array.isArray(color)) {
            this.color = color
        } else {
            const backgroundColorRGB = hexRgb(color);
            this.color = [100, 111, 111, 160];
            this.color[0] = backgroundColorRGB.red;
            this.color[1] = backgroundColorRGB.green;
            this.color[2] = backgroundColorRGB.blue;
        }

        this.renderbackgrounds = renderBackgrounds;
        this.outline = null;
        this.polygon = null;
        this.startIndex = 0;
        this.polygonNum = 0;

        this.computeOutline()
    }
    computeOutline() {

        const rectangles = this.renderbackgrounds.map((v, i) => {
            return {
                x: v.position[0],
                y: v.position[1],
                width: v.style.backgroundWidth,
                height: v.style.backgroundHeight,
            }
        });
        const bubble = new BubbleSet()

        const list = bubble.createOutline(rectangles, [], null);
        const outline = new PointPath(list).transform([
            new ShapeSimplifier(0.0),
            new BSplineShapeGenerator(),
            new ShapeSimplifier(0.0),
        ]);
        this.polygon = outline.toPolygon()
    }
    reCompute() {
        this.computeOutline()
    }
    getRenderBubbles() {
        return this.polygon;
    }
    setIndex(index) {
        this.startIndex = index;
    }
    getOriginNodes() {
        return this.originNodes;
    }



}
import { CompositeLayer } from '@deck.gl/core';
import { ScatterplotLayer, PolygonLayer, PathLayer } from '@deck.gl/layers';
//组合layer,通过组合多种layer来获取想要的形状或者样式
//该类组合了圆角矩形
export default class RoundedRectangleLayer extends CompositeLayer {

    renderLayers() {
        return [
            new ScatterplotLayer({
                id: `${this.props.id}-scatter1`,
                data: this.props.data,
                pickable: true,
                stroked: true,
                filled: true,
                radiusMinPixels: 1,
                radiusMaxPixels: 100,
                lineWidthMinPixels: 1,
                getPosition: this.props.getFirstScatterPosition,
                getRadius: this.props.getCircleRadius,
                getFillColor: this.props.getFillColor,
                getLineColor: this.props.getLineColor,
                getLineWidth: this.props.getLineWidth,

                updateTriggers: {
                    getPosition: this.props.updateTriggers.getFirstScatterPosition,
                    getRadius: this.props.updateTriggers.getCircleRadius,
                    getFillColor: this.props.updateTriggers.getFillColor,
                    getLineColor: this.props.updateTriggers.getLineColor,
                    getLineWidth: this.props.updateTriggers.getLineWidth,
                }
            }),
            new ScatterplotLayer({
                id: `${this.props.id}-scatter2`,
                data: this.props.data,
                pickable: true,
                stroked: true,
                filled: true,
                getPosition: this.props.getSecondScatterPosition,
                getRadius: this.props.getCircleRadius,
                getFillColor: this.props.getFillColor,
                getLineColor: this.props.getLineColor,
                getLineWidth: this.props.getLineWidth,
                opacity: this.props.opacity,

                updateTriggers: {
                    getPosition: this.props.updateTriggers.getSecondScatterPosition,
                    getRadius: this.props.updateTriggers.getCircleRadius,
                    getFillColor: this.props.updateTriggers.getFillColor,
                    getLineColor: this.props.updateTriggers.getLineColor,
                    getLineWidth: this.props.updateTriggers.getLineWidth,
                }
            }),
            new PolygonLayer({
                id: `${this.props.id}-polygon`,
                data: this.props.data,
                pickable: true,
                stroke: true,
                filled: true,
                wireFrame: true,
                getPolygon: this.props.getPolygon,
                getFillColor: this.props.getFillColor,
                getLineColor: this.props.getFillColor,
                getLineWidth: this.props.getLineWidth,
                updateTriggers: {
                    getPolygon: this.props.updateTriggers.getPolygon,
                    getFillColor: this.props.updateTriggers.getFillColor,
                    getLineColor: this.props.updateTriggers.getFillColor,
                    getLineWidth: this.props.updateTriggers.getLineWidth,
                }
            }),
            new PathLayer({
                id: `${this.props.id}-path1`,
                data: this.props.data,
                pickable: true,
                opacity: this.props.opacity,
                getPath: this.props.getFirstPath,
                getColor: this.props.getLineColor,
                getWidth: this.props.getLineWidth,
                updateTriggers: {
                    getPath: this.props.updateTriggers.getFirstPath,
                    getColor: this.props.updateTriggers.getLineColor,
                    getWidth: this.props.updateTriggers.getLineWidth,
                }
            }),
            new PathLayer({
                id: `${this.props.id}-path2`,
                data: this.props.data,
                pickable: true,
                opacity: this.props.opacity,
                getPath: this.props.getSecondPath,
                getColor: this.props.getLineColor,
                getWidth: this.props.getLineWidth,
                updateTriggers:{
                    getPath: this.props.updateTriggers.getSecondPath,
                    getColor: this.props.updateTriggers.getLineColor,
                    getWidth: this.props.updateTriggers.getLineWidth,
                }
            })
        ]
    }

}

RoundedRectangleLayer.layerName = 'RoundedRectangleLayer';

RoundedRectangleLayer.defaultProps = {
    getFirstScatterPosition: { type: 'accessor', value: x => x.position },
    getSecondScatterPosition: {
        type: 'accessor', value: x => {
            return [x.position[0] + x.width, x.position[1]];
        }
    },
    getPolygon: {
        type: 'accessor', value: x => {
            return [[x.position[0], x.position[1] + x.height / 2], [x.position[0] + x.width, x.position[1] + x.height / 2], [x.position[0] + x.width, x.position[1] - x.height / 2], [x.position[0], x.position[1] - x.height / 2]]
        }
    },
    getFirstPath: {
        type: 'accessor', value: x => {
            return [[x.position[0] - x.lineWidth / 2, x.position[1] - x.height / 2], [x.position[0] + x.width + x.lineWidth / 2, x.position[1] - x.height / 2]];
        }
    },
    getSecondPath: {
        type: 'accessor', value: x => {
            return [[x.position[0] - x.lineWidth / 2, x.position[1] + x.height / 2], [x.position[0] + x.width + x.lineWidth / 2, x.position[1] + x.height / 2]];
        }
    },
    getCircleRadius: {
        type: 'accessor', value: x => {
            return x.height / 2;
        }
    },
    getFillColor: { type: 'accessor', value: [0, 0, 0, 255] },
    getLineWidth: { type: 'accessor', value: 16 },
    getLineColor: { type: 'accessor', value: [0, 0, 0, 255] },
}

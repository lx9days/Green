import { Deck, OrthographicView } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import { LineLayer } from '@deck.gl/layers';
import * as d3 from "d3"
//d3.layout.tree()
const deckWidth = 10000;
const deckHeight = 1000;
const dataset = require('/src/schema.json');

let roots = [];//存放文件中的根节点
dataset.nodes.forEach(function (d) {
    roots.push(d.data);
})

//创造一个假根结点，所有原数据中的根节点都是它的孩子，用于树形布局
let fakeRoot = { children: roots };
let h = d3.hierarchy(fakeRoot);
var tree = d3.tree() 
    .size([deckWidth, deckHeight])
    .separation(function (a, b) { return (a.parent == b.parent ? 1 : 2); });
let nodes2 = tree(h);

let nodes = [nodes2];//用于层次遍历的队列，存放布局后的根节点
while (nodes.length) {
    //初始化时设置只展开1层，depth为2的节点被设置为隐藏子节点列表
    if (nodes[0].children) {
        if (nodes[0].depth == 2) {
            nodes[0].invisibleChildren = nodes[0].children;
            nodes[0].children = undefined;
            nodes[0].visible = -1;
        }
        else {
            nodes[0].children.forEach(function (d) {
                nodes.push(d);
            });
        }

    }
    nodes.shift();
};
nodes = [nodes2];
let final = makeFinal(nodes);
let finalnodes = final[0];
let finallinks = final[1];

function makeFinal(nodes) {
    let finalnodes = [];//最终将被绘制的结点们
    let finallinks = [];
    let nodeCount = 0;//节点计数，用做节点的唯一索引
    let linkCount = 0;

    //层次遍历，在此过程中，给每个节点和边都设置一个visible属性用以指明其是否处于隐藏状态
    //并且为每条边添加parent_ID属性指明它起始于哪个节点
    while (nodes.length) {
        if (nodes[0].depth > 1) {
            //若队列头结点有父亲，且父亲不是假根，则会有一条向上的边
            finallinks.push(
                {
                    linkID: linkCount,
                    visible: 1,
                    parent_ID: nodes[0].parent.nodeID,
                    x1: nodes[0].x,
                    x2: nodes[0].x,
                    y1: nodes[0].y,
                    y2: (nodes[0].parent.y + nodes[0].y) / 2,
                }
            )
            linkCount++;
        }
        if (nodes[0].children) {
            //若队列头结点有儿子，会有一条向下的边，也许还有一条横边
            let left = nodes[0].x;
            let right = nodes[0].x;
            nodes[0].children.forEach(function (d) {
                //将儿子节点全部入队，并设定visible和ID属性
                if (!d.visible) {
                    d.visible = 1;
                }
                d.nodeID = nodeCount;
                nodes.push(d);
                nodeCount++;
                if (d.x < left) {
                    left = d.x;
                }
                else if (d.x > right) {
                    right = d.x;
                }
            });
            finallinks.push(
                //向下竖边
                {
                    linkID: linkCount,
                    visible: 1,
                    parent_ID: nodes[0].nodeID,
                    x1: nodes[0].x,
                    x2: nodes[0].x,
                    y1: nodes[0].y,
                    y2: (nodes[0].children[0].y + nodes[0].y) / 2,
                }
            );
            linkCount++;
            if (left < right) {
                //横边
                finallinks.push(
                    {
                        linkID: linkCount,
                        visible: 1,
                        parent_ID: nodes[0].nodeID,
                        x1: left,
                        x2: right,
                        y1: (nodes[0].children[0].y + nodes[0].y) / 2,
                        y2: (nodes[0].children[0].y + nodes[0].y) / 2,
                    }
                );
                linkCount++;
            }
        }
        finalnodes.push(nodes.shift());//当前头结点加入最终渲染列表
    };

    //删除假根节点，和从假根开始向下的一条竖边
    finalnodes.shift();
    finallinks.shift();
    //若原数据有多棵树，则假根下会有一条横边，判断假根竖边后是否还有横边，若有则删除
    if (finallinks[0].y1 == finallinks[0].y2) {
        finallinks.shift();
    }

    return [finalnodes, finallinks];
};

//console.log(nodes2);
// console.log(finalnodes);
// console.log(finallinks);

//节点层创建函数，根据节点和边的visible属性设置透明度
function makeplotlayer(data, id) {
    const scatter = new ScatterplotLayer({
        id: 'scatterplot-layer' + id,
        data,
        pickable: true,
        stroked: true,
        filled: true,
        getPosition: d => [d.x, d.y],
        getRadius: d => {
            if (d.visible == -1)
                return 8;
            else
                return 5;
        },
        getFillColor: d => {
            if (d.visible == -1)
                return [0, 255, 255, 255];
            else
                return [255, 0, 0, 255 * d.visible];
        },
        getLineColor: d => {
            if (d.visible == -1)
                return [255, 0, 255, 255];
            else
                return [100, 100, 0, 255 * d.visible];
        },
        getLineWidth: d => {
            if (d.visible == -1)
                return 4;
            else
                return 1;
        },

    });
    return scatter;
}
let scatter1 = makeplotlayer(finalnodes, 1);

function makelinelayer(data, id) {
    const line = new LineLayer({
        id: 'line-layer' + id,
        data,
        pickable: true,
        getWidth: d => {
            // if (d.parent_ID == "5f1a9cfeab91f513e1ccee93") {
            //     return 5;
            // }
            // else
            return 1;
        },
        getSourcePosition: d => [d.x1, d.y1],
        getTargetPosition: d => [d.x2, d.y2],
        getColor: d => [255, 140, 0, 255 * d.visible],
    });
    return line;
}
let line1 = makelinelayer(finallinks, 1);


let nowViewState = {
    target: [deckWidth, deckHeight, 0],
    rotationX: 0,
    rotationOrbit: 0,
    zoom: 0
}

let onViewStateChange = ({ viewState, interactionState, oldViewState }) => {
    if (interactionState.isZooming) {
    }
    nowViewState = viewState;
    deck.setProps({ viewState, layers: [line1, scatter1] });
}

// 点击事件说明：
// 只能点击可见的节点。
// 点击时判断是否是一棵子树的根
// 若是，当visible属性为1时将其children列表转为invisibleChildren，这样在生成布局时就不会被视为有子节点。
// 然后用node2进行重新布局（这里的node2是全局使用的）
// 最后，将节点visible设为-1以改变样式
// 若点击到-1的节点，进行相反操作

const deck = new Deck({
    views: new OrthographicView({
        id: 'globalView',
        x: 0,
        y: 0,
        width: deckWidth,
        height: deckHeight,
    }),
    viewState: nowViewState,
    controller: true,
    layers: [line1, scatter1],
    getTooltip: function ({ object }) {
        if (object && object.visible != 0) {
            if (object.data) {
                return "_id:" + object.data._id;
            }
        }
    },
    onClick: function ({ object }) {
        if (object && object.data) {
            if (object.visible == -1) {
                object.children = object.invisibleChildren;
                object.invisibleChildren = undefined;
                console.log(object);
                nodes2 = tree(nodes2);
                let nodes = [nodes2];//用于层次遍历的队列，存放布局后的根节点
                let newFinal = makeFinal(nodes);
                let newFinalnodes = newFinal[0];
                let newFinallinks = newFinal[1];
                object.visible = 1;
                scatter1 = makeplotlayer(newFinalnodes, Math.random());
                line1 = makelinelayer(newFinallinks, Math.random());
                //id相同的layer不会被重新绘制，所以在更新时用随机id
                deck.setProps({ nowViewState, layers: [line1, scatter1] });
            }
            else if (object.children && object.visible == 1) {
                object.invisibleChildren = object.children;
                object.children = undefined;
                console.log(object);
                nodes2 = tree(nodes2);
                let nodes = [nodes2];//用于层次遍历的队列，存放布局后的根节点
                let newFinal = makeFinal(nodes);
                let newFinalnodes = newFinal[0];
                let newFinallinks = newFinal[1];
                object.visible = -1;
                scatter1 = makeplotlayer(newFinalnodes, Math.random());
                line1 = makelinelayer(newFinallinks, Math.random());
                //id相同的layer不会被重新绘制，所以在更新时用随机id
                deck.setProps({ nowViewState, layers: [line1, scatter1] });
            }

        }
        return object;
    },
    onViewStateChange
});
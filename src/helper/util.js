//计算箭头的形状
function computeArrow(link, offset, type) {
    let sourceX;
    let sourceY;
    let targetX;
    let targetY;
    let r;
    if (type === 'target') {
        r = offset.targetOffset.y + 2;
        sourceX = link.sourceNode.x + offset.sourceOffset.width / 2;//+offset.sourceOffset.x;
        sourceY = link.sourceNode.y + offset.sourceOffset.height / 2//+offset.sourceOffset.y;
        targetX = link.targetNode.x + offset.targetOffset.width / 2;//+offset.targetOffset.x;
        targetY = link.targetNode.y + offset.targetOffset.height / 2;//+offset.targetOffset.y;
    } else {
        r = offset.sourceOffset.y + 2;
        sourceX = link.targetNode.x + offset.targetOffset.width / 2;//+offset.targetOffset.x;
        sourceY = link.targetNode.y + offset.targetOffset.height / 2;//+offset.targetOffset.y;
        targetX = link.sourceNode.x + offset.sourceOffset.width / 2;//+offset.sourceOffset.x;
        targetY = link.sourceNode.y + offset.sourceOffset.height / 2;//+offset.sourceOffset.y;s
    }
    const dis = 8;
    const length = 4;
    let dx = targetX - sourceX;
    let dy = targetY - sourceY;
    let v_norm = Math.sqrt(dx ** 2 + dy ** 2);
    targetX = targetX - r * dx / v_norm;
    targetY = targetY - r * dy / v_norm;
    dx = targetX - sourceX;
    dy = targetY - sourceY;
    v_norm = Math.sqrt(dx ** 2 + dy ** 2);
    let point_on_line = [targetX - dis * dx / v_norm, targetY - dis * dy / v_norm];
    let point_below = [point_on_line[0] - length * -dy / v_norm, point_on_line[1] - length * dx / v_norm];
    let point_above = [point_on_line[0] + length * -dy / v_norm, point_on_line[1] + length * dx / v_norm];
    const lo1 = point_above;
    const lo2 = [targetX, targetY];
    const lo3 = point_below;
    return [lo1, lo2, lo3];
}

function computePolygon(link, shape, type, offset) {
    if (shape === 'triangle') {
        return computeArrow(link, offset, type);
    } else if ('square') {

    }
}

function reLocationLinks(link, r = 11) {
    let sourceX = link.sourceNode.x;
    let sourceY = link.sourceNode.y;
    let targetX = link.targetNode.x;
    let targetY = link.targetNode.y;


    let dx = targetX - sourceX;
    let dy = targetY - sourceY;
    let v_norm = Math.sqrt(dx ** 2 + dy ** 2);
    targetX = targetX - r * dx / v_norm;
    targetY = targetY - r * dy / v_norm;

    link.targetLoc.x = targetX;
    link.targetLoc.y = targetY;

    sourceX = link.targetNode.x;
    sourceY = link.targetNode.y;
    targetX = link.sourceNode.x;
    targetY = link.sourceNode.y;

    dx = targetX - sourceX;
    dy = targetY - sourceY;
    v_norm = Math.sqrt(dx ** 2 + dy ** 2);
    targetX = targetX - r * dx / v_norm;
    targetY = targetY - r * dy / v_norm;

    link.sourceLoc.x = targetX;
    link.sourceLoc.y = targetY;

}
/**
 * 计算位置
 * @param {link} link 
 * @param {偏移} offset 
 * @param {*} renderLink 
 */
function generateLinkLocation(link, offset, renderLink) {
    let r = offset.targetOffset.y + 2;
    let sourceX = link.sourceNode.x + offset.sourceOffset.width / 2;//+offset.sourceOffset.x;
    let sourceY = link.sourceNode.y + offset.sourceOffset.height / 2//+offset.sourceOffset.y;
    let targetX = link.targetNode.x + offset.targetOffset.width / 2;//+offset.targetOffset.x;
    let targetY = link.targetNode.y + offset.targetOffset.height / 2;//+offset.targetOffset.y;


    let dx = targetX - sourceX;
    let dy = targetY - sourceY;
    let v_norm = Math.sqrt(dx ** 2 + dy ** 2);
    targetX = targetX - r * dx / v_norm;
    targetY = targetY - r * dy / v_norm;

    renderLink.targetPosition[0] = targetX;
    renderLink.targetPosition[1] = targetY;

    r = offset.sourceOffset.y + 2;
    sourceX = link.targetNode.x + offset.targetOffset.width / 2;//+offset.targetOffset.x;
    sourceY = link.targetNode.y + offset.targetOffset.height / 2;//+offset.targetOffset.y;
    targetX = link.sourceNode.x + offset.sourceOffset.width / 2;//+offset.sourceOffset.x;
    targetY = link.sourceNode.y + offset.sourceOffset.height / 2;//+offset.sourceOffset.y;

    dx = targetX - sourceX;
    dy = targetY - sourceY;
    v_norm = Math.sqrt(dx ** 2 + dy ** 2);
    targetX = targetX - r * dx / v_norm;
    targetY = targetY - r * dy / v_norm;

    renderLink.sourcePosition[0] = targetX;
    renderLink.sourcePosition[1] = targetY;
}

function getInteractionData(nodesMap, dataLiks, interactionNodes, interactionLinks, nodeID) {

    const nodeMap = new Map();
    const linkMap = new Map();
    interactionNodes.forEach(element => {
        nodeMap.set(element.id, element);
    });

    interactionLinks.forEach((link) => {
        linkMap.set(link.id, link);
    });
    dataLiks.forEach((element) => {
        if (element.source.id === nodeID) {
            if (element.isDelete) {
                element.isDelete = false;
            }
            if (!linkMap.has(element.id)) {
                interactionLinks.push(element);
                linkMap.set(element.id, element);
            }
            if (nodeMap.has(element.target.id)) {
                nodesMap.get(element.target.id).isDelete = false;
                nodesMap.get(element.target.id).status = 2;

            } else {
                interactionNodes.push(nodesMap.get(element.target.id));
                nodesMap.get(element.target.id).isDelete = false;
                nodesMap.get(element.target.id).status = 2;
                nodeMap.set(element.target.id, nodesMap.get(element.target.id));
            }
        }
    });
}

function generatePolygon(links, r) {
    const polygonSet = new Map();
    links.forEach((v, i) => {
        polygonSet.set(v.id, computeArrow(v, r));
    });
    return polygonSet;
}

//{source:'from',target:'to'}
// function generateLinkLocation(nodes, links, linkType) {
//     const nodeLocationMap = new Map();
//     nodes.forEach((v) => {
//         nodeLocationMap.set(v.id, v);
//     });
//     links.forEach((link) => {
//         const sourceNode = nodeLocationMap.get(link[linkType.source]);
//         link.source = { id: sourceNode.id, x: sourceNode.x + 20, y: sourceNode.y + 20 };
//         const targetNode = nodeLocationMap.get(link[linkType.target]);
//         link.target = { id: targetNode.id, x: targetNode.x + 20, y: targetNode.y + 20 };
//     });
// }

function isFunction(obj) {
    if (obj) {
        if (typeof obj === 'function') {
            return true;
        }
    }
    return false;
}

function BFSTree(rootNodes, nodes, links) {
    const neborTable = new Map();

    const tagMap = new Map();
    const nodeMap = new Map();
    let nodeRes = [];
    nodes.forEach((node) => {
        nodeMap.set(node.id, { id: node.id, children: [] });
        tagMap.set(node.id, false);
        neborTable.set(node.id, [])
    });
    links.forEach(link => {
        if (neborTable.has(link.data.from)) {
            neborTable.get(link.data.from).push(nodeMap.get(link.data.to));
        }
    })
  
    for (let i = 0; i < rootNodes.length; i++) {
        const queue = [];
        if (!tagMap.get(rootNodes[i].id)) {
            queue.push(nodeMap.get(rootNodes[i].id))
            tagMap.set(rootNodes[i].id, true);
        }
        while (queue.length > 0) {
           
            const fromNode = queue.shift();
            neborTable.get(fromNode.id).forEach(toNode => {
                if (!tagMap.get(toNode.id)) {
                    tagMap.set(toNode.id, true);
                    fromNode.children.push(toNode);
                    queue.push(toNode);
                }
            })
        }
        nodeRes.push(nodeMap.get(rootNodes[i].id))
    }

    return {
        nodes: nodeRes,
    }
}

function autoFitView(nodes, viewSize) {
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let minY = Infinity;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].x > maxX) {
            maxX = nodes[i].x;
        }
        if (nodes[i].x < minX) {
            minX = nodes[i].x;
        }
        if (nodes[i].y > maxY) {
            maxY = nodes[i].y;
        }
        if (nodes[i].y < minY) {
            minY = nodes[i].y;
        }
    }
    let originWidth = maxX - minX;
    let originHeight = maxY - minY;
    let curZoom = 0;
    let target = [minX + originWidth / 2, minY + originHeight / 2];
    let zoom = null
    if (originWidth < viewSize[0] && originHeight < viewSize[1]) {

        // if (originWidth / viewSize[0] < originHeight / viewSize[1]) {
        //     zoom = viewSize[1] / originHeight;
        // } else {
        //     zoom = viewSize[0] / originWidth;
        // }

    } else if (originWidth < viewSize[0]) {
        zoom = -(originHeight / viewSize[1] - 1);

    } else if (originHeight < viewSize[1]) {
        zoom = -(originWidth / viewSize[0] - 1);

    } else {
        if (originWidth / viewSize[0] > originHeight / viewSize[1]) {
            zoom = -(originWidth / viewSize[0] - 1);
        } else {
            zoom = -(originHeight / viewSize[1] - 1);
        }
    }
    zoom -= 0.18;
    return {
        target,
        zoom: zoom
    }

}
export { generatePolygon, getInteractionData, generateLinkLocation, isFunction, computePolygon, BFSTree, autoFitView }
//计算箭头的形状
function computeArrow(link, offset, type) {
    let sourceX;
    let sourceY;
    let targetX;
    let targetY;
    let r;
    if (type === 'target') {
        r=offset.targetOffset.y;
        sourceX = link.sourceNode.x+offset.sourceOffset.x;
        sourceY = link.sourceNode.y+offset.sourceOffset.y;
        targetX = link.targetNode.x+offset.targetOffset.x;
        targetY = link.targetNode.y+offset.targetOffset.y;
    } else {
        r=offset.sourceOffset.y;
        sourceX = link.targetNode.x+offset.targetOffset.x;
        sourceY = link.targetNode.y+offset.targetOffset.y;
        targetX = link.sourceNode.x+offset.sourceOffset.x;
        targetY = link.sourceNode.y+offset.sourceOffset.y;
    }
    const dis = 8;
    const length =4;
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
function generateLinkLocation(link, offset,renderLink) {
    let r=offset.targetOffset.y
    let sourceX = link.sourceNode.x+offset.sourceOffset.x;
    let sourceY = link.sourceNode.y+offset.sourceOffset.y;
    let targetX = link.targetNode.x+offset.targetOffset.x;
    let targetY = link.targetNode.y+offset.targetOffset.y;


    let dx = targetX - sourceX;
    let dy = targetY - sourceY;
    let v_norm = Math.sqrt(dx ** 2 + dy ** 2);
    targetX = targetX - r * dx / v_norm;
    targetY = targetY - r * dy / v_norm;

    renderLink.targetPosition[0] = targetX;
    renderLink.targetPosition[1] = targetY;

    r=offset.sourceOffset.y;
    sourceX = link.targetNode.x+offset.targetOffset.x;
    sourceY = link.targetNode.y+offset.targetOffset.y;
    targetX = link.sourceNode.x+offset.sourceOffset.x;
    targetY = link.sourceNode.y+offset.sourceOffset.y;

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

export { generatePolygon, getInteractionData, generateLinkLocation, isFunction, computePolygon }
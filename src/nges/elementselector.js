import { NgesSelectorParser } from "./ngesselectorparser";
export class ElementSelector {
    constructor(nodes, links, nodesMap, linksMap) {
        this.ngesSelectorParser = new NgesSelectorParser();
        this.ngesSelectorParser.registerAttrEqualityMods('^', '>', '<', '+', '-', '!', '?');
        this.nodes = nodes;
        this.links = links;
        if (nodesMap && linksMap) {
            this.nodesMap = nodesMap;
            this.linksMap = linksMap;
        }
        else {
            this.nodesMap = this.generateNodesMap(nodes);
            this.linksMap = this.generateLinksMap(links);
        }
    }
    /**
     * filter nodes and links by selectorStr
     * @param selectStr selectorStr
     */
    select(selectStr) {
        const parseObj = this.ngesSelectorParser.parse(selectStr);
        const result = {
            links: new Array(),
            nodes: new Array()
        };
        if (parseObj.type === 'selectors') {
            parseObj.selectors.forEach((ruleSet) => {
                const tempRes = this.analyzeElement(ruleSet);
                result.links = [...result.links, ...tempRes.links];
                result.nodes = [...result.nodes, ...tempRes.nodes];
            });
        }
        else if (parseObj.type === 'ruleSet') {
            const tempRes = this.analyzeElement(parseObj);
            result.links = tempRes.links;
            result.nodes = tempRes.nodes;
        }
        else {
            throw new Error(selectStr + "无法识别");
        }
        return result;
    }
    analyzeElement(parseObj) {
        const result = {
            links: new Array(),
            nodes: new Array()
        };
        if (parseObj.type === 'ruleSet') {
            const rules = parseObj.rule;
            if (rules.tagName) {
                if (rules.tagName === 'node') {
                    let tempNodeResult = this.selectByName('node');
                    tempNodeResult = this.analyzeNode(tempNodeResult, rules);
                    result.nodes = tempNodeResult;
                }
                else if (rules.tagName === 'link') {
                    let tempLinkResult = this.selectByName('link');
                    tempLinkResult = this.analyzeLink(tempLinkResult, rules);
                    result.links = tempLinkResult;
                }
            }
            else {
                let tempNodeResult = this.selectByName('node');
                tempNodeResult = this.analyzeNode(tempNodeResult, rules);
                result.nodes = tempNodeResult;
                let tempLinkResult = this.selectByName('link');
                tempLinkResult = this.analyzeLink(tempLinkResult, rules);
                result.links = tempLinkResult;
            }
        }
        return result;
    }
    analyzeNode(tempNodeResult, rules) {
        if (rules.hasOwnProperty('id')) {
            const node = this.selectNodeById(rules.id);
            if (node) {
                tempNodeResult = [node];
            }
            else {
                tempNodeResult = [];
            }
        }
        if (rules.hasOwnProperty('classNames')) {
            const classNames = rules.classNames;
            classNames === null || classNames === void 0 ? void 0 : classNames.forEach((className) => {
                tempNodeResult = this.selectNodeByClass(tempNodeResult, className);
            });
        }
        if (rules.attrs) {
            rules.attrs.forEach((attr, attri) => {
                if (!attr.operator || attr.operator === '^') {
                    if (attr.hasOwnProperty('operator') && attr.operator === '^') {
                        tempNodeResult = this.selectNodesByNotHasAttr(tempNodeResult, attr.value);
                    }
                    else {
                        tempNodeResult = this.selectNodesByHasAttr(tempNodeResult, attr.name);
                    }
                }
                else {
                    let attrName = '';
                    let attrOperator = attr.operator;
                    let attrValue = '';
                    if (attr.operator === '?' || attr.operator === '!') {
                        attrName = attr.value;
                        if (attr.operator === '!') {
                            attrValue = false;
                        }
                        if (attr.operator === '?') {
                            attrValue = true;
                        }
                        attrOperator = '=';
                    }
                    else {
                        attrName = attr.name;
                        attrOperator = attr.operator;
                        attrValue = attr.value;
                    }
                    tempNodeResult = this.selectNodesByExpression(tempNodeResult, attrName, attrValue, attrOperator);
                }
            });
        }
        return tempNodeResult;
    }
    analyzeLink(tempLinkResult, rules) {
        if (rules.hasOwnProperty('id')) {
            const link = this.selectLinkById(rules.id);
            if (link) {
                tempLinkResult = [link];
            }
            else {
                tempLinkResult = [];
            }
        }
        if (rules.hasOwnProperty('classNames')) {
            const classNames = rules.classNames;
            classNames === null || classNames === void 0 ? void 0 : classNames.forEach(className => {
                tempLinkResult = this.selectLinkByClass(tempLinkResult, className);
            });
        }
        if (rules.attrs) {
            rules.attrs.forEach((attr, attri) => {
                if (!attr.operator || attr.operator === '^') {
                    if (attr.hasOwnProperty('operator') && attr.operator === '^') {
                        tempLinkResult = this.selectLinksByNotHasAttr(tempLinkResult, attr.value);
                    }
                    else {
                        tempLinkResult = this.selectLinksByHasAttr(tempLinkResult, attr.name);
                    }
                }
                else {
                    let attrName = '';
                    let attrOperator = attr.operator;
                    let attrValue = '';
                    if (attr.operator === '?' || attr.operator === '!') {
                        attrName = attr.value;
                        if (attr.operator === '!') {
                            attrValue = false;
                        }
                        if (attr.operator === '?') {
                            attrValue = true;
                        }
                        attrOperator = '=';
                    }
                    else {
                        attrName = attr.name;
                        attrOperator = attr.operator;
                        attrValue = attr.value;
                    }
                    tempLinkResult = this.selectLinksByExpression(tempLinkResult, attrName, attrValue, attrOperator);
                }
            });
        }
        return tempLinkResult;
    }
    selectByName(name) {
        if (name.toLowerCase() === 'node') {
            return this.nodes;
        }
        else {
            return this.links;
        }
    }
    selectNodeByClass(nodes, className) {
        const tempNodeArray = new Array();
        if (nodes.length > 0) {
            nodes.forEach((node) => {
                if (node.hasOwnProperty('classes')) {
                    const nodeClasses = node.classes;
                    if (nodeClasses && nodeClasses.length > 0) {
                        let length = nodeClasses.length;
                        for (let i = 0; i < length; i++) {
                            if (nodeClasses[i].toLowerCase() === className) {
                                tempNodeArray.push(node);
                                break;
                            }
                        }
                    }
                }
            });
        }
        return tempNodeArray;
    }
    selectLinkByClass(links, className) {
        const tempLinkArray = new Array();
        if (links.length > 0) {
            links.forEach((link) => {
                if (link.hasOwnProperty('classes')) {
                    const linkClasses = link.classes;
                    if (linkClasses && linkClasses.length > 0) {
                        let length = linkClasses.length;
                        for (let i = 0; i < length; i++) {
                            if (linkClasses[i].toLowerCase() === className) {
                                tempLinkArray.push(link);
                                break;
                            }
                        }
                    }
                }
            });
        }
        return tempLinkArray;
    }
    selectNodeById(id) {
        if (this.nodesMap.has(id)) {
            return this.nodesMap.get(id);
        }
        else {
            return null;
        }
    }
    selectLinkById(id) {
        if (this.linksMap.has(id)) {
            return this.linksMap.get(id);
        }
        else {
            return null;
        }
    }
    selectNodesByHasAttr(nodes, attr) {
        const nodesArray = new Array();
        nodes.forEach(node => {
            if (node.hasOwnProperty(attr) || node.data.hasOwnProperty(attr)) {
                nodesArray.push(node);
            }
        });
        return nodesArray;
    }
    selectNodesByNotHasAttr(nodes, attr) {
        const nodesArray = new Array();
        nodes.forEach(node => {
            if (!node.hasOwnProperty(attr) && !node.data.hasOwnProperty(attr)) {
                nodesArray.push(node);
            }
        });
        return nodesArray;
    }
    selectLinksByHasAttr(links, attr) {
        const linksArray = new Array();
        links.forEach(link => {
            if (link.hasOwnProperty(attr) || link.data.hasOwnProperty(attr)) {
                linksArray.push(link);
            }
        });
        return linksArray;
    }
    selectLinksByNotHasAttr(links, attr) {
        const linksArray = new Array();
        links.forEach(link => {
            if (!link.hasOwnProperty(attr) && !link.data.hasOwnProperty(attr)) {
                linksArray.push(link);
            }
        });
        return linksArray;
    }
    selectNodesByExpression(nodes, attr, val, operator) {
        const nodesArray = new Array();
        nodes.forEach(node => {
            if (operator === '=') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] == val) {
                        nodesArray.push(node);
                    }
                }
                else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] == val) {
                            nodesArray.push(node);
                        }
                    }
                }
            }
            else if (operator === '!=') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] != val) {
                        nodesArray.push(node);
                    }
                }
                else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] != val) {
                            nodesArray.push(node);
                        }
                    }
                }
            }
            else if (operator === '>') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] > val) {
                        nodesArray.push(node);
                    }
                }
                else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] > val) {
                            nodesArray.push(node);
                        }
                    }
                }
            }
            else if (operator === '>=') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] >= val) {
                        nodesArray.push(node);
                    }
                }
                else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] >= val) {
                            nodesArray.push(node);
                        }
                    }
                }
            }
            else if (operator === '<') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] < val) {
                        nodesArray.push(node);
                    }
                }
                else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] < val) {
                            nodesArray.push(node);
                        }
                    }
                }
            }
            else if (operator === '<=') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] <= val) {
                        nodesArray.push(node);
                    }
                }
                else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] <= val) {
                            nodesArray.push(node);
                        }
                    }
                }
            }
        });
        return nodesArray;
    }
    selectLinksByExpression(links, attr, val, operator) {
        const linksArray = new Array();
        links.forEach(link => {
            if (operator == '=') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] == val) {
                        linksArray.push(link);
                    }
                }
                else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] == val) {
                            linksArray.push(link);
                        }
                    }
                }
            }
            else if (operator === '!=') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] != val) {
                        linksArray.push(link);
                    }
                }
                else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] != val) {
                            linksArray.push(link);
                        }
                    }
                }
            }
            else if (operator === '>') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] > parseFloat(val)) {
                        linksArray.push(link);
                    }
                }
                else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] > parseFloat(val)) {
                            linksArray.push(link);
                        }
                    }
                }
            }
            else if (operator === '>=') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] >= parseFloat(val)) {
                        linksArray.push(link);
                    }
                }
                else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] >= parseFloat(val)) {
                            linksArray.push(link);
                        }
                    }
                }
            }
            else if (operator === '<') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] < parseFloat(val)) {
                        linksArray.push(link);
                    }
                }
                else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] < parseFloat(val)) {
                            linksArray.push(link);
                        }
                    }
                }
            }
            else if (operator === '<=') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] <= parseFloat(val)) {
                        linksArray.push(link);
                    }
                }
                else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] <= parseFloat(val)) {
                            linksArray.push(link);
                        }
                    }
                }
            }
            else {
                return null;
            }
        });
        return linksArray;
    }
    generateNodesMap(nodes) {
        const nodesMap = new Map();
        nodes.forEach((node) => {
            nodesMap.set(node.id, node);
        });
        return nodesMap;
    }
    generateLinksMap(links) {
        const linksMap = new Map();
        links.forEach((link) => {
            linksMap.set(link.id, link);
        });
        return linksMap;
    }
}
//test();
function test() {
    const nodeMap = new Map();
    const linkMap = new Map();
    const nodes = new Array();
    const links = new Array();
    for (let i = 0; i < 10; i++) {
        const node = {
            id: 'a' + i,
            isDraggable: true,
            data: {
                type1: 'a1',
                type2: 'a' + i,
                type3: i
            },
            classes: ['aa', 'bb']
        };
        const link = {
            id: 'a' + i,
            isDraggable: true,
            data: {
                type1: 'a1',
                type2: 'a' + i,
                type3: i
            },
            classes: ['aa', 'bb']
        };
        links.push(link);
        nodes.push(node);
        linkMap.set(link.id, link);
        nodeMap.set(node.id, node);
    }
    nodes.push({
        id: 'a10',
        x: 1,
        isDraggable: false,
        data: {
            type1: 'b10',
            type2: 'a10',
            type3: 10,
            y: 5
        }
    });
    links.push({
        id: 'a10',
        x: 1,
        isDraggable: false,
        data: {
            type1: 'a2',
            type2: 'a10',
            type3: 10,
            y: 5
        }
    });
    const selection = new ElementSelector(nodes, links, nodeMap, linkMap);
}
// function test() {
//     const nodeMap = new Map();
//     const linkMap = new Map();
//     const nodes = new Array();
//     const links = new Array();
//     class NodeElem{
//         constructor(id,isDraggable,data,classes){
//             this.id=id;
//             this.isDraggable=isDraggable;
//             this.data=data;
//             this.classes=classes;
//         }
//         getClasses(){
//             return this.classes;
//         }
//     }
//     for (let i = 0; i < 10; i++) {
//         const node=new NodeElem('a'+i,{
//             type1: 'a1',
//             type2: 'a' + i,
//             type3: i
//         },['aa', 'bb']);
//         const link = {
//             id: 'a' + i,
//             isDraggable: true,
//             data: {
//                 type1: 'a1',
//                 type2: 'a' + i,
//                 type3: i
//             },
//             classes: ['aa', 'bb']
//         }
//         links.push(link);
//         nodes.push(node);
//         linkMap.set(link.id, link);
//         nodeMap.set(node.id, node);
//     }
//     nodes.push(new NodeElem('a10',{
//         type1: 'b10',
//         type2: 'a10',
//         type3: 10,
//         y: 5
//     },['aa', 'cc']));
//     // links.push({
//     //     id: 'a10',
//     //     x: 1,
//     //     isDraggable: false,
//     //     data: {
//     //         type1: 'a2',
//     //         type2: 'a10',
//     //         type3: 10,
//     //         y: 5
//     //     }
//     // });
//     const selection = new ElementSelector(nodes, links, nodeMap, linkMap);
//     console.log(selection.select('node.aa'));
// }
// test();
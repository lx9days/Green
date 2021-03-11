
import SelecterParser from './selecterparse';
//const SelecterParser = require('./selecterparse');
export default class Selection {
    constructor(nodes, links, nodesMap=null, linksMap=null) {
        this.nodes = nodes;
        this.links = links;
        if(nodesMap&&linksMap){
            this.nodesMap=nodesMap;
            this.linksMap=linksMap;
        }else{
            this.nodesMap=this._generateNodesMap();
            this.linksMap=this._generateLinksMap();
        }
        this.selecterParser = new SelecterParser();
    }

    ///^.[^:#\[\.,]*$/
    select(selectStr) {
        if (!selectStr) {
            return null;
        }
        const parseObj = this.selecterParser.parse(selectStr);
        const result = {
            links: new Array(),
            nodes: new Array()
        }
        if (parseObj.type === 'selectors') {
            parseObj.selectors.forEach((ruleSet) => {
                const tempRes = this.analyzeModel(ruleSet);
                result.links = [...result.links, ...tempRes.links];
                result.nodes = [...result.nodes, ...tempRes.nodes];
            });

        } else if (parseObj.type === 'ruleSet') {
            const tempRes = this.analyzeModel(parseObj);
            result.links = tempRes.links;
            result.nodes = tempRes.nodes;
        } else {
            throw new Error(selectStr + "无法识别");
        }
        return result;
    }


    analyzeModel(parseObj) {
        const result = {
            links: new Array(),
            nodes: new Array()
        }
        if (parseObj.type === 'ruleSet') {
            const rules = parseObj.rule;
            if (rules.tagName) {
                if (rules.tagName === 'node') {
                    let tempNodeResult = this.selectByName('node');
                    tempNodeResult = this.analyzeNode(tempNodeResult, rules);
                    result.nodes = tempNodeResult;
                } else if (rules.tagName === 'link') {
                    let tempLinkResult = this.selectByName('link');
                    tempLinkResult = this.analyzeLink(tempLinkResult, rules);
                    result.links = tempLinkResult;
                }
            } else {
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
            const node=this.selectNodeById(rules.id);
            if(node){
                tempNodeResult = [this.selectNodeById(rules.id)];
            }else{
                tempNodeResult=[];
            }
            
        }
        if (rules.hasOwnProperty('classNames')) {
            const classNames=rules.classNames;
            classNames.forEach((className)=>{
                tempNodeResult=this.selectNodeByClass(tempNodeResult,className);
            });
        }
        if (rules.attrs) {
            rules.attrs.forEach((attr, attri) => {
                if (!attr.operator || attr.operator === '^') {
                    if (attr.hasOwnProperty('operator') && attr.operator === '^') {
                        tempNodeResult = this.selectNodesByNotHasAttr(tempNodeResult, attr.value);
                    } else {
                        tempNodeResult = this.selectNodesByHasAttr(tempNodeResult, attr.name);
                    }

                } else {
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
                    } else {
                        attrName = attr.name;
                        attrOperator = attr.operator;
                        attrValue = attr.value;
                    }

                    tempNodeResult = this.selectNodesByExpression(tempNodeResult, attrName, attrValue, attrOperator);
                }

            })
        }
        return tempNodeResult;

    }

    analyzeLink(tempLinkResult, rules) {
        if (rules.hasOwnProperty('id')) {
            const link=this.selectLinkById(rules.id);
            if(link){
                tempLinkResult = [link];
            }else{
                tempLinkResult=[];
            }
            
        }
        if (rules.hasOwnProperty('classNames')) {
            const classNames=rules.classNames;
            classNames.forEach((className)=>{
                tempLinkResult=this.selectNodeByClass(tempLinkResult,className);
            });
        }
        if (rules.attrs) {
            rules.attrs.forEach((attr, attri) => {
                if (!attr.operator || attr.operator === '^') {
                    if (attr.hasOwnProperty('operator') && attr.operator === '^') {
                        tempLinkResult = this.selectLinksByNotHasAttr(tempLinkResult, attr.value);
                    } else {
                        tempLinkResult = this.selectLinksByHasAttr(tempLinkResult, attr.name);
                    }

                } else {
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
                    } else {
                        attrName = attr.name;
                        attrOperator = attr.operator;
                        attrValue = attr.value;
                    }

                    tempLinkResult = this.selectLinksByExpression(tempLinkResult, attrName, attrValue, attrOperator);
                }

            })
        }
        return tempLinkResult;

    }

    selectByName(name) {
        if (name.toLowerCase() === 'node') {
            return this.nodes;
        }
        if (name.toLowerCase() === 'link') {
            return this.links;
        }
        return null;
    }

    selectNodeByClass(nodes,className){
        const tempNodeArray=new Array();
        if(nodes&&nodes.length>0){
            nodes.forEach((node)=>{
                const nodeClasses=node.getClasses();
                if(nodeClasses&&nodeClasses.length>0){
                    for(let i=0;i<nodeClasses.length;i++){
                        if(nodeClasses[i].toLowerCase()===className.toLowerCase()){
                            tempNodeArray.push(node);
                            break;
                        }
                    }
                }
            });
        }
        return tempNodeArray;
    }

    selectLinkByClass(links,className){
        const tempLinkArray=new Array();
        if(links&&links.length>0){
            links.forEach((link)=>{
                const linkClasses=link.getClasses();
                if(linkClasses&&linkClasses.length>0){
                    for(let i=0;i<linkClasses.length;i++){
                        if(linkClasses[i].toLowerCase()===className.toLowerCase()){
                            tempLinkArray.push(link);
                            break;
                        }
                    }
                }
            });
        }
        return tempLinkArray;
    }

    selectNodeById(id) {
        if (id) {
            if (this.nodesMap.has(id)) {
                return this.nodesMap.get(id);
            } else {
                return null;
            }
        }
        return null;
    }

    selectLinkById(id) {
        if (id) {
            if (this.linksMap.has(id)) {
                return this.linksMap.get(id);
            } else {
                return null;
            }
        }
        return null;
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

    //0:attr=val,1:attr!=val,2:attr>val,3:attr>=val,4:attr<val,5:attr<=val
    selectNodesByExpression(nodes, attr, val, operator) {
        if (!nodes) {
            nodes = this.nodes;
        }
        const nodesArray = new Array();
        nodes.forEach(node => {
            if (operator === '=') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] == val) {
                        nodesArray.push(node);
                    }
                } else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] == val) {
                            nodesArray.push(node);
                        }
                    }
                }
            } else if (operator === '!=') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] != val) {
                        nodesArray.push(node);
                    }
                } else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] != val) {
                            nodesArray.push(node);
                        }
                    }
                }
            } else if (operator === '>') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] > val) {
                        nodesArray.push(node);
                    }
                } else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] > val) {
                            nodesArray.push(node);
                        }
                    }
                }
            } else if (operator === '>=') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] >= val) {
                        nodesArray.push(node);
                    }
                } else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] >= val) {
                            nodesArray.push(node);
                        }
                    }
                }
            } else if (operator === '<') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] < val) {
                        nodesArray.push(node);
                    }
                } else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] < val) {
                            nodesArray.push(node);
                        }
                    }
                }

            } else if (operator === '<=') {
                if (node.hasOwnProperty(attr)) {
                    if (node[attr] <= val) {
                        nodesArray.push(node);
                    }
                } else {
                    if (node.data.hasOwnProperty(attr)) {
                        if (node.data[attr] <= val) {
                            nodesArray.push(node);
                        }
                    }
                }
            } else {
                return null;
            }
        });
        return nodesArray;
    }

    selectLinksByExpression(links, attr, val, operator) {
        const linksArray = new Array();
        if (!links) {
            links = this.links;
        }
        links.forEach(link => {
            if (operator == '=') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] == val) {
                        linksArray.push(link);
                    }
                } else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] == val) {
                            linksArray.push(link);
                        }
                    }
                }
            } else if (operator === '!=') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] != val) {
                        linksArray.push(link);
                    }
                } else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] != val) {
                            linksArray.push(link);
                        }
                    }
                }
            } else if (operator === '>') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] > parseFloat(val)) {
                        linksArray.push(link);
                    }
                } else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] > parseFloat(val)) {
                            linksArray.push(link);
                        }
                    }
                }
            } else if (operator === '>=') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] >= parseFloat(val)) {
                        linksArray.push(link);
                    }
                } else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] >= parseFloat(val)) {
                            linksArray.push(link);
                        }
                    }
                }
            } else if (operator === '<') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] < parseFloat(val)) {
                        linksArray.push(link);
                    }
                } else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] < parseFloat(val)) {
                            linksArray.push(link);
                        }
                    }
                }

            } else if (operator === '<=') {
                if (link.hasOwnProperty(attr)) {
                    if (link[attr] <= parseFloat(val)) {
                        linksArray.push(link);
                    }
                } else {
                    if (link.data.hasOwnProperty(attr)) {
                        if (link.data[attr] <= parseFloat(val)) {
                            linksArray.push(link);
                        }
                    }
                }
            } else {
                return null;
            }
        });
        return linksArray;
    }

    _generateNodesMap(){
        const nodesMap=new Map();
        this.nodes.forEach((node)=>{
            nodesMap.set(node.getId(),node);
        });
        return nodesMap;
    }

    _generateLinksMap(){
        const linksMap=new Map();
        this.links.forEach((link)=>{
            linksMap.set(link.getId(),link);
        });
        return linksMap;
    }
}



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
            classes:['aa','bb']
        }
        const link = {
            id: 'a' + i,
            isDraggable: true,
            data: {
                type1: 'a1',
                type2: 'a' + i,
                type3: i
            },
            classes:['aa','bb']
        }
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

    const selection = new Selection(nodes, links, nodeMap, linkMap);
    // console.log(selection.select('link.aa[type2=a2]'));

}
//test();
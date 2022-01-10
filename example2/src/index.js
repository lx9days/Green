import axios from 'axios';
import {SuperGraph} from '../../src/netgraph';

axios.get('/src/test_data.json').then(res => {
    const nodes = res.data.nodes;
    const links = res.data.links;
    nodes.forEach((node, i) => {
        node.img = '/src/img1/a' + i % 10 + '.png';
    });
    const data = {
        nodes: nodes,
        links
    };
    draw(data);
});

function draw (data) {
    const superGraph = new SuperGraph({
        canvasProps: {
            containerWidth: 2500,
            containerHeight: 1200,
            zoom: 0,
            container: 'container',
            maxZoom: 4,
            minZoom: -4,
        },
        constant: {
            nodeHighlightColor: '#d9d9d9',
            nodeHighlightOpacity: 0.5,
            lineHighlightColor: '#ffd53f',
            lineHighlightOpacity: 0.5,
        },
        layout: 'vertical',
        data: data,
        style: [
            {
                selector: 'node',
                style: {
                    'width': 45,
                    'height': 45,
                    'background-width': 62,
                    'background-height': 62 ,
                    'url': (d) => d.data.img,
                    'opacity': 1,
                    'background-color': '#ffd53f',
                    'background-opacity': 1,
                    'text-color': '#845624',
                    'text-opacity': 1,
                    'font-size': 10,
                    'text': (d) => d.data.name,
                    'label-text-color':"#fff",
                    'label-font-size':10,
                    'node-label-text':(d)=>{
                        return '节点:100';
                    },
                    'link-label-text':(d)=>{
                        return '关系:0';
                    },
                    'node-label-background':'#456456',
                    'link-label-background':'#456456'
                }
            },
            {
                selector: 'link',
                style: {
                    'width': 2,
                    'line-color': '#456456',
                    'line-opacity': 1,
                    'text-opacity': 1,
                    'text-color': "#456456",
                    'font-size': 10,
                    'text': (d) => d.data.type,
                }
            }
        ]
    });

    superGraph.addEventListener("nodeClick",(object, e) => {
        superGraph.updateNodeStatus([object.object.id], 1);
        //netGraph.replaceData();
    });
    superGraph.addEventListener("nodeRightClick",(object,e)=>{
        superGraph.updateNodeStatus([object.object.id], 2);
    });

    document.getElementById("add").addEventListener("click",()=>{
        superGraph.addData({nodes:[ {
            "id": "abb2992",
            "img": "/src/img1/a10.png",
            "type": "dataPackage",
            "name": "javk",
            "loaded": true,
            "relation": "",
            "dataSize": {
                "nodesNum": 4287
            }
        }],links:[{
            "id": "conEdge_con_3d84bec3aae517bbb0633648ec0cfec0dd",
            "from": "con_3d84bec3aae517bbb0633648ec0cfec0",
            "to": "abb2992",
            "type": "通过实体类型过滤",
            "undirected_type": "undirected_type",
            "direct": true,
            "labelDetail": "实体类型(人物)  "
        },]});
    });

    document.getElementById("remove").addEventListener("click",()=>{
        superGraph.removeNodes(["abb2992"]);
    });
    document.getElementById("replace",()=>{
        superGraph.replaceData();
    });
    document.getElementById("vlayout").addEventListener("click",()=>{
        superGraph.layout('vertical');
    });
    document.getElementById("hlayout").addEventListener("click",()=>{
        console.log(superGraph.getNodes());
        superGraph.layout("horizontal");
    });
    document.getElementById("fit").addEventListener('click',()=>{
        console.log("fit")
        superGraph.fitView();
    });
    

}
import axios from 'axios';
import HierarchyGraph from '../../src/hierarchygraph';

axios.get('/src/data1.json').then(res => {
    // const nodes = res.data.nodes;
    // const links = res.data.links;
    // nodes.forEach((node, i) => {
    //     node.img = '/src/img1/a' + i % 10 + '.png';
    // });
    // const data = {
    //     nodes: nodes,
    //     links
    // };
    draw(res.data);
});

function draw (data) {
    const hierarchyGraph = new HierarchyGraph({
        canvasProps: {
            containerWidth: 1500,
            containerHeight: 1500,
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
            defaultUrlMap: {
                "default": "/src/img2/a1.png",
            },
            defaultUrlFunc: (d) => {
                return 'default';
            }
        },
        data: data,
        style: [
            {
                selector: 'node',
                style: {
                    'width': 30,
                    'height': 30,
                    'shape': 'rect',
                    'background-width': 45,
                    'background-height': 45,
                    'background-color': '#ffd53f',
                    'border-color':'#63b0b1',
                    'url': (d) => d.data.img,
                    'opacity': 1,
                    'text-color': '#845624',
                    'text-opacity': 1,
                    'font-size': 15,
                    'text': (d) => d.data.name,
                }
            },
            {
                selector: 'node#rootEntity',
                style: {
                    'width': 30,
                    'height': 30,
                    'shape': 'rect',
                    'background-width': 45,
                    'background-height': 45,
                    'background-color': '#46D1BE',
                    'border-color':'#63b0b1',
                    'url': (d) => d.data.img,
                    'opacity': 1,
                    'text-color': '#845624',
                    'text-opacity': 1,
                    'font-size': 30,
                    'text': (d) => d.data.name,
                }
            },{
                selector: 'link',
                style: {
                    "line-color": "#ff0008",
                    "width" : 3,
                }
            }
        ]
    });
    console.log(hierarchyGraph);
    hierarchyGraph.addEventListener("nodeClick",(d)=>{
        if(d.object.origionElement.childrenVisible) {
            hierarchyGraph.hideChildren([d.object.id]);
        }
        else {
            hierarchyGraph.showChildren([d.object.id]);
            hierarchyGraph.focusOnNodes([d.object.id]);
        }
    });

    document.getElementById("showChildren").addEventListener("click",()=>{
        hierarchyGraph.showChildren(["a3", "b15"]);
    });
    document.getElementById("hideChildren").addEventListener("click",()=>{
        hierarchyGraph.hideChildren(["5fff08e1fe2550c9ff6a6549"]);
    });
    document.getElementById("updateStatus").addEventListener("click",()=>{
        hierarchyGraph.updateNodeStatus(["a3"],2);
    });
    document.getElementById("updateDim").addEventListener("click",()=>{
        hierarchyGraph.updateDim({width:500,height:500});
    });

    document.getElementById("selectedNodes").addEventListener("click",()=>{
        console.log(hierarchyGraph.getSelectedNodes());
    });
    document.getElementById("getNodes").addEventListener("click",()=>{
        console.log(hierarchyGraph.getNodes());
    });
    document.getElementById('addStyle').addEventListener('click', () => {
        // const nodes = netGraph.getNodes();
        // let id = 'aaa';

        // if (nodes.length > 5) {
        //     id = nodes[4].id;
        // }
        hierarchyGraph.addStyle([{
            selector: 'node',
            style: {
                'background-color': '#7FFFD4',
                'background-width': (d) => 100,
                    'text-color': '#551A8B',
                    'font-size': 35,
            },
        },
        {
            selector: 'link',
            style: {
                'line-color': '#7FFFD4',
                'width': 20,
            },
        }
    ]);
    //hierarchyGraph.controller.canvasController.updateRenderObject({position:1});
    });

}
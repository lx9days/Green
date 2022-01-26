import axios from 'axios';
import HierarchyGraph from '../../src/hierarchygraph';

axios.get('/src/schema1.json').then(res => {
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

function draw(data) {
    const hierarchyGraph = new HierarchyGraph({
        canvasProps: {
            containerWidth: 1000,
            containerHeight: 1000,
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
                return 'default'
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
                    'font-size': 10,
                    'text': (d) => d.data.name,
                }
            }
        ]
    });
    hierarchyGraph.addEventListener("nodeClick",()=>{
        hierarchyGraph.showChildren(["a3"])
    })

    document.getElementById("showChildren").addEventListener("click",()=>{
        hierarchyGraph.showChildren(["a3"])
    });
    document.getElementById("hideChildren").addEventListener("click",()=>{
        hierarchyGraph.hideChildren(["a3"])
    });

}
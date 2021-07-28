import axios from 'axios';
import NetGraph from '../../src/index';
import blobTOBase from 'blob-to-base64'
import { base64ToBlob, blobToBase64 } from 'base64-blob'

const debug = true;


// axios.get('/src/2472_data.json').then((res) => {
//     const nodes = res.data.data.nodes;
//     const links = res.data.data.links;

//     nodes.forEach((node, i) => {
//         node.img = '/src/img1/a' + 0 + '.png';
//     });
//     console.log(nodes.length);

//     const data = {
//         nodes,
//         links
//     }
//     draw(data);
// })
function draw(rawData) {
    let data=null;
    if(!debug){
        data=rawData;
    }else{
        data={
            nodes: [
                {
                    id: 'a001',
                    name: '你哈',
                    img: '/src/img1/a0.png',
                },
                {
                    id: 'a002',
                    name: '是',
                    img: '/src/img1/a1.png',
                },
                {
                    id: 'a003',
                    name: '速度',
                    img: '/src/img1/a2.png',
                },
                {
                    id: 'a004',
                    name: '负对数',
                    img: '/src/img1/a3.png',
                },
                {
                    id: 'a005',
                    name: '是',
                    img: '/src/img1/a4.png'
                }
            ],
            links: [
                {
                    id: 'l01',
                    type: '但是',
                    from: 'a001',
                    to: 'a003',
                },
                {
                    id: 'l02',
                    type: '阿达',
                    from: 'a004',
                    to: 'a002',
                }

            ]
        }
    }

    const netGraph = new NetGraph({
        canvasProps: {
            containerWidth: 3500,
            containerHeight: 2000,
            zoom: 0,
            container: 'container',
            maxZoom: 4,
            minZoom: -4,
        },
        layout: 'square',
        data: data,
        style: [
            {
                selector: 'node',
                style: {
                    'width': 50,
                    'height': 40,
                    'url': (d) => d.data.img,
                    'opacity': 1,
                    'background-color': '#aaa',
                    'background-opacity': 1,
                    'border-width': 5,
                    'border-color': '#fff',
                    'border-opacity': 1,
                    'color': '#845624',
                    'text-opacity': 1,
                    'font-size': 16,
                    'text': (d) => d.data.name,
                    'shape': 'circle',
                }
            },
            {
                selector: 'link',
                style: {
                    'width': 2,
                    'line-color': '#456456',
                    'line-opacity': 1,
                    'to-arrow-shape': 'triangle',
                    'to-arrow-color': '#858585',
                    'to-arrow-fill': 'filled',
                    'color': '#845624',
                    'text-opacity': 1,
                    'font-size': 10,
                    'text': (d) => d.data.type,
                }
            },
            {
                    selector: 'node.fff',
                    style: {
                        'width': 60,
                        'height': 40,
                        'url': (d) => d.data.img,
                        'opacity': 1,
                        'background-color': '#aaa',
                        'background-opacity': 1,
                        'border-width': 5,
                        'border-color': '#fff',
                        'border-opacity': 1,
                        'color': '#845624',
                        'text-opacity': 1,
                        'font-size': 16,
                        'text': (d) => d.data.name,
                        'shape': 'rect',
                    }
                }
        ]
    });


    netGraph.addEventListener('nodeClick', (object,e) => {
        console.log("click")
        //netGraph.replaceData();
    });
    netGraph.addEventListener('nodeClickWithCtrl',(info,e)=>{
       // netGraph.getNodes(['a005'])[0].addClasses(['fff']);
        console.log('nodeClickWithCtrl');
    });

    netGraph.addEventListener('lineClick',(o,e)=>{
        console.log('lineClick');
    });
    netGraph.addEventListener('canvasRightClick',(info,e)=>{
        console.log(netGraph.exportCanvasAsBase64())
        console.log('canvas right click')
    })
    netGraph.addEventListener('lineClickWithCtrl',(o,e)=>{
        console.log('lineClickWithCtrl');
    });
    netGraph.addEventListener('emptyClick',(o,e)=>{
        console.log("emptyClick");
        // console.log('emptyClick');
        // netGraph.getNodes(['a005'])[0].addClasses(['fff']);
        // netGraph.addStyle([{
        //     selector: 'node.fff',
        //     style: {
        //         'width': 60,
        //         'height': 40,
        //         'url': (d) => d.data.img,
        //         'opacity': 1,
        //         'background-color': '#aaa',
        //         'background-opacity': 1,
        //         'border-width': 5,
        //         'border-color': '#fff',
        //         'border-opacity': 1,
        //         'color': '#845624',
        //         'text-opacity': 1,
        //         'font-size': 16,
        //         'text': (d) => d.data.name,
        //         'shape': 'rect',
        //     }
        // },]);
    })

    netGraph.addEventListener('brush', (nodeIds) => {
        console.log(nodeIds);
    });
    netGraph.addEventListener('rightClick',()=>{
        
        console.log("rightClick")
    })
    document.getElementById('remove').addEventListener('click', (e) => {
        console.log(e);
        const selectedNodes = netGraph.getSelectedNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        })
        netGraph.removeNodes(selectedNodeIds);
    });


    document.getElementById('addStyle').addEventListener('click', () => {
        netGraph.addStyle([{
            selector: 'node#a005',
            style: {
                'width': 60,
                'height': 40,
                'url': (d) => d.data.img,
                'opacity': 1,
                'background-color': '#aaa',
                'background-opacity': 1,
                'border-width': 5,
                'border-color': '#fff',
                'border-opacity': 1,
                'color': '#845624',
                'text-opacity': 1,
                'font-size': 16,
                'text': (d) => d.data.name,
                'shape': 'rect',
            }
        },]);
    });


    document.getElementById('setLayout').addEventListener('click', () => {
        const selectedNodes = netGraph.getSelectedNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        netGraph.setNodeLayout('multSquare');
    });

    document.getElementById('brush').addEventListener('click', () => {
        netGraph.showBrushArea();
    });

    document.getElementById('groupDrag').addEventListener('click', () => {
        netGraph.replaceData();
        //netGraph.setGroupDrag(true);
    });
    document.getElementById('addClass').addEventListener('click',()=>{
        netGraph.addClassForNode(['a005'],['fff']);
        console.log(netGraph.getNodes());
    })

    document.getElementById('add').addEventListener('click', () => {
        netGraph.addData({
            nodes: [
                {
                    id: 'b001',
                    name: '是1',
                    img: '/src/img1/a5.png'
                },
                {
                    id: 'b002',
                    name: '是2',
                    img: '/src/img1/a6.png'
                },
                {
                    id: 'b003',
                    name: '是7',
                    img: '/src/img1/a4.png'
                },
                {
                    id: 'b004',
                    name: '是3',
                    img: '/src/img1/a8.png'
                },
                {
                    id: 'b005',
                    name: '是4',
                    img: '/src/img1/a9.png'
                },
                {
                    id: 'b006',
                    name: '是5',
                    img: '/src/img1/a10.png'
                },
                {
                    id: 'b007',
                    name: '是6',
                    img: '/src/img1/a11.png'
                }

            ],
            links: [
                {
                    id: 'lk01',
                    type: 'cm',
                    from: 'b004',
                    to: 'b001',
                }
            ]
        })
    });
}
draw();




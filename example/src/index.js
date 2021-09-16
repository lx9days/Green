import axios from 'axios';
import NetGraph,{HIGHLIGHT,SELECTED,UNSELECTED} from '../../src/index';

const debug = false;


axios.get('/src/auto_500.json').then((res) => {
    const nodes = res.data.nodes;
    const links = res.data.links;

    nodes.forEach((node, i) => {
        node.img = '/src/img1/a' + i + '.png';
    });
    console.log("nodelength",nodes.length);
    console.log("linklength",links.length);

    const data = {
        nodes,
        links
    }
    draw(data);
})
function draw(rawData) {
    let data = null;
    if (!debug) {
        data = rawData;
    } else {
        data = {
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
                },
                {
                    id: 'a006',
                    name: '是',
                    img: '/src/img1/a1.png',
                },
                {
                    id: 'a007',
                    name: '速度',
                    img: '/src/img1/a2.png',
                },
                {
                    id: 'a008',
                    name: '负对数',
                    img: '/src/img1/a3.png',
                },
                {
                    id: 'a009',
                    name: '是',
                    img: '/src/img1/a4.png'
                },{
                    id: 'a0010',
                    name: '是',
                    img: '/src/img1/a4.png'
                }
            ],
            links:[
                {
                    id:'link1',
                    type: '但是',
                    from: 'a001',
                    to: 'a002',
                },{
                    id:'link2',
                    type: '但是',
                    from: 'a001',
                    to: 'a003',
                },{
                    id:'link3',
                    type: '但是',
                    from: 'a001',
                    to: 'a004',
                },{
                    id:'link4',
                    type: '但是',
                    from: 'a001',
                    to: 'a005',
                },
                {
                    id:'link5',
                    type: '但是',
                    from: 'a001',
                    to: 'a006',
                },
                {
                    id:'link6',
                    type: '但是',
                    from: 'a001',
                    to: 'a007',
                },{
                    id:'link7',
                    type: '但是',
                    from: 'a001',
                    to: 'a008',
                },{
                    id:'link8',
                    type: '但是',
                    from: 'a001',
                    to: 'a009',
                },{
                    id:'link9',
                    type: '但是',
                    from: 'a001',
                    to: 'a0010',
                }
            ]

        }
    }

    const netGraph = new NetGraph({
        canvasProps: {
            containerWidth: 3000,
            containerHeight: 2000,
            zoom: 0,
            container: 'container',
            maxZoom: 4,
            minZoom: -4,
            nodeHighlightColor:'#d9d9d9',
            nodeHighlightOpacity:0.5,
            lineHighlightColor:'#ffd53f',
            lineHighlightOpacity:0.5
        },
        layout: 'auto',
        data: data,
        style: [
            {
                selector: 'node',
                style: {
                    'width': 45,
                    'height': 45,
                    'background-width':62,
                    'background-height':62,
                    'url': (d) => d.data.img,
                    'opacity': 1,
                    'background-color': '#ffd53f',
                    'background-opacity': 1,
                    'border-width': 0,
                    'border-color': '#fff',
                    'border-opacity': 1,
                    'text-color': '#845624',
                    'text-opacity': 1,
                    'font-size': 16,
                    'text': (d) => d.data.name,
                    'shape': 'rect',
                    'highlight-color':"#Fff0BC",
                    'highlight-opacity':0.8,
                    "label-style":{
                        'url':'/src/img1/a3.png',
                        'width':15,
                        'height':15,
                        'position':'left-top',
                    }
                }
            },
            {
                selector: 'link',
                style: {
                    'width': 2,
                    'line-color': '#456456',
                    'line-opacity': 1,
                    'text-opacity': 1,
                    'text-color':"456456",
                    'font-size': 10,
                    'text': (d) => d.data.type,
                    'direct':(d)=>d.data.direct
                }
            },
            {
                selector: 'node.fff',
                style: {
                    'width': 60,
                    'height': 60,
                    'background-width':70,
                    'background-height':70,
                    'url': (d) => d.data.img,
                    'opacity': 1,
                    'background-color': '#fff',
                    'background-opacity': 1,
                    'border-width': 0,
                    'border-color': '#fff',
                    'border-opacity': 1,
                    'color': '#845624',
                    'text-opacity': 1,
                    'font-size': 16,
                    'text': (d) => d.data.name,
                    'shape': 'rect',
                    'highlight-color':"#Fff0BC",
                    'highlight-opacity':0.5
                }
            }
        ]
    });

    let timeout=null

    netGraph.addEventListener('canvasMouseDown',(e)=>{
        timeout=setTimeout(()=>{
            netGraph.showBrushArea()
        },2000)
    });
    netGraph.addEventListener('canvasMouseUp',(e)=>{
        if(timeout){
            console.log("up")
            clearTimeout(timeout)
        }
    })
    netGraph.addEventListener('canvasMouseMove',(e)=>{
        if(timeout){
            console.log("mouve")
            clearTimeout(timeout)
        }
    })


    netGraph.addEventListener('nodeClick', (object, e) => {
        console.log("click")
        //netGraph.replaceData();
    });
    netGraph.addEventListener('nodeClickWithCtrl', (info, e) => {
        netGraph.addClassForNode(['a005'],['fff','class2'])
        console.log('nodeClickWithCtrl');
    });

    netGraph.addEventListener('lineClick', (o, e) => {
        console.log('lineClick');
    });
    netGraph.addEventListener('canvasRightClick', (info, e) => {
       // console.log(netGraph.exportCanvasAsBase64())
        console.log('canvas right click')
    })
    netGraph.addEventListener('lineClickWithCtrl', (o, e) => {
        console.log('lineClickWithCtrl');
    });
    netGraph.addEventListener('emptyClick', (o, e) => {
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
        netGraph.updateNodeStatus(nodeIds,UNSELECTED)
    });



    netGraph.addEventListener('rightClick', () => {

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
                'height': 60,
                'background-width':100,
                'background-height':70,
                'url': (d) => d.data.img,
                'opacity': 1,
                'background-color': '#ffd53f',
                'background-opacity': 1,
                'border-width': 0,
                'border-color': '#fff',
                'border-opacity': 1,
                'color': '#845624',
                'text-opacity': 1,
                'font-size': 16,
                'text': (d) => d.data.name,
                'shape': 'rect',
                'highlight-color':"#Fff0BC",
                'highlight-opacity':0.5
            }
        },]);
    });


    document.getElementById('setLayout').addEventListener('click', () => {
        const selectedNodes = netGraph.getSelectedNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        netGraph.setNodeLayout('auto');
    });

    document.getElementById('brush').addEventListener('click', () => {

        netGraph.showBrushArea();
        
    });

    document.getElementById('groupDrag').addEventListener('click', () => {
        // netGraph.replaceData({
        //     nodes:null,
        //     links:null
        // });
        netGraph.addData({
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
        })
        //console.log(netGraph.getNodes())
        //netGraph.setGroupDrag(true);
    });
    document.getElementById('addClass').addEventListener('click', () => {
        netGraph.addClassForNode(['a005'], ['fff']);
    })
    document.getElementById('updateLinkStyle').addEventListener('click',()=>{
        netGraph.addStyle([{
            selector:"link",
            style: {
                'line-color': '#fff',
            }
        }])
    })

    document.getElementById("lockNode").addEventListener("click",()=>{
        netGraph.lockNodes(["a002"])
    })
    document.getElementById("unlockNode").addEventListener("click",()=>{
        netGraph.unlockNodes(["a002"])
    });
    document.getElementById("alterStatus").addEventListener("click",()=>{
        const selectedNodes = netGraph.getSelectedNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        netGraph.updateNodeStatus(selectedNodeIds,HIGHLIGHT)
    });
    document.getElementById("replaceData").addEventListener("click",()=>{

        netGraph.replaceData({
            nodes:[],
        })
        console.log(netGraph.getNodes(["a001"]))
        console.log(netGraph.getLinks())
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
//draw();




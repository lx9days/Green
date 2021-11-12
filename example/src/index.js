import axios from 'axios';
import NetGraph, { HIGHLIGHT, SELECTED, UNSELECTED } from '../../src/index';

const debug = false;


axios.get('/src/auto_500.json').then((res) => {
    const nodes = res.data.nodes;
    const links = res.data.links;

    nodes.forEach((node, i) => {
        node.img = '/src/img1/a' + i + '.png';
    });
    console.log("nodelength", nodes.length);
    console.log("linklength", links.length);
    // const nodes=[]
    const data = {
        nodes: nodes,
        links,
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
                    type: 'human',
                    ca: false,
                },
                {
                    id: 'a007',
                    name: '速度',
                    img: '/src/img1/a2.png',
                    //class:['event','kkdkd']
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
                }, {
                    id: 'a0010',
                    name: '是',
                    img: '/src/img1/a4.png'
                }
            ],
            links: [
                {
                    id: 'link1',
                    type: '但是',
                    from: 'a001',
                    to: 'a002',
                }, {
                    id: 'link2',
                    type: '但是',
                    from: 'a001',
                    to: 'a003',
                }, {
                    id: 'link3',
                    type: '但是',
                    from: 'a001',
                    to: 'a004',
                }, {
                    id: 'link4',
                    type: '但是',
                    from: 'a001',
                    to: 'a005',
                },
                {
                    id: 'link5',
                    type: '但是',
                    from: 'a001',
                    to: 'a006',
                },
                {
                    id: 'link6',
                    type: '但是',
                    from: 'a001',
                    to: 'a007',
                }, {
                    id: 'link7',
                    type: '但是',
                    from: 'a001',
                    to: 'a008',
                }, {
                    id: 'link8',
                    type: '但是',
                    from: 'a001',
                    to: 'a009',
                }, {
                    id: 'link9',
                    type: '但是',
                    from: 'a001',
                    to: 'a0010',
                }
            ]

        }
    }

    const netGraph = new NetGraph({
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
            // defaultUrl:'/src/img1/a2.png',
            defaultUrlMap: {
                "human": '/src/img1/a100.png',
                "entity": '/src/img1/a101.png',
                "animal": "/src/img1/a103.png",
                "default": "/src/img1/a102.png",
            },
            defaultUrlFunc: (d) => {
                if (d.data.subType) {
                    return d.data.subType;
                } else {
                    if (d.data.type) {
                        return d.data.type;
                    } else {
                        if (d.data.metaType) {
                            return d.data.metaType;
                        } else {
                            return 'default';
                        }
                    }
                }
            }
        },
        layout: 'square',
        data:data,
        style: [
            {
                selector: 'node',
                style: {
                    'width': 45,
                    'height': 45,
                    'background-width': 62,
                    'background-height': 62,
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
                    'highlight-color': "#Fff0BC",
                    'highlight-opacity': 0.8,
                    "label-style": {
                        'url': '/src/img1/images.png',
                        'width': 15,
                        'height': 15,
                        'position': 'left-top',
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
                    'line-style':(d)=>{
                        if(d.data.direct){
                            return 'solid'
                        }else{
                            return 'dash'
                        }
                    },
                    'text-color': "#456456",
                    'font-size': 10,
                    'text': (d) => d.data.type,
                    'direct': (d) => d.data.direct
                }
            },{
                selector:'link.color',
                style:{
                    'line-color':'#fff',
                    'text-color':'#aaa'
                }
            },
            {
                selector: 'node.fff',
                style: {
                    'background-color': '#fff',
                }
            }
            ,
            {
                selector: "link.selected",
                style: {
                    'line-color': '#fff',
                }
            }
        ]
    });


    let timeout = null;
    netGraph.addEventListener('canvasMouseDown', (e) => {
        timeout = setTimeout(() => {
            netGraph.showBrushArea()
        }, 2000)
    });
    netGraph.addEventListener('canvasMouseUp', (e) => {
        if (timeout) {
            clearTimeout(timeout)
        }
    })
    netGraph.addEventListener('canvasMouseMove', (e) => {
        if (timeout) {
            clearTimeout(timeout)
        }
    })


    netGraph.addEventListener('nodeClick', (object, e) => {
        console.log(object.object.id, e);
        netGraph.updateNodeStatus([object.object.id], SELECTED)
        //netGraph.replaceData();
    });
    netGraph.addEventListener('nodeClickWithCtrl', (info, e) => {
        netGraph.addClassForNode(['a005'], ['fff', 'class2'])
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
        netGraph.updateNodeStatus(nodeIds, SELECTED)
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
            selector: 'node#603b971bdf7a398786544ded42be0348',
            style: {
                'width': 60,
                'height': 60,
                'background-width': 100,
                'background-height': 70,
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
                'highlight-color': "#Fff0BC",
                'highlight-opacity': 0.5
            }
        },]);
    });


    document.getElementById('setLayout').addEventListener('click', () => {
        const selectedNodes = netGraph.getSelectedNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        netGraph.setNodeLayout('square');
    });

    document.getElementById('brush').addEventListener('click', () => {

        netGraph.showBrushArea();

    });

    // new NetworkChart({
    //     ...
    //     events:{
    //       onClick: function(event){...},
    //       onSelectionChange: function(event){...}
    //     },
    //     ...
    //   });
    let isGroup = false;
    document.getElementById('groupDrag').addEventListener('click', () => {

        netGraph.setGroupDrag(!isGroup)
        isGroup = !isGroup
    });


    document.getElementById('addClass').addEventListener('click', () => {
        netGraph.addClassForNode(['5c2f3ba4d6943955a3b823e8518babd4'], ['fff']);
        netGraph.addClassForLink(['7b1120b4debb38148a41d06fa25f2b8aphone_write41dcc82234d534ce92c81d47c356c277'],['color'])
        // netGraph.updateStyle();
    })


    document.getElementById('updateLinkStyle').addEventListener('click', () => {


        // netGraph.addStyle([{
        //     selector:"link.selected",
        //     style: {
        //         'line-color': '#fff',
        //     }
        // }],false);

        netGraph.addClassForLink(['MG_8cb555585f988b72b61bd42c7ebe4b5f'], ['selected'])


    })

    document.getElementById("lockNode").addEventListener("click", () => {
        netGraph.lockNodes(["3ded00b898c73c11a72558530859568d"])
    })
    document.getElementById("unlockNode").addEventListener("click", () => {
        netGraph.unlockNodes(["3ded00b898c73c11a72558530859568d"])
    });
    document.getElementById("alterStatus").addEventListener("click", () => {
        const selectedNodes = netGraph.getNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        netGraph.updateNodeStatus(selectedNodeIds, UNSELECTED)
    });
    document.getElementById("replaceData").addEventListener("click", () => {

        netGraph.replaceData({
            nodes: [],
        })
        console.log(netGraph.getNodes(["a001"]))
        console.log(netGraph.getLinks())
    })


    document.getElementById('add').addEventListener('click', () => {
        // netGraph.addData({nodes:[
        //    { id:'dssd',
        //     name:'fsd',
        //     img:'/src/img1/a5.png'}
        // ]})
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

    document.getElementById("treeLayout").addEventListener("click", () => {
        netGraph.setNodeLayout('hierarchy', ["2786b7455ff93ce7ad0fc4a4cfe5bd21", "61c90e594b88372f8fa3217c150656f0"]);
    });
    document.getElementById("zoom").addEventListener("click", () => {
        let zoomNum = netGraph.getZoom();
        console.log(zoomNum)
        zoomNum += 0.4;
        if (zoomNum > 4) {
            zoomNum = -3;
        }
        netGraph.setZoom(zoomNum)
    });
    document.getElementById("scroll").addEventListener("click", () => {
        netGraph.scrollIntoView("3ded00b898c73c11a72558530859568d");
    });
    document.getElementById("fitView").addEventListener("click", () => {
        netGraph.fitView(null);
    })

    document.getElementById("auto").addEventListener("click", () => {
        const selectedNodes = netGraph.getSelectedNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        netGraph.setNodeLayout('auto');
    });
    document.getElementById("addBubble").addEventListener("click", () => {
        const nodeIds = netGraph.getSelectedNodes().map(v => v.id);
        netGraph.addBubbleSet([nodeIds, ["b001", "b002", "b003", "b004", "b005", "b006", "b007"]], ["#d7473a", "#4ea79b"], "one");
    });
    document.getElementById("layoutBubble").addEventListener("click", () => {
        netGraph.layoutBubbleSet(["one"]);
    });
    document.getElementById("removeBubble").addEventListener("click", () => {
        console.log(netGraph.removeBubbleSet(["one"]));
    });

    document.getElementById("addAnimation").addEventListener("click", () => {
        axios.get("/src/animation.json").then((res) => {
            netGraph.addFlowAnimation(res.data.data)
        })
    });
    document.getElementById("pauseAnimation").addEventListener("click", () => {
        netGraph.pauseFlowAnimation(["flow_one"]);
    });
    document.getElementById("restartAnimation").addEventListener("click", () => {
        netGraph.restartFlowAnimation(["flow_one"]);
    })
    document.getElementById("removeAnimation").addEventListener("click", () => {
        netGraph.removeFlowAnimation()
    });


    document.getElementById("addFusion").addEventListener("click", () => {


        const data = {
            record: [{
                method: "del_node",
                params: ["01cc378b0ebe3ad6b82c4a13e0767d47", "80b55436e31238928e1b753b2611485c"]
            }, {
                method: "add_node",
                params: [
                    {
                        id: "80b55436e31238928e1b753b2611485c",
                        name: '你哈',
                        img: '/src/img1/a10.png',
                    }
                ]
            }, {
                method: "del_link",
                params: ["MG_8209bb0a976600ee8f4be8749c1eb78c", "MG_794dbaf446bae70c486720216e4b5747", "MG_d52a6fa1404fd8b43464beeb16c8f85b"],
            }, {
                method: "add_link",
                params: [{
                    "direct": true,
                    "e_type": 0,
                    "from": "80b55436e31238928e1b753b2611485c",
                    "id": "fjsdlkjflksdjflkjds",
                    "to": "1f56770072803b819da91b3ae1f2a6c4",
                    "type": "玩的接口",
                    "undirected_type": "set_off"
                }]
            }]
        }
        netGraph.addFusionAnimation(data);
    });

    document.getElementById("updateUrlMap").addEventListener("click", () => {
        netGraph.replaceDefaultUrlMap({
            "human": '/src/img1/a104.png',
            "entity": '/src/img1/a106.png',
            "animal": "/src/img1/a105.png",
            "default": "/src/img1/a107.png",
        })
    })
}




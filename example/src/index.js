import axios from 'axios';
import NetGraph, { HIGHLIGHT, SELECTED, UNSELECTED } from '../../src/index';

const debug = false;
// let isUpLoadFile = false;

// function readData () {
//     if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
//         return -1;
//     } else {
//         if (!isUpLoadFile) {
//             throw new Error("two files are needed");
//         }
//         let input = document.getElementById("uploadFile");
//         let dataFile = input.files[0];
//         let dataFileReader = new FileReader();

//         dataFileReader.onload = function (e) {
//             let dataContent = e.target.result;
//             let data = JSON.parse(dataContent);
//             //const renderData={nodes:data.data.nodes,links:data.data.links};
//             data.nodes.forEach((node, i) => {
//                 node.img = '/src/img1/b' + i % 10 + '.png';
//             });
//             // console.log(renderData.nodes.length);
//             // console.log(renderData.links.length);
//             draw(data);
//         };
//         dataFileReader.readAsText(dataFile);
//     }
// }

// document.getElementById("uploadFile").addEventListener("change", (e) => {
//     if (e.target.files[0].name.lastIndexOf('.json') !== -1) {
//         isUpLoadFile = true;
//         readData();
//     }
// });

axios.get('/src/auto_500.json').then((res) => {

    const nodes = res.data.nodes;
    const links = res.data.links;

    nodes.forEach((node, i) => {
        node.img = '/src/img1/a' + i%10 + '.png';
    });
    console.log("nodelength", nodes.length);
    console.log("linklength", links.length);
    // const nodes=[]
    const data = {
        nodes: nodes,
        links,
    };
    // let temp = new Array(200000).fill(1);
    // const nodes = temp.map((v, i) => {
    //     return {
    //         id: 'a' + i,
    //         name: 'h',
    //         img: '/src/img1/a0.png',
    //     };
    // });
    // const data = {
    //     nodes,
    //     links: [],
    // }
    draw(data);
});
function draw (rawData) {
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

        };
    }

    const netGraph = new NetGraph({
        canvasProps: {
            containerWidth: 2500,
            containerHeight: 1200,
            zoom: 0,
            container: 'container',
            maxZoom: 4,
            minZoom: -2,
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
        data: data,
        style: [
            {
                selector: 'node',
                style: {
                    'width': 45,
                    'height': 45,
                    'background-width': (d) => {
                        if (d.data.metaType === 'nodeSet') {
                            return 98;
                        } else {
                            return 58;
                        }
                    },
                    'background-height': 58,
                    'url': (d) => d.data.img,
                    'opacity': 1,
                    'background-color': '#ffd53f',
                    'background-opacity': 1,
                    'text-color': '#845624',
                    'text-opacity': 1,
                    'font-size': 12,
                    'text': (d) => d.data.name,
                    'shape': (d) => {
                        if (d.data.metaType === 'nodeSet') {
                            return 'horizontal_rect';
                        } else {
                            return 'rect';
                        }
                    },
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
                    'line-style': (d) => {

                        return 'solid';

                    },
                    'text-color': "#456456",
                    'font-size': 10,
                    'text': (d) => d.data.type,
                    'direct': (d) => d.data.direct
                }
            }, {
                selector: 'link.color',
                style: {
                    'line-color': '#fff',
                    'text-color': '#aaa'
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

    console.log(netGraph);

    let timeout = null;
    netGraph.addEventListener('canvasMouseDown', (e) => {
        timeout = setTimeout(() => {
            netGraph.showBrushArea();
        }, 2000);
    });
    netGraph.addEventListener('canvasMouseUp', (e) => {
        if (timeout) {
            clearTimeout(timeout);
        }
    });
    netGraph.addEventListener('canvasMouseMove', (e) => {
        if (timeout) {
            clearTimeout(timeout);
        }
    });


    netGraph.addEventListener('nodeClick', (object, e) => {
        console.log(object.object.id, e);
        netGraph.updateNodeStatus([object.object.id], SELECTED);
        //netGraph.replaceData();
    });
    netGraph.addEventListener('nodeClickWithCtrl', (info, e) => {
        netGraph.addClassForNode(['a005'], ['fff', 'class2']);
        console.log('nodeClickWithCtrl');
    });

    netGraph.addEventListener('lineClick', (o, e) => {
        console.log('lineClick');
    });
    netGraph.addEventListener('canvasRightClick', (info, e) => {
        // console.log(netGraph.exportCanvasAsBase64())
        console.log('canvas right click');
    });
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
    });

    netGraph.addEventListener('brush', (nodeIds) => {
        netGraph.updateNodeStatus(nodeIds, SELECTED);
    });



    netGraph.addEventListener('rightClick', () => {

        console.log("rightClick");
    });
    document.getElementById('remove').addEventListener('click', (e) => {
        const selectedNodes = netGraph.getSelectedNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        netGraph.removeNodes(selectedNodeIds);
    });


    document.getElementById('addStyle').addEventListener('click', () => {
        const nodes = netGraph.getNodes();
        let id = 'aaa';

        if (nodes.length > 5) {
            id = nodes[4].id;
        }
        netGraph.addStyle([{
            selector: 'node#' + id,
            style: {
                'background-color': '#fff',
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

        netGraph.setGroupDrag(!isGroup);
        isGroup = !isGroup;
    });


    document.getElementById('addClass').addEventListener('click', () => {
        const nodes = netGraph.getNodes();
        const links = netGraph.getLinks();
        if (nodes.length > 0) {
            netGraph.addClassForNode([nodes[0].id], ['fff']);
        }
        if (links.length > 0) {
            netGraph.addClassForLink([links[0].id], ['color']);
        }


        // netGraph.updateStyle();
    });


    document.getElementById('updateLinkStyle').addEventListener('click', () => {


        // netGraph.addStyle([{
        //     selector:"link.selected",
        //     style: {
        //         'line-color': '#fff',
        //     }
        // }],false);

        const links = netGraph.getLinks();

        if (links.length > 3) {
            netGraph.addClassForLink([links[2].id], ['selected']);
        }




    });

    document.getElementById("lockNode").addEventListener("click", () => {
        const nodes = netGraph.getNodes();
        if (nodes.length > 0) {
            netGraph.lockNodes([nodes[0].id]);
        }

    });
    document.getElementById("unlockNode").addEventListener("click", () => {
        const nodes = netGraph.getNodes();
        if (nodes.length > 0) {
            netGraph.unlockNodes([nodes[0].id]);
        }

    });
    document.getElementById("alterStatus").addEventListener("click", () => {
        const selectedNodes = netGraph.getNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        netGraph.updateNodeStatus(selectedNodeIds, UNSELECTED);
    });
    document.getElementById("replaceData").addEventListener("click", () => {
        netGraph.replaceData({
            nodes: [],
        });
    });


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
                    img: '/src/img1/a5.png',
                    metaType:'nodeSet'
                },
                // {
                //     id: 'b002',
                //     name: '是2',
                //     img: '/src/img1/b6.png'
                // },
                // {
                //     id: 'b003',
                //     name: '是7',
                //     img: '/src/img1/b4.png'
                // },
                // {
                //     id: 'b004',
                //     name: '是3',
                //     img: '/src/img1/a8.png'
                // },
                // {
                //     id: 'b005',
                //     name: '是4',
                //     img: '/src/img1/a9.png'
                // },
                // {
                //     id: 'b006',
                //     name: '是5',
                //     img: '/src/img1/a10.png'
                // },
                // {
                //     id: 'b007',
                //     name: '是6',
                //     img: '/src/img1/a11.png'
                // }

            ],
            links: [
               
            ]
        });
    });

    document.getElementById("treeLayout").addEventListener("click", () => {
        const nodes = netGraph.getNodes();

        if (nodes.length > 10) {
            netGraph.setNodeLayout('hierarchy', [nodes[0].id, nodes[9].id]);
        }

        //netGraph.setNodeLayout('hierarchy', ["2786b7455ff93ce7ad0fc4a4cfe5bd21", "61c90e594b88372f8fa3217c150656f0"]);
    });
    document.getElementById("zoom").addEventListener("click", () => {
        let zoomNum = netGraph.getZoom();
        console.log(zoomNum);
        zoomNum += 0.4;
        if (zoomNum > 4) {
            zoomNum = -3;
        }
        netGraph.setZoom(zoomNum);
    });
    document.getElementById("scroll").addEventListener("click", () => {
        const nodes = netGraph.getNodes();
        
        if (nodes.length > 0) {
            console.log(nodes[0].id);
            netGraph.scrollIntoView(nodes[0].id);
        }
        //netGraph.scrollIntoView("3ded00b898c73c11a72558530859568d");
    });
    document.getElementById("fitView").addEventListener("click", () => {
        netGraph.fitView(null);
    });

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
        netGraph.addBubbleSet([nodeIds], ["#d7473a", "#4ea79b"], "one");
    });
    document.getElementById("layoutBubble").addEventListener("click", () => {
        netGraph.layoutBubbleSet(["one"]);
    });
    document.getElementById("removeBubble").addEventListener("click", () => {
        console.log(netGraph.removeBubbleSet(["one"]));
    });

    document.getElementById("addAnimation").addEventListener("click", () => {
        const links = netGraph.getLinks();
        if (links.length > 5) {


            const anData = {
                "data": [
                    {
                        "id": "flow_one",
                        "name": "abc",
                        "speed": 2,
                        "colour": "rgba(246,42,26,1)",
                        "balls": {
                            "ball_001": {
                                "size": 0.301,
                                "link_id": links[0].id,
                                "direct": 1
                            },
                            "ball_002": {
                                "size": 0.3,
                                "link_id": links[1].id,
                                "direct": -1
                            }
                        },
                        "order": [
                            [
                                "ball_001",
                                "ball_002"
                            ]
                        ]
                    },
                    {
                        "id": "flow_two",
                        "name": "abcd",
                        "speed": 1.5,
                        "colour": "rgba(117,218,233,1)",
                        "balls": {
                            "ball_003": {
                                "size": 0.201,
                                "link_id": links[2].id,
                                "direct": 1
                            },
                            "ball_004": {
                                "size": 0.37,
                                "link_id": links[3].id,
                                "direct": -1
                            }
                        },
                        "order": [
                            [
                                "ball_003",
                                "ball_004"
                            ]
                        ]
                    }
                ]
            };
            netGraph.addFlowAnimation(anData.data);
        }
        // axios.get("/src/animation.json").then((res) => {
        //     netGraph.addFlowAnimation(res.data.data)
        // })
    });
    document.getElementById("pauseAnimation").addEventListener("click", () => {
        netGraph.pauseFlowAnimation(["flow_one"]);
    });
    document.getElementById("restartAnimation").addEventListener("click", () => {
        netGraph.restartFlowAnimation(["flow_one"]);
    });
    document.getElementById("removeAnimation").addEventListener("click", () => {
        netGraph.removeFlowAnimation();
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
        };
        netGraph.addFusionAnimation(data);
    });

    document.getElementById("updateUrlMap").addEventListener("click", () => {
        netGraph.replaceDefaultUrlMap({
            "human": '/src/img1/a104.png',
            "entity": '/src/img1/a106.png',
            "animal": "/src/img1/a105.png",
            "default": "/src/img1/a107.png",
        });
    });

    document.getElementById("highlight").addEventListener("click", () => {
        netGraph.updateNodeStatus(["01cc378b0ebe3ad6b82c4a13e0767d47", "80b55436e31238928e1b753b2611485c"], HIGHLIGHT);
    });

    document.getElementById("updateTextStyle").addEventListener("click", () => {
        netGraph.scrollIntoView("Q249995");
        // const selectedNodes = netGraph.getSelectedNodes();
        // netGraph.updateNodeCustomStyle(selectedNodes,{'font-size':40,'background-color':"#000"});
    });
}




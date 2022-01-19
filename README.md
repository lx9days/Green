# NetGraph WebGL graph rendering framework

## API overview
- [NetGraph WebGL graph rendering framework](#netgraph-webgl-graph-rendering-framework)
  - [API overview](#api-overview)
  - [API detail](#api-detail)
    - [constructor](#constructor)
    - [addData](#adddata)
    - [replaceData](#replacedata)
    - [nodestatus](#nodestatus)
    - [reloadData](#reloaddata)
    - [updateGraph](#updategraph)
    - [getNodes](#getnodes)
    - [getLinks](#getlinks)
    - [getSelectedNodes](#getselectednodes)
    - [setSelectNodes](#setselectnodes)
    - [brushNode](#brushnode)
    - [scrollIntoView](#scrollintoview)
    - [fitView](#fitview)
    - [addStyle](#addstyle)
    - [updateStyle](#updatestyle)
    - [addClassForNode](#addclassfornode)
    - [removeClassForNode](#removeclassfornode)
    - [addClassForLink](#addclassforlink)
    - [removeClassForLink](#removeclassforlink)
    - [replaceStyle](#replacestyle)
    - [removeNodes](#removenodes)
    - [removeLinks](#removelinks)
    - [hideNodes](#hidenodes)
    - [getZoom](#getzoom)
    - [setZoom](#setzoom)
    - [setNodeLayout](#setnodelayout)
    - [addEventListener](#addeventlistener)
    - [removeEventListener](#removeeventlistener)
    - [setGroupDrag](#setgroupdrag)
    - [showBrushArea](#showbrusharea)
    - [exportData](#exportdata)
    - [exportDataAsString](#exportdataasstring)
    - [exportCanvasAsBase64](#exportcanvasasbase64)
    - [updateDim](#updatedim)
    - [lockNodes](#locknodes)
    - [unlockNodes](#unlocknodes)
    - [updateNodeStatus](#updatenodestatus)
    - [fitView](#fitview-1)
    - [addBubbleSet](#addbubbleset)
    - [removeBubbleSet](#removebubbleset)
    - [layoutBubbleSet](#layoutbubbleset)
    - [addFlowAnimation](#addflowanimation)
    - [removeFlowAnimation](#removeflowanimation)
    - [pauseFlowAnimation](#pauseflowanimation)
    - [restartFlowAnimation](#restartflowanimation)
    - [getFlowAnimationIdByStatus](#getflowanimationidbystatus)
    - [addFusionAnimation](#addfusionanimation)
    - [replaceDefaultUrlMap](#replacedefaulturlmap)
    - [updateNodeCustomStyle](#updatenodecustomstyle)
    - [updateLinkCustomStyle](#updatelinkcustomstyle)
    - [focusOnNodes](#focusonnodes)


## API detail

### constructor
```javascript
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
                    'width': 50,//node 宽度
                    'height': 40,//node 高度 只有在 shape 为‘rect’时可用
                    'url': (d) => d.data.img,
                    'opacity': 1,
                    'background-color': '#aaa',
                    'background-opacity': 1,
                    'border-width': 5,//图片周围圆圈的宽度
                    'border-color': '#fff',//颜色
                    'border-opacity': 1,//透明度
                    'color': '#845624',
                    'text-opacity': 1,
                    'font-size': 16,
                    'text': (d) => d.data.name,
                    'shape': 'circle',//'circle','rect'两种
                }
            },
            {
                selector: 'link',
                style: {
                   'width': 2,//线宽度
                    'line-color': '#456456',//线的颜色
                    'line-opacity': 1,//线的透明度
                    'to-arrow-shape': 'triangle',//target 箭头的形状
                    'to-arrow-color': '#858585',//target 箭头的颜色
                    'to-arrow-fill': 'filled', //target 箭头是否填充'none','filled'
                    'from-arrow-shape': 'triangle',//source 箭头的形状
                    'from-arrow-color': '#858585',//source 箭头的颜色
                    'from-arrow-fill': 'filled',//source 箭头是否填充'none','filled'
                    'color': '#845624',//线上文字的颜色
                    'text-opacity': 1,//文字的透明度
                    'font-size': 10,//文字的大小
                    'text': (d) => d.data.type,//文字
                    'direct':(d)=>d.data.direct//线的方向  函数返回值true 单向，函数返回值false 双向，默认单项
                }
            },
            ]
    });
```
使用`new NetGraph(props)` 来进行初始化操作，其中`canvasProps`用来设置canvas的属性。`containerWidth`和`containerHeight`用来设置canvas的的宽度和高度,`zoom` `maxZoom` `minZoom`分别是canvas 的当前的缩放、最大缩放、最小缩放值。`layout` 用来设置初始化的布局，目前支持的布局有`square` `star` `circleShape` `multSquare` `oneRow` `oneColumn`。`data`用于创建画布的node-link 数据。`style` 用于设置元素的样式风格。
### addData
```javascript
netGraph.addData({
            nodes: [
                {
                    id: 'b001',
                    name: '是1',
                    img: '/src/img1/a5.png'
                },
            ],
            links: [
                {
                    id: 'lk01',
                    type: 'cm',
                    from: 'b004',
                    to: 'b001',
                }
            ]
        });
```
`addData(data)` 用于添加新的渲染数据。
> data 中的数据nodes 和links 必须为 Array,如果添加的数据中不包含id将会自动生成随机id

### replaceData
```javascript
netGraph.replaceData({
            nodes: [
                {
                    id: 'b001',
                    name: '是1',
                    img: '/src/img1/a5.png'
                },
            ],
            links: [
                {
                    id: 'lk01',
                    type: 'cm',
                    from: 'b004',
                    to: 'b001',
                }
            ]
        });
```
`replaceData`将会用新的数据替换原有的数据

### nodestatus
 `HIGHLIGHT`,`SELECTED`,`UNSELECTED`,`HIDE`分别对应于`高亮`,`选中`,`未选中`,`隐藏`,为了避免使用错误可以从`index.js`中导入结点的状态然后使用
 >目前`HIDE`状态还不可用

### reloadData

### updateGraph

### getNodes
 `getNodes(nodeIds)`,通过ID来获取Node Object, 如果nodeIds=null 返回所有 Node Object
### getLinks
 `getLinks(linkIds)`,通过ID来获取Link Object, 如果linkIds=null 返回所有 Link Object

### getSelectedNodes
 返回所有当前状态为选中状态的Node Object.
### setSelectNodes
 `setSelectNodes(nodeIds)`, 将指定`ID`的`Node Obect`的状态设置为选中状态
### brushNode
 `brushNode(brushField)`,根据指定的`brushField`获取该范围内的所有`nodeIds`,`brushField`的格式为`{x:0,y:0,width:1,height:1}`
### scrollIntoView
`scrollInfoView(nodeId)`,用户可以通过指定`nodeId`来将画布的中心移动到改node所在的位置上,用户不需要指定位置，NetGraph会自动获取结点所在的位置并对焦点进行移动
### fitView
`fitView(nodeIds)`,用户可以通过调用`fitView`来做到让展示的数据自动适应当前窗口的大小，`nodeIds`为`id`数组，如果`nodeId`为`null`那么将对画布上所有的数据进行窗口自适应，否则只对指定`ID`的数据进行自适应

### addStyle
`addStyle(style)`传入`Array`类型的`style`格式为`[{selector:string,style:{...}}]`
```javascript
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
```
### updateStyle
 `updateStyle()`会使得`netGraph`重新解析所有元素的`Style`并且重新进行绘制
### addClassForNode
`addClassForNode(nodeIds,classes)`为指定`ID`的`Node Object`添加`Class`,`nodeIds`和`classes`均为`Array<String>`.
>用户不应该直接为`Node Object`添加样式，因为不会使得`NetGraph`不会感受到改变
```javascript
netGraph.addClassForNode(['a005'],['class1','class2'])
```
以上代码会为`ID`为`a005`的`Node Object`添加对应的`class`并立即重新解析所有元素的`style`并重新渲染生效
### removeClassForNode
`removeClassForNode(nodeIds,classes)`为指定`ID`的`Node Object`删除`Class`,`nodeIds`和`classes`均为`Array<String>`.
>用户不应该直接为`Node Object`删除样式，因为不会使得`NetGraph`不会感受到改变
```javascript
netGraph.removeClassForNode(['a005'],['class1','class2'])
```
以上代码会为`ID`为`a005`的`Node Object`删除对应的`class`并立即重新解析所有元素的`style`并重新渲染生效
### addClassForLink
`addClassForLink(linkIds,classes)`为指定`ID`的`Link Object`添加`Class`,`linkIds`和`classes`均为`Array<String>`.
>用户不应该直接为`Link Object`添加样式，因为不会使得`NetGraph`不会感受到改变
```javascript
netGraph.addClassForLink(['a005'],['class1','class2'])
```
以上代码会为`ID`为`a005`的`Link Object`添加对应的`class`并立即重新解析所有元素的`style`并重新渲染生效
### removeClassForLink
`removeClassForLink(linkIds,classes)`为指定`ID`的`Link Object`删除`Class`,`linkIds`和`classes`均为`Array<String>`.
>用户不应该直接为`Link Object`删除样式，因为不会使得`NetGraph`不会感受到改变
```javascript
netGraph.removeClassForLink(['a005'],['class1','class2'])
```
以上代码会为`ID`为`a005`的`Link Object`删除对应的`class`并立即重新解析所有元素的`style`并重新渲染生效

### replaceStyle
`replaceStyle(styles)`会使用新的`style`替换`NetGraph`当前持有的所有的`style`并且立即生效
```javascript
netGraph.replaceStyle([
            {
                selector:"node",
                style:{
                    ...
                }
            },{
                selector:"link",
                style:{
                    ...
                }
            }
        ])
```
### removeNodes
`removeNodes(nodeIds)`,`nodeIds`应该为`Array<string>`类型，方法将会删除指定`ID`的`Node Object`当参数为`null`或者没有参数时将会删除所有的`Node Object` 该函数会立即生效并导致画布的重新渲染
### removeLinks
`removeLinks(nodeIds)`,`linkIds`应该为`Array<string>`类型，方法将会删除指定`ID`的`Link Object`当参数为`null`或者没有参数时将会删除所有的`Link Object` 该函数会立即生效并导致画布的重新渲染
### hideNodes

### getZoom
`getZoom()`返回当前`NetGraph`的缩放级别
### setZoom
`setZoom(zoom)` 设置当前`NetGraph`渲染元素的缩放级别
### setNodeLayout
`setNodeLayout(layoutName,nodeIds)` 为指定的`ID`的元素进行布局，`layoutName`指定使用的布局方式,默认是`square`,当前支持的布局类型有`square`,`star`,`circleShape`,`multSquare`,`oneRow`,`oneColum`,`nodeIds`指定要进行布局的元素，默认为`null`,当用户不传该参数或者传值为`null`时，对所有的`Node Object`使用指定的布局方式进行重新布局。
### addEventListener
`addEventListener(name,callbackFunc)`,用户添加交互事件,用户指定事件名和回调函数,该函数会返回添加事件的`token`用户使用`token`可以删除事件目前`NetGraph`支持的事件有`nodeClick`,`nodeClickWithCtrl`,`lineClick`,`canvasRightClick`,`lineClickWithCtrl`,`emptyClick`,`brush`,`rightClick`
```javascript
 netGraph.addEventListener('rightClick', () => {

        console.log("rightClick")
    })
```
### removeEventListener
`removeEventListener(token)`根据`token`删除指定的监听事件
### setGroupDrag
`setGroupDrag(bool)`用户可以通过使用`true`作为参数调用该方法，开启`GroupDrag`后用户可以对批量的选中结点进行拖拽操作.
### showBrushArea
`showBrushArea()`调用该方法将会开启`NetGraph`的内置brush图层，用户可以通过拖住鼠标进行`brush`操作,用户松开鼠标后该`brush`过程自动结束并返回brush后的结点的ID,并自动将这些结点的状态置为选中状态
### exportData
`exportData()`将用户导入到`NetGraph`中的数据通过JSON的格式进行导出
### exportDataAsString
`exportData()`将用户导入到`NetGraph`中的数据转换为`String`类型后导出
### exportCanvasAsBase64
`exportCanvasAsBase64()`将Canvas画布以`Base64`编码的形式导出
### updateDim
`updateDim(size)`用户更新用户可见的Canvas 的尺寸,`size`为最新的画布的尺寸`{width:100,height:100}`,该操作会对过去`NetGraph`中已有的元素进行一定的调整来适应画布尺寸的改变
### lockNodes
`lockNodes(nodeIds)`可以用来根据指定的`id`来对结点进行锁定，锁定后`node`将不能够进行位置的改变，包括拖动和布局都不会对锁定的结点产生影响
### unlockNodes
`unlockNodes(nodeIds)`根据指定的`id`来解除对`node`的锁定

### updateNodeStatus
`updateNodeStatus(nodeIds,status)`用来更新node的样式，`nodeIds`为将要进行更新的`node`的`id`,status为样式选项,用户就可以直接使用数字`0`,`1`,`2`,`3`也可以从`NetGraph`中导出`UNSELECTED`,`SELECTED`,`HIDE`,`HIGHLIGHT`进行使用

### fitView
`fitView(nodeIds)`用于元素自适应窗口大小，主要是对画布根据元素的数量已经元素是否超出可见区域对画布进行一定的缩放操作使用户能够看到数据的所有内容,当`nodeIds`为`null`时或者用户直接调用`fitView()`会将画布上的所有的元素进行窗口适配,如果`nodeIds`为`ID`数组那个自适应窗口的操作只会根据指定的元素进行

### addBubbleSet
`addBubbleSet(nodeIdArrays,colors,id)`用于给一组元素添加域，用户需要指定每个域用包含的元素的`id`,每个域的背景颜色colors,以及每个人域的`id`,该方法会返回生成的所有的域的`id`数组，用户持有id后可以对该域进行其他操作例如删除指定的域
>`nodeIdArrays`的形式应该时`[["id1","id2"],['id3','id4']]`的形式,其中每个子数组对应一个域的区域。对于colors正常情况用户可以指定和域的区域相同数量，如果数量和生成的域的区域的数量不一致,会自动生成color进行补充
### removeBubbleSet
`removeBubbleSet(ids)`该方法会删除id指定的域,如果用户不传递id或者传值为`null`会删除所有的域
### layoutBubbleSet
`layoutBubbleSet(ids)`该方法会将每个BubbleSet为一个组，然后对每组分别进行矩形布局，默认使用第一个`node`的坐标作为起始位置,如果传递一个bubbleset 的id 数组只会对指定的域进行矩形布局，如果不传递参数会对所有的域进行矩形布局
### addFlowAnimation
`addFlowAnimation(animations)`用于添加动画，数据格式如下,必须为动画的数组格式
```javascript
 [
        {
            "id": "flow_one",
            "name": "abc",
            "speed": 3,
            "colour": "#fff",
            "balls": {
                "ball_001": {
                    "size": 0.301,
                    "link_id": "53f8614c746734f19f5b937f40b0c2abphone_write41dcc82234d534ce92c81d47c356c277",
                    "direct": 1
                },
                "ball_002": {
                    "size": 0.3,
                    "link_id": "MG_6e0588043118888161aaa7278f91c878",
                    "direct": -1
                }
            },
            "order": [
                [
                    "ball_001",
                    "ball_002"
                ]
            ]
        }
]
```
### removeFlowAnimation
`removeFlowAnimation(flowIds)`根据用户提供的`flowid`数组来删除流动画,如果调用但是不传递参数会将所有的动画进行删除
### pauseFlowAnimation
`pauseFlowAnimation(flowIds)`根据用户提供的`flowid`数组来暂停流动画,如果调用但是不传递参数会将所有的动画进行暂停
### restartFlowAnimation
`restartFlowAnimation(flowIds)`根据用户提供的`flowid`数组来重启被暂停的流动画,如果调用但是不传递参数会将所有的动画重新开始
### getFlowAnimationIdByStatus
`getFlowAnimationIdByStatus(status)`根据用户指定的状态来获取流动画的id,用户利用id进行其他操作，如果调用但是不传递参数将会获取到所有动画的id
### addFusionAnimation
`addFusionAnimation(data)`创建一个消融动画，将两个结点合并成一个,数据格式如下:
```javascript
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
            }]
        }
```
### replaceDefaultUrlMap
`replaceDefaultUrlMap(defaultUrlMap)`将已有的默认的类型-》url的映射使用罪行的defaultUrlMap进行替换，并立即生效。输入数据格式如下：
```javascript
{
    "human": '/src/img1/a104.png',
    "entity": '/src/img1/a106.png',
    "animal": "/src/img1/a105.png",
    "default": "/src/img1/a107.png",
}
```
### updateNodeCustomStyle
`updateNodeCustomStyle(nodes,style)`为指定的Node 添加用户自定义的样式
```javascript
netGraph.updateNodeCustomStyle(selectedNodes,{'font-size':40,'background-color':"#000"});
```
### updateLinkCustomStyle
`updateLinkCustomStyle(links,style)`为指定的Link 添加用户自定义的样式
```javascript
netGraph.updateNodeCustomStyle(selectedNodes,{'font-size':40,'background-color':"#000"});
```
### focusOnNodes
` focusOnNodes(ids)`自动将视图聚焦了一组Nodes之中

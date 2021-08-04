# NetGraph WebGL graph rendering framework

## API overview
- [NetGraph constructor](###constructor)
- [addData](###addData)
- [replaceData](#replaceData)
- [reloadData](#reloadData)
- [updateGraph](#updateGraph)
- [getNodes](#getNodes)
- [getLinks](#getLinks)
- [getSelectedNodes](#getSelectedNodes)
- [setSelectNodes](#setSelectNodes)
- [brushNode](#brushNode)
- [scrollIntoView](#scrollIntoView)
- [addStyle](#addStyle)
- [updateStyle](#updateStyle)
- [addClassForNode](#addClassForNode)
- [removeClassForNode](#removeClassForNode)
- [addClassForLink](#addClassForLink)
- [removeClassForLink](#removeClassForLink)
- [replaceStyle](#replaceStyle)
- [removeNodes](#removeNodes)
- [removeLinks](#removeLinks)
- [hideNodes](#hideNodes)
- [getZoom](#getZoom)
- [setZoom](#setZoom)
- [setNodeLayout](#setNodeLayout)
- [addEventListener](#addEventListener)
- [removeEventListener](#removeEventListener)
- [setGroupDrag](#setGroupDrag)
- [showBrushArea](#showBrushArea)
- [exportData](#exportData)
- [exportDataAsString](#exportDataAsString)
- [exportCanvasAsBase64](#exportCanvasAsBase64)


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
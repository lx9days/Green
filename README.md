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


//组件中使用的Node数据结构
export default class Node {
    constructor(id, data) {
        this.id = id;
        this.data = data;
        this.classes = new Array();
        this.items = new Array();
        this.styles = new Array();

        this.draggable = true;
        this._x = 0;
        this._y = 0;
        this.status = 2;//1未选中，2选中，3隐藏, 4高亮
        this.isHover = false;
        this.sourceLinks = new Array();
        this.targetLinks = new Array();
        this.isLocked = false;
        this.useCustomStyle = false;
        this.customStyle = {};
    }




    getId() {
        return this.id;
    }

    getStatus() {
        return this.status;
    }

    setStatus(status) {
        this.status = status;
    }

    isNode() {
        return true;
    }
    isLink() {
        return false;
    }

    setDraggable(bl) {
        this.draggable = bl;
    }
    getDraggable() {
        return this.draggable;
    }

    addStyle(style) {
        this.styles.push(style);
    }
    addItems(items) {
        if (!items && items.length > 0) {
            items.forEach((v) => {
                this.items.push(v);
            })
        }
    }

    removeItems(ids = null) {
        if (ids && ids.length > 0) {
            ids.forEach(id => {
                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i].id === id) {
                        this.items.splice(i, 1);
                        break;
                    }
                }
            });
        } else {
            this.items = new Array();
        }
    }

    getItems() {
        return this.items;
    }

    addClasses(classes) {
        if (classes) {
            if (Array.isArray(classes)) {
                classes.forEach((cl) => {
                    this.classes.push(cl);
                })
            } else {
                this.classes.push(classes);
            }
        }
    }

    removeClasses(classes) {
        if (classes) {
            if (Array.isArray(classes)) {
                classes.forEach((cl) => {
                    const index = this.classes.indexOf(cl);
                    if (index > -1) {
                        this.classes.splice(index, 1);
                    }
                })
            } else {
                const index = this.classes.indexOf(classes);
                if (index > -1) {
                    this.classes.splice(index, 1);
                }
            }
        } else {
            this.classes = [];
        }
    }

    getClasses() {
        return this.classes;
    }

    getLocation() {
        return {
            x: this.x,
            y: this.y
        }
    }
    getStyles() {
        return this.styles;
    }

    addSourceLink(link) {
        if (link) {
            this.sourceLinks.push(link);
        }

    }
    getSourceLinks() {
        return this.sourceLinks;
    }

    removeSourceLink(link) {
        if (link) {
            const index = this.sourceLinks.indexOf(link);
            if (index > -1) {
                this.sourceLinks.splice(index, 1);
            }
        }
    }


    addTargetLink(link) {
        if (link) {
            this.targetLinks.push(link)
        }

    }
    getTargetLinks() {
        return this.targetLinks;
    }

    removeTargetLink(link) {
        if (link) {
            const index = this.targetLinks.indexOf(link);
            if (index > -1) {
                this.targetLinks.splice(index, 1);
            }
        }
    }
    lock() {
        this.isLocked = true;
    }
    unlock() {
        this.isLocked = false;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    set x(newX) {
        if (!this.isLocked) {
            this._x = newX;
        }
    }
    set y(newY) {
        if (!this.isLocked) {
            this._y = newY;
        }
    }

    updateCustomStyle(customeStyle) {
        this.useCustomStyle = true;
        this.customStyle = Object.assign(this.customStyle, customeStyle);
    }
    closeCustomStyle() {
        this.useCustomStyle = false;
        this.customStyle = {};
    }

}
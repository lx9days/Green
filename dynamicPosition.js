export default {

  getDynamicPositionAdd (baseX, baseY, nodeArrList,num) {
    const positionList = new Array();
    if (!baseX) {
      baseX = 0;
    }
    if (!baseY) {
      baseY = 0;
    }
    if (Array.isArray(nodeArrList)) {
      const r = Math.ceil(nodeArrList.length / Math.PI);
      nodeArrList.forEach(item => {
        const arrTemp = new Array();
        arrTemp.push(baseX + r * (Math.random()) * 100 + 20);
        arrTemp.push(baseY + r * (Math.random()) * 100 + 20);
        positionList.push(arrTemp);
      });
      return positionList;
    } else if(num>0){
      const r = Math.ceil(num / Math.PI);
      for(let i = 0;i<num;i++){
        const arrTemp = new Array();
        arrTemp.push(baseX + r * (Math.random()) + 20);
        arrTemp.push(baseY + r * (Math.random()) + 20);
        positionList.push(arrTemp);
      }
      return positionList;
    }
    
  },

  getDynamicPosition (baseX, baseY, nodeArrList,num) {
    const positionList = new Array();
    if (!baseX) {
      baseX = 0;
    }
    if (!baseY) {
      baseY = 0;
    }
    if (Array.isArray(nodeArrList)) {
      const r = Math.ceil(nodeArrList.length / Math.PI);
      nodeArrList.forEach(item => {
        const arrTemp = new Array();
        arrTemp.push(baseX + r * (Math.random() - 0.5) * 100 + 20);
        arrTemp.push(baseY + r * (Math.random() - 0.5) * 100 + 20);
        positionList.push(arrTemp);
      });
      return positionList;
    } else if(num>0){
      const r = Math.ceil(num / Math.PI);
      for(let i = 0;i<num;i++){
        const arrTemp = new Array();
        arrTemp.push(baseX + r * (Math.random() - 0.5) + 20);
        arrTemp.push(baseY + r * (Math.random() - 0.5) + 20);
        positionList.push(arrTemp);
      }
      return positionList;
    }
    
  },
  getSquarePosition (baseX, baseY, nodeArrList) {
    const rowNum = Math.ceil(Math.sqrt(nodeArrList.length));
    const posArr = new Array();
    let sqnum = 0;
    for (let i = 0; i < nodeArrList.length; i++) {
      const parr = new Array();
      const col = sqnum % rowNum;
      const row = parseInt(sqnum / rowNum);
      parr.push(baseX + col * 150);
      parr.push(baseY + row * 150);
      posArr.push(parr);
      sqnum++;
    }
    return posArr;
  }

};

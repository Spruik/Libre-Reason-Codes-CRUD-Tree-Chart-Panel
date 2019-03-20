  /**
   * Expecting list of all data
   * Then first make a root, and category
   * @param {*} data 
   */
  export function getTreeStructureData(data){
    //root
    let obj = {
      children: [],
      name: 'ReasonCodes',
      type: 'Root',
      parent: null
    }

    //take all sites out from an array of objects, find disctinct, and make those distinct values a new array of strings
    const distinctSites = findDisctinct(data, 'category')
    
    for (let i = 0; i < distinctSites.length; i++) {
      const category = distinctSites[i];
      let ob = {
        name: category,
        children: [], 
        // collapsed: false,
        type: 'Category', 
        parent: obj.name,
        info:{
            category: category
        }
      }
      obj.children.push(ob)
    }

    return getReasons(obj, data)
  }

  /**
   * Expecting the tree structed obj, and the list structured array of objects
   * Add distinct areas to their matching sites
   * @param {*} obj 
   * @param {*} data 
   */
  function getReasons(obj, data){
    //Under the mother root, for each sites
    for (let i = 0; i < obj.children.length; i++) {
      const category = obj.children[i];
      //find areas that are under this site
      const reasons = data.filter(d => d.category_id !== null && d.category_id === category.name && d.parent_reason_id === null && d.reason_id !== null)
      //all areas to distinct areas
      const distinctReasons = findDisctinct(reasons, 'reason')
      //add each distinct area to this site
      for (let k = 0; k < distinctReasons.length; k++) {
        const reason = distinctReasons[k];
        let ob = {
          name: reason, 
          children: [], 
          collapsed: false,
          type: 'Parent Reason', 
          parent: obj.children[i].name,
          info: {
            category: category.name,
            reason: reason
          }
        }
        ob = addReasons(ob, category, data)
        obj.children[i].children.push(ob)
      }
    }
    return obj
  }

  /**
   * Expecting the current node, the current node's matching site, area, line and category, and the list data
   * If the current node has child, add child to the current node, then call this method again and pass the child as the current node.
   * @param {*} node 
   * @param {*} category 
   * @param {*} data 
   */
  function addReasons(node, category, data){
    //find the node's children
    let childReasons = data.filter(d => d.reason_id !== null && d.parent_reason_id !== null && d.category_id === category.name && d.parent_reason_id === node.name)
    if (childReasons.length > 0) {
      //node's children to node's disctinct children
      const distinctReasons = findDisctinct(childReasons, 'reason')
      //for each children
      for (let i = 0; i < distinctReasons.length; i++) {
        const reason = distinctReasons[i];
        //init this child
        let child = {
          name: reason,
          children: [],
          collapsed: false,
          type: 'Reason',
          parent: node.name,
          info: {
            category: category.name,
            reason: reason
          }
        }
        //add this child's children to this child before adding this child to this child's parent
        child = addReasons(child, category, data)
        //add this child to parent
        node.children[i] = child
      }
    }
    
    //Ultramately return the levelOneReason
    return node
  }

    /**
   * Expecting an array of objects, and a string of keyword
   * Based on different attributes keywords passed in
   * Return an array of distinct and keyword-matching values of the array of objects
   * @param {*} arrObj 
   * @param {*} s 
   */
  function findDisctinct(arrObj, s){
    const areaArr = arrObj.reduce((arr, record) => {
     if (s === 'category') {
        arr.push(record.category_id)
      }else if (s === 'reason'){
        arr.push(record.reason_id)
      }
      return arr
    }, [])
    return Array.from(new Set(areaArr))
  }
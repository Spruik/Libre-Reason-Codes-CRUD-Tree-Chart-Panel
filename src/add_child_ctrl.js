import * as utils from './utils'
import angular from 'angular'

let filter = []

export function addChild(node, allData, panelCtrl){

  let data = prepareModalData(node, allData)
  utils.showModal('add_child.html', data)
  removeListeners()
  addListeners(node, allData, panelCtrl)

}

function prepareModalData(node, allData){

  let sub, self
  let placeholder
  let maxLength = 50

  if (node.type === 'Root') {
    sub = 'Category'
    self = 'Root'
    placeholder = 'Enter a Category here'
    filter = allData.filter(d => d.category_id !== null)
    filter = filter.reduce((arr, record) => {
      arr.push(record.category_id)
      return arr
    }, [])
  }else if (node.type === 'Category') {
    sub = 'Reason'
    self = 'Category called ' + node.name
    placeholder = 'Enter a Reason here'
    filter = allData.filter(d => d.category_id !== null && d.category_id === node.info.category && d.reason_id !== null && d.parent_reason_id === null)
    filter = filter.reduce((arr, record) => {
      arr.push(record.reason_id)
      return arr
    }, [])
  }else if (node.type === 'Parent Reason' || node.type === 'Reason') {
    sub = 'Sub-Reason'
    self = 'Reason called ' + node.name
    placeholder = 'Enter a Reason here'
    filter = allData.filter(d => d.category_id !== null && d.category_id === node.info.category && d.reason_id !== null && d.parent_reason_id === node.name)
    filter = filter.reduce((arr, record) => {
      arr.push(record.reason_id)
      return arr
    }, [])
  }

  filter = Array.from(new Set(filter))

  return {
    info: {
      child: sub,
      self: self
    },
    placeholder: placeholder,
    maxLength: maxLength
  }
}

function addListeners(node, allData, panelCtrl){
  $(document).on('click', '#master-data-reason-code-add-child-submitBtn', e => {
    const input = $('#master-data-reason-code-add-child-form').serializeArray()
    if (input[0].value === '') {
      utils.alert('warning', 'Warning', 'Input Required')
    }else {
      if (isInputAvailable(input[0].value)) {
        insertNode(input[0].value, node, panelCtrl, allData)
      }
    }
  })
}

function removeListeners(){
  $(document).off('click', '#master-data-reason-code-add-child-submitBtn')
}

/**
 * Check if the user input has already been exist in the same parent node.
 * @param {*} input 
 */
function isInputAvailable(input){
  // console.log(filter);
  filter = filter.reduce((arr, d) => {
    arr.push(d.toLowerCase())
    return arr
  }, [])

  if (filter.indexOf(input.toLowerCase()) !== -1) {
    utils.alert('warning', 'Warning', 'Child exists')
    return false
  }

  if (input.indexOf('|') !== -1){
    utils.alert('warning', 'Warning', 'Sensitive character "|" is not allowed')
    return false
  }

  return true
}

function insertNode(input, node, panelCtrl, allData){


  if (!isInputValid(input, node, allData)) {return}

  const line = writeInsertionLine(input, node)
  const url = utils.postgRestHost + 'reason_codes'
  utils.post(url, line).then(res => {
    // console.log(res)
    $('#master-data-reason-code-add-child-cancelBtn').trigger('click')
    utils.alert('success', 'Success', 'A new node has been succeesfully inserted')
    panelCtrl.refresh()
  }).catch(e => {
    // console.log(e);
    $('#master-data-reason-code-add-child-cancelBtn').trigger('click')
    utils.alert('error', 'Error', 'Error ocurred whiling inserting node into the database, please try agian')
  })
}

function writeInsertionLine(input, node){
    let line = ''

    if (node.type === 'Root') {
      line = 'category_id=' + input
    }else if (node.type === 'Category') {
      line = 'category_id=' + node.info.category + '&reason_id=' + input
    }else if (node.type === 'Parent Reason' || node.type === 'Reason') {
      line = 'category_id=' + node.info.category + '&reason_id=' + input + '&parent_reason_id=' + node.info.reason
    }

    return line
}

/**
 * Check if the input is the same with its parent, and if adding sub-reason, check if the reason has exist -> not duplicate name should be exist in one category
 * Checking for sub-reason is beacuse the parent-reason and sub-reason is an endless parent-child relationship, -
 * for which, recursive method is used to loop thruogh each child, if a sub-reason's name is the same with any of it's parent reason's name -
 * it will cause 'call stack out of range' error.
 *  
 * @param {*} input --> This is the input
 * @param {*} node  --> This is the selected node, which will be the input's parent, because this is a 'add child' method 
 * @param {*} allData --> This is all of the data of the tree, which will be used to find the all of the input's parents
 */
function isInputValid (input, node, allData){
  if (node.type !== 'Root') {
    //get all of the reasons of that category
    const reasons = utils.getReasons(node, allData)
    if (reasons.indexOf(input) !== -1) {
      //exist
      utils.alert('warning', 'Warning', "Same reason was found in the same category, please make sure there isn't duplicate reason in the same category")
      return false
    }
  }

  if (input === node.name) {
    utils.alert('warning', 'Warning', "The child node's name cannot be the same as its parent's name")
    return false
  }

  return true
}

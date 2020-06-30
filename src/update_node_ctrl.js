import * as utils from './utils'

let filter = []

export function updateNode (node, allData, panelCtrl) {
  const data = prepareModalData(node, allData)
  utils.showModal('update_node.html', data)
  removeListeners()
  addListeners(node, allData, panelCtrl)
}

/**
 * Update the reminder text based on the node's type
 * filter the distinct record of the same branch based on the node's type and push the value that match that type in the record to an array, this is for further validation purposes
 * @param {*} node
 * @param {*} allData
 */
function prepareModalData (node, allData) {
  let self
  const maxlength = 50

  if (node.type === 'Category') {
    self = 'Category'
    filter = allData.filter(d => d.category_id !== null)
    filter = filter.reduce((arr, record) => {
      arr.push(record.category_id)
      return arr
    }, [])
  } else if (node.type === 'Parent Reason') {
    self = 'Reason'
    filter = allData.filter(d => d.category_id === node.info.category && d.reason_id !== null && d.parent_reason_id === null)
    filter = filter.reduce((arr, record) => {
      arr.push(record.reason_id)
      return arr
    }, [])
  } else if (node.type === 'Reason') {
    self = 'Sub-Reason'
    filter = allData.filter(d => d.category_id === node.info.category && d.reason_id !== null && d.parent_reason_id === node.parent)
    filter = filter.reduce((arr, record) => {
      arr.push(record.reason_id)
      return arr
    }, [])
  }

  filter = Array.from(new Set(filter))

  return {
    info: { self: self },
    inputVal: node.name,
    maxlength: maxlength
  }
}

function removeListeners () {
  $(document).off('click', '#master-data-reason-code-update-node-submitBtn')
}

function addListeners (node, allData, panelCtrl) {
  $(document).on('click', '#master-data-reason-code-update-node-submitBtn', e => {
    const input = $('#master-data-reason-code-update-node-form').serializeArray()[0].value
    if (isInputValid(input, node)) {
      // valid
      startUpdate(input, node, panelCtrl, allData)
    }
  })
}

/**
 * Check if input is empty
 * Check if input has changed
 * Check if input is already exist within the same parent
 * @param {*} input
 * @param {*} node
 */
function isInputValid (input, node) {
  if (input === '') {
    utils.alert('warning', 'Warning', 'Input Required')
    return false
  }

  if (input === node.name) {
    utils.alert('warning', 'Warning', 'Change Required')
    return false
  }

  filter = filter.reduce((arr, d) => {
    arr.push(d.toLowerCase())
    return arr
  }, [])

  if (filter.indexOf(input.toLowerCase()) !== -1) {
    utils.alert('warning', 'Warning', node.type + ' exists')
    return false
  }

  if (input.indexOf('|') !== -1) {
    utils.alert('warning', 'Warning', 'Sensitive character "|" is not allowed')
    return false
  }

  return true
}

/**
 * Prepare urls and lines for the update
 * @param {*} input
 * @param {*} node
 * @param {*} panelCtrl
 */
function startUpdate (input, node, panelCtrl, allData) {
  if (!isInputValidSecondCheck(input, node, allData)) { return }
  const url = utils.writeLine(node)
  const line = makeLine(input, node)

  if (node.type === 'Parent Reason' || node.type === 'Reason') {
    let postgresUrl = utils.postgRestHost + 'reason_code?category_id=eq.' + node.info.category
    const childUrl = postgresUrl += '&reason_id=not.is.null' + '&parent_reason_id=eq.' + node.name
    const childLine = 'parent_reason_id=' + input
    updateForReasons(url, line, childUrl, childLine, panelCtrl)
  } else {
    normalUpdate(url, line, panelCtrl)
  }
}

/**
 * Url will locate all records matching this url condition
 * Line is the update argument that is used to update all those records
 * popup successful, close the form, and refresh the tree when it's finished
 * popup error, close the form when it failed
 * @param {*} url
 * @param {*} line
 * @param {*} panelCtrl
 */
function normalUpdate (url, line, panelCtrl) {
  utils.update(url, line).then(res => {
    // console.log(res)
    $('#master-data-reason-code-update-node-cancelBtn').trigger('click')
    utils.alert('success', 'Success', 'A new node has been succeesfully inserted')
    panelCtrl.refresh()
  }).catch(e => {
    // console.log(e)
    $('#master-data-reason-code-update-node-cancelBtn').trigger('click')
    utils.alert('error', 'Error', 'Error ocurred whiling inserting node into the database, please try agian')
  })
}

/**
 * Url will locate the selected parent_reason or reason, line is the update argument
 * update the reason's reason_id, and then locate all its children, then update the children's parent_reason_id
 * popup successful, close the form, and refresh the tree when it's finished
 * popup error, close the form when it failed
 * @param {*} url
 * @param {*} line
 * @param {*} childUrl
 * @param {*} childLine
 * @param {*} panelCtrl
 */
function updateForReasons (url, line, childUrl, childLine, panelCtrl) {
  utils.update(url, line).then(utils.update(childUrl, childLine).then(res => {
    $('#master-data-reason-code-update-node-cancelBtn').trigger('click')
    utils.alert('success', 'Success', 'A new node has been succeesfully inserted')
    panelCtrl.refresh()
  })).catch(e => {
    console.log(e)
    $('#master-data-reason-code-update-node-cancelBtn').trigger('click')
    utils.alert('error', 'Error', 'Error ocurred whiling inserting node into the database, please try agian')
  })
}

/**
 * Make the update line based on the node type.
 * @param {*} input
 * @param {*} node
 */
function makeLine (input, node) {
  let l = ''
  if (node.type === 'Category') {
    l = 'category_id=' + input
  } else if (node.type === 'Parent Reason' || node.type === 'Reason') {
    l = 'reason_id=' + input
  }
  return l
}

function isInputValidSecondCheck (input, node, allData) {
  if (node.type === 'Parent Reason' || node.type === 'Reason') {
    // get all of the reasons of that category
    const reasons = utils.getReasons(node, allData)
    if (reasons.indexOf(input) !== -1) {
      // exist
      utils.alert('warning', 'Warning', "Same reason was found in the same category, please make sure there isn't duplicate reason in the same category")
      return false
    }
  }
  if (input === node.parent) {
    utils.alert('warning', 'Warning', "The name cannot be the same as its parent's name")
    return false
  }
  return true
}

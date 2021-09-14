import request from '@/utils/request'

// apiExecuteStrategy

export function listPage(params) {
  return request({
    url: '/api/apiExecuteStrategy/listPage',
    method: 'get',
    params
  })
}

export function list(params) {
  return request({
    url: '/api/apiExecuteStrategy/list',
    method: 'get',
    params
  })
}

export function getById(id) {
  return request({
    url: '/api/apiExecuteStrategy/getById?id=' + id,
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: '/api/apiExecuteStrategy/update',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/api/apiExecuteStrategy/add',
    method: 'post',
    data
  })
}

export function deleted(data) {
  return request({
    url: '/api/apiExecuteStrategy/delete',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export function listApiTestCase(id) {
  return request({
    url: '/api/apiExecuteStrategy/listApiTestCase?id=' + id,
    method: 'get'
  })
}

export function addCasesWithTx(data) {
  return request({
    url: '/api/apiExecuteStrategy/addCasesWithTx',
    method: 'post',
    data
  })
}

export function deleteCases(data) {
  return request({
    url: '/api/apiExecuteStrategy/deleteCases',
    method: 'post',
    data
  })
}

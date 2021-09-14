import request from '@/utils/request'

// apiTestCase

export function listPage(params) {
  return request({
    url: '/api/apiTestCase/listPage',
    method: 'get',
    params
  })
}

export function list(params) {
  return request({
    url: '/api/apiTestCase/list',
    method: 'get',
    params
  })
}

export function getById(id) {
  return request({
    url: '/api/apiTestCase/getById?id=' + id,
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: '/api/apiTestCase/update',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/api/apiTestCase/add',
    method: 'post',
    data
  })
}

export function deleted(data) {
  return request({
    url: '/api/apiTestCase/delete',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}


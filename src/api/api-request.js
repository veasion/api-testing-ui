import request from '@/utils/request'

// apiRequest

export function listPage(params) {
  return request({
    url: '/api/apiRequest/listPage',
    method: 'get',
    params
  })
}

export function list(params) {
  return request({
    url: '/api/apiRequest/list',
    method: 'get',
    params
  })
}

export function getById(id) {
  return request({
    url: '/api/apiRequest/getById?id=' + id,
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: '/api/apiRequest/update',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/api/apiRequest/add',
    method: 'post',
    data
  })
}

export function deleted(data) {
  return request({
    url: '/api/apiRequest/delete',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}


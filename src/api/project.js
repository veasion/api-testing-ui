import request from '@/utils/request'

// project

export function listPage(params) {
  return request({
    url: '/api/project/listPage',
    method: 'get',
    params
  })
}

export function list(params) {
  return request({
    url: '/api/project/list',
    method: 'get',
    params
  })
}

export function getById(id) {
  return request({
    url: '/api/project/getById?id=' + id,
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: '/api/project/update',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/api/project/add',
    method: 'post',
    data
  })
}

export function deleted(data) {
  return request({
    url: '/api/project/delete',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}


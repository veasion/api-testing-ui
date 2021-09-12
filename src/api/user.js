import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export function listPage(params) {
  return request({
    url: '/api/user/listPage',
    method: 'get',
    params
  })
}

export function list(params) {
  return request({
    url: '/api/user/list',
    method: 'get',
    params
  })
}

export function getById(id) {
  return request({
    url: '/api/user/getById?id=' + id,
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: '/api/user/update',
    method: 'post',
    data
  })
}

export function updatePwd(data) {
  return request({
    url: '/api/user/updatePwd',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/api/user/add',
    method: 'post',
    data
  })
}

export function deleted(data) {
  return request({
    url: '/api/user/delete',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

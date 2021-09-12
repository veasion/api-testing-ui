import request from '@/utils/request'

// project

export function list(params) {
  return request({
    url: '/api/project/pageList',
    method: 'get',
    params
  })
}

export function updated(data) {
  return request({
    url: '/api/project/update',
    method: 'post',
    data
  })
}

export function created(data) {
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

export function getProjectList(params) {
  return request({
    url: '/api/project/list',
    method: 'get',
    params
  })
}


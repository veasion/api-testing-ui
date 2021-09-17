import request from '@/utils/request'

export function runScript(data) {
  return request({
    url: '/api/script/runScript',
    method: 'post',
    data
  })
}

export function toScript(params) {
  return request({
    url: '/api/script/toScript',
    method: 'get',
    params
  })
}

export function apiNameTips(params) {
  return request({
    url: '/api/script/apiNameTips',
    method: 'get',
    params
  })
}

export function codeTips() {
  return request({
    url: '/api/script/codeTips',
    method: 'get'
  })
}

export function apiResponseTips(projectId, data) {
  // data['_maxTimeoutOfSeconds'] = 5
  return request({
    url: '/api/script/apiResponseTips/' + (projectId || ''),
    method: 'post',
    data
  })
}


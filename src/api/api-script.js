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

export function codeTips(params) {
  return request({
    url: '/api/script/codeTips',
    method: 'get',
    params
  })
}


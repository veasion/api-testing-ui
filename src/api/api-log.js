import request from '@/utils/request'

// apiLog

export function listPage(params) {
  return request({
    url: '/api/apiLog/listPage',
    method: 'get',
    params
  })
}

export function list(params) {
  return request({
    url: '/api/apiLog/list',
    method: 'get',
    params
  })
}

export function sumList(params) {
  return request({
    url: '/api/apiLog/sumList',
    method: 'get',
    params
  })
}

export function queryByStrategyId(strategyId, logId) {
  return request({
    url: '/api/apiLog/queryByStrategyId?strategyId=' + strategyId + '&logId=' + (logId || ''),
    method: 'get'
  })
}

export function pressureResult(strategyId, logId) {
  return request({
    url: '/api/apiLog/pressureResult?strategyId=' + strategyId + '&logId=' + (logId || ''),
    method: 'get'
  })
}

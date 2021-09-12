import request from '@/utils/request'

// dashborad

export function chartInfo() {
  return request({
    url: '/api/chartInfo',
    method: 'get'
  })
}

export function listRanking() {
  return request({
    url: '/api/listRanking',
    method: 'get'
  })
}

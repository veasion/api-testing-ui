import request from '@/utils/request'

export function serverInfo() {
  return request({
    url: '/api/serverInfo',
    method: 'get'
  })
}


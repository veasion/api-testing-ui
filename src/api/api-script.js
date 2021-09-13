import request from '@/utils/request'

export function runScript(data) {
  return request({
    url: '/api/script/runScript',
    method: 'post',
    data
  })
}

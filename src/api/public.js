import request from '@/utils/request'

export function serverInfo() {
  return request({
    url: '/api/public/serverInfo',
    method: 'get'
  })
}

export function nextTriggerTime(cron) {
  return request({
    url: '/api/public/nextTriggerTime?cron=' + cron,
    method: 'get'
  })
}

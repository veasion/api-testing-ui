import request from '@/utils/request'

export function getList(params) {
  return request({
    url: 'api/sysVar/pageList',
    method: 'get',
    params
  })
}

export function addOrUpdate(data) {
  return request({
    url: '/api/sysVar/addOrUpdate',
    method: 'post',
    data
  })
}

export function removeVar(id) {
  return request({
    url: '/api/sysVar/remove/' + id,
    method: 'post'
  })
}

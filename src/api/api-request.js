import request from '@/utils/request'

// apiRequest

export function listPage(params) {
  return request({
    url: '/api/apiRequest/listPage',
    method: 'get',
    params
  })
}

export function list(params) {
  return request({
    url: '/api/apiRequest/list',
    method: 'get',
    params
  })
}

export function getById(id) {
  return request({
    url: '/api/apiRequest/getById?id=' + id,
    method: 'get'
  })
}

export function queryByApiName(apiName, projectId) {
  return request({
    url: '/api/apiRequest/queryByApiName?apiName=' + apiName + '&projectId=' + (projectId || ''),
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: '/api/apiRequest/update',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/api/apiRequest/add',
    method: 'post',
    data
  })
}

export function deleted(data) {
  return request({
    url: '/api/apiRequest/delete',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export function exportExcel(params) {
  request.get('/api/apiRequest/export', { responseType: 'blob', params }, {
    responseType: 'arraybuffer',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    downloadFile(response, 'API接口.xlsx')
  })
}

export function downloadTemplate() {
  request.get('/api/apiRequest/downloadTemplate', { responseType: 'blob' }, {
    responseType: 'arraybuffer',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    downloadFile(response, 'API接口导入模板.xlsx')
  })
}

export function downloadSwaggerApi(swaggerUrl) {
  request.get('/api/apiRequest/downloadSwaggerApi?swaggerUrl=' + swaggerUrl, { responseType: 'blob' }, {
    responseType: 'arraybuffer',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    downloadFile(response, 'swagger接口.xlsx')
  })
}

export function importExcel(data) {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('autoCase', data.autoCase)
  formData.append('projectId', data.projectId)
  return request.post('/api/apiRequest/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

function downloadFile(data, fileName) {
  const blob = new Blob([data])
  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    navigator.msSaveBlob(blob, fileName)
  } else {
    const link = document.createElement('a')
    link.download = fileName
    link.style.display = 'none'
    link.href = URL.createObjectURL(blob)
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
  }
}

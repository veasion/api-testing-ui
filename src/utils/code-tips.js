/**
 * 处理代码提示
 */
export function codeTips(codeTipsData, currentLine, index) {
  if (!codeTipsData || !currentLine) {
    return
  }
  if (index == null || index < 0) {
    index = currentLine.length
  }
  if (index === 0) {
    return
  }
  const startStr = currentLine.substring(0, index)
  const endStr = currentLine.substring(index)
  let isEval = false
  let splitIndex = 0
  for (let i = index; i >= 0; i--) {
    if (startStr[i] === ' ') {
      splitIndex = i + 1
      break
    }
    if (startStr[i] === '{' && i > 0 && startStr[i - 1] === '$') {
      isEval = true
      splitIndex = i + 1
      break
    }
  }
  const matchStr = startStr.substring(splitIndex, index)
  if (matchStr.startsWith('http.request(\'')) {
    let appendEnd = ''
    if (endStr.trim() === '') {
      appendEnd = '\')'
    } else if (endStr.trim() === ')') {
      appendEnd = '\''
    }
    return apiNameTips(codeTipsData.apiNames, matchStr.substring('http.request(\''.length), appendEnd)
  } else if (matchStr.startsWith('http.request("')) {
    let appendEnd = ''
    if (endStr.trim() === '') {
      appendEnd = '")'
    } else if (endStr.trim() === ')') {
      appendEnd = '"'
    }
    return apiNameTips(codeTipsData.apiNames, matchStr.substring('http.request("'.length), appendEnd)
  }
  const lastDian = matchStr.endsWith('.')
  const array = matchStr.split('.')
  let result = isEval ? codeTipsData.globalMap : codeTipsData.varCodes
  for (let i = 0; i < array.length; i++) {
    let newResult = null
    if (i < array.length - 1 || lastDian) {
      newResult = result[array[i]]
    }
    if (!newResult) {
      const keys = Object.keys(result) || []
      result = []
      for (let j = 0; j < keys.length; j++) {
        let appendEnd = ''
        const k = (keys[j] + '')
        if (isEval && endStr.trim() === '') {
          appendEnd = '}'
        }
        if (k.startsWith(array[i]) && k !== array[i]) {
          result.push({ displayText: k, text: k.substring(array[i].length) + appendEnd })
        }
      }
      return result
    } else {
      result = newResult
    }
  }
  return Object.keys(result)
}

function apiNameTips(apiNames, apiName, end) {
  end = end || ''
  if (apiNames == null || apiNames.length === 0) {
    return null
  }
  const result = []
  for (const i in apiNames) {
    const k = apiNames[i]
    if (apiNames[i].startsWith(apiName)) {
      result.push({ displayText: k, text: k.substring(apiName.length) + end })
    }
  }
  return result
}

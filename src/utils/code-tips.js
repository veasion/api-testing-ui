const otherTipsMap = {
  if: 'if (%code) {\r\n\r\n}',
  null: 'if (%code != null) {\r\n\r\n}',
  var: 'let %var = %code\r\n',
  for: 'for (const i in %code) {\r\n\r\n}',
  fori: 'for (let i = 0; i < %code.length; i++) {\r\n\r\n}',
  try: 'try{\r\n\t%code\r\n} catch (e) {\r\n\tlog.error(\'发生错误\')\r\n}'
}

/**
 * 处理代码提示
 */
export function codeTips(codeTipsData, currentLine, index, cursor, script) {
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
    if (startStr[i] === ' ' || startStr[i] === ';') {
      splitIndex = i + 1
      break
    }
    if (startStr[i] === '{' && i > 0 && startStr[i - 1] === '$') {
      isEval = true
      splitIndex = i + 1
      break
    }
    if ((startStr[i] === '\'' || startStr[i] === '"') && codeTipsData.apiNameMap) {
      const c = startStr[i - 1]
      if (c === ' ' || c === '\n' || c === ',' || c === '{') {
        const startEnd = startStr.substring(i + 1, index)
        const api = lastApiName(script, cursor)
        if (api && codeTipsData.apiNameMap[api]) {
          const keys = Object.keys(codeTipsData.apiNameMap[api]) || []
          const result = []
          for (let j = 0; j < keys.length; j++) {
            const k = (keys[j] + '')
            if (k.startsWith(startEnd) && k !== startEnd) {
              result.push({ displayText: k, text: k.substring(startEnd.length) })
            }
          }
          return result
        }
      }
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
    return noneTips(apiNameTips(codeTipsData.apiNames, matchStr.substring('http.request(\''.length), appendEnd), matchStr, splitIndex)
  } else if (matchStr.startsWith('http.request("')) {
    let appendEnd = ''
    if (endStr.trim() === '') {
      appendEnd = '")'
    } else if (endStr.trim() === ')') {
      appendEnd = '"'
    }
    return noneTips(apiNameTips(codeTipsData.apiNames, matchStr.substring('http.request("'.length), appendEnd), matchStr, splitIndex)
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
      if (i === 0 && result.length === 0) {
        result = apiResponseTips(matchStr, lastDian, codeTipsData.tempVar, cursor)
      }
      return otherTips(result, matchStr, splitIndex)
    } else {
      result = newResult
    }
  }
  return otherTips(Object.keys(result), matchStr, splitIndex)
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

function noneTips(result, matchStr, splitIndex) {
  if (result == null || result.length === 0) {
    return otherTips(result, matchStr, splitIndex)
  }
  return result
}

function otherTips(result, matchStr, splitIndex) {
  result = result || []
  const lastIdx = matchStr.lastIndexOf('.')
  if (lastIdx < 1) {
    return result
  }
  const start = matchStr.substring(0, lastIdx)
  const end = matchStr.substring(lastIdx + 1)
  const keys = Object.keys(otherTipsMap)
  for (const i in keys) {
    const k = keys[i]
    if (k.startsWith(end)) {
      // result.push({ displayText: k, text: k.substring(end.length) })
      let code = otherTipsMap[k].replace('%code', start)
      if (code.indexOf('%var') > -1) {
        code = code.replace('%var', 'v' + randCode(3))
      }
      result.push({ displayText: k, text: code, replace: true, startIndex: splitIndex })
    }
  }
  return result
}

function randCode(number) {
  let str = ''
  for (let i = 0; i < number; i++) {
    str += Math.floor(Math.random() * 10)
  }
  return str
}

function apiResponseTips(matchStr, lastDian, tempVar, cursor) {
  let result = tempVar
  const array = matchStr.replaceAll('[', '.[').split('.')
  for (let i = 0; i < array.length; i++) {
    let newResult = null
    if (i < array.length - 1 || lastDian) {
      const field = array[i].trim()
      if (Array.isArray(result)) {
        if (field.startsWith('[') && field.endsWith(']')) {
          newResult = result[parseInt(field.substring(1, field.length - 1))]
        } else if (field === '') {
          const resp = []
          for (const idx in result) {
            if (idx > 10) {
              break
            }
            const from = lastDian ? Object.assign({}, cursor, { ch: cursor.ch - 1 }) : null
            const to = lastDian ? Object.assign({}, cursor, { ch: cursor.ch }) : null
            resp.push({ displayText: '[' + idx + ']', text: '[' + idx + ']', from, to })
          }
          return resp
        } else {
          return []
        }
      } else {
        newResult = result[field]
      }
    }
    if (!newResult) {
      if ((typeof result) === 'string') {
        return []
      }
      const keys = Object.keys(result) || []
      result = []
      for (let j = 0; j < keys.length; j++) {
        const k = (keys[j] + '')
        if (k.startsWith(array[i]) && k !== array[i]) {
          result.push({ displayText: k, text: k.substring(array[i].length) })
        }
      }
      return result
    } else {
      result = newResult
    }
  }
  return result
}

function lastApiName(script, cursor) {
  const lines = script.split('\n')
  let idx = -1
  for (let i = cursor.line; i >= 0; i--) {
    idx = lines[i].lastIndexOf('http.request(')
    if (idx === -1) {
      continue
    }
    if (i === cursor.line && lines[i].substring(0, cursor.ch).indexOf(')') > 0) {
      return
    }
    if (i < cursor.line && lines[i].substring(idx).indexOf(')') > 0) {
      return
    }
    script = lines[i]
    break
  }
  if (idx < 0) {
    return
  }
  let apiCode = script.substring(idx + 'http.request('.length).trim()
  if (apiCode[0] !== '\'' && apiCode[0] !== '\"') {
    return
  }
  apiCode = bracketContext(apiCode, apiCode[0])
  if (!apiCode || !apiCode.trim()) {
    return
  }
  return apiCode.trim()
}

export function parseHttpRequestVar(script) {
  let idx = -1
  let startIdx = 0
  const result = {}
  const httpStr = 'http.request('
  while ((idx = script.indexOf(httpStr, idx + 1)) > -1) {
    let varCode = script.substring(startIdx, idx).trim()
    if (!varCode.endsWith('=')) {
      continue
    }
    varCode = varCode.substring(0, varCode.length - 1).trim()
    varCode = preToken(varCode)
    let apiCode = script.substring(idx + httpStr.length).trim()
    if (apiCode[0] !== '\'' && apiCode[0] !== '\"') {
      continue
    }
    apiCode = bracketContext(apiCode, apiCode[0])
    if (!apiCode || !apiCode.trim()) {
      continue
    }
    result[varCode] = apiCode.trim()
    startIdx = idx + httpStr.length
  }
  return result
}

function bracketContext(str, bracket, index) {
  if (index == null) {
    index = 0
  }
  const sIdx = str.indexOf(bracket, index)
  if (sIdx < 0) {
    return null
  }
  const eIdx = str.indexOf(bracket, sIdx + 1)
  if (eIdx < 0) {
    return null
  }
  str = str.substring(sIdx + 1, eIdx)
  return str.indexOf('\n') > 0 ? null : str
}

function preToken(str, index) {
  let startIndex = -1
  if (index == null) {
    index = str.length - 1
  }
  for (let i = index; i >= 0; i--) {
    if (str[i] === ' ' || str[i] === '\n') {
      startIndex = i + 1
      break
    }
  }
  if (startIndex > 0) {
    return str.substring(startIndex, index + 1).trim()
  } else {
    return str.substring(0, index + 1).trim()
  }
}

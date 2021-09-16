/**
 * 处理代码提示
 */
export function codeTips(data, currentLine, index, allWord) {
  if (!data || !currentLine) {
    return
  }
  if (index == null || index < 0) {
    index = currentLine.length
  }
  if (index === 0) {
    return
  }
  const startStr = currentLine.substring(0, index)
  let splitIndex = 0
  for (let i = index; i >= 0; i--) {
    if (startStr[i] === ' ') {
      splitIndex = i + 1
      break
    }
    if (startStr[i] === '{' && i > 0 && startStr[i - 1] === '$') {
      splitIndex = i + 1
      break
    }
  }
  const matchStr = startStr.substring(splitIndex, index)
  const lastDian = matchStr.endsWith('.')
  const array = matchStr.split('.')
  let result = data
  for (let i = 0; i < array.length; i++) {
    let newResult = null
    if (i < array.length - 1 || lastDian) {
      newResult = result[array[i]]
    }
    if (!newResult) {
      let endIndex = index
      const keys = Object.keys(result) || []
      result = []
      for (let j = 0; j < keys.length; j++) {
        const k = (keys[j] + '')
        if (k.startsWith(array[i]) && k !== array[i]) {
          if (allWord) {
            result.push(k)
            endIndex = index - array[i].length
          } else {
            result.push(k.substring(array[i].length))
          }
        }
      }
      return { list: result, index: endIndex }
    } else {
      result = newResult
    }
  }
  return { list: Object.keys(result), index }
}

export function getQueryFromUrl(url) {
  const obj = {}
  if (typeof url !== 'string') {
    return obj
  }
  const uri = url.split('?')
  if (uri.length < 2) {
    return obj
  }
  for (const raw of uri[1].split('&')) {
    const split = raw.split('=')
    const name = split.shift()
    const value = split.join('=')
    obj[name] = value
  }
  return obj
}

export function getQueryFromCurrentUrl() {
  return getQueryFromUrl(window.location.href)
}

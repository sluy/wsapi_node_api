import axios from 'axios'
import { DateTime } from 'luxon'
import config from './config'

const requestProxy = async (method, route, data) => {
  const now = DateTime.now()
  let payload = {}
  let err = null

  try {
    const headers = {
      'Content-Type': 'application/json'
    }
    const payload = {
      method,
      route,
      data
    }
    const res = await axios({
      method: config.api.proxy.method,
      url: config.api.proxy.url,
      data: payload,
      headers
    })

    if (typeof res.data === 'object' && res.data !== null) {
      return res.data
    }
    return {}
  } catch (error) {
    err = error
  }
  console.log('api request time: ' + now.diffNow().milliseconds * -1 + 'ms')
  if (err) {
    throw err
  }
  return payload
}

const requestApi = async (method, route, data) => {
  const now = DateTime.now()
  let payload = {}
  let err = null
  try {
    let url = config.api.url
    const headers = {
      client_id: config.client_id,
      api_secret: config.api.secret,
      'Content-Type': 'application/json'
    }
    method = method.trim().toLowerCase()
    if (typeof data !== 'object' || data === null) {
      data = {}
    }
    data['route'] = Array.isArray(route) ? route.join('/') : route
    let body = {}
    if (['get', 'delete', 'options', 'head'].includes(method)) {
      if (method !== 'get') {
        data._method = method
        method = 'get'
      }
      if (Object.keys(data).length > 0) {
        url += '/?' + new URLSearchParams(data).toString()
      }
    } else {
      body = data
    }
    const res = await axios({
      method,
      url,
      data: body,
      headers
    })
    if (typeof res.data === 'object' && res.data !== null) {
      payload = res.data
    }
  } catch (error) {
    err = error
  }
  console.log('api request time: ' + now.diffNow().milliseconds * -1 + 'ms')
  if (err) {
    throw err
  }
  return payload
}

export const api = {
  head: (route, data) => api.request('head', route, data),
  get: (route, data) => api.request('get', route, data),
  post: (route, data) => api.request('post', route, data),
  put: (route, data) => api.request('put', route, data),
  patch: (route, data) => api.request('patch', route, data),
  delete: (route, data) => api.request('delete', route, data),
  options: (route, data) => api.request('options', route, data),
  request: async (method, route, data) => {
    return (await config.api.proxy.status)
      ? requestProxy(method, route, data)
      : await requestApi(method, route, data)
  }
}
